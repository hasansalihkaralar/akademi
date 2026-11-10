import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { meetingLabelToIso } from "@/lib/meeting-date";

const GOOGLE_CONNECTION_ID = "default";

function env(name: string) {
  // Dinamik erişim: Next build sırasında localhost'a sabitlemesin.
  return process.env[name] || "";
}

function clientId() {
  return env("GOOGLE_CLIENT_ID");
}

function clientSecret() {
  return env("GOOGLE_CLIENT_SECRET");
}

export function appBaseUrl() {
  const fromEnv = env("APP_URL").replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "http://localhost:3000";
}

function redirectUri() {
  const configured = env("GOOGLE_REDIRECT_URI").replace(/\/$/, "");
  if (configured) return configured;
  return `${appBaseUrl()}/api/google/callback`;
}

function authSecret() {
  return process.env.AUTH_SECRET || "dev-only-change-me";
}

export function googleConfigured() {
  return Boolean(clientId() && clientSecret());
}

export function signGoogleState() {
  const body = Buffer.from(
    JSON.stringify({ exp: Date.now() + 10 * 60 * 1000, n: randomBytes(8).toString("hex") }),
  ).toString("base64url");
  const sig = createHmac("sha256", authSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyGoogleState(state: string | null) {
  if (!state) return false;
  const [body, sig] = state.split(".");
  if (!body || !sig) return false;
  const expected = createHmac("sha256", authSecret()).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar",
].join(" ");

function hasCalendarScope(scope: string | undefined | null) {
  if (!scope) return false;
  return scope.includes("https://www.googleapis.com/auth/calendar");
}

export function googleAuthUrl(state: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId());
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_SCOPES);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "false");
  url.searchParams.set("login_hint", "amfikocluk@gmail.com");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function saveGoogleCode(code: string) {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });
  const token = (await tokenResponse.json().catch(() => null)) as {
    access_token?: string;
    refresh_token?: string;
    scope?: string;
  } | null;
  if (!tokenResponse.ok || !token?.access_token) {
    return null;
  }

  const infoResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token.access_token)}`,
  );
  const info = (await infoResponse.json().catch(() => null)) as { scope?: string } | null;
  const scope = token.scope || info?.scope || "";
  if (!hasCalendarScope(scope)) {
    return null;
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const profile = (await profileResponse.json().catch(() => null)) as { email?: string } | null;
  const email = profile?.email || "amfikocluk@gmail.com";

  const existing = await prisma.googleConnection.findUnique({ where: { id: GOOGLE_CONNECTION_ID } });
  const refreshToken = token.refresh_token || existing?.refreshToken;
  if (!refreshToken) {
    return null;
  }

  await prisma.googleConnection.upsert({
    where: { id: GOOGLE_CONNECTION_ID },
    create: { id: GOOGLE_CONNECTION_ID, email, refreshToken },
    update: { email, refreshToken },
  });

  await backfillMissingMeetLinks().catch(() => undefined);
  return email;
}

export async function googleConnection() {
  return prisma.googleConnection.findUnique({
    where: { id: GOOGLE_CONNECTION_ID },
    select: { email: true },
  });
}

async function accessToken(): Promise<{ token: string | null; error: string | null }> {
  if (!googleConfigured()) {
    return { token: null, error: "Google API anahtarları tanımlı değil." };
  }
  const connection = await prisma.googleConnection.findUnique({ where: { id: GOOGLE_CONNECTION_ID } });
  if (!connection) {
    return { token: null, error: "Google hesabı bağlı değil." };
  }
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId(),
      client_secret: clientSecret(),
      refresh_token: connection.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = (await response.json().catch(() => null)) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  } | null;
  if (!response.ok || !data?.access_token) {
    return {
      token: null,
      error:
        data?.error === "invalid_grant"
          ? "Google bağlantısı süresi dolmuş. Yönetim panelinden hesabı yeniden bağla."
          : data?.error_description || data?.error || "Google erişim jetonu alınamadı.",
    };
  }
  return { token: data.access_token, error: null };
}

export async function googleTokenHealthy() {
  const { token, error } = await accessToken();
  if (!token) return { healthy: false, error };
  const infoResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`,
  );
  const info = (await infoResponse.json().catch(() => null)) as { scope?: string } | null;
  if (!hasCalendarScope(info?.scope)) {
    return {
      healthy: false,
      error: "Google Takvim izni eksik. Yönetim panelinden hesabı yeniden bağla ve Takvim iznini onayla.",
    };
  }
  return { healthy: true, error: null as string | null };
}

