import { packages, formatPrice } from "@/lib/content";

const rows = [
  { key: "price", label: "Paket fiyatı" },
  { key: "duration", label: "Paket süresi" },
  { key: "meetings", label: "Görüşme sıklığı" },
  { key: "programPrep", label: "Program hazırlama" },
  { key: "trialAnalysis", label: "Deneme analizi" },
  { key: "tracking", label: "Takip" },
  { key: "parentMeeting", label: "Veli görüşmesi" },
] as const;

export function CompareTable({ program }: { program: "yks" | "lgs" }) {
  const cols = packages.filter((p) => p.program === program);

  return (
    <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-md">
      <table className="w-full min-w-[760px] text-left text-body-sm">
        <thead className="bg-surface-container-low">
          <tr>
            <th className="px-space-md py-space-md font-semibold text-on-surface">Özellik</th>
            {cols.map((col) => (
              <th key={col.id} className="px-space-md py-space-md font-semibold text-primary">
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-outline-variant/40">
              <td className="px-space-md py-space-md text-on-surface-variant">{row.label}</td>
              {cols.map((col) => (
                <td key={col.id} className="px-space-md py-space-md text-on-surface">
                  {row.key === "price" ? formatPrice(col.price) : col[row.key]}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-outline-variant/40">
            <td className="px-space-md py-space-md text-on-surface-variant">Ek özellikler</td>
            {cols.map((col) => (
              <td key={col.id} className="px-space-md py-space-md text-on-surface">
                {col.extras.join(" · ")}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
