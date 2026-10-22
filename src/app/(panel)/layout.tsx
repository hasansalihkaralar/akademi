import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Amfi Panel",
    default: "Panel",
  },
};

export default function PanelRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