function istanbulDateTime(date: string, time: string) {
  return `${date}T${time.length === 5 ? `${time}:00` : time}`;
}

export async function createMeetLink(input: {
  requestId: string;
  title: string;
  studentName: string;
  date: string;
  time: string;
  note?: string | null;
}) {
  const { token, error: tokenError } = await accessToken();
  if (!token) {
    return { meetUrl: null as string | null, eventId: null as string | null, error: tokenError };
  }

  const startLocal = istanbulDateTime(input.date, input.time.slice(0, 5));
  const startMs = new Date(`${input.date}T${input.time.slice(0, 5)}:00+03:00`).getTime();
  const endLocal = (() => {
    const end = new Date(startMs + 60 * 60 * 1000);
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(end);
    const get = (type: string) => parts.find((part) => part.type === type)?.value || "00";
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
  })();

  const requestId = input.requestId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 36) || randomBytes(8).toString("hex");

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: `${input.title} · ${input.studentName}`,
        description: input.note || "Amfi Koçluk görüşmesi",
        start: { dateTime: startLocal, timeZone: "Europe/Istanbul" },
        end: { dateTime: endLocal, timeZone: "Europe/Istanbul" },
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    },
  );
  const data = (await response.json().catch(() => null)) as {
    id?: string;
    hangoutLink?: string;
    error?: { message?: string };
    conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] };
  } | null;
  const meetUrl =
    data?.hangoutLink ||
    data?.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ||
    null;
  if (!response.ok || !meetUrl) {
    return {
      meetUrl: null,
      eventId: null,
      error: data?.error?.message || `Google Calendar Meet oluşturulamadı (${response.status}).`,
    };
  }
  return { meetUrl, eventId: data?.id ?? null, error: null as string | null };
}

export async function attachMeetToMeeting(meetingId: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: { student: { include: { user: { select: { name: true } } } } },
  });
  if (!meeting || meeting.status !== "upcoming") {
    return { meetUrl: null as string | null, error: "Yaklaşan randevu bulunamadı." };
  }
  if (meeting.meetUrl) {
    return { meetUrl: meeting.meetUrl, error: null as string | null };
  }

  const date = meetingLabelToIso(meeting.dateLabel);
  if (!date || meeting.time === "—" || meeting.dateLabel === "Talep") {
    return { meetUrl: null, error: "Randevu tarihi eksik." };
  }

  const link = await createMeetLink({
    requestId: `${meeting.id}${Date.now()}`.replace(/[^a-zA-Z0-9]/g, "").slice(0, 36),
    title: meeting.title,
    studentName: meeting.student.user.name,
    date,
    time: meeting.time.slice(0, 5),
    note: meeting.note,
  });
  if (!link.meetUrl) {
    return { meetUrl: null, error: link.error || "Meet linki oluşmadı." };
  }

  await prisma.meeting.update({
    where: { id: meeting.id },
    data: { meetUrl: link.meetUrl, googleEventId: link.eventId },
  });
  return { meetUrl: link.meetUrl, error: null as string | null };
}

export async function backfillMissingMeetLinks(limit = 40) {
  const meetings = await prisma.meeting.findMany({
    where: {
      status: "upcoming",
      meetUrl: null,
      NOT: { dateLabel: "Talep" },
    },
    take: limit,
    orderBy: { id: "desc" },
  });
  let attached = 0;
  for (const meeting of meetings) {
    const result = await attachMeetToMeeting(meeting.id);
    if (result.meetUrl) attached += 1;
  }
  return { attempted: meetings.length, attached };
}

export async function updateMeetEvent(input: {
  eventId: string;
  title: string;
  studentName: string;
  date: string;
  time: string;
  note?: string | null;
}) {
  const { token } = await accessToken();
  if (!token) return false;
  const startLocal = istanbulDateTime(input.date, input.time.slice(0, 5));
  const startMs = new Date(`${input.date}T${input.time.slice(0, 5)}:00+03:00`).getTime();
  const end = new Date(startMs + 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(end);
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "00";
  const endLocal = `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(input.eventId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: `${input.title} · ${input.studentName}`,
        description: input.note || "Amfi Koçluk görüşmesi",
        start: { dateTime: startLocal, timeZone: "Europe/Istanbul" },
        end: { dateTime: endLocal, timeZone: "Europe/Istanbul" },
      }),
    },
  );
  return response.ok;
}

export async function deleteMeetEvent(eventId: string) {
  const { token } = await accessToken();
  if (!token) return false;
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
  );
  return response.ok || response.status === 404 || response.status === 410;
}
