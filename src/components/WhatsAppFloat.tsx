import { brand } from "@/lib/content";
import { Icon } from "./Icon";

export function WhatsAppFloat() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      <div className="hidden items-center rounded-full border-0 bg-surface-container-lowest px-space-md py-space-sm text-label-md text-on-surface shadow-[0_10px_25px_-5px_rgba(15,23,42,0.12)] sm:flex">
        <span className="mr-space-xs h-2 w-2 animate-ping rounded-full bg-[#25D366]" />
        Sorunuz mu var? WhatsApp&apos;tan Yazın
      </div>
      <a
        href={brand.whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_24px_-4px_rgba(37,211,102,0.45)] transition-transform duration-200 hover:scale-105 active:scale-95"
        aria-label="WhatsApp Destek Hattı"
      >
        <Icon name="chat" className="text-[30px]" />
      </a>
    </div>
  );
}
