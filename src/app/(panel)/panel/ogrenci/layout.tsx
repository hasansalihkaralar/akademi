"use client";

import { PanelShell } from "@/components/panel/PanelShell";
import { demoAccounts } from "@/lib/panel-data";

const nav = [
  { href: "/panel/ogrenci", label: "Özet", icon: "dashboard" },
  { href: "/panel/ogrenci/program", label: "Program", icon: "calendar_month" },
  { href: "/panel/ogrenci/denemeler", label: "Denemeler", icon: "analytics" },
  { href: "/panel/ogrenci/gorusmeler", label: "Görüşmeler", icon: "videocam" },
];

export default function StudentPanelLayout({ children }: { children: React.ReactNode }) {
  const user = demoAccounts.ogrenci;
  return (
    <PanelShell
      role="ogrenci"
      name={user.name}
      subtitle={`${user.grade} · ${user.program} · Koç: ${user.coach}`}
      nav={nav}
    >
      {children}
    </PanelShell>
  );
}
