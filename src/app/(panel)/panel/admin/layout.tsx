"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelShell } from "@/components/panel/PanelShell";
import { isPanelRole, panelHomeForRole } from "@/lib/panel-home";

const groups = [
  {
    label: "Yönetim",
    items: [
      { href: "/panel/admin", label: "Özet", icon: "dashboard" },
      { href: "/panel/admin/ogrenciler", label: "Öğrenciler", icon: "groups" },
      { href: "/panel/admin/danismanlar", label: "Danışmanlar", icon: "psychology" },
      { href: "/panel/admin/talepler", label: "Talepler", icon: "inbox" },
      { href: "/panel/admin/odemeler", label: "Ödemeler", icon: "payments" },
      { href: "/panel/admin/mesajlar", label: "Mesajlar", icon: "mail" },
    ],
  },
  {
    label: "Site içeriği",
    items: [
      { href: "/panel/admin/icerik/logo", label: "Logo", icon: "image" },
      { href: "/panel/admin/icerik/menu", label: "Menü", icon: "menu" },
      { href: "/panel/admin/icerik/slider", label: "Slider", icon: "view_carousel" },
      { href: "/panel/admin/icerik/gorseller", label: "Görseller", icon: "photo_library" },
    ],
  },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
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
        if (data.user.role !== "admin") {
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
      role="admin"
      name={profile.name}
      subtitle={profile.subtitle}
      groups={groups}
      homeHref="/panel/admin"
    >
      {children}
    </PanelShell>
  );
}
