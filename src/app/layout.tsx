import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Amfi Koçluk | YKS & LGS Derece Koçluğu",
    template: "%s | Amfi Koçluk",
  },
  description:
    "YKS ve LGS hazırlığında kişiye özel program, deneme analizi, günlük takip ve PDR uzmanı koçluk. Veli bilgilendirme sistemiyle şeffaf süreç.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-surface font-sans text-on-surface">{children}</body>
    </html>
  );
}
