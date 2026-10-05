import Image from "next/image";
import Link from "next/link";

export function Logo({
  subtitle = "YKS & LGS Derece Koçluğu",
  compact = false,
}: {
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className="flex min-w-0 max-w-[min(100%,280px)] shrink items-center gap-2 sm:max-w-none sm:gap-space-md"
      aria-label="Pusula Akademi ana sayfa"
    >
      <Image
        src="/logo.png"
        alt=""
        width={120}
        height={40}
        className="h-7 w-auto shrink-0 object-contain sm:h-8"
        priority
      />
      <span className="flex min-w-0 flex-col">
        <span
          className={`truncate leading-none text-primary ${
            compact ? "text-[15px] font-bold sm:text-headline-sm" : "text-headline-sm"
          }`}
        >
          Pusula Akademi
        </span>
        <span
          className={`mt-0.5 truncate font-semibold tracking-wide text-secondary ${
            compact
              ? "hidden text-[10px] sm:mt-space-xs sm:block sm:text-label-md"
              : "text-label-md"
          }`}
        >
          {subtitle}
        </span>
      </span>
    </Link>
  );
}
