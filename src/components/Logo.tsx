import Image from "next/image";
import Link from "next/link";

export function Logo({
  subtitle = "YKS & LGS Derece Koçluğu",
}: {
  subtitle?: string;
}) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-space-md" aria-label="Pusula Akademi ana sayfa">
      <Image
        src="/logo.png"
        alt="Pusula Akademi"
        width={120}
        height={40}
        className="h-8 w-auto object-contain"
        priority
      />
      <span className="flex flex-col">
        <span className="text-headline-sm leading-none text-primary">Pusula Akademi</span>
        <span className="mt-space-xs text-label-md font-semibold tracking-wide text-secondary">
          {subtitle}
        </span>
      </span>
    </Link>
  );
}
