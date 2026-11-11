"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelShell } from "@/components/panel/PanelShell";
import { isPanelRole, panelHomeForRole } from "@/lib/panel-home";

const nav = [
  { href: "/panel/danisman", label: "Özet", icon: "dashboard" },
  { href: "/panel/danisman/ogrenciler", label: "Öğrencilerim", icon: "groups" },
  { href: "/panel/danisman/takvim", label: "Takvim", icon: "event" },
  { href: "/panel/danisman/ara-gorusmeler", label: "Ara Görüşme", icon: "fact_check" },
  { href: "/panel/danisman/notlar", label: "Notlar", icon: "edit_note" },
  { href: "/panel/danisman/talepler", label: "Talepler", icon: "inbox" },
];

export default function AdvisorPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "…", subtitle: "Oturum kontrol ediliyor" });

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
        if (data.user.role !== "danisman") {
          router.replace(isPanelRole(data.user.role) ? panelHomeForRole(data.user.role) : "/giris");
          return;
        }
        setProfile({ name: data.user.name, subtitle: data.subtitle });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setProfile((prev) => ({ ...prev, subtitle: "Bağlantı hatası, sayfayı yenile." }));
      });
    return () => ac.abort();
  }, [router]);

  return (
    <PanelShell
      role="danisman"
      name={profile.name}
      subtitle={profile.subtitle}
      nav={nav}
      homeHref="/panel/danisman"
    >
      {children}
    </PanelShell>
  );
}
