import type { Metadata } from "next";
import { PackagesView } from "@/components/PackagesView";

export const metadata: Metadata = { title: "Koçluk Paketleri" };

export default function PackagesPage() {
  return <PackagesView />;
}
