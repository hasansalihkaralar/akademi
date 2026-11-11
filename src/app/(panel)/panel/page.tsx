import { redirect } from "next/navigation";
import { panelHomeForRole } from "@/lib/panel-home";
import { getSessionUser } from "@/lib/session";

export default async function PanelIndexPage() {
  const user = await getSessionUser();
  if (!user) redirect("/giris");
  redirect(panelHomeForRole(user.role));
}
