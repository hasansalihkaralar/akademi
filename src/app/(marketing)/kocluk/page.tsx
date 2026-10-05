import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "YKS ve LGS Koçluğu" };

export default function CoachingPage() {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-surface py-space-2xl">
        <div className="shell relative z-10 max-w-4xl">
          <nav className="mb-space-md text-label-md text-on-surface-variant">
            Ana Sayfa / <span className="text-primary">YKS & LGS Koçluğu</span>
          </nav>
          <span className="section-badge">Koçluk Modeli</span>
          <h1 className="mt-space-sm page-title">
            YKS ve LGS koçluğu kimler için, nasıl işler?
          </h1>
          <p className="mt-space-md max-w-3xl text-body-lg text-on-surface-variant">
            Pusula Akademi&apos;de koçluk; program yazıp bırakmak değildir. Haftalık plan,
            öğrenci takibi, deneme analizi, eksik konu haritası ve PDR uzmanı motivasyon
            desteği aynı sistemde yürür. Veli de süreçten kopmaz.
          </p>
        </div>
      </section>

      <section className="shell py-space-2xl">
        <div className="grid gap-space-lg lg:grid-cols-2">
          <article
            id="yks"
            className="scroll-mt-28 relative overflow-hidden rounded-xl bg-primary p-space-xl text-on-primary shadow-lg"
          >
            <div className="absolute left-0 top-0 h-full w-2 bg-secondary-container" />
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-space-md py-1 text-label-md font-bold">
              <Icon name="school" className="text-[16px]" /> YKS
            </span>
            <h2 className="mt-space-md text-headline-md">YKS Derece Koçluğu</h2>
            <p className="mt-space-sm text-body-md text-primary-fixed">
              11. sınıf, 12. sınıf ve mezun öğrenciler için. TYT&apos;de hız, AYT&apos;de
              derinlik; okul temposu ile deneme takvimi aynı planda tutulur.
            </p>
            <Link href="/paketler" className="btn-primary mt-space-lg inline-flex">
              YKS Paketlerini İncele
            </Link>
          </article>

          <article
            id="lgs"
            className="scroll-mt-28 relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-xl shadow-lg"
          >
            <div className="absolute left-0 top-0 h-full w-2 bg-secondary-container" />
            <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-space-md py-1 text-label-md font-bold text-on-tertiary-fixed">
              <Icon name="menu_book" className="text-[16px]" /> LGS
            </span>
            <h2 className="mt-space-md text-headline-md text-on-surface">LGS Yeni Nesil Koçluğu</h2>
            <p className="mt-space-sm text-body-md text-on-surface-variant">
              7. ve 8. sınıf öğrencilerinde okul ödevi ile LGS hazırlığını çarpıştırmadan
              ilerleriz. Veli iletişimi daha sık, dil daha sakin ve nettir.
            </p>
            <Link href="/paketler" className="btn-primary mt-space-lg inline-flex">
              LGS Paketlerini İncele
            </Link>
          </article>
        </div>

        <div className="mt-space-2xl">
          <h2 className="text-headline-md text-on-surface">Kimler için?</h2>
          <div className="mt-space-lg grid gap-space-md md:grid-cols-2">
            {[
              ["Planı bozulanlar", "Çalışıyor gibi görünüp ilerleme alamayan öğrenciler."],
              ["Neti dalgalananlar", "Deneme sonuçları inip çıkan, analiz yapamayanlar."],
              ["TYT–AYT dengesini arayanlar", "Birini çalışırken diğerini kaçıran YKS öğrencileri."],
              ["Veli ile düzen isteyenler", "Evde tartışmayı sisteme çevirmek isteyen aileler."],
            ].map(([t, d]) => (
              <div
                key={t}
                className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"
              >
                <h3 className="text-title-lg font-bold text-on-surface">{t}</h3>
                <p className="mt-space-xs text-body-sm text-on-surface-variant">{d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-space-2xl">
          <h2 className="text-headline-md text-on-surface">Koçluk sürecinde neler yapılıyor?</h2>
          <div className="mt-space-lg grid gap-space-md md:grid-cols-2 lg:grid-cols-3">
            {[
              ["calendar_month", "Haftalık çalışma programı", "Net, okul yükü ve eksik konulara göre haftalık plan."],
              ["visibility", "Öğrenci takibi", "Yapılan / yapılmayan çalışma görünür. Kopuş ilk günde yakalanır."],
              ["analytics", "Deneme analizi", "Yanlışlar branş ve konu bazında okunur."],
              ["playlist_add_check", "Eksik konu takibi", "Kapanmayan konular programa geri gömülür."],
              ["forum", "Günlük / haftalık kontrol", "Check-in ve haftalık görüşme ile tempo korunur."],
              ["psychology", "Motivasyon ve sınav süreci", "PDR uzmanı ekip; kaygı ve erteleme desteği."],
            ].map(([icon, t, d]) => (
              <article
                key={t}
                className="rounded-xl bg-surface-container-low p-space-lg"
              >
                <div className="mb-space-md flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                  <Icon name={icon} className="text-[22px]" />
                </div>
                <h3 className="text-title-md font-bold text-on-surface">{t}</h3>
                <p className="mt-space-xs text-body-sm text-on-surface-variant">{d}</p>
              </article>
            ))}
          </div>
        </div>

        <section className="mt-space-2xl rounded-2xl bg-surface-container-lowest p-space-xl shadow-md">
          <h2 className="text-headline-md text-on-surface">Veli bilgilendirme sistemi</h2>
          <p className="mt-space-sm max-w-3xl text-body-md text-on-surface-variant">
            Veliler karanlıkta bırakılmaz. Panelde haftalık tamamlama oranı, deneme netleri
            ve bir sonraki hedefin özeti görünür. Ayda bir veli görüşmesi yapılır.
          </p>
          <div className="mt-space-lg grid gap-space-md md:grid-cols-3">
            {[
              ["Aylık veli görüşmesi", "İlerleme, riskler ve evde nasıl destek olunacağı net konuşulur."],
              ["Panel özeti", "Veliler karar vermelerini sağlayan özeti görür."],
              ["Veli seminerleri", "Sınav kaygısı, ekran, uyku ve ev içi ritim üzerine seminerler."],
            ].map(([t, d]) => (
              <div key={t}>
                <h3 className="text-title-md font-bold text-primary">{t}</h3>
                <p className="mt-space-xs text-body-sm text-on-surface-variant">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-space-xl flex flex-wrap gap-space-sm">
          <Link href="/paketler" className="btn-navy">
            YKS ve LGS paketlerini incele
          </Link>
          <Link href="/on-gorusme" className="btn-primary">
            Ücretsiz ön görüşme talep et
          </Link>
        </div>
      </section>
    </div>
  );
}
