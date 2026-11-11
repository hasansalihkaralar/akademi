"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { brand } from "@/lib/content";
import { panelHomeForRole } from "@/lib/panel-home";
import { defaultBrand, defaultMenu, type SiteBrand, type SiteMenuItem } from "@/lib/site-defaults";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

export function SiteHeader({
  menu = defaultMenu,
  siteBrand = defaultBrand,
}: {
  menu?: SiteMenuItem[];
  siteBrand?: SiteBrand;
}) {
  const [open, setOpen] = useState(false);
  const [accountHref, setAccountHref] = useState("/giris");
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store", signal: ac.signal })
      .then(async (response) => {
        if (!response.ok) {
          setAccountHref("/giris");
          return;
        }
        const data = (await response.json()) as { user?: { role?: string } };
        setAccountHref(data.user?.role ? panelHomeForRole(data.user.role) : "/giris");
      })
      .catch(() => setAccountHref("/giris"));
    return () => ac.abort();
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
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 md:h-20">
        <Logo compact brand={siteBrand} />

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 overflow-x-auto 2xl:flex">
          {menu.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.id}
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
          <Link
            href="/on-gorusme"
            className="btn-primary hidden h-10 px-3 py-0 text-label-md lg:inline-flex xl:px-space-lg"
          >
            <Icon name="calendar_today" className="text-[16px]" />
            <span className="hidden xl:inline">Ücretsiz Ön Görüşme Yap</span>
            <span className="xl:hidden">Ön Görüşme</span>
          </Link>

          <Link
            href={accountHref}
            className="grid h-9 w-9 place-items-center rounded-full bg-primary text-on-primary sm:h-8 sm:w-8"
            aria-label={accountHref === "/giris" ? "Panele giriş" : "Panele dön"}
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
              {menu.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.id}
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

              <div className="mt-space-sm flex flex-col gap-space-sm pb-space-md">
                <Link
                  href="/on-gorusme"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full"
                >
                  Ücretsiz Ön Görüşme Yap
                </Link>
                <Link
                  href="/uye-ol"
                  onClick={() => setOpen(false)}
                  className="btn-secondary w-full"
                >
                  Öğrenci Üye Ol
                </Link>
                <Link
                  href={accountHref}
                  onClick={() => setOpen(false)}
                  className="btn-secondary w-full"
                >
                  {accountHref === "/giris" ? "Giriş Yap" : "Panele Dön"}
                </Link>
                <a
                  href={brand.phoneHref}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-space-md py-3 text-title-md text-on-surface hover:bg-surface-container-low"
                >
                  <Icon name="call" className="text-[20px] text-primary" />
                  {brand.phone}
                </a>
                <a
                  href={brand.whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-space-md py-3 text-title-md text-on-surface hover:bg-surface-container-low"
                >
                  <Icon name="chat" className="text-[20px] text-primary" />
                  WhatsApp
                </a>
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
