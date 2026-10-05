import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Pusula Panel",
    default: "Panel",
  },
};

export default function PanelRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
