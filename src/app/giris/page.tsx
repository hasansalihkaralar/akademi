import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { LoginForm } from "@/components/panel/LoginForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Öğrenci & Danışman Girişi" };

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1 pt-20">
        <div className="border-0 bg-surface-container-low py-space-sm">
          <div className="shell flex items-center justify-between">
            <nav className="flex items-center gap-space-xs text-label-md text-on-surface-variant">
              <Link href="/" className="flex items-center gap-1 hover:text-primary">
                <Icon name="home" className="text-[16px]" />
                Ana Sayfa
              </Link>
              <Icon name="chevron_right" className="text-[14px] text-outline" />
              <span className="font-semibold text-primary">Giriş Portalı</span>
            </nav>
            <span className="hidden items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-label-md font-semibold text-[#15803D] sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#15803D]" />
              Portal Aktif
            </span>
          </div>
        </div>

        <section className="relative overflow-hidden bg-surface py-space-xl lg:py-space-2xl">
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 rounded-full bg-secondary-container/10 blur-3xl" />
          <div className="shell relative z-10">
            <div className="grid grid-cols-1 items-start gap-space-xl lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-surface-container" />}>
                  <LoginForm />
                </Suspense>
              </div>

              <div className="flex flex-col gap-space-lg lg:col-span-5">
                <div className="relative overflow-hidden rounded-xl bg-primary p-space-lg text-on-primary shadow-xl">
                  <h2 className="text-headline-sm">Tek panel, iki taraf</h2>
                  <p className="mt-space-sm text-body-sm text-primary-fixed">
                    Öğrenci kendi programını takip eder; danışman tüm öğrencilerin
                    netlerini, seanslarını ve risk durumunu yönetir.
                  </p>
                  <ul className="mt-space-lg space-y-space-sm text-body-sm">
                    {[
                      "Haftalık program & günlük görevler",
                      "Deneme net grafikleri",
                      "Online seans takvimi",
                      "Danışman notları ve veli özeti",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-space-xs">
                        <Icon name="check_circle" className="text-[18px] text-secondary-container" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-md">
                  <h3 className="text-title-lg font-bold text-on-surface">Hızlı erişim</h3>
                  <div className="mt-space-md grid gap-space-sm">
                    <Link
                      href="/giris?rol=ogrenci"
                      className="flex items-center gap-space-sm rounded-lg bg-surface-container-low px-space-md py-3 text-label-lg font-semibold text-primary"
                    >
                      <Icon name="school" className="text-[20px]" />
                      Öğrenci paneli
                    </Link>
                    <Link
                      href="/giris?rol=danisman"
                      className="flex items-center gap-space-sm rounded-lg bg-surface-container-low px-space-md py-3 text-label-lg font-semibold text-primary"
                    >
                      <Icon name="psychology" className="text-[20px]" />
                      Danışman paneli
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
