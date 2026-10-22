import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";

const GOOGLE_CONNECTION_ID = "default";

function clientId() {
  return process.env.GOOGLE_CLIENT_ID || "";
}

function clientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || "";
}

function redirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/google/callback";
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

export function googleAuthUrl(state: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId());
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email https://www.googleapis.com/auth/calendar.events");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
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
  } | null;
  if (!tokenResponse.ok || !token?.access_token || !token.refresh_token) {
    return null;
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const profile = (await profileResponse.json().catch(() => null)) as { email?: string } | null;
  const email = profile?.email || "amfikocluk@gmail.com";

  await prisma.googleConnection.upsert({
    where: { id: GOOGLE_CONNECTION_ID },
    create: { id: GOOGLE_CONNECTION_ID, email, refreshToken: token.refresh_token },
    update: { email, refreshToken: token.refresh_token },
  });
  return email;
}

export async function googleConnection() {
  return prisma.googleConnection.findUnique({
    where: { id: GOOGLE_CONNECTION_ID },
    select: { email: true },
  });
}

async function accessToken() {
  const connection = await prisma.googleConnection.findUnique({ where: { id: GOOGLE_CONNECTION_ID } });
  if (!connection) return null;
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
  const data = (await response.json().catch(() => null)) as { access_token?: string } | null;
  if (!response.ok || !data?.access_token) return null;
  return data.access_token;
}

export async function createMeetLink(input: {
  requestId: string;
  title: string;
  studentName: string;
  date: string;
  time: string;
  note?: string | null;
}) {
  const token = await accessToken();
  if (!token) return { meetUrl: null as string | null, eventId: null as string | null };

  const start = new Date(`${input.date}T${input.time}:00+03:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
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
        start: { dateTime: start.toISOString(), timeZone: "Europe/Istanbul" },
        end: { dateTime: end.toISOString(), timeZone: "Europe/Istanbul" },
        conferenceData: {
          createRequest: {
            requestId: input.requestId,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    },
  );
  const data = (await response.json().catch(() => null)) as {
    id?: string;
    hangoutLink?: string;
    conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] };
  } | null;
  const meetUrl =
    data?.hangoutLink ||
    data?.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ||
    null;
  if (!response.ok || !meetUrl) return { meetUrl: null, eventId: null };
  return { meetUrl, eventId: data?.id ?? null };
}
