import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta gir."),
  password: z.string().min(4, "Şifre en az 4 karakter olmalı."),
  role: z.enum(["ogrenci", "danisman", "veli", "admin"]),
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

export const createTaskSchema = z.object({
  day: z.enum(["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]),
  subject: z.string().trim().min(2).max(80),
  title: z.string().trim().min(2).max(200),
  duration: z.string().trim().min(1).max(40),
});

const meetingDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const meetingTime = z.string().regex(/^\d{2}:\d{2}$/);

export const meetingRequestSchema = z.object({
  note: z.string().trim().min(2).max(500),
});

export const createMeetingSchema = z.object({
  title: z.string().trim().min(2).max(120),
  date: meetingDate,
  time: meetingTime,
  type: z.enum(["online", "check-in"]),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const confirmMeetingSchema = z.object({
  id: z.string().min(1),
  date: meetingDate,
  time: meetingTime,
});

export const assignAdvisorSchema = z.object({
  id: z.string().min(1),
  advisorId: z.string().min(1).nullable(),
});

export const createAdvisorSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(4).max(80),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
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
