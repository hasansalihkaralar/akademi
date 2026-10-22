"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelShell } from "@/components/panel/PanelShell";

const nav = [
  { href: "/panel/ogrenci", label: "Özet", icon: "dashboard" },
  { href: "/panel/ogrenci/program", label: "Program", icon: "calendar_month" },
  { href: "/panel/ogrenci/denemeler", label: "Denemeler", icon: "analytics" },
  { href: "/panel/ogrenci/gorusmeler", label: "Görüşmeler", icon: "videocam" },
];

export default function StudentPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    name: string;
    subtitle: string;
    role: "ogrenci" | "veli";
  }>({ name: "…", subtitle: "Oturum kontrol ediliyor", role: "ogrenci" });

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) {
          router.replace("/giris?rol=ogrenci");
          return;
        }
        const data = (await response.json()) as {
          user: { name: string; role: string };
          subtitle: string;
        };
        if (data.user.role !== "ogrenci" && data.user.role !== "veli") {
          router.replace("/giris?rol=ogrenci");
          return;
        }
        setProfile({
          name: data.user.name,
          subtitle: data.subtitle,
          role: data.user.role === "veli" ? "veli" : "ogrenci",
        });
      })
      .catch(() => router.replace("/giris?rol=ogrenci"));
  }, [router]);

  return (
    <PanelShell role={profile.role} name={profile.name} subtitle={profile.subtitle} nav={nav}>
      {children}
    </PanelShell>
  );
}
