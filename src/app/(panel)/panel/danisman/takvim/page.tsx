import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { advisorAgenda } from "@/lib/panel-data";

export const metadata: Metadata = { title: "Takvim" };

const week = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function AdvisorCalendarPage() {
  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Seans Takvimi</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Bu haftaki birebir ve check-in görüşmeleri.
        </p>
      </div>

      <div className="grid grid-cols-7 gap-space-sm">
        {week.map((day, i) => (
          <div
            key={day}
            className={`rounded-xl p-space-sm text-center shadow-sm ${
              i === 0
                ? "bg-primary text-on-primary"
                : "bg-surface-container-lowest text-on-surface"
            }`}
          >
            <p className="text-label-md font-bold">{day}</p>
            <p className="text-title-lg font-extrabold">{30 + i}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h3 className="mb-space-md text-title-lg font-bold text-on-surface">
          Bugün — 30 Eylül
        </h3>
        <div className="space-y-space-sm">
          {advisorAgenda.map((item) => (
            <div
              key={item.time}
              className="flex flex-col gap-space-sm rounded-lg bg-surface-container-low p-space-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-space-md">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-on-primary">
                  <Icon name="videocam" className="text-[22px]" />
                </div>
                <div>
                  <p className="text-title-md font-bold text-on-surface">
                    {item.time} · {item.student}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {item.type} · {item.note}
                  </p>
                </div>
              </div>
              <button type="button" className="btn-navy">
                Seansı başlat
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
