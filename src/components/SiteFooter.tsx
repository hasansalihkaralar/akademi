import Link from "next/link";
import { brand } from "@/lib/content";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="w-full bg-surface-container-low pb-space-lg pt-space-2xl shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
      <div className="shell">
        <div className="mb-space-2xl grid grid-cols-1 gap-space-xl md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col">
            <div className="mb-space-md">
              <Logo subtitle="YKS & LGS Rehberliği" />
            </div>
            <p className="mb-space-md text-body-sm leading-relaxed text-on-surface-variant">
              Türkiye&apos;nin en seçkin üniversite ve nitelikli liselerine hazırlanan
              öğrencilere; MEB ve PDR standartlarına tam uyumlu, kişiye özel analitik
              çalışma programları ve derece mentörleri ile sonuç odaklı koçluk sunuyoruz.
            </p>
            <div className="flex items-center gap-space-xs text-label-md font-semibold text-primary">
              <Icon name="verified" className="text-[18px]" />
              <span>MEB ve PDR Standartlarında Rehberlik</span>
            </div>
          </div>

          <div>
            <h3 className="mb-space-md text-title-lg font-bold text-on-surface">Hızlı Erişim</h3>
            <ul className="flex flex-col gap-space-sm text-body-sm text-on-surface-variant">
              <li>
                <Link href="/" className="transition-colors hover:text-primary">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/kocluk#yks" className="transition-colors hover:text-primary">
                  YKS Koçluğu
                </Link>
              </li>
              <li>
                <Link href="/kocluk#lgs" className="transition-colors hover:text-primary">
                  LGS Koçluğu
                </Link>
              </li>
              <li>
                <Link href="/paketler" className="transition-colors hover:text-primary">
                  Paketler & Ücretler
                </Link>
              </li>
              <li>
                <Link href="/koclarimiz" className="transition-colors hover:text-primary">
                  Koçlarımız
                </Link>
              </li>
              <li>
                <Link href="/sss" className="transition-colors hover:text-primary">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/giris" className="transition-colors hover:text-primary">
                  Öğrenci / Danışman Girişi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-space-md text-title-lg font-bold text-on-surface">Kurumsal</h3>
            <ul className="flex flex-col gap-space-sm text-body-sm text-on-surface-variant">
              <li>
                <Link href="/biz-kimiz" className="transition-colors hover:text-primary">
                  Biz Kimiz?
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="transition-colors hover:text-primary">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/yasal/mesafeli-satis" className="transition-colors hover:text-primary">
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/yasal/kvkk" className="transition-colors hover:text-primary">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/yasal/acik-riza" className="transition-colors hover:text-primary">
                  Açık Rıza Metni
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-space-md text-title-lg font-bold text-on-surface">İletişim</h3>
            <ul className="flex flex-col gap-space-sm text-body-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <Icon name="call" className="mt-0.5 text-[18px] text-primary" />
                <a href={brand.phoneHref}>{brand.phone}</a>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="chat" className="mt-0.5 text-[18px] text-secondary" />
                <a href={brand.whatsappHref} target="_blank" rel="noreferrer">
                  WhatsApp Destek
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="mail" className="mt-0.5 text-[18px] text-primary" />
                <a href={`mailto:${brand.email}`}>{brand.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="location_on" className="mt-0.5 text-[18px] text-primary" />
                <span>{brand.address}</span>
              </li>
            </ul>
            <div className="mt-space-md flex gap-space-sm">
              <a
                href={brand.instagram}
                className="grid h-9 w-9 place-items-center rounded-full bg-surface-container-lowest text-primary shadow-sm"
                aria-label="Instagram"
              >
                <Icon name="photo_camera" className="text-[18px]" />
              </a>
              <a
                href={brand.youtube}
                className="grid h-9 w-9 place-items-center rounded-full bg-surface-container-lowest text-primary shadow-sm"
                aria-label="YouTube"
              >
                <Icon name="play_circle" className="text-[18px]" />
              </a>
              <a
                href={brand.tiktok}
                className="grid h-9 w-9 place-items-center rounded-full bg-surface-container-lowest text-primary shadow-sm"
                aria-label="TikTok"
              >
                <Icon name="music_note" className="text-[18px]" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-space-sm border-t border-outline-variant/40 pt-space-lg text-center text-body-sm text-on-surface-variant md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} Pusula Akademi. Tüm hakları saklıdır.</p>
          <p>YKS & LGS derece koçluğu · Online takip paneli</p>
        </div>
      </div>
    </footer>
  );
}
