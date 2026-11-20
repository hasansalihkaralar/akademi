import type { Metadata } from "next";
import { brand } from "@/lib/content";

export const metadata: Metadata = { title: "Gizlilik Politikası" };

export default function PrivacyPolicyPage() {
  return (
    <article className="shell max-w-3xl py-space-2xl text-body-md leading-relaxed text-on-surface-variant">
      <h1 className="text-headline-lg text-on-surface">Gizlilik Politikası</h1>
      <p className="mt-space-md">
        Bu Gizlilik Politikası, {brand.name} ({brand.address}) tarafından işletilen{" "}
        <a href="https://amfikocluk.com" className="text-primary underline">
          amfikocluk.com
        </a>{" "}
        web sitesi ve online koçluk paneli üzerinden toplanan kişisel verilerin nasıl
        işlendiğini açıklar. Siteyi kullanarak bu politikayı kabul etmiş sayılırsınız.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">1. Toplanan bilgiler</h2>
      <p>
        Üyelik, ön görüşme, ödeme ve iletişim formları aracılığıyla ad soyad, e-posta,
        telefon, sınıf/sınav bilgisi, veli iletişim bilgileri, sipariş ve fatura kayıtları
        toplanabilir. Kart ödemelerinde kart numarası tarafımızca saklanmaz; ödeme altyapısı
        (ör. iyzico) üzerinden 3D Secure ile işlenir.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">2. Kullanım amaçları</h2>
      <ul className="mt-space-sm list-disc space-y-1 pl-5">
        <li>Üyelik oluşturma ve hesap güvenliği</li>
        <li>Koçluk paketinin satışı, faturalama ve teslimatı</li>
        <li>Panel üzerinden program, deneme ve görüşme hizmetinin sunulması</li>
        <li>Destek taleplerinin yanıtlanması ve yasal yükümlülüklerin yerine getirilmesi</li>
      </ul>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">3. Paylaşım</h2>
      <p>
        Verileriniz; ödeme kuruluşları, barındırma / e-posta hizmet sağlayıcıları ve yasal
        zorunluluk halinde yetkili merciler dışında üçüncü kişilere satılmaz veya pazarlama
        amacıyla aktarılmaz. Veli hesabı açıldığında, öğrencinin koçluk süreciyle ilgili
        bilgiler bağlı veliye gösterilebilir.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">4. Çerezler ve güvenlik</h2>
      <p>
        Oturum yönetimi ve temel site işleyişi için gerekli çerezler kullanılabilir. Veriler,
        HTTPS ve erişim kontrolleri ile korunur. Şifreler hash’lenerek saklanır.
      </p>

      <h2 className="mt-space-xl text-title-lg font-bold text-on-surface">5. Haklarınız</h2>
      <p>
        KVKK kapsamında erişim, düzeltme, silme, itiraz ve veri taşınabilirliği taleplerinizi{" "}
        <a href={`mailto:${brand.email}`} className="text-primary underline">
          {brand.email}
        </a>{" "}
        adresine iletebilirsiniz. Aydınlatma metni için ayrıca{" "}
        <a href="/yasal/kvkk" className="text-primary underline">
          KVKK Aydınlatma Metni
        </a>
        ’ne bakınız.
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
