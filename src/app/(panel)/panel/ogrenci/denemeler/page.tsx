"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { PackageAccessGate } from "@/components/panel/PackageAccessGate";

type Trial = {
  id: string;
  name: string;
  date: string;
  tyt: number;
  ayt: number;
  delta: string;
};

export default function StudentTrialsPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [hasPackage, setHasPackage] = useState<boolean | null>(null);
  const [pendingTransfer, setPendingTransfer] = useState(false);
  const [viewer, setViewer] = useState("ogrenci");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/panel/ogrenci/denemeler")
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as {
          hasPackage?: boolean;
          pendingTransfer?: boolean;
          viewer?: string;
          trials?: Trial[];
          error?: string;
        } | null;
        if (!response.ok) {
          setError(data?.error || "Denemeler yüklenemedi.");
          return;
        }
        setHasPackage(Boolean(data?.hasPackage));
        setPendingTransfer(Boolean(data?.pendingTransfer));
        setViewer(data?.viewer || "ogrenci");
        setTrials(data?.trials || []);
      })
      .catch(() => setError("Denemeler yüklenemedi."));
  }, []);

  if (error) {
    return <p className="text-body-sm text-error">{error}</p>;
  }

  if (hasPackage === null) {
    return <p className="text-body-sm text-on-surface-variant">Denemeler yükleniyor…</p>;
  }

  if (!hasPackage) {
    return (
      <PackageAccessGate
        viewer={viewer}
        pendingTransfer={pendingTransfer}
        title="Deneme takibi paketle açılır"
      />
    );
  }

  const chart = trials
    .slice()
    .reverse()
    .map((trial) => trial.tyt || trial.ayt)
    .filter((value) => value > 0);
  const max = Math.max(...chart, 1);

  return (
    <div className="space-y-space-lg">
      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <h2 className="text-headline-sm text-on-surface">Deneme Analizleri</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Her deneme sonrası konu bazlı kök neden analizi koçun tarafından işlenir.
        </p>
        {chart.length === 0 ? (
          <p className="mt-space-lg text-body-sm text-on-surface-variant">Henüz deneme kaydı yok.</p>
        ) : (
          <div className="mt-space-lg flex h-28 items-end gap-2">
            {chart.map((value, i) => (
              <div key={`${value}-${i}`} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary/80"
                  style={{ height: `${Math.max((value / max) * 100, 8)}%` }}
                />
                <span className="text-[10px] text-on-surface-variant">D{i + 1}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        {trials.length === 0 ? (
          <p className="p-space-lg text-body-sm text-on-surface-variant">
            Koçun deneme netlerini girdikçe tablo burada dolacak.
          </p>
        ) : (
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
              {trials.map((trial) => (
                <tr key={trial.id} className="border-t border-outline-variant/40">
                  <td className="px-space-md py-space-md font-semibold text-on-surface">{trial.name}</td>
                  <td className="px-space-md py-space-md text-on-surface-variant">{trial.date}</td>
                  <td className="px-space-md py-space-md">{trial.tyt || "—"}</td>
                  <td className="px-space-md py-space-md">{trial.ayt || "—"}</td>
                  <td className="px-space-md py-space-md">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-label-md font-bold ${
                        trial.delta.startsWith("+")
                          ? "bg-[#DCFCE7] text-[#15803D]"
                          : trial.delta.startsWith("-")
                            ? "bg-error/10 text-error"
                            : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      <Icon
                        name={
                          trial.delta.startsWith("+")
                            ? "trending_up"
                            : trial.delta.startsWith("-")
                              ? "trending_down"
                              : "remove"
                        }
                        className="text-[14px]"
                      />
                      {trial.delta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
