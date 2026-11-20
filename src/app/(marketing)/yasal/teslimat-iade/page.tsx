import type { Metadata } from "next";
import { brand } from "@/lib/content";

export const metadata: Metadata = { title: "Teslimat ve İade" };

export default function DeliveryReturnPage() {
  return (
    <article className="shell max-w-3xl py-space-2xl text-body-md leading-relaxed text-on-surface-variant">
      <h1 className="text-headline-lg text-on-surface">Teslimat ve İade</h1>
      <p className="mt-space-md">
        Bu sayfa, {brand.name} üzerinden satın alınan online koçluk paketlerinin teslimat,
        cayma ve iade koşullarını açıklar.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">1. Teslimat</h2>
      <p>
        Satın alınan ürün fiziksel değildir; dijital eğitim / koçluk hizmetidir. Kart ödemesi
        başarılı olduğunda veya havale / EFT ödemesi yönetici tarafından onaylandığında:
      </p>
      <ul className="mt-space-sm list-disc space-y-1 pl-5">
        <li>İlgili paket öğrenci paneline tanımlanır,</li>
        <li>genellikle 24 saat içinde danışman atama ve iletişim süreci başlar,</li>
        <li>görüşme randevuları panel üzerinden planlanır.</li>
      </ul>
      <p className="mt-space-sm">
        Kargo, kurye veya fiziksel teslimat yapılmaz. Fatura / dekont bilgileri e-posta veya
        panel üzerinden paylaşılabilir.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">2. Cayma hakkı</h2>
      <p>
        Mesafeli satış kapsamında, hizmete başlanmamış veya ilk görüşme sonrası 7 gün içinde
        memnun kalınmayan paketlerde cayma talebi değerlendirilir. Hizmetin ifasına
        (görüşme, program yazımı vb.) başlanmış dönemlerde cayma, mesafeli satış
        sözleşmesindeki esaslara göre sınırlanabilir.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">3. İade koşulları</h2>
      <ul className="mt-space-sm list-disc space-y-1 pl-5">
        <li>
          İlk görüşmeden sonra 7 gün içinde yazılı iade talebi verilirse, kullanılmayan
          hizmet bedeli iade edilir.
        </li>
        <li>
          Dönem başlamışsa iade tutarı, kalan süre / kullanılmayan hak oranında hesaplanır.
        </li>
        <li>
          Kullanıcının ihlali (içerik paylaşımı, hakaret, kötüye kullanım) nedeniyle hesabın
          kapatıldığı durumlarda iade yapılmayabilir.
        </li>
        <li>
          Havale bekleyen ancak henüz onaylanmamış ödemelerde paket açılmadığı için tahsilat
          yoksa iade konusu oluşmaz; onay sonrası iptalde yukarıdaki kurallar uygulanır.
        </li>
      </ul>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">4. İade süreci</h2>
      <p>
        İade talebi{" "}
        <a href={`mailto:${brand.email}`} className="text-primary underline">
          {brand.email}
        </a>{" "}
        veya {brand.phone} üzerinden, öğrenci adı, sipariş / ödeme bilgisi ve gerekçe ile
        iletilir. Onaylanan iadeler, kart ödemelerinde banka / iyzico süreçlerine göre
        genellikle birkaç iş günü içinde aynı karta; havale ödemelerinde bildirilen IBAN’a
        yapılır.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">5. İlgili belgeler</h2>
      <p>
        Detaylı sözleşme metni için{" "}
        <a href="/yasal/mesafeli-satis" className="text-primary underline">
          Mesafeli Satış Sözleşmesi
        </a>{" "}
        ve genel kullanım için{" "}
        <a href="/yasal/hizmet-sartlari" className="text-primary underline">
          Hizmet Şartları
        </a>
        ’na bakınız.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">6. İletişim</h2>
      <p>
        {brand.name}
        <br />
        {brand.address}
        <br />
        Tel: {brand.phone} · E-posta: {brand.email}
      </p>
      <p className="mt-space-md text-body-sm">Son güncelleme: 20 Kasım 2026</p>
    </article>
  );
}
