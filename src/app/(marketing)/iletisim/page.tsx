import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Icon } from "@/components/Icon";
import { brand } from "@/lib/content";

export const metadata: Metadata = { title: "İletişim" };

export default function ContactPage() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 top-40 h-64 w-64 rounded-full bg-secondary/5 blur-3xl" />

      <div className="shell relative py-space-2xl">
        <nav className="mb-space-md text-label-md text-on-surface-variant">
          Ana Sayfa / <span className="text-primary">İletişim</span>
        </nav>
        <span className="section-badge">Bize Ulaşın</span>
        <h1 className="mt-space-sm page-title">
          İletişim
        </h1>
        <p className="mt-space-md max-w-2xl text-body-lg text-on-surface-variant">
          Adresi olan yer güven verir. Ofisimiz İstanbul&apos;da; görüşmeler online yürür.
          Form, telefon veya WhatsApp — hangisi hızlıysa onu kullan.
        </p>

        <div className="mt-space-xl grid gap-space-md sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["call", "Çağrı Merkezi", brand.phone, brand.phoneHref, "Hafta içi 09:00–20:00"],
            ["chat", "WhatsApp", "Anında Destek", brand.whatsappHref, "7 gün hızlı yanıt"],
            ["mail", "E-posta", brand.email, `mailto:${brand.email}`, "24 saat içinde dönüş"],
            ["location_on", "Ofis", "Maslak / İstanbul", "/iletisim", "Randevu ile ziyaret"],
          ].map(([icon, title, value, href, note]) => (
            <a
              key={title}
              href={href}
              className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm transition hover:shadow-md"
            >
              <div className="mb-space-md flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                <Icon name={icon} className="text-[22px]" />
              </div>
              <p className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
                {title}
              </p>
              <p className="mt-1 text-title-md font-bold text-on-surface">{value}</p>
              <p className="mt-1 text-body-sm text-on-surface-variant">{note}</p>
            </a>
          ))}
        </div>

        <div className="mt-space-2xl grid gap-space-xl lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          <div className="space-y-space-md lg:col-span-5">
            <div className="rounded-2xl bg-surface-container-lowest p-space-xl shadow-md">
              <h3 className="text-headline-sm font-bold text-primary">Maslak Kampüs</h3>
              <p className="mt-space-sm text-body-sm text-on-surface-variant">{brand.address}</p>
              <div className="mt-space-md flex flex-wrap gap-space-sm">
                <a href={brand.instagram} className="text-label-md font-semibold text-primary underline">
                  Instagram
                </a>
                <a href={brand.youtube} className="text-label-md font-semibold text-primary underline">
                  YouTube
                </a>
                <a href={brand.tiktok} className="text-label-md font-semibold text-primary underline">
                  TikTok
                </a>
              </div>
            </div>
            <iframe
              title="Amfi Koçluk ofis konumu"
              src={brand.mapsUrl}
              className="h-72 w-full rounded-2xl border-0 shadow-md"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
