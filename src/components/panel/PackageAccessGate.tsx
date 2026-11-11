import Link from "next/link";
import { Icon } from "@/components/Icon";

export function PackageAccessGate({
  viewer = "ogrenci",
  pendingTransfer = false,
  title = "Önce paket satın al",
}: {
  viewer?: "ogrenci" | "veli" | string;
  pendingTransfer?: boolean;
  title?: string;
}) {
  if (pendingTransfer) {
    return (
      <section className="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-space-md grid h-14 w-14 place-items-center rounded-full bg-secondary-fixed text-on-secondary-fixed">
            <Icon name="hourglass_top" className="text-[28px]" />
          </div>
          <h2 className="text-headline-sm text-on-surface">Havale onay bekleniyor</h2>
          <p className="mt-space-sm text-body-md text-on-surface-variant">
            Dekontun alındı. Yönetim ödemeyi onayladığında paket otomatik açılır; yeniden satın almana
            gerek yok.
          </p>
          <div className="mt-space-lg flex flex-wrap justify-center gap-space-sm">
            <Link href="/panel/ogrenci/siparisler" className="btn-primary">
              <Icon name="receipt_long" className="text-[18px]" />
              Siparişlerime git
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (viewer === "veli") {
    return (
      <section className="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-space-md grid h-14 w-14 place-items-center rounded-full bg-primary-fixed text-primary">
            <Icon name="inventory_2" className="text-[28px]" />
          </div>
          <h2 className="text-headline-sm text-on-surface">Paket henüz aktif değil</h2>
          <p className="mt-space-sm text-body-md text-on-surface-variant">
            Öğrencinin paketi tanımlanınca program ve denemeler burada görünür. Paket satın alma
            yalnızca öğrenci hesabından yapılır.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-space-md grid h-14 w-14 place-items-center rounded-full bg-primary-fixed text-primary">
          <Icon name="inventory_2" className="text-[28px]" />
        </div>
        <h2 className="text-headline-sm text-on-surface">{title}</h2>
        <p className="mt-space-sm text-body-md text-on-surface-variant">
          Üyeliğin hazır. Haftalık program, deneme takibi ve görüşme hakları paket satın aldıktan
          sonra hesabına tanımlanır.
        </p>
        <div className="mt-space-lg flex flex-wrap justify-center gap-space-sm">
          <Link href="/paketler" className="btn-primary">
            <Icon name="shopping_bag" className="text-[18px]" />
            Paketleri gör
          </Link>
          <Link href="/odeme" className="btn-secondary">
            Satın almaya git
          </Link>
        </div>
      </div>
    </section>
  );
}
