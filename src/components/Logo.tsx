"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { defaultBrand, type SiteBrand } from "@/lib/site-defaults";

export function Logo({
  brand,
  compact = false,
  markOnly = false,
}: {
  brand?: SiteBrand;
  compact?: boolean;
  markOnly?: boolean;
}) {
  const [live, setLive] = useState<SiteBrand>(brand ?? defaultBrand);

  useEffect(() => {
    if (brand) {
      setLive(brand);
      return;
    }
    let ignore = false;
    function pull() {
      fetch("/api/site")
        .then(async (response) => {
          if (!response.ok || ignore) return;
          const data = (await response.json()) as { brand: SiteBrand };
          if (!ignore && data.brand) setLive(data.brand);
        })
        .catch(() => undefined);
    }
    pull();
    window.addEventListener("site-content", pull);
    return () => {
      ignore = true;
      window.removeEventListener("site-content", pull);
    };
  }, [brand]);

  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2 sm:gap-space-md"
      aria-label={`${live.name} ana sayfa`}
    >
      <img
        src={live.logoUrl}
        alt=""
        className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
      />
      {markOnly ? null : (
        <span className="flex min-w-0 flex-col">
          <span
            className={`truncate leading-none text-primary ${
              compact ? "text-[15px] font-bold sm:text-headline-sm" : "text-headline-sm"
            }`}
          >
            {live.name}
          </span>
          <span
            className={`mt-0.5 truncate font-semibold tracking-wide text-secondary ${
              compact
                ? "hidden text-[10px] sm:mt-space-xs sm:block sm:text-label-md"
                : "text-label-md"
            }`}
          >
            {live.tagline}
          </span>
        </span>
      )}
    </Link>
  );
}
