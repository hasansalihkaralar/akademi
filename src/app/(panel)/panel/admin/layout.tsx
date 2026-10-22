"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelShell } from "@/components/panel/PanelShell";

const groups = [
  {
    label: "Yönetim",
    items: [
      { href: "/panel/admin", label: "Özet", icon: "dashboard" },
      { href: "/panel/admin/ogrenciler", label: "Öğrenciler", icon: "groups" },
      { href: "/panel/admin/danismanlar", label: "Danışmanlar", icon: "psychology" },
      { href: "/panel/admin/talepler", label: "Talepler", icon: "inbox" },
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
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) {
          router.replace("/giris?rol=admin");
          return;
        }
        const data = (await response.json()) as {
          user: { name: string; role: string };
          subtitle: string;
        };
        if (data.user.role !== "admin") {
          router.replace("/giris?rol=admin");
          return;
        }
        setProfile({ name: data.user.name, subtitle: data.subtitle });
      })
      .catch(() => router.replace("/giris?rol=admin"));
  }, [router]);

  return (
    <PanelShell role="admin" name={profile.name} subtitle={profile.subtitle} groups={groups}>
      {children}
    </PanelShell>
  );
}
