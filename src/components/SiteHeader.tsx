"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brand } from "@/lib/content";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/kocluk", label: "YKS & LGS Koçluğu" },
  { href: "/paketler", label: "Paketler & Fiyatlar" },
  { href: "/koclarimiz", label: "Koçlarımız" },
  { href: "/biz-kimiz", label: "Biz Kimiz?" },
  { href: "/sss", label: "S.S.S." },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 w-full bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="shell flex h-20 items-center justify-between gap-space-md">
        <Logo />
        <nav className="hidden items-center gap-space-lg xl:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap text-title-md transition-colors ${
                  active
                    ? "font-bold text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-space-sm">
          <a
            href={brand.phoneHref}
            className="hidden items-center gap-space-xs rounded-full bg-surface-container px-space-md py-space-sm text-label-lg text-on-surface transition-colors hover:bg-surface-container-high lg:flex"
          >
            <Icon name="call" className="text-[18px] text-primary" />
            <span>{brand.phone}</span>
          </a>
          <a
            href={brand.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-space-xs rounded-full bg-surface-container-low px-space-md py-space-sm text-label-lg text-on-surface transition-colors hover:bg-surface-container md:flex"
          >
            <span className="h-2 w-2 rounded-full bg-[#25D366]" />
            <span>WhatsApp</span>
          </a>
          <Link href="/on-gorusme" className="btn-primary hidden py-space-sm sm:inline-flex">
            <Icon name="calendar_today" className="text-[18px]" />
            <span>Ücretsiz Ön Görüşme Yap</span>
          </Link>
          <Link
            href="/giris"
            className="grid h-8 w-8 place-items-center rounded-full bg-primary text-on-primary"
            aria-label="Panele giriş"
          >
            <Icon name="person" className="text-[18px]" />
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg bg-surface-container text-primary xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menü"
          >
            <Icon name={open ? "close" : "menu"} className="text-[22px]" />
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-outline-variant/30 bg-surface px-gutter py-space-lg xl:hidden">
          <div className="flex flex-col gap-space-md">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-title-md text-on-surface"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/on-gorusme" onClick={() => setOpen(false)} className="btn-primary">
              Ücretsiz Ön Görüşme Yap
            </Link>
            <Link
              href="/giris"
              onClick={() => setOpen(false)}
              className="btn-secondary text-center"
            >
              Öğrenci / Danışman Girişi
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
