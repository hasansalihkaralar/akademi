"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/content";
import { paymentStatusClass, paymentStatusLabel } from "@/lib/payment-status";

type Payment = {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email: string;
  grade: string;
  packageName: string;
  amount: number;
  status: string;
  method?: string;
  studentId: string | null;
  createdAt: string;
};

function formatWhen(value: string) {
  return new Date(value).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<Payment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/panel/admin/odemeler")
      .then(async (response) => {
        if (!response.ok) {
          setError("Ödemeleri görmek için yönetim hesabıyla giriş yap.");
          return;
        }
        const data = (await response.json()) as { items: Payment[] };
        setItems(data.items);
      })
      .catch(() => setError("Ödemeler yüklenemedi."));
  }, []);

  const paid = items.filter((item) => item.status === "odendi").length;
  const pending = items.filter((item) => item.status === "havale_bekliyor").length;

  return (
    <div className="space-y-space-lg">
      <div>
        <h2 className="text-headline-sm text-on-surface">Ödemeler</h2>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Siteden gelen paket ödemeleri burada durur. {paid} ödendi
          {pending ? ` · ${pending} havale bekliyor` : ""}.
        </p>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {items.length === 0 && !error ? (
        <p className="text-body-sm text-on-surface-variant">Henüz ödeme yok.</p>
      ) : null}
      <div className="space-y-space-sm">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/panel/admin/odemeler/${item.id}`}
            className="block rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition hover:shadow-md"
          >
            <div className="flex flex-wrap items-start justify-between gap-space-sm">
              <div>
                <p className="font-semibold text-on-surface">
                  {item.studentName}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-label-md font-semibold ${paymentStatusClass(item.status)}`}
                  >
                    {paymentStatusLabel(item.status)}
                  </span>
                  {item.studentId ? (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-label-md font-semibold text-primary">
                      Hesap açık
                    </span>
                  ) : null}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  {item.packageName} · {formatPrice(item.amount)} · {item.grade}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  Veli: {item.parentName} · {item.phone} · {item.email}
                </p>
              </div>
              <p className="text-label-md text-on-surface-variant">{formatWhen(item.createdAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
