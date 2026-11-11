"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import { safeHref } from "@/lib/validators";

export function GirisSignupCard() {
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  const nextPath = nextRaw && safeHref(nextRaw)?.startsWith("/") ? safeHref(nextRaw)! : null;
  const signupHref = nextPath ? `/uye-ol?next=${encodeURIComponent(nextPath)}` : "/uye-ol";

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-md">
      <h3 className="text-title-lg font-bold text-on-surface">Hesabın yok mu?</h3>
      <p className="mt-space-sm text-body-sm text-on-surface-variant">
        Öğrenci üyeliği oluştur, ardından paket satın alabilirsin.
      </p>
      <Link href={signupHref} className="btn-primary mt-space-md w-full">
        <Icon name="person_add" className="text-[20px]" />
        Öğrenci üye ol
      </Link>
    </div>
  );
}
