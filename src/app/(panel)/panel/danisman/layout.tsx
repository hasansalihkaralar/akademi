"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelShell } from "@/components/panel/PanelShell";

const nav = [
  { href: "/panel/danisman", label: "Özet", icon: "dashboard" },
  { href: "/panel/danisman/ogrenciler", label: "Öğrencilerim", icon: "groups" },
  { href: "/panel/danisman/takvim", label: "Takvim", icon: "event" },
  { href: "/panel/danisman/notlar", label: "Notlar", icon: "edit_note" },
  { href: "/panel/danisman/talepler", label: "Talepler", icon: "inbox" },
];

export default function AdvisorPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "…", subtitle: "Oturum kontrol ediliyor" });

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) {
          router.replace("/giris?rol=danisman");
          return;
        }
        const data = (await response.json()) as {
          user: { name: string; role: string };
          subtitle: string;
        };
        if (data.user.role !== "danisman") {
          router.replace("/giris?rol=danisman");
          return;
        }
        setProfile({ name: data.user.name, subtitle: data.subtitle });
      })
      .catch(() => router.replace("/giris?rol=danisman"));
  }, [router]);

  return (
    <PanelShell role="danisman" name={profile.name} subtitle={profile.subtitle} nav={nav}>
      {children}
    </PanelShell>
  );
}
