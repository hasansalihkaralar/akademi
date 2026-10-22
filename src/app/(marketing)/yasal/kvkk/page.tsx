import type { Metadata } from "next";

export const metadata: Metadata = { title: "KVKK Aydınlatma Metni" };

export default function KvkkPage() {
  return (
    <article className="shell max-w-3xl py-space-2xl text-body-md leading-relaxed text-on-surface-variant">
      <h1 className="text-headline-lg text-on-surface">KVKK Aydınlatma Metni</h1>
      <p className="mt-space-md">
        Amfi Koçluk, 6698 sayılı Kanun kapsamında veri sorumlusudur. Bu metin taslaktır.
      </p>
      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">İşlenen veriler</h2>
      <p>
        Ad soyad, telefon, e-posta, sınıf, sınav türü, paket bilgisi ve ödeme işlemi için
        gerekli kart doğrulama verileri (kartın tamamı saklanmaz).
      </p>
      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">Amaç</h2>
      <p>
        Sözleşmenin kurulması, koçluk hizmetinin sunulması, veli bilgilendirmesi, faturalama
        ve yasal yükümlülükler.
      </p>
      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">Haklar</h2>
      <p>
        Veri sahibinin erişim, düzeltme, silme ve itiraz hakları merhaba@amfikocluk.com
        üzerinden kullanılır.
      </p>
    </article>
  );
}
