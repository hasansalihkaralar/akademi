"use client";

import { useState } from "react";
import { faqs } from "@/lib/content";
import { Icon } from "./Icon";

export function FaqList({ items = faqs }: { items?: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-space-sm">
      {items.map((item, index) => {
        const active = open === index;
        return (
          <button
            key={item.q}
            type="button"
            className={`w-full rounded-xl px-space-lg py-space-md text-left shadow-sm transition ${
              active
                ? "bg-surface-container-low"
                : "bg-surface-container-lowest hover:bg-surface-container-low"
            }`}
            onClick={() => setOpen(active ? null : index)}
            aria-expanded={active}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="text-title-md font-semibold text-on-surface">{item.q}</span>
              <Icon
                name={active ? "expand_less" : "expand_more"}
                className="shrink-0 text-[22px] text-primary"
              />
            </div>
            {active ? (
              <p className="mt-space-sm text-body-md leading-relaxed text-on-surface-variant">
                {item.a}
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
