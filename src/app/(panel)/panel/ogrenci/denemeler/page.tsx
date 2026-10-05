import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { studentTrials } from "@/lib/panel-data";

export const metadata: Metadata = { title: "Denemeler" };

export default function StudentTrialsPage() {
  return (
    <div className="space-y-space-lg">
      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="text-headline-sm text-on-surface">Deneme Analizleri</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Her deneme sonrası konu bazlı kök neden analizi koçun tarafından işlenir.
        </p>
        <div className="mt-space-lg flex h-28 items-end gap-2">
          {[72, 78, 75, 84, 88, 86, 92].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-primary/80"
                style={{ height: `${h}%` }}
              />
              <span className="text-[10px] text-on-surface-variant">D{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-space-md py-space-md font-semibold">Deneme</th>
              <th className="px-space-md py-space-md font-semibold">Tarih</th>
              <th className="px-space-md py-space-md font-semibold">TYT</th>
              <th className="px-space-md py-space-md font-semibold">AYT</th>
              <th className="px-space-md py-space-md font-semibold">Değişim</th>
            </tr>
          </thead>
          <tbody>
            {studentTrials.map((trial) => (
              <tr key={trial.id} className="border-t border-outline-variant/40">
                <td className="px-space-md py-space-md font-semibold text-on-surface">
                  {trial.name}
                </td>
                <td className="px-space-md py-space-md text-on-surface-variant">{trial.date}</td>
                <td className="px-space-md py-space-md">{trial.tyt || "—"}</td>
                <td className="px-space-md py-space-md">{trial.ayt || "—"}</td>
                <td className="px-space-md py-space-md">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-label-md font-bold ${
                      trial.delta.startsWith("+")
                        ? "bg-[#DCFCE7] text-[#15803D]"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    <Icon
                      name={trial.delta.startsWith("+") ? "trending_up" : "trending_down"}
                      className="text-[14px]"
                    />
                    {trial.delta}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
