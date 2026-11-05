"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { formatPrice } from "@/lib/content";

type Order = {
  id: string;
  packageId: string;
  packageName: string;
  duration: string | null;
  amount: number;
  status: string;
  startedAtLabel: string;
  endsAtLabel: string;
  active: boolean;
};

function statusLabel(status: string, active: boolean) {
  if (status === "basarisiz") return "Başarısız";
  if (status === "havale_bekliyor") return "Havale onay bekliyor";
  if (active) return "Aktif";
  if (status === "odendi") return "Süre doldu";
  return status;
}

function statusClass(status: string, active: boolean) {
  if (status === "basarisiz") return "bg-error/10 text-error";
  if (status === "havale_bekliyor") return "bg-[#FEF3C7] text-[#B45309]";
  if (active) return "bg-[#DCFCE7] text-[#15803D]";
  return "bg-surface-container text-on-surface-variant";
}

export default function StudentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [current, setCurrent] = useState<Order | null>(null);
  const [canRepurchase, setCanRepurchase] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/panel/ogrenci/siparisler", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          setError("Siparişler yüklenemedi.");
          return;
        }
        const data = (await response.json()) as {
          orders: Order[];
          current: Order | null;
          canRepurchase: boolean;
        };
        setOrders(data.orders);
        setCurrent(data.current);
        setCanRepurchase(data.canRepurchase);
      })
      .catch(() => setError("Siparişler yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-body-sm text-on-surface-variant">Siparişler yükleniyor…</p>;
  }

  if (error) {
    return <p className="text-body-sm text-error">{error}</p>;
  }

  return (
    <div className="space-y-space-lg">
      <section className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-space-md">
          <div>
            <h2 className="text-headline-sm text-on-surface">Siparişlerim</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Satın aldığın paketleri, başlangıç ve bitiş tarihlerini buradan takip et.
            </p>
          </div>
          <Link href={current ? `/odeme?paket=${current.packageId}` : "/paketler"} className="btn-primary">
            <Icon name="shopping_bag" className="text-[18px]" />
            {canRepurchase ? "Yeniden paket al" : "Paketleri gör"}
          </Link>
        </div>

        {current ? (
          <div className="mt-space-lg rounded-xl bg-primary p-space-lg text-on-primary">
            <p className="text-label-md font-bold uppercase tracking-wider text-primary-fixed">
              Aktif paket
            </p>
            <h3 className="mt-space-xs text-headline-sm">{current.packageName}</h3>
            {current.duration ? (
              <p className="mt-1 text-body-sm text-primary-fixed">{current.duration}</p>
            ) : null}
            <div className="mt-space-md grid gap-space-sm sm:grid-cols-3">
              <div>
                <p className="text-label-md text-primary-fixed">Başlangıç</p>
                <p className="text-title-md font-semibold">{current.startedAtLabel}</p>
              </div>
              <div>
                <p className="text-label-md text-primary-fixed">Bitiş</p>
                <p className="text-title-md font-semibold">{current.endsAtLabel}</p>
              </div>
              <div>
                <p className="text-label-md text-primary-fixed">Tutar</p>
                <p className="text-title-md font-semibold">{formatPrice(current.amount)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-space-lg rounded-xl bg-surface-container-low p-space-lg">
            <p className="text-title-md font-semibold text-on-surface">Aktif paket yok</p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {orders.some((order) => order.status === "odendi")
                ? "Önceki paketinin süresi dolmuş. Yeniden satın alarak devam edebilirsin."
                : "Henüz paket satın almadın. Paketler sayfasından seçim yapabilirsin."}
            </p>
            <Link href="/paketler" className="btn-secondary mt-space-md inline-flex">
              Paketleri incele
            </Link>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
        <div className="border-b border-outline-variant/40 px-space-lg py-space-md">
          <h3 className="text-title-lg font-bold text-on-surface">Satın alma geçmişi</h3>
        </div>
        {orders.length === 0 ? (
          <p className="p-space-lg text-body-sm text-on-surface-variant">
            Henüz sipariş kaydı yok.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-body-sm">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-space-md py-space-md font-semibold">Paket</th>
                  <th className="px-space-md py-space-md font-semibold">Başlangıç</th>
                  <th className="px-space-md py-space-md font-semibold">Bitiş</th>
                  <th className="px-space-md py-space-md font-semibold">Tutar</th>
                  <th className="px-space-md py-space-md font-semibold">Durum</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-outline-variant/40">
                    <td className="px-space-md py-space-md">
                      <p className="font-semibold text-on-surface">{order.packageName}</p>
                      {order.duration ? (
                        <p className="text-on-surface-variant">{order.duration}</p>
                      ) : null}
                    </td>
                    <td className="px-space-md py-space-md text-on-surface-variant">
                      {order.startedAtLabel}
                    </td>
                    <td className="px-space-md py-space-md text-on-surface-variant">
                      {order.endsAtLabel}
                    </td>
                    <td className="px-space-md py-space-md font-semibold text-on-surface">
                      {formatPrice(order.amount)}
                    </td>
                    <td className="px-space-md py-space-md">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-label-md font-bold ${statusClass(
                          order.status,
                          order.active,
                        )}`}
                      >
                        {statusLabel(order.status, order.active)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
