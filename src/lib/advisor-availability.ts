import { prisma } from "@/lib/db";
import { conflictsWithTaken } from "@/lib/meeting-slots";

/** Danışmanın o günkü dolu başlangıç saatleri: randevular + kapalı dilimler. */
export async function advisorOccupiedTimes(advisorId: string, dateIso: string, dateLabel: string) {
  const [meetings, blocks] = await Promise.all([
    prisma.meeting.findMany({
      where: {
        dateLabel,
        status: "upcoming",
        student: { advisorId },
      },
      select: { time: true },
    }),
    prisma.advisorBlock.findMany({
      where: { advisorId, dateIso },
      select: { time: true },
    }),
  ]);

  return [
    ...meetings.map((meeting) => meeting.time.slice(0, 5)),
    ...blocks.map((block) => block.time.slice(0, 5)),
  ];
}

export async function advisorSlotConflict(
  advisorId: string,
  dateIso: string,
  dateLabel: string,
  time: string,
  exceptMeetingId?: string,
) {
  const [meetings, blocks] = await Promise.all([
    prisma.meeting.findMany({
      where: {
        dateLabel,
        status: "upcoming",
        ...(exceptMeetingId ? { id: { not: exceptMeetingId } } : {}),
        student: { advisorId },
      },
      select: {
        time: true,
        student: { select: { user: { select: { name: true } } } },
      },
    }),
    prisma.advisorBlock.findMany({
      where: { advisorId, dateIso },
      select: { time: true, note: true },
    }),
  ]);

  const meetingClash = meetings.find((meeting) => conflictsWithTaken(time, [meeting.time.slice(0, 5)]));
  if (meetingClash) {
    return `${dateLabel} ${time} müsait değil. ${meetingClash.student.user.name} ile ${meetingClash.time} görüşmen var.`;
  }

  const blockClash = blocks.find((block) => conflictsWithTaken(time, [block.time.slice(0, 5)]));
  if (blockClash) {
    return `${dateLabel} ${time} müsait değil. Danışman bu saati kapattı${blockClash.note ? ` (${blockClash.note})` : ""}.`;
  }

  return null;
}
