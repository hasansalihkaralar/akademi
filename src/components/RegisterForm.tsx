"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { safeHref } from "@/lib/validators";

const field =
  "h-11 w-full rounded-lg bg-surface-container-low px-3 text-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary";

export function RegisterForm() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const nextPath = nextParam && safeHref(nextParam)?.startsWith("/") ? safeHref(nextParam)! : null;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [resending, setResending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    if (password !== passwordConfirm) {
      setError("Şifreler eşleşmiyor.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          passwordConfirm,
          phone,
          ...(nextPath ? { next: nextPath } : {}),
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        needsVerification?: boolean;
        email?: string;
        message?: string;
        mailWarning?: string | null;
      } | null;
      if (!response.ok) {
        setError(data?.error || "Üyelik oluşturulamadı.");
        setLoading(false);
        return;
      }
      setPendingEmail(data?.email || email.toLowerCase());
      setNotice(data?.message || "Doğrulama maili gönderildi.");
      setLoading(false);
    } catch {
      setError("Sunucuya ulaşılamadı. Birkaç saniye sonra tekrar dene.");
      setLoading(false);
    }
  }

  async function resendMail() {
    if (!pendingEmail) return;
    setResending(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pendingEmail,
          ...(nextPath ? { next: nextPath } : {}),
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
      if (!response.ok) {
        setError(data?.error || "Mail yeniden gönderilemedi.");
      } else {
        setNotice(data?.message || "Doğrulama maili yeniden gönderildi.");
      }
    } catch {
      setError("Sunucuya ulaşılamadı. Birkaç saniye sonra tekrar dene.");
    } finally {
      setResending(false);
    }
  }

  const loginHref = nextPath ? `/giris?next=${encodeURIComponent(nextPath)}` : "/giris";

  if (pendingEmail) {
    return (
      <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-xl sm:p-space-xl">
        <div className="mb-space-lg">
          <div className="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-space-sm py-1 text-label-md font-semibold text-on-primary-fixed">
            <Icon name="mark_email_unread" className="text-[16px]" />
            E-posta doğrulama
          </div>
          <h1 className="mb-space-xs text-headline-md text-on-surface">Mailini kontrol et</h1>
          <p className="text-body-md text-on-surface-variant">
            <span className="font-semibold text-on-surface">{pendingEmail}</span> adresine doğrulama
            bağlantısı gönderdik. Linke tıklayınca giriş yapabilirsin.
          </p>
        </div>
        {notice ? <p className="mb-space-md text-body-sm text-primary">{notice}</p> : null}
        {error ? <p className="mb-space-md text-body-sm text-error">{error}</p> : null}
        <div className="flex flex-col gap-space-sm sm:flex-row">
          <button type="button" className="btn-primary" disabled={resending} onClick={() => void resendMail()}>
            <Icon name="forward_to_inbox" className="text-[18px]" />
            {resending ? "Gönderiliyor…" : "Maili yeniden gönder"}
          </button>
          <Link href={loginHref} className="btn-secondary inline-flex items-center justify-center gap-2">
            Giriş sayfasına git
          </Link>
        </div>
        <p className="mt-space-md text-body-sm text-on-surface-variant">
          Spam / gereksiz klasörünü de kontrol et. Link 24 saat geçerlidir.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-xl sm:p-space-xl">
      <div className="mb-space-lg">
        <div className="mb-space-sm inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-space-sm py-1 text-label-md font-semibold text-on-primary-fixed">
          <Icon name="person_add" className="text-[16px]" />
          Öğrenci üyeliği
        </div>
        <h1 className="mb-space-xs text-headline-md text-on-surface">Panele üye ol</h1>
        <p className="text-body-md text-on-surface-variant">
          Hesabını oluştur. Üyelik sonrası e-posta doğrulaması gerekir; ardından paket satın alabilirsin.
        </p>
      </div>

      <form className="grid gap-space-sm sm:grid-cols-2" onSubmit={onSubmit}>
        <label className="text-label-md font-semibold text-on-surface">
          Ad
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`${field} mt-1`}
            placeholder="Adın"
            autoComplete="given-name"
          />
        </label>
        <label className="text-label-md font-semibold text-on-surface">
          Soyad
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`${field} mt-1`}
            placeholder="Soyadın"
            autoComplete="family-name"
          />
        </label>
        <label className="text-label-md font-semibold text-on-surface sm:col-span-2">
          E-posta
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${field} mt-1`}
            placeholder="ornek@mail.com"
            autoComplete="email"
          />
        </label>
        <label className="text-label-md font-semibold text-on-surface">
          Şifre
          <input
            required
            minLength={4}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${field} mt-1`}
            placeholder="En az 4 karakter"
            autoComplete="new-password"
          />
        </label>
        <label className="text-label-md font-semibold text-on-surface">
          Şifre tekrar
          <input
            required
            minLength={4}
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className={`${field} mt-1`}
            placeholder="Şifreyi tekrar yaz"
            autoComplete="new-password"
          />
        </label>
        <label className="text-label-md font-semibold text-on-surface sm:col-span-2">
          Telefon numarası
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`${field} mt-1`}
            placeholder="05XX XXX XX XX"
            autoComplete="tel"
          />
        </label>

        {error ? <p className="text-body-sm text-error sm:col-span-2">{error}</p> : null}

        <button type="submit" disabled={loading} className="btn-primary h-12 sm:col-span-2 disabled:opacity-70">
          <Icon name="person_add" className="text-[20px]" />
          {loading ? "Üyelik oluşturuluyor…" : nextPath ? "Üye ol ve pakete devam et" : "Üye ol"}
        </button>
      </form>

      <p className="mt-space-md text-center text-body-sm text-on-surface-variant">
        Zaten hesabın var mı?{" "}
        <Link href={loginHref} className="font-semibold text-primary">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
