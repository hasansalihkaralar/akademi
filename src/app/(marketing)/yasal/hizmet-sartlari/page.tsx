import type { Metadata } from "next";
import { brand } from "@/lib/content";

export const metadata: Metadata = { title: "Hizmet Şartları" };

export default function TermsOfServicePage() {
  return (
    <article className="shell max-w-3xl py-space-2xl text-body-md leading-relaxed text-on-surface-variant">
      <h1 className="text-headline-lg text-on-surface">Hizmet Şartları</h1>
      <p className="mt-space-md">
        Bu Hizmet Şartları, {brand.name} tarafından sunulan online YKS / LGS koçluk
        hizmetlerinin kullanım koşullarını düzenler. Siteye üye olarak veya paket satın alarak
        bu şartları kabul etmiş sayılırsınız.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">1. Hizmetin kapsamı</h2>
      <p>
        Hizmet; seçilen pakete göre birebir online görüşme, haftalık çalışma programı, deneme
        analizi, öğrenci / veli paneli erişimi ve ilgili dijital içerikleri kapsar. Fiziksel
        ürün gönderimi yapılmaz.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">2. Üyelik ve hesap</h2>
      <p>
        Öğrenci hesabı e-posta doğrulaması ile açılır. Hesap bilgilerinin doğruluğundan ve
        gizliliğinden kullanıcı sorumludur. Yetkisiz kullanım şüphesinde hesap askıya
        alınabilir. Veli hesabı, öğrenciye bağlı okuma / takip amaçlıdır; paket satın alma
        öğrenci hesabından yapılır.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">3. Ücretlendirme</h2>
      <p>
        Paket bedelleri sitede ilan edilir. Ödeme; kredi / banka kartı (iyzico altyapısı) veya
        havale / EFT ile yapılabilir. Kart ödemelerinde 3D Secure kullanılır. Ödeme
        tamamlanmadan veya havale onayı verilmeden paket hakları açılmaz.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">4. Kullanım kuralları</h2>
      <ul className="mt-space-sm list-disc space-y-1 pl-5">
        <li>Panel ve görüşme içerikleri yalnızca kayıtlı öğrenci / veli için kişiseldir.</li>
        <li>İçeriklerin izinsiz kopyalanması, paylaşılması veya yeniden satışı yasaktır.</li>
        <li>Danışmanlara ve diğer kullanıcılara saygılı iletişim zorunludur.</li>
      </ul>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">5. Sorumluluk sınırı</h2>
      <p>
        Koçluk; rehberlik ve takip hizmetidir; sınav sonucu veya yerleştirme garantisi
        vermez. İnternet kesintisi, üçüncü taraf (Meet, ödeme) kesintileri gibi kontrolümüz
        dışındaki durumlardan doğan gecikmelerden {brand.name} sorumlu tutulamaz.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">6. Cayma, teslimat ve iade</h2>
      <p>
        Cayma, teslimat ve iade koşulları için{" "}
        <a href="/yasal/teslimat-iade" className="text-primary underline">
          Teslimat ve İade
        </a>{" "}
        ile{" "}
        <a href="/yasal/mesafeli-satis" className="text-primary underline">
          Mesafeli Satış Sözleşmesi
        </a>{" "}
        geçerlidir.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">7. Değişiklikler</h2>
      <p>
        Bu şartlar güncellenebilir. Güncel metin bu sayfada yayınlanır. Önemli değişiklikler
        e-posta veya panel bildirimi ile duyurulabilir.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">8. İletişim</h2>
      <p>
        {brand.name} · {brand.address}
        <br />
        {brand.phone} · {brand.email}
      </p>
      <p className="mt-space-md text-body-sm">Son güncelleme: 20 Kasım 2026</p>
    </article>
  );
}
