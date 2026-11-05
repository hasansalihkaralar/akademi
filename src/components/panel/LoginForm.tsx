"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { demoAccounts, type PanelRole } from "@/lib/panel-data";
import { panelHomeForRole } from "@/lib/panel-home";
import { safeHref } from "@/lib/validators";

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  const nextPath = nextRaw && safeHref(nextRaw)?.startsWith("/") ? safeHref(nextRaw)! : null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store", signal: ac.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as { user?: { role?: PanelRole } };
        if (!data.user?.role) return;
        window.location.assign(
          nextPath && data.user.role === "ogrenci" ? nextPath : panelHomeForRole(data.user.role),
        );
      })
      .catch(() => undefined);
    return () => ac.abort();
  }, [nextPath]);

  function fillDemo(role: PanelRole) {
    const account = demoAccounts[role];
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(12000),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        user?: { role: PanelRole };
      } | null;

      if (!response.ok || !data?.user) {
        setError(data?.error || "Giriş yapılamadı.");
        setLoading(false);
        return;
      }

      const home = panelHomeForRole(data.user.role);
      window.location.assign(nextPath && data.user.role === "ogrenci" ? nextPath : home);
    } catch {
      setError("Sunucuya ulaşılamadı. Birkaç saniye sonra tekrar dene.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-xl sm:p-space-xl">
      <div className="mb-space-lg">
        <div className="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-space-sm py-1 text-label-md font-semibold text-on-primary-fixed">
          <Icon name="verified_user" className="text-[16px]" />
          Amfi Koçluk Panel Girişi
        </div>
        <h1 className="mb-space-xs text-headline-md text-on-surface">Panele hoş geldiniz</h1>
        <p className="text-body-md text-on-surface-variant">
          E-posta ve şifrenle giriş yap. Hesap yetkine göre doğru panele yönlendirilirsin.
        </p>
      </div>

      <form className="flex flex-col gap-space-md" onSubmit={onSubmit}>
        <label className="block text-label-lg text-on-surface">
          E-posta <span className="text-secondary">*</span>
          <div className="relative mt-1.5 flex items-center">
            <Icon
              name="badge"
              className="pointer-events-none absolute left-3.5 text-[20px] text-on-surface-variant"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-lg bg-surface-container-low py-2 pl-11 pr-4 text-body-md text-on-surface outline-none transition focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
              placeholder="ornek@mail.com"
            />
          </div>
        </label>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-label-lg text-on-surface">
              Şifre <span className="text-secondary">*</span>
            </label>
            <button type="button" className="text-label-md text-secondary hover:text-secondary-container">
              Şifremi Unuttum?
            </button>
          </div>
          <div className="relative flex items-center">
            <Icon
              name="lock"
              className="pointer-events-none absolute left-3.5 text-[20px] text-on-surface-variant"
            />
            <input
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-lg bg-surface-container-low py-2 pl-11 pr-12 text-body-md text-on-surface outline-none transition focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
            <button
              type="button"
              aria-label="Şifreyi göster/gizle"
              className="absolute right-3 p-1 text-on-surface-variant hover:text-primary"
              onClick={() => setShowPassword((v) => !v)}
            >
              <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[20px]" />
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-space-xs select-none py-space-xs">
          <input type="checkbox" className="h-4 w-4 accent-primary" />
          <span className="text-body-sm text-on-surface-variant">Bu cihazda beni hatırla</span>
        </label>

        {error ? <p className="text-body-sm text-error">{error}</p> : null}

        <button type="submit" disabled={loading} className="btn-primary h-12 w-full disabled:opacity-70">
          <Icon name="login" className="text-[20px]" />
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <div className="mt-space-lg rounded-xl bg-surface-container-low p-space-md text-body-sm text-on-surface-variant">
        <p className="font-semibold text-on-surface">Demo hesaplar</p>
        <ul className="mt-space-xs space-y-1">
          {(
            [
              ["ogrenci", "Öğrenci"],
              ["danisman", "Danışman"],
              ["veli", "Veli"],
              ["admin", "Yönetim"],
            ] as const
          ).map(([role, label]) => (
            <li key={role}>
              <button
                type="button"
                onClick={() => fillDemo(role)}
                className="text-left hover:text-primary hover:underline"
              >
                {label}: {demoAccounts[role].email} / {demoAccounts[role].password}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-space-md text-center text-body-sm text-on-surface-variant">
        Öğrenci hesabın yok mu?{" "}
        <Link
          href={nextPath ? `/uye-ol?next=${encodeURIComponent(nextPath)}` : "/uye-ol"}
          className="font-semibold text-primary"
        >
          Üye ol
        </Link>
      </p>

      <div className="mt-space-md flex flex-wrap items-center justify-between gap-space-sm text-label-md text-on-surface-variant">
        <span className="inline-flex items-center gap-1">
          <Icon name="lock" className="text-[16px] text-[#15803D]" />
          256-Bit SSL
        </span>
        <Link href="/paketler" className="font-semibold text-primary">
          Paketleri Gör
        </Link>
      </div>
    </div>
  );
}
