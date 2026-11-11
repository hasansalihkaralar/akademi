"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelShell } from "@/components/panel/PanelShell";
import { isPanelRole, panelHomeForRole } from "@/lib/panel-home";

const nav = [
  { href: "/panel/ogrenci", label: "Özet", icon: "dashboard" },
  { href: "/panel/ogrenci/program", label: "Program", icon: "calendar_month" },
  { href: "/panel/ogrenci/denemeler", label: "Denemeler", icon: "analytics" },
  { href: "/panel/ogrenci/gorusmeler", label: "Görüşmeler", icon: "videocam" },
  { href: "/panel/ogrenci/siparisler", label: "Siparişlerim", icon: "receipt_long" },
];

export default function StudentPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    name: string;
    subtitle: string;
    role: "ogrenci" | "veli" | "bekliyor";
  }>({ name: "…", subtitle: "Oturum kontrol ediliyor", role: "bekliyor" });

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store", signal: ac.signal })
      .then(async (response) => {
        if (ac.signal.aborted) return;
        if (response.status === 401) {
          router.replace("/giris");
          return;
        }
        if (!response.ok) {
          setProfile((prev) => ({ ...prev, subtitle: "Oturum doğrulanamadı, yeniden dene." }));
          return;
        }
        const data = (await response.json()) as {
          user: { name: string; role: string };
          subtitle: string;
        };
        if (data.user.role !== "ogrenci" && data.user.role !== "veli") {
          router.replace(isPanelRole(data.user.role) ? panelHomeForRole(data.user.role) : "/giris");
          return;
        }
        setProfile({
          name: data.user.name,
          subtitle: data.subtitle,
          role: data.user.role === "veli" ? "veli" : "ogrenci",
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setProfile((prev) => ({ ...prev, subtitle: "Bağlantı hatası, sayfayı yenile." }));
      });
    return () => ac.abort();
  }, [router]);

  const items =
    profile.role === "ogrenci"
      ? nav
      : [
          ...nav.filter((item) => item.href !== "/panel/ogrenci/gorusmeler"),
        ].map((item) =>
          item.href === "/panel/ogrenci"
            ? { ...item, label: "Özet & talepler" }
            : item,
        );

  return (
    <PanelShell
      role={profile.role === "veli" ? "veli" : "ogrenci"}
      name={profile.name}
      subtitle={profile.subtitle}
      nav={items}
      homeHref="/panel/ogrenci"
    >
      {children}
    </PanelShell>
  );
}
