import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { brand } from "@/lib/content";
import { defaultBrand, defaultMenu, type SiteBrand, type SiteMenuItem, type SiteSlide } from "@/lib/site-defaults";

export function publishSite() {
  revalidatePath("/", "layout");
}

async function ensureSiteContent() {
  await prisma.$transaction(async (tx) => {
    const seeded = await tx.siteSetting.findUnique({ where: { key: "seeded" } });
    if (seeded) return;
    await tx.siteSetting.createMany({
      data: [
        { key: "seeded", value: "1" },
        { key: "brandName", value: brand.name },
        { key: "tagline", value: brand.tagline },
        { key: "logoUrl", value: "/logo.png" },
      ],
    });
    await tx.navLink.createMany({
      data: defaultMenu.map((item, index) => ({
        label: item.label,
        href: item.href,
        sortOrder: (index + 1) * 10,
        visible: true,
      })),
    });
  });
}

export async function getSiteContent(): Promise<{ brand: SiteBrand; menu: SiteMenuItem[]; slides: SiteSlide[] }> {
  noStore();
  await ensureSiteContent();
  const [settings, links, slides] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.navLink.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" } }),
    prisma.slide.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  const map = new Map(settings.map((item) => [item.key, item.value]));
  return {
    brand: {
      name: map.get("brandName") || defaultBrand.name,
      tagline: map.get("tagline") || defaultBrand.tagline,
      logoUrl: map.get("logoUrl") || defaultBrand.logoUrl,
    },
    menu: links.map((item) => ({ id: item.id, label: item.label, href: item.href })),
    slides: slides.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      imageUrl: item.imageUrl,
      buttonLabel: item.buttonLabel,
      buttonHref: item.buttonHref,
    })),
  };
}

export async function shiftOrder(
  items: { id: string; sortOrder: number }[],
  id: string,
  direction: "up" | "down",
  update: (id: string, sortOrder: number) => Promise<unknown>,
) {
  const ordered = [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
  const index = ordered.findIndex((item) => item.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= ordered.length) return;
  if (ordered[index].sortOrder === ordered[target].sortOrder) {
    await Promise.all(ordered.map((item, position) => update(item.id, (position + 1) * 10)));
    ordered.forEach((item, position) => {
      item.sortOrder = (position + 1) * 10;
    });
  }
  const current = ordered[index];
  const other = ordered[target];
  await Promise.all([update(current.id, other.sortOrder), update(other.id, current.sortOrder)]);
}
