"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { demoAccounts, type PanelRole } from "@/lib/panel-data";

const tabs: { id: PanelRole; label: string; icon: string }[] = [
  { id: "ogrenci", label: "Öğrenci Girişi", icon: "school" },
  { id: "danisman", label: "Danışman Girişi", icon: "psychology" },
  { id: "veli", label: "Veli Girişi", icon: "family_restroom" },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("rol") as PanelRole) || "ogrenci";
  const [role, setRole] = useState<PanelRole>(
    tabs.some((t) => t.id === initialRole) ? initialRole : "ogrenci",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const copy = useMemo(() => {
    if (role === "danisman") {
      return {
        badge: "Pusula Akademi Danışman Paneli",
        title: "Danışman Portalı'na Hoş Geldiniz",
        desc: "Öğrenci listeni, haftalık seanslarını ve deneme takiplerini tek ekrandan yönet.",
        submit: "Danışman Paneline Giriş Yap",
        redirect: "/panel/danisman",
      };
    }
    if (role === "veli") {
      return {
        badge: "Pusula Akademi Veli Bilgi Sistemi",
        title: "Veli Portalı'na Hoş Geldiniz",
        desc: "Öğrencinin haftalık tamamlama oranını, deneme netlerini ve koç notlarını takip edin.",
        submit: "Veli Portalı'na Giriş Yap",
        redirect: "/panel/ogrenci?veli=1",
      };
    }
    return {
      badge: "Pusula Akademi Öğrenci Bilgi Sistemi",
      title: "Öğrenci Portalı'na Hoş Geldiniz",
      desc: "Haftalık çalışma programını görüntüle, deneme analizlerini incele ve koçunla görüşmelerini planla.",
      submit: "Öğrenci Portalı'na Giriş Yap",
      redirect: "/panel/ogrenci",
    };
  }, [role]);

  function fillDemo() {
    const account = demoAccounts[role === "veli" ? "veli" : role];
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 700));

    const account = demoAccounts[role === "veli" ? "veli" : role];
    const ok =
      (email === account.email && password === account.password) ||
      (email.length > 3 && password.length >= 4);

    if (!ok) {
      setError("Giriş bilgileri hatalı. Demo için 'Demo doldur' kullanabilirsiniz.");
      setLoading(false);
      return;
    }

    localStorage.setItem("pusula-panel-role", role === "veli" ? "veli" : role);
    localStorage.setItem(
      "pusula-panel-user",
      JSON.stringify({
        name: account.name,
        email: account.email,
        role,
      }),
    );
    router.push(copy.redirect);
  }

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-xl sm:p-space-xl">
      <div className="mb-space-lg flex items-center rounded-xl bg-surface-container-low p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setRole(tab.id);
              setError("");
            }}
            className={`flex flex-1 items-center justify-center gap-space-xs rounded-lg px-space-sm py-space-sm text-label-md font-semibold transition-all sm:text-label-lg ${
              role === tab.id
                ? "bg-surface-container-lowest font-bold text-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Icon name={tab.icon} className="text-[18px] sm:text-[20px]" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">
              {tab.id === "ogrenci" ? "Öğrenci" : tab.id === "danisman" ? "Danışman" : "Veli"}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-space-lg">
        <div className="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-space-sm py-1 text-label-md font-semibold text-on-primary-fixed">
          <Icon name="verified_user" className="text-[16px]" />
          {copy.badge}
        </div>
        <h1 className="mb-space-xs text-headline-md text-on-surface">{copy.title}</h1>
        <p className="text-body-md text-on-surface-variant">{copy.desc}</p>
      </div>

      <form className="flex flex-col gap-space-md" onSubmit={onSubmit}>
        <label className="block text-label-lg text-on-surface">
          E-posta veya telefon <span className="text-secondary">*</span>
          <div className="relative mt-1.5 flex items-center">
            <Icon
              name="badge"
              className="pointer-events-none absolute left-3.5 text-[20px] text-on-surface-variant"
            />
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-lg bg-surface-container-low py-2 pl-11 pr-4 text-body-md text-on-surface outline-none transition focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary"
              placeholder="ornek@mail.com veya 05XX..."
            />
          </div>
        </label>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-label-lg text-on-surface">
              Portal giriş şifresi <span className="text-secondary">*</span>
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

        <div className="flex items-center justify-between py-space-xs">
          <label className="flex cursor-pointer items-center gap-space-xs select-none">
            <input type="checkbox" className="h-4 w-4 accent-primary" />
            <span className="text-body-sm text-on-surface-variant">Bu cihazda beni hatırla</span>
          </label>
          <button
            type="button"
            onClick={fillDemo}
            className="text-label-md font-semibold text-primary underline"
          >
            Demo doldur
          </button>
        </div>

        {error ? <p className="text-body-sm text-error">{error}</p> : null}

        <button type="submit" disabled={loading} className="btn-primary h-12 w-full disabled:opacity-70">
          <Icon name="login" className="text-[20px]" />
          {loading ? "Giriş yapılıyor..." : copy.submit}
        </button>
      </form>

      <div className="mt-space-lg rounded-xl bg-surface-container-low p-space-md text-body-sm text-on-surface-variant">
        <p className="font-semibold text-on-surface">Demo hesaplar</p>
        <ul className="mt-space-xs space-y-1">
          <li>Öğrenci: ogrenci@demo.com / demo123</li>
          <li>Danışman: danisman@demo.com / demo123</li>
          <li>Veli: veli@demo.com / demo123</li>
        </ul>
      </div>

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
