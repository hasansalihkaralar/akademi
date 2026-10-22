"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelShell } from "@/components/panel/PanelShell";

const nav = [
  { href: "/panel/admin", label: "Özet", icon: "dashboard" },
  { href: "/panel/admin/ogrenciler", label: "Öğrenciler", icon: "groups" },
  { href: "/panel/admin/danismanlar", label: "Danışmanlar", icon: "psychology" },
  { href: "/panel/admin/talepler", label: "Talepler", icon: "inbox" },
  { href: "/panel/admin/mesajlar", label: "Mesajlar", icon: "mail" },
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
    <PanelShell role="admin" name={profile.name} subtitle={profile.subtitle} nav={nav}>
      {children}
    </PanelShell>
  );
}
