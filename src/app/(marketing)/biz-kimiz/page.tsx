import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Biz Kimiz" };

export default function AboutPage() {
  return (
    <div className="w-full">
      <section className="bg-gradient-to-b from-surface-container-low to-surface py-space-2xl">
        <div className="shell max-w-4xl">
          <nav className="mb-space-md text-label-md text-on-surface-variant">
            Ana Sayfa / <span className="text-primary">Biz Kimiz?</span>
          </nav>
          <span className="section-badge">Kurumsal</span>
          <h1 className="mt-space-sm page-title">
            Biz kimiz?
          </h1>
          <p className="mt-space-md text-body-lg text-on-surface-variant">
            Pusula Akademi, sınav hazırlığını “daha çok çalış” cümlesine bırakmamak için
            kuruldu. Kurucu ekip, yıllarca öğrencinin asıl sorununu gördü: bilgi eksiğinden
            çok, plansızlık, kopuş ve evde büyüyen belirsizlik.
          </p>
          <div className="mt-space-xl grid grid-cols-2 gap-space-sm md:grid-cols-4">
            {[
              ["2018", "Kuruluş"],
              ["1.250+", "İlk 1000"],
              ["%98.4", "Memnuniyet"],
              ["PDR", "Standart"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="rounded-lg bg-surface-container-lowest p-space-md shadow-sm"
              >
                <p className="text-headline-sm font-extrabold text-primary">{v}</p>
                <p className="text-label-md text-on-surface-variant">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell max-w-4xl space-y-space-2xl pb-space-2xl">
        {[
          [
            "Kuruluş hikâyesi",
            "İlk koçluklar, rehberlik odasında yetişmeyen öğrenciler için birebir takip denemesiydi. Günlük kontrol, deneme analizi ve veli özeti aynı dile bağlanınca netler toplanmaya başladı. Pusula Akademi bu pratikten doğdu.",
          ],
          [
            "Eğitim anlayışı",
            "Öğrenci bir makine değildir. Uyku, kaygı, okul yükü ve ev ritmi programın parçasıdır. Ezberlenen uzun listeler yerine, o hafta gerçekten taşınabilecek işi yazarız.",
          ],
          [
            "Koçluk yaklaşımı",
            "Koç, öğrencinin yerine çalışmaz; nasıl çalışacağını öğretir. Veri ile konuşur, yargılamadan düzeltir. PDR bakışı, disiplin ile şefkati aynı masaya oturtur.",
          ],
        ].map(([t, d]) => (
          <div key={t}>
            <h2 className="text-headline-md text-on-surface">{t}</h2>
            <p className="mt-space-sm text-body-md leading-relaxed text-on-surface-variant">{d}</p>
          </div>
        ))}

        <div className="grid gap-space-md md:grid-cols-2">
          <div className="rounded-xl bg-surface-container-low p-space-xl">
            <h3 className="text-headline-sm text-primary">Misyon</h3>
            <p className="mt-space-sm text-body-sm text-on-surface-variant">
              YKS ve LGS öğrencisine kişiye özel, takip edilen ve aileyi içine alan bir
              hazırlık düzeni sunmak.
            </p>
          </div>
          <div className="rounded-xl bg-primary p-space-xl text-on-primary">
            <h3 className="text-headline-sm">Vizyon</h3>
            <p className="mt-space-sm text-body-sm text-primary-fixed">
              Türkiye&apos;de sınav koçluğunu “motivasyon konuşması” olmaktan çıkarıp
              ölçülebilir bir eğitim hizmeti haline getirmek.
            </p>
          </div>
        </div>

        <div className="grid gap-space-md md:grid-cols-2 lg:grid-cols-4">
          {[
            ["psychology", "PDR Odaklı"],
            ["analytics", "Veriye Dayalı"],
            ["family_restroom", "Aileyle Birlikte"],
            ["verified", "Ölçülebilir Sonuç"],
          ].map(([icon, label]) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-xl bg-surface-container-lowest p-space-lg text-center shadow-sm"
            >
              <Icon name={icon} className="mb-space-sm text-[28px] text-secondary" />
              <span className="text-title-md font-bold text-on-surface">{label}</span>
            </div>
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-md">
          <div className="grid h-48 place-items-center bg-gradient-to-br from-primary to-primary-container text-5xl font-extrabold text-on-primary">
            AY
          </div>
          <div className="p-space-xl">
            <p className="text-label-md font-bold uppercase tracking-wider text-secondary">
              Kurucu
            </p>
            <h2 className="mt-space-xs text-headline-md text-on-surface">
              Ayşe Yurt — PDR Uzmanı
            </h2>
            <p className="mt-space-sm text-body-md text-on-surface-variant">
              Psikolojik Danışmanlık ve Rehberlik mezunu. On yılı aşkın süredir sınav
              öğrencileriyle çalışıyor. Pusula Akademi&apos;yi, “öğrenciye program atıp
              kaybolan” modellere alternatif olarak kurdu.
            </p>
          </div>
        </section>

        <Link href="/on-gorusme" className="btn-primary inline-flex">
          Ücretsiz Ön Görüşme Yap
        </Link>
      </section>
    </div>
  );
}
