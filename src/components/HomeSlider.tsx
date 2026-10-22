"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SiteSlide } from "@/lib/site-defaults";

export function HomeSlider({ slides }: { slides: SiteSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[index] ?? slides[0];

  function step(delta: number) {
    setIndex((current) => (current + delta + slides.length) % slides.length);
  }

  return (
    <section className="shell pt-space-lg" aria-roledescription="carousel" aria-label="Ana sayfa slaytları">
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low">
        <img src={slide.imageUrl} alt="" className="h-64 w-full object-cover sm:h-80 md:h-[420px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-on-surface/75 via-on-surface/35 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-space-lg md:p-space-xl">
          <h2 className="max-w-xl text-headline-md font-extrabold text-surface">{slide.title}</h2>
          {slide.subtitle ? <p className="mt-2 max-w-xl text-body-md text-surface/90">{slide.subtitle}</p> : null}
          {slide.buttonLabel && slide.buttonHref ? (
            slide.buttonHref.startsWith("/") ? (
              <Link href={slide.buttonHref} className="btn-primary mt-space-md w-fit">
                {slide.buttonLabel}
              </Link>
            ) : (
              <a href={slide.buttonHref} className="btn-primary mt-space-md w-fit" target="_blank" rel="noreferrer">
                {slide.buttonLabel}
              </a>
            )
          ) : null}
        </div>
        {slides.length > 1 ? (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button type="button" onClick={() => step(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-surface text-primary" aria-label="Önceki slayt">
              ‹
            </button>
            <button type="button" onClick={() => step(1)} className="grid h-10 w-10 place-items-center rounded-full bg-surface text-primary" aria-label="Sonraki slayt">
              ›
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
