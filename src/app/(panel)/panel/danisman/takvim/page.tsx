import type { Metadata } from "next";
import { AdvisorCalendar } from "./calendar";

export const metadata: Metadata = { title: "Takvim" };

export default function AdvisorCalendarPage() {
  return <AdvisorCalendar />;
}
