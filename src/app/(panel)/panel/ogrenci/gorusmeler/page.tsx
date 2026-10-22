import type { Metadata } from "next";
import { StudentMeetings } from "./meetings";

export const metadata: Metadata = { title: "Görüşmeler" };

export default function StudentMeetingsPage() {
  return <StudentMeetings />;
}
