import { z } from "zod";
import { isMondayIso, PROGRAM_DAYS } from "@/lib/meeting-date";

export const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta gir."),
  password: z.string().min(4, "Şifre en az 4 karakter olmalı."),
});

export const consultationSchema = z.object({
  studentName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(30),
  email: z.string().trim().email(),
  applicantRole: z.string().trim().min(2).max(40),
  exam: z.string().trim().min(2).max(80),
  grade: z.string().trim().min(2).max(40),
  packageId: z.string().trim().max(40).optional().or(z.literal("")),
  struggle: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(30),
  email: z.string().trim().email(),
  exam: z.string().trim().max(80).optional().or(z.literal("")),
  applicantRole: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(2).max(4000),
});

export const noteSchema = z.object({
  studentId: z.string().min(1),
  body: z.string().trim().min(2).max(4000),
});

export const taskToggleSchema = z.object({
  id: z.string().min(1),
  done: z.boolean(),
});

export function normalizeVideoUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export const dayNoteSchema = z.object({
  weekStart: z.string().refine(isMondayIso, "Hafta bir pazartesi günü olmalı."),
  day: z.enum(PROGRAM_DAYS),
  body: z.string().trim().max(1000),
});

export const createTaskSchema = z.object({
  weekStart: z.string().refine(isMondayIso, "Hafta bir pazartesi günü olmalı."),
  day: z.enum(["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]),
  subject: z.string().trim().min(2).max(80),
  title: z.string().trim().min(2).max(200),
  duration: z.string().trim().min(1).max(40),
  videoUrl: z.string().trim().max(500).optional().or(z.literal("")),
});

const meetingDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const meetingTime = z.string().regex(/^\d{2}:\d{2}$/);

export const meetingRequestSchema = z.object({
  note: z.string().trim().min(2).max(500),
});

export const studentBookMeetingSchema = z.object({
  date: meetingDate,
  time: meetingTime,
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const advisorBlockSchema = z.object({
  date: meetingDate,
  time: meetingTime,
  note: z.string().trim().max(200).optional().or(z.literal("")),
});

export const createMeetingSchema = z.object({
  title: z.string().trim().min(2).max(120),
  date: meetingDate,
  time: meetingTime,
  type: z.enum(["online", "check-in"]),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const confirmMeetingSchema = z
  .object({
    id: z.string().min(1),
    date: meetingDate.optional().or(z.literal("")),
    time: meetingTime.optional().or(z.literal("")),
    outcome: z.enum(["planlandi", "yapildi"]).optional(),
    advisorNote: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.outcome === "yapildi") {
      if (!data.advisorNote || data.advisorNote.trim().length < 2) {
        ctx.addIssue({ code: "custom", path: ["advisorNote"], message: "Görüşme notu gerekli." });
      }
      return;
    }
    if (!data.date) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "Tarih gerekli." });
    }
    if (!data.time) {
      ctx.addIssue({ code: "custom", path: ["time"], message: "Saat gerekli." });
    }
    if (data.outcome === "planlandi" && (!data.advisorNote || data.advisorNote.trim().length < 2)) {
      ctx.addIssue({ code: "custom", path: ["advisorNote"], message: "Görüşme notu gerekli." });
    }
  });

export const meetingAttendanceSchema = z.object({
  id: z.string().min(1),
  attendance: z.enum(["yapildi", "yapilmadi"]),
  advisorNote: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const updateMeetingSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(2).max(120),
  date: meetingDate,
  time: meetingTime,
  type: z.enum(["online", "check-in"]),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const assignAdvisorSchema = z.object({
  id: z.string().min(1),
  advisorId: z.string().min(1).nullable(),
});

export const createStudentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(4).max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  grade: z.string().trim().min(2).max(40),
  program: z.string().trim().min(2).max(80),
  packageId: z.string().trim().min(2).max(40),
  advisorId: z.string().min(1).nullable().optional(),
  parentName: z.string().trim().min(2).max(120),
  parentEmail: z.string().trim().email(),
  parentPassword: z.string().min(4).max(80),
});

export const publicStudentRegisterSchema = z
  .object({
    firstName: z.string().trim().min(2).max(60),
    lastName: z.string().trim().min(2).max(60),
    email: z.string().trim().email(),
    password: z.string().min(4).max(80),
    passwordConfirm: z.string().min(4).max(80),
    phone: z.string().trim().min(10).max(30),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({ code: "custom", path: ["passwordConfirm"], message: "Şifreler eşleşmiyor." });
    }
  });

export const updateStudentPackageSchema = z.object({
  packageId: z.string().trim().min(2).max(40),
});

export const enrollPaymentSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email(),
    password: z.string().min(4).max(80),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    grade: z.string().trim().min(2).max(40),
    program: z.string().trim().min(2).max(80),
    advisorId: z.string().min(1).nullable().optional(),
    withParent: z.boolean().optional(),
    parentName: z.string().trim().max(120).optional().or(z.literal("")),
    parentEmail: z.string().trim().max(200).optional().or(z.literal("")),
    parentPassword: z.string().max(80).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (!data.withParent) return;
    if (!data.parentName || data.parentName.trim().length < 2) {
      ctx.addIssue({ code: "custom", path: ["parentName"], message: "Veli adı gerekli." });
    }
    if (!z.string().email().safeParse(data.parentEmail).success) {
      ctx.addIssue({ code: "custom", path: ["parentEmail"], message: "Veli e-postası gerekli." });
    }
    if (!data.parentPassword || data.parentPassword.length < 4) {
      ctx.addIssue({ code: "custom", path: ["parentPassword"], message: "Veli şifresi en az 4 karakter." });
    }
  });

export const createAdvisorSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(4).max(80),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export const updateAdvisorSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  password: z.string().min(4).max(80).optional().or(z.literal("")),
  photoUrl: z.string().trim().max(500).optional().or(z.literal("")),
});

export const paymentSchema = z.object({
  studentName: z.string().trim().min(2).max(120),
  parentName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().min(10).max(30),
  email: z.string().trim().email(),
  grade: z.string().trim().min(2).max(40),
  packageId: z.string().trim().min(2).max(40),
  method: z.enum(["kart", "havale"]).default("kart"),
  status: z.enum(["odendi", "basarisiz", "havale_bekliyor"]),
  receiptUrl: z.string().trim().max(500).optional().or(z.literal("")),
});

export const requestStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["yeni", "gorusuldu", "uye"]),
});

export const enrollSchema = z.object({
  requestId: z.string().min(1),
  advisorId: z.string().min(1).nullable(),
  password: z.string().min(4).max(80),
});

export function safeHref(value: string) {
  const href = value.trim();
  if (href.startsWith("/") && !href.startsWith("//") && !href.includes("\\")) return href;
  try {
    const url = new URL(href);
    if (url.protocol === "https:" || url.protocol === "http:") return href;
  } catch {
    return null;
  }
  return null;
}

export const brandSchema = z.object({
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(2).max(80),
  logoUrl: z.string().trim().min(1).max(500),
});

export const navLinkSchema = z.object({
  label: z.string().trim().min(1).max(60),
  href: z.string().trim().min(1).max(200),
  visible: z.boolean().optional(),
});

export const slideSchema = z.object({
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(300).optional().or(z.literal("")),
  imageUrl: z.string().trim().min(1).max(500),
  buttonLabel: z.string().trim().max(40).optional().or(z.literal("")),
  buttonHref: z.string().trim().max(200).optional().or(z.literal("")),
  visible: z.boolean().optional(),
});
