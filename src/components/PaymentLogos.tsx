export function PaymentLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-lg bg-on-surface px-space-md py-space-sm ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- iyzico bandı optimize edilmeden net kalsın */}
      <img
        src="/odeme/iyzico-logo-band-white.png"
        alt="iyzico ile Öde, Mastercard, Visa, American Express ve Troy logoları"
        width={1024}
        height={71}
        className="h-auto w-full max-w-md object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
