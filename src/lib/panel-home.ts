import type { PanelRole } from "@/lib/panel-data";

export function panelHomeForRole(role: string): string {
  if (role === "admin") return "/panel/admin";
  if (role === "danisman") return "/panel/danisman";
  if (role === "veli") return "/panel/ogrenci";
  return "/panel/ogrenci";
}

export function isPanelRole(role: string): role is PanelRole {
  return role === "ogrenci" || role === "danisman" || role === "veli" || role === "admin";
}
