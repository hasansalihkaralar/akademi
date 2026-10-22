import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mesafeli Satış Sözleşmesi" };

export default function DistanceSalesPage() {
  return (
    <article className="shell max-w-3xl py-space-2xl text-body-md leading-relaxed text-on-surface-variant">
      <h1 className="text-headline-lg text-on-surface">Mesafeli Satış Sözleşmesi</h1>
      <p className="mt-space-md">
        Bu metin taslaktır; yayına alınmadan önce avukat kontrolünden geçmelidir. Satıcı:
        Amfi Koçluk. Konu: YKS / LGS online koçluk paketi.
      </p>
      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">1. Taraflar ve konu</h2>
      <p>
        Alıcı, sitedeki formu doldurarak seçtiği paketi satın alır. Hizmet; birebir görüşme,
        program, deneme analizi ve panel takibini kapsar.
      </p>
      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">2. Bedel ve ödeme</h2>
      <p>
        Bedel paket sayfasında ilan edilen fiyattır. Tahsilat kredi/banka kartı ile 3D Secure
        üzerinden yapılır.
      </p>
      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">3. Cayma ve iade</h2>
      <p>
        İlk görüşmeden sonra 7 gün içinde memnun kalınmazsa kullanılmayan hizmet bedeli iade
        edilir. Başlayan dönemlerde iade, kalan süre oranında hesaplanır.
      </p>
      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">4. Teslim</h2>
      <p>
        Hizmet dijitaldir. Ödeme sonrası 24 saat içinde panel daveti ve ön görüşme planı
        iletilir.
      </p>
    </article>
  );
}
