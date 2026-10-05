import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="min-h-[calc(100vh-80px)] flex-1 pt-20">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
