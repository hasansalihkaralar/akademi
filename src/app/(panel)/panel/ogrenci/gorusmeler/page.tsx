import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { studentMeetings } from "@/lib/panel-data";

export const metadata: Metadata = { title: "Görüşmeler" };

export default function StudentMeetingsPage() {
  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Görüşmeler</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Online birebir seanslar ve kısa check-in görüşmeleri.
        </p>
      </div>

      <div className="grid gap-space-md">
        {studentMeetings.map((meeting) => (
          <article
            key={meeting.id}
            className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-space-md">
              <div
                className={`grid h-12 w-12 place-items-center rounded-xl ${
                  meeting.status === "upcoming"
                    ? "bg-secondary-fixed text-secondary"
                    : "bg-surface-container text-primary"
                }`}
              >
                <Icon
                  name={meeting.type === "online" ? "videocam" : "chat"}
                  className="text-[24px]"
                />
              </div>
              <div>
                <h3 className="text-title-lg font-bold text-on-surface">{meeting.title}</h3>
                <p className="text-body-sm text-on-surface-variant">
                  {meeting.with} · {meeting.date} · {meeting.time}
                </p>
              </div>
            </div>
            {meeting.status === "upcoming" ? (
              <button type="button" className="btn-primary">
                <Icon name="login" className="text-[18px]" />
                Katıl
              </button>
            ) : (
              <span className="rounded-full bg-surface-container px-space-md py-2 text-label-md font-semibold text-on-surface-variant">
                Tamamlandı
              </span>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
