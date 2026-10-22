import { brand } from "@/lib/content";

export type SiteBrand = {
  name: string;
  tagline: string;
  logoUrl: string;
};

export type SiteMenuItem = {
  id: string;
  label: string;
  href: string;
};

export type SiteSlide = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonLabel: string;
  buttonHref: string;
};

export const defaultBrand: SiteBrand = {
  name: brand.name,
  tagline: brand.tagline,
  logoUrl: "/logo.png",
};

export const defaultMenu: SiteMenuItem[] = [
  { id: "home", label: "Ana Sayfa", href: "/" },
  { id: "kocluk", label: "YKS & LGS Koçluğu", href: "/kocluk" },
  { id: "paketler", label: "Paketler & Fiyatlar", href: "/paketler" },
  { id: "koclarimiz", label: "Koçlarımız", href: "/koclarimiz" },
  { id: "biz", label: "Biz Kimiz?", href: "/biz-kimiz" },
  { id: "sss", label: "S.S.S.", href: "/sss" },
  { id: "iletisim", label: "İletişim", href: "/iletisim" },
];
