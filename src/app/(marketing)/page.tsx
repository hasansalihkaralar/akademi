import Link from "next/link";
import Image from "next/image";
import { FaqList } from "@/components/FaqList";
import { HomeSlider } from "@/components/HomeSlider";
import { Icon } from "@/components/Icon";
import { CoachCard } from "@/components/CoachCard";
import { listPublicAdvisors } from "@/lib/advisors";
import { brand, faqs } from "@/lib/content";
import { getSiteContent } from "@/lib/site-content";

const steps = [
  {
    n: "01",
    tone: "bg-primary-fixed text-primary",
    title: "15 Dk. Ücretsiz Analiz & Seviye Tespiti",
    text: "Öğrencinin mevcut net durumu, ders çalışma alışkanlıkları ve hedeflediği fakülte/lise uzman PDR danışmanımızla analiz edilir.",
  },
  {
    n: "02",
    tone: "bg-secondary-fixed text-secondary",
    title: "Öğrenci Karakterine Uygun Mentör Eşleşmesi",
    text: "Öğrencinin mizaç tipine ve hedef bölümüne göre en ideal mentör atanır. Memnuniyetsizlikte anında değişim hakkı.",
  },
  {
    n: "03",
    tone: "bg-surface-container-high text-primary",
    title: "Kişiselleştirilmiş Haftalık Plan & Günlük Takip",
    text: "Öğrencinin okul, dershane ve uyku düzenine göre saat saat plan yapılır. Portal üzerinden günlük soru/çözüm kontrolü sağlanır.",
  },
  {
    n: "04",
    tone: "bg-primary text-on-primary",
    title: "Birebir Görüntülü Seans & Veli Raporlaması",
    text: "Haftalık derinlemesine online görüşmede denemeler incelenir; veliye şeffaf dijital performans özeti iletilir.",
  },
];

