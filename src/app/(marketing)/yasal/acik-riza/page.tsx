import type { Metadata } from "next";

export const metadata: Metadata = { title: "Açık Rıza Metni" };

export default function ConsentPage() {
  return (
    <article className="shell max-w-3xl py-space-2xl text-body-md leading-relaxed text-on-surface-variant">
      <h1 className="text-headline-lg text-on-surface">Açık rıza metni</h1>
      <p className="mt-space-md">
        Koçluk sürecinin yürütülmesi, veli bilgilendirmesi, SMS/e-posta ile randevu
        hatırlatması ve hizmet kalitesi iletişimi için kişisel verilerimin işlenmesine açık
        rıza veriyorum. Rızamı merhaba@amfikocluk.com adresine yazarak geri alabilirim.
      </p>
    </article>
  );
}
