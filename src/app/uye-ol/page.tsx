import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { RegisterForm } from "@/components/RegisterForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Öğrenci Üyeliği" };

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1 pt-16 md:pt-20">
        <div className="border-0 bg-surface-container-low py-space-sm">
          <div className="shell flex items-center justify-between">
            <nav className="flex items-center gap-space-xs text-label-md text-on-surface-variant">
              <Link href="/" className="flex items-center gap-1 hover:text-primary">
                <Icon name="home" className="text-[16px]" />
                Ana Sayfa
              </Link>
              <Icon name="chevron_right" className="text-[14px] text-outline" />
              <span className="font-semibold text-primary">Üye Ol</span>
            </nav>
          </div>
        </div>

        <section className="relative overflow-hidden bg-surface py-space-xl lg:py-space-2xl">
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 rounded-full bg-secondary-container/10 blur-3xl" />
          <div className="shell relative z-10">
            <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-space-xl lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-surface-container" />}>
                  <RegisterForm />
                </Suspense>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-xl bg-primary p-space-lg text-on-primary shadow-xl">
                  <h2 className="text-headline-sm">Üyelikle neler gelir?</h2>
                  <ul className="mt-space-lg space-y-space-sm text-body-sm">
                    {[
                      "Haftalık program ve görev takibi",
                      "Deneme netlerini görme",
                      "Danışmanla randevu alma",
                      "Üyelik sonrası paket satın alma",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-space-xs">
                        <Icon name="check_circle" className="text-[18px] text-secondary-container" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-space-lg text-body-sm text-primary-fixed">
                    Önce üye ol, sonra paket satın al. Danışman ataması yönetim panelinden yapılır.
                  </p>
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
