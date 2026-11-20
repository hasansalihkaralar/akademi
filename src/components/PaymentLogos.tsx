import Image from "next/image";

export function PaymentLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-lg bg-on-surface px-space-md py-space-sm ${className}`}>
      <Image
        src="/odeme/iyzico-logo-band.png"
        alt="iyzico ile Öde, Mastercard, Visa, American Express ve Troy logoları"
        width={1024}
        height={71}
        quality={100}
        sizes="(max-width: 768px) 100vw, 448px"
        className="h-auto w-full max-w-md object-contain"
        priority={false}
      />
    </div>
  );
}
