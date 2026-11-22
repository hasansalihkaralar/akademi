"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

export function PaymentSuccess({
  name,
  packageLine,
  method = "kart",
}: {
  name: string;
  packageLine: string;
  method?: "kart" | "havale";
}) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(20);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const isTransfer = method === "havale";
  const destination = isTransfer ? "/panel/ogrenci/siparisler" : "/panel/ogrenci";
  const loginHref = `/giris?next=${encodeURIComponent(destination)}`;

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" })
      .then((response) => setLoggedIn(response.ok))
      .catch(() => setLoggedIn(false));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (seconds > 0 || loggedIn === null) return;
    router.replace(loggedIn ? destination : loginHref);
  }, [seconds, router, destination, loggedIn, loginHref]);

  return (
    <div className="shell max-w-xl py-space-2xl text-center">
      <div className="mx-auto mb-space-lg flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary">
        <Icon name="check_circle" className="text-[40px]" />
      </div>
      <p className="text-label-lg font-bold uppercase tracking-wider text-secondary">
        {isTransfer ? "Dekont alındı" : "Ödeme alındı"}
      </p>
      <h1 className="mt-space-sm text-headline-lg text-on-surface">Teşekkürler, {name}</h1>
      <p className="mt-space-md text-body-md leading-relaxed text-on-surface-variant">
        {isTransfer
          ? `${packageLine} Havale/EFT dekontun tarafımıza ulaştı. Ödeme onaylandıktan sonra paket otomatik açılır.`
          : `${packageLine} Ödemen başarıyla alınmıştır. Danışmanın en kısa sürede seninle iletişime geçecektir. Amfi Koçluk ailesine hoş geldin.`}
      </p>
      <p className="mt-space-md text-body-sm text-on-surface-variant">
        {seconds > 0
          ? `${seconds} saniye sonra ${isTransfer ? "siparişlerine" : "öğrenci paneline"} yönlendirileceksin.`
          : "Yönlendiriliyorsun…"}
      </p>
      <div className="mt-space-xl flex flex-wrap justify-center gap-space-sm">
        {loggedIn === false ? (
          <Link href={loginHref} className="btn-primary">
            <Icon name="login" className="text-[18px]" />
            Giriş yap ve panele git
          </Link>
        ) : isTransfer ? (
          <Link href="/panel/ogrenci/siparisler" className="btn-primary">
            <Icon name="receipt_long" className="text-[18px]" />
            Siparişlerim
          </Link>
        ) : (
          <>
            <Link href="/panel/ogrenci" className="btn-primary">
              <Icon name="dashboard" className="text-[18px]" />
              Panele git
            </Link>
            <Link href="/panel/ogrenci/siparisler" className="btn-secondary">
              Siparişlerim
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
