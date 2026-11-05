import type { Metadata } from "next";
import { AdvisorCalendar } from "./calendar";
import { AdvisorAvailability } from "./availability";

export const metadata: Metadata = { title: "Takvim" };

export default function AdvisorCalendarPage() {
  return (
    <div className="space-y-space-lg">
      <AdvisorCalendar />
      <AdvisorAvailability />
    </div>
  );
}
