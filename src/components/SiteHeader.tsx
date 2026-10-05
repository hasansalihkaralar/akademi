"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="fixed top-0 z-50 w-full bg-surface/95 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-3 md:h-20 md:gap-space-md">
        <Logo compact />

        <nav className="hidden items-center gap-5 2xl:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap text-[13px] transition-colors ${
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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-space-sm">
          <a
            href={brand.phoneHref}
            className="hidden items-center gap-space-xs rounded-full bg-surface-container px-3 py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container-high xl:flex"
            aria-label={brand.phone}
          >
            <Icon name="call" className="text-[18px] text-primary" />
            <span className="hidden 2xl:inline">{brand.phone}</span>
          </a>

          <a
            href={brand.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-space-xs rounded-full bg-surface-container-low px-3 py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container lg:flex"
          >
            <span className="h-2 w-2 rounded-full bg-[#25D366]" />
            <span>WhatsApp</span>
          </a>

          <Link
            href="/on-gorusme"
            className="btn-primary hidden h-10 px-3 py-0 text-label-md lg:inline-flex xl:px-space-lg"
          >
            <Icon name="calendar_today" className="text-[16px]" />
            <span className="hidden xl:inline">Ücretsiz Ön Görüşme Yap</span>
            <span className="xl:hidden">Ön Görüşme</span>
          </Link>

          <Link
            href="/giris"
            className="grid h-9 w-9 place-items-center rounded-full bg-primary text-on-primary sm:h-8 sm:w-8"
            aria-label="Panele giriş"
          >
            <Icon name="person" className="text-[18px]" />
          </Link>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg bg-surface-container text-primary 2xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
          >
            <Icon name={open ? "close" : "menu"} className="text-[22px]" />
          </button>
        </div>
      </div>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 z-40 bg-on-surface/30 md:top-20 2xl:hidden"
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 max-h-[min(80vh,640px)] overflow-y-auto border-t border-outline-variant/30 bg-surface shadow-lg 2xl:hidden">
            <nav className="shell flex flex-col gap-1 py-space-md">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-lg px-space-md py-3 text-title-md transition ${
                      active
                        ? "bg-primary-fixed font-bold text-primary"
                        : "text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="my-space-sm h-px bg-outline-variant/40" />

              <a
                href={brand.phoneHref}
                className="flex items-center gap-space-sm rounded-lg px-space-md py-3 text-title-md text-on-surface"
              >
                <Icon name="call" className="text-[20px] text-primary" />
                {brand.phone}
              </a>
              <a
                href={brand.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-space-sm rounded-lg px-space-md py-3 text-title-md text-on-surface"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#25D366]" />
                WhatsApp Destek
              </a>

              <div className="mt-space-sm flex flex-col gap-space-sm pb-space-md">
                <Link
                  href="/on-gorusme"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full"
                >
                  Ücretsiz Ön Görüşme Yap
                </Link>
                <Link
                  href="/giris"
                  onClick={() => setOpen(false)}
                  className="btn-secondary w-full"
                >
                  Öğrenci / Danışman Girişi
                </Link>
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
