import Image from "next/image";

export function PaymentLogos({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="/odeme/iyzico-logo-band.png"
        alt="iyzico ile Öde, Mastercard, Visa, American Express ve Troy logoları"
        width={640}
        height={80}
        className="h-auto w-full max-w-md object-contain"
        priority={false}
      />
    </div>
  );
}
