"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";

type NavItem = { href: string; label: string; icon: string };

export function PanelShell({
  role,
  name,
  subtitle,
  nav,
  children,
}: {
  role: "ogrenci" | "danisman" | "veli" | "admin";
  name: string;
  subtitle: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/giris");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-outline-variant/30 bg-surface-container-lowest p-space-md lg:flex">
        <div className="mb-space-lg px-space-sm">
          <Logo />
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-space-sm rounded-lg px-space-md py-2.5 text-label-lg transition ${
                  active
                    ? "bg-primary font-bold text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <Icon name={item.icon} className="text-[20px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="mt-space-md flex items-center gap-space-sm rounded-lg px-space-md py-2.5 text-label-lg text-on-surface-variant transition hover:bg-surface-container"
        >
          <Icon name="logout" className="text-[20px]" />
          Çıkış Yap
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-outline-variant/30 bg-surface-container-lowest/95 px-space-md py-space-md backdrop-blur lg:px-space-xl">
          <div className="flex items-start justify-between gap-space-md">
            <div className="flex min-w-0 items-start gap-space-sm">
              <Link href="/" className="mt-0.5 shrink-0 lg:hidden" aria-label="Amfi Koçluk ana sayfa">
                <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
              </Link>
              <div className="min-w-0">
              <p className="text-label-md font-bold uppercase tracking-wider text-secondary">
                {role === "admin"
                  ? "Yönetim Paneli"
                  : role === "danisman"
                    ? "Danışman Paneli"
                    : role === "veli"
                      ? "Veli Paneli"
                      : "Öğrenci Paneli"}
              </p>
              <h1 className="truncate text-title-lg font-bold text-on-surface">{name}</h1>
              <p className="line-clamp-2 text-body-sm text-on-surface-variant sm:line-clamp-none">
                {subtitle}
              </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-space-sm">
              <button
                type="button"
                onClick={logout}
                className="grid h-10 w-10 place-items-center rounded-full bg-surface-container text-on-surface-variant lg:hidden"
                aria-label="Çıkış yap"
              >
                <Icon name="logout" className="text-[20px]" />
              </button>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full bg-surface-container text-primary"
                aria-label="Bildirimler"
              >
                <Icon name="notifications" className="text-[20px]" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-label-md font-bold text-on-primary">
                {name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            </div>
          </div>
        </header>

        <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-outline-variant/30 bg-surface-container-lowest px-space-md [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-label-md font-semibold ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 overflow-x-hidden p-space-md pb-24 lg:p-space-xl lg:pb-space-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
