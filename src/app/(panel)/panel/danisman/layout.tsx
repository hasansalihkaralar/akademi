"use client";

import { PanelShell } from "@/components/panel/PanelShell";
import { demoAccounts } from "@/lib/panel-data";

const nav = [
  { href: "/panel/danisman", label: "Özet", icon: "dashboard" },
  { href: "/panel/danisman/ogrenciler", label: "Öğrencilerim", icon: "groups" },
  { href: "/panel/danisman/takvim", label: "Takvim", icon: "event" },
  { href: "/panel/danisman/notlar", label: "Notlar", icon: "edit_note" },
];

export default function AdvisorPanelLayout({ children }: { children: React.ReactNode }) {
  const user = demoAccounts.danisman;
  return (
    <PanelShell
      role="danisman"
      name={user.name}
      subtitle={`${user.title} · ${user.students} aktif öğrenci`}
      nav={nav}
    >
      {children}
    </PanelShell>
  );
}
