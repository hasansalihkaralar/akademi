import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getSiteContent } from "@/lib/site-content";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteContent();
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader menu={site.menu} siteBrand={site.brand} />
      <main className="min-h-[calc(100vh-64px)] flex-1 pt-16 md:min-h-[calc(100vh-80px)] md:pt-20">
        {children}
      </main>
      <SiteFooter siteBrand={site.brand} />
      <WhatsAppFloat />
    </div>
  );
}