export default async function HomePage() {
  const [site, advisors] = await Promise.all([getSiteContent(), listPublicAdvisors()]);
  return (
    <div className="flex w-full flex-col">
      <HomeSlider slides={site.slides} />
      {/* HERO */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-surface pb-space-2xl pt-space-xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-1/2 h-80 w-80 rounded-full bg-secondary/5 blur-3xl" />
        <div className="shell relative z-10">
          <div className="grid grid-cols-1 items-center gap-space-xl lg:grid-cols-12">
            <div className="flex flex-col items-start lg:col-span-7">
              <div className="mb-space-md inline-flex items-center gap-space-xs rounded-full bg-surface-container-high px-space-md py-1.5 text-label-md text-primary shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
                <span className="font-bold uppercase tracking-wide">
                  2025 - 2026 Sınav Sezonu Kayıtları Başladı
                </span>
              </div>
              <h1 className="mb-space-md text-[1.875rem] leading-tight font-extrabold tracking-tight text-on-surface sm:text-display-hero-mobile md:text-display-hero">
                Gelişigüzel Değil,{" "}
                <span className="text-primary underline decoration-secondary-container decoration-4 underline-offset-4">
                  Bilimsel ve Analitik
                </span>{" "}
                Metotla Hedefine Ulaş
              </h1>
              <p className="mb-space-xl max-w-2xl text-body-lg leading-relaxed text-on-surface-variant">
                Türkiye&apos;nin en başarılı üniversitelerinden sınav derecesi yapmış mentörler,
                MEB ve PDR standartlarına tam uyumlu takip sistemi ile hayalindeki bölüme giden
                en berrak rota.
              </p>
              <div className="mb-space-2xl flex w-full flex-col gap-space-md sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <Link href="/on-gorusme" className="btn-primary w-full px-space-xl py-4 sm:w-auto">
                  <Icon name="bolt" className="text-[20px]" />
                  <span>Koçluğa Başla (Ücretsiz Analiz)</span>
                </Link>
                <Link href="/paketler" className="btn-secondary w-full px-space-lg py-4 sm:w-auto">
                  <Icon name="explore" className="text-[20px]" />
                  <span>Paketleri İncele</span>
                </Link>
              </div>
              <div className="grid w-full grid-cols-2 gap-space-md sm:grid-cols-4">
                {[
                  ["1.250+", "İlk 1000 Başarısı", "text-primary"],
                  ["%98.4", "Memnuniyet Oranı", "text-secondary"],
                  ["120+ Saat", "PDR Pedagojik Eğitim", "text-primary"],
                ].map(([stat, label, color]) => (
                  <div
                    key={label}
                    className="flex flex-col rounded-lg bg-surface-container-lowest p-space-sm shadow-sm"
                  >
                    <span className={`text-headline-md font-extrabold leading-none ${color}`}>
                      {stat}
                    </span>
                    <span className="mt-1 text-label-md text-on-surface-variant">{label}</span>
                  </div>
                ))}
                <div className="flex flex-col rounded-lg bg-surface-container-lowest p-space-sm shadow-sm">
                  <div className="flex items-center gap-1 text-primary">
                    <Icon name="published_with_changes" className="text-[20px]" />
                    <span className="text-label-lg font-bold">Garantili</span>
                  </div>
                  <span className="mt-1 text-label-md text-on-surface-variant">
                    Koşulsuz Koç Değişimi
                  </span>
                </div>
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-xl bg-surface-container-lowest p-space-md shadow-xl sm:p-space-lg">
                <div className="relative mb-space-md h-52 overflow-hidden rounded-lg bg-surface-container">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhQlhEBBvoePndLvw86lvI-vPRoySTAUumv3f-NafgVnO2pFZoTpRgjwm5itYtwyCAOoy1-wEyrVRslXMjQVMGTXm9HmIztg6EZaYX7gGnZwisUCcRSvUS-BUnt0hmxjGz94J7o_SsjNlJ_oh-jgrhtDoUW-f_qlMfg_ZLi8rOm7zhmnIx39yMhr7pE__9btXTeM-iayPfK_IuaEYdWzmd4KFyR86nZ-xzKerEjJq7Z_XEtih56Yz7sg"
                    alt="Odaklı çalışma masası"
                    fill
                    className="object-cover"
                    sizes="400px"
                    priority
                  />
                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-surface-container-lowest/90 px-space-sm py-1 shadow-sm backdrop-blur-md">
                    <span className="h-2 w-2 animate-ping rounded-full bg-secondary" />
                    <span className="text-label-md font-bold text-primary">Canlı Takip Aktif</span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-primary px-space-md py-1 text-label-md text-on-primary">
                    <Icon name="verified" className="text-[16px]" />
                    <span>PDR Onaylı Plan</span>
                  </div>
                </div>
                <div className="space-y-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-title-md font-bold text-on-surface">
                      Haftalık Hedef Gerçekleşme
                    </span>
                    <span className="text-label-lg font-bold text-secondary">%94</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                    <div className="h-full rounded-full bg-secondary-container" style={{ width: "94%" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                    <div className="flex items-center gap-space-xs rounded-lg bg-surface-container-low p-space-sm">
                      <Icon name="assignment_turned_in" className="text-[20px] text-primary" />
                      <div className="flex flex-col">
                        <span className="text-label-md text-on-surface-variant">Çözülen Soru</span>
                        <span className="text-title-md font-bold text-primary">1.480 / hafta</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs rounded-lg bg-surface-container-low p-space-sm">
                      <Icon name="analytics" className="text-[20px] text-secondary" />
                      <div className="flex flex-col">
                        <span className="text-label-md text-on-surface-variant">TYT Net Artışı</span>
                        <span className="text-title-md font-bold text-secondary">+18.5 Net</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-space-md flex items-center gap-space-sm rounded-xl bg-primary p-space-md text-on-primary shadow-lg sm:absolute sm:-bottom-5 sm:-left-5 sm:mt-0 sm:max-w-xs">
                  <Icon name="military_tech" className="shrink-0 text-[28px] text-tertiary-fixed" />
                  <div>
                    <p className="text-label-lg font-bold leading-tight">YKS Türkiye 47.&apos;si</p>
                    <p className="text-body-sm leading-tight text-primary-fixed">
                      Mert Yılmaz bu hafta seninle
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="w-full bg-surface py-space-2xl" id="programlar">
        <div className="shell">
          <div className="mb-space-2xl flex flex-col items-center text-center">
            <span className="section-badge">Özelleştirilmiş Çözümler</span>
            <h2 className="mb-space-sm text-headline-lg text-on-surface">
              Her Yaşa ve Sınava Özel Analitik Metot
            </h2>
            <p className="max-w-xl text-body-lg text-on-surface-variant">
              Hedefine uygun sınav grubunu seç, akademik eksiklerini nokta atışı kapatacak sistemi başlat.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-2">
            <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-xl shadow-md transition-shadow hover:shadow-xl">
              <div className="absolute left-0 top-0 h-full w-2 bg-primary" />
              <div>
                <div className="mb-space-md flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed px-space-md py-1 text-label-md font-bold uppercase text-on-primary-fixed">
                    <Icon name="school" className="text-[16px]" /> YKS 2026 / 2027
                  </span>
                  <span className="text-label-md font-bold text-secondary">11, 12. Sınıf & Mezun</span>
                </div>
                <h3 className="mb-space-sm text-headline-md text-primary">YKS Derece & Hedef Koçluğu</h3>
                <p className="mb-space-lg text-body-md leading-relaxed text-on-surface-variant">
                  Sayısal, Eşit Ağırlık ve Sözel alanlarında kronik eksik konu tespiti, TYT-AYT deneme
                  simülasyonları ve masa başı odaklanma krizlerine bilimsel çözümler.
                </p>
                <div className="mb-space-xl space-y-space-sm">
                  {[
                    ["Kişiye Özel Konu Matrisi:", "TYT ve AYT konularını bitirme hızına göre dinamik haftalık plan."],
                    ["Deneme Karakutusu:", "Yanlış yapılan her sorunun kazanım bazlı kök neden analizi."],
                    ["Masa Başı Kondisyonu:", "3+ saatlik blok odaklanma ve sınav anı stres yönetimi rehberliği."],
                    ["Derece Mentörleri:", "İstediğin bölümü bizzat kazanmış mentörle seans."],
                  ].map(([t, d]) => (
                    <div key={t} className="flex items-start gap-space-xs">
                      <Icon name="check_circle" className="mt-0.5 shrink-0 text-[20px] text-secondary" />
                      <span className="text-body-md text-on-surface">
                        <strong>{t}</strong> {d}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center justify-between gap-space-md sm:flex-row">
                <div>
                  <span className="block text-label-md text-on-surface-variant">
                    Ücretsiz 15 dk Analiz ile Başla
                  </span>
                  <span className="text-title-lg font-bold text-primary">Kişisel YKS Yol Haritanı Çıkar</span>
                </div>
                <Link href="/kocluk#yks" className="btn-navy w-full sm:w-auto">
                  YKS Koçunu Seç
                </Link>
              </div>
            </article>

            <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-xl shadow-md transition-shadow hover:shadow-xl">
              <div className="absolute left-0 top-0 h-full w-2 bg-secondary-container" />
              <div>
                <div className="mb-space-md flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-space-md py-1 text-label-md font-bold uppercase text-on-tertiary-fixed">
                    <Icon name="menu_book" className="text-[16px]" /> LGS 2026
                  </span>
                  <span className="text-label-md font-bold text-secondary">7. ve 8. Sınıf Öğrencileri</span>
                </div>
                <h3 className="mb-space-sm text-headline-md text-on-surface">LGS Yeni Nesil Başarı Koçluğu</h3>
                <p className="mb-space-lg text-body-md leading-relaxed text-on-surface-variant">
                  Yeni nesil beceri temelli soru çözme alışkanlığı, zaman yönetimi, ergenlik dönemi
                  motivasyon desteği ve veliyle çatışmasız sağlıklı iletişim ortamı.
                </p>
                <div className="mb-space-xl space-y-space-sm">
                  {[
                    ["Yeni Nesil Soru Okuryazarlığı:", "Mantık-muhakeme sorularında paragraf ve grafik çözümleme teknikleri."],
                    ["Dijital Bağımlılık & Disiplin:", "Ekran saatlerini optimize eden ders-mola ritmi."],
                    ["Düzenli Veli Konsültasyonu:", "Sınav kaygısını veli-öğrenci çatışmasına dönüştürmeyen PDR rehberliği."],
                    ["Nitelikli Lise Rotası:", "%1'lik dilim hedefiyle adım adım ilerleme."],
                  ].map(([t, d]) => (
                    <div key={t} className="flex items-start gap-space-xs">
                      <Icon name="check_circle" className="mt-0.5 shrink-0 text-[20px] text-secondary" />
                      <span className="text-body-md text-on-surface">
                        <strong>{t}</strong> {d}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center justify-between gap-space-md sm:flex-row">
                <div>
                  <span className="block text-label-md text-on-surface-variant">Ücretsiz Seviye Belirleme</span>
                  <span className="text-title-lg font-bold text-on-surface">LGS Strateji Planı Edin</span>
                </div>
                <Link href="/kocluk#lgs" className="btn-primary w-full sm:w-auto">
                  LGS Koçunu Seç
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="w-full bg-surface-container-low py-space-2xl">
        <div className="shell">
          <div className="mb-space-2xl flex flex-col items-center text-center">
            <span className="section-badge">Net ve Şeffaf Akış</span>
            <h2 className="mb-space-sm text-headline-lg text-on-surface">
              Sistem Nasıl İşliyor? 4 Adımda Başarı Yolu
            </h2>
            <p className="max-w-2xl text-body-lg text-on-surface-variant">
              İlk andan sınav salonuna kadar rastlantıya yer bırakmayan, adım adım yapılandırılmış
              profesyonel koçluk mimarisi.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.n}
                className="relative rounded-xl bg-surface-container-lowest p-space-lg shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`mb-space-md flex h-12 w-12 items-center justify-center rounded-lg text-headline-sm font-bold ${step.tone}`}
                >
                  {step.n}
                </div>
                <h4 className="mb-space-xs text-title-lg font-bold text-on-surface">{step.title}</h4>
                <p className="text-body-sm leading-relaxed text-on-surface-variant">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COACHES */}
      <section className="w-full bg-surface py-space-2xl">
        <div className="shell">
          <div className="mb-space-2xl flex flex-col justify-between gap-space-md md:flex-row md:items-end">
            <div>
              <span className="section-badge">Dereceli Kadro</span>
              <h2 className="text-headline-lg text-on-surface">Öne Çıkan Dereceli Mentörlerimiz</h2>
              <p className="mt-space-xs text-body-lg text-on-surface-variant">
                Sadece sınavı kazanan değil, öğretmeyi ve rehberlik etmeyi iyi bilen pedagojik formasyonlu ekip.
              </p>
            </div>
            <Link
              href="/koclarimiz"
              className="inline-flex items-center gap-space-xs text-label-lg font-bold text-primary transition-colors hover:text-secondary"
            >
              <span>Tüm Mentör Kadrosunu Gör</span>
              <Icon name="arrow_forward" className="text-[18px]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-space-lg sm:grid-cols-2 lg:grid-cols-4">
            {advisors.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY + FAQ + CTA */}
      <section className="w-full overflow-hidden bg-surface-container-low py-space-2xl">
        <div className="shell">
          <div className="grid grid-cols-1 items-center gap-space-xl lg:grid-cols-12">
            <div className="flex flex-col lg:col-span-6">
              <span className="section-badge self-start">Fark Yaratan Altyapı</span>
              <h2 className="mb-space-md text-headline-lg text-on-surface">
                Neden Amfi Koçluk? Veriye Dayalı, PDR Denetimli
              </h2>
              <p className="mb-space-xl text-body-lg leading-relaxed text-on-surface-variant">
                Sıradan sohbet koçluğu değil; gelişiminizin her saniyesini kayıt altına alan öğrenci
                paneli ve uzman psikolojik danışman kontrolü.
              </p>
              <div className="space-y-space-md">
                {[
                  ["psychology", "PDR ve Pedagojik Süpervizyon", "Her mentörün haftalık programı kıdemli PDR uzmanları tarafından onaylanır.", "bg-primary-fixed text-primary"],
                  ["troubleshoot", "Çözülemeyen Soru Karakutusu", "Yapılamayan her soru sisteme yüklenir; kalıcı öğrenme için tekrar önüne çıkarılır.", "bg-secondary-fixed text-secondary"],
                  ["family_restroom", "Şeffaf Veli Bilgilendirme", "Haftalık etüt oranı ve deneme net grafikleri veliye dijital karneyle iletilir.", "bg-surface-container text-primary"],
                ].map(([icon, title, text, tone]) => (
                  <div
                    key={title}
                    className="flex items-start gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm"
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                      <Icon name={icon} className="text-[24px]" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-title-lg font-bold text-on-surface">{title}</h4>
                      <p className="text-body-sm text-on-surface-variant">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl bg-surface-container-lowest p-space-lg shadow-xl">
                <div className="mb-space-md flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <div className="h-3 w-3 rounded-full bg-error" />
                    <div className="h-3 w-3 rounded-full bg-[#ffb599]" />
                    <div className="h-3 w-3 rounded-full bg-[#25D366]" />
                    <span className="ml-2 font-mono text-label-md text-on-surface-variant">
                      pusula-portal / ogrenci_analiz
                    </span>
                  </div>
                  <span className="rounded bg-surface-container px-2 py-0.5 text-label-md font-bold text-primary">
                    Deneme Takip
                  </span>
                </div>
                <div className="mb-space-md grid grid-cols-3 gap-space-sm">
                  {[
                    ["TYT Net", "98.5", "+12"],
                    ["AYT Mat", "34.0", "+8"],
                    ["Tamamlanan", "%91", "Bu hafta"],
                  ].map(([l, v, d]) => (
                    <div key={l} className="rounded-lg bg-surface-container-low p-space-sm">
                      <p className="text-label-md text-on-surface-variant">{l}</p>
                      <p className="text-headline-sm font-extrabold text-primary">{v}</p>
                      <p className="text-label-md font-semibold text-secondary">{d}</p>
                    </div>
                  ))}
                </div>
                <div className="h-32 rounded-lg bg-gradient-to-r from-primary/10 via-secondary-container/20 to-primary/5 p-space-md">
                  <p className="mb-2 text-label-md font-bold text-primary">Haftalık Net Trendi</p>
                  <div className="flex h-20 items-end gap-2">
                    {[40, 55, 48, 70, 65, 82, 94].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-primary/80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-surface py-space-2xl">
        <div className="shell max-w-3xl">
          <div className="mb-space-xl text-center">
            <span className="section-badge">Merak Edilenler</span>
            <h2 className="text-headline-lg text-on-surface">Sıkça Sorulan Sorular</h2>
          </div>
          <FaqList items={faqs.slice(0, 6)} />
          <p className="mt-space-md text-center text-body-sm">
            <Link href="/sss" className="font-semibold text-primary underline">
              Tüm soruları gör
            </Link>
          </p>
        </div>
      </section>

      <section className="w-full bg-primary py-space-2xl text-on-primary">
        <div className="shell flex flex-col items-start justify-between gap-space-lg md:flex-row md:items-center">
          <div>
            <h2 className="text-headline-md">Hâlâ karar vermedin mi?</h2>
            <p className="mt-space-xs text-body-md text-primary-fixed">
              WhatsApp&apos;tan yaz, ücretsiz ön görüşme planlayalım. Bu hafta 142 öğrenci analiz yaptı.
            </p>
          </div>
          <div className="flex flex-wrap gap-space-sm">
            <a href={brand.whatsappHref} className="btn-primary">
              <Icon name="chat" className="text-[18px]" />
              WhatsApp
            </a>
            <Link
              href="/iletisim"
              className="inline-flex items-center rounded-full border border-on-primary/20 px-space-lg py-3 text-label-lg font-semibold text-on-primary transition hover:bg-white/10"
            >
              İletişim
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
