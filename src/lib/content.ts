export const brand = {
  name: "Pusula Akademi",
  tagline: "YKS & LGS Derece Koçluğu",
  phone: "0850 840 00 00",
  phoneHref: "tel:+908508400000",
  whatsapp: "908508400000",
  whatsappHref: "https://wa.me/908508400000",
  email: "merhaba@pusulaakademi.com",
  address: "Maslak Mah. Büyükdere Cad. No: 255, Sarıyer / İstanbul",
  mapsUrl:
    "https://www.google.com/maps?q=Maslak+B%C3%BCy%C3%BCkdere+Caddesi+Sar%C4%B1yer+%C4%B0stanbul&output=embed",
  instagram: "https://instagram.com/pusulaakademi",
  youtube: "https://youtube.com/@pusulaakademi",
  tiktok: "https://www.tiktok.com/@pusulaakademi",
};

export type Program = "yks" | "lgs";

export type PackageId =
  | "yks-aylik"
  | "yks-3ay"
  | "yks-6ay"
  | "yks-yillik"
  | "lgs-aylik"
  | "lgs-3ay"
  | "lgs-6ay"
  | "lgs-yillik";

export type CoachingPackage = {
  id: PackageId;
  program: Program;
  name: string;
  duration: string;
  months: number;
  price: number;
  oldPrice?: number;
  popular?: boolean;
  meetings: string;
  programPrep: string;
  trialAnalysis: string;
  tracking: string;
  parentMeeting: string;
  extras: string[];
};

export const packages: CoachingPackage[] = [
  {
    id: "yks-aylik",
    program: "yks",
    name: "Aylık Başlangıç",
    duration: "1 ay",
    months: 1,
    price: 2490,
    meetings: "Haftada 1 birebir görüşme",
    programPrep: "Kişiye özel haftalık program",
    trialAnalysis: "Ayda 2 deneme analizi",
    tracking: "Haftalık çalışma kontrolü",
    parentMeeting: "Ayda 1 veli bilgilendirme",
    extras: ["Sınav kaygısı seminer kaydı"],
  },
  {
    id: "yks-3ay",
    program: "yks",
    name: "3 Aylık Gelişim",
    duration: "3 ay",
    months: 3,
    price: 6490,
    oldPrice: 7470,
    meetings: "Haftada 1 birebir görüşme",
    programPrep: "Dönemsel plan + haftalık revizyon",
    trialAnalysis: "Her deneme sonrası analiz",
    tracking: "Günlük mesaj takibi",
    parentMeeting: "Ayda 1 veli görüşmesi",
    extras: ["Öğrenme stratejileri atölyesi", "Veli semineri"],
  },
  {
    id: "yks-6ay",
    program: "yks",
    name: "6 Aylık Derece",
    duration: "6 ay",
    months: 6,
    price: 11490,
    oldPrice: 14940,
    popular: true,
    meetings: "Haftada 1 görüşme + ara check-in",
    programPrep: "TYT–AYT dengeli uzun plan",
    trialAnalysis: "Konu bazlı net raporu",
    tracking: "Günlük ve haftalık panel takibi",
    parentMeeting: "Ayda 1 veli + panel erişimi",
    extras: [
      "PDR uzmanı sınav seminerleri",
      "Öğrenme stratejileri programı",
      "Eksik konu haritası",
    ],
  },
  {
    id: "yks-yillik",
    program: "yks",
    name: "Tam Sezonluk VIP",
    duration: "12 ay",
    months: 12,
    price: 18990,
    oldPrice: 29880,
    meetings: "Haftalık görüşme + yoğun dönem ekstra seans",
    programPrep: "Sınava kadar tam yol haritası",
    trialAnalysis: "Tüm denemelerde detaylı analiz",
    tracking: "Günlük takip ve panel",
    parentMeeting: "Ayda 1 veli + dönemsel seminer",
    extras: [
      "PDR sınav süreci desteği",
      "Veli seminerleri",
      "Öğrenme stratejileri",
      "Sınav haftası özel plan",
    ],
  },
  {
    id: "lgs-aylik",
    program: "lgs",
    name: "Aylık Başlangıç",
    duration: "1 ay",
    months: 1,
    price: 1990,
    meetings: "Haftada 1 birebir görüşme",
    programPrep: "Kişiye özel haftalık program",
    trialAnalysis: "Ayda 2 deneme analizi",
    tracking: "Haftalık çalışma kontrolü",
    parentMeeting: "Ayda 1 veli bilgilendirme",
    extras: ["Sınav kaygısı seminer kaydı"],
  },
  {
    id: "lgs-3ay",
    program: "lgs",
    name: "3 Aylık Gelişim",
    duration: "3 ay",
    months: 3,
    price: 5490,
    oldPrice: 5970,
    meetings: "Haftada 1 birebir görüşme",
    programPrep: "Dönemsel plan + haftalık revizyon",
    trialAnalysis: "Her deneme sonrası analiz",
    tracking: "Günlük mesaj takibi",
    parentMeeting: "Ayda 1 veli görüşmesi",
    extras: ["Öğrenme stratejileri atölyesi", "Veli semineri"],
  },
  {
    id: "lgs-6ay",
    program: "lgs",
    name: "6 Aylık Derece",
    duration: "6 ay",
    months: 6,
    price: 9490,
    oldPrice: 11940,
    popular: true,
    meetings: "Haftada 1 görüşme + ara check-in",
    programPrep: "Okul + LGS dengeli plan",
    trialAnalysis: "Konu bazlı net raporu",
    tracking: "Günlük ve haftalık panel takibi",
    parentMeeting: "Ayda 1 veli + panel erişimi",
    extras: [
      "PDR uzmanı sınav seminerleri",
      "Öğrenme stratejileri programı",
      "Eksik konu haritası",
    ],
  },
  {
    id: "lgs-yillik",
    program: "lgs",
    name: "Tam Sezonluk VIP",
    duration: "12 ay",
    months: 12,
    price: 15990,
    oldPrice: 23880,
    meetings: "Haftalık görüşme + yoğun dönem ekstra seans",
    programPrep: "Sınava kadar tam yol haritası",
    trialAnalysis: "Tüm denemelerde detaylı analiz",
    tracking: "Günlük takip ve panel",
    parentMeeting: "Ayda 1 veli + dönemsel seminer",
    extras: [
      "PDR sınav süreci desteği",
      "Veli seminerleri",
      "Öğrenme stratejileri",
      "Sınav haftası özel plan",
    ],
  },
];

export const coaches = [
  {
    slug: "mert-yilmaz",
    name: "Mert Yılmaz",
    title: "YKS Sayısal Mentörü",
    expertise: "TYT–AYT planlama, deneme karakutusu",
    experience: "YKS Türkiye 47.'si · 4 yıl mentörlük",
    group: "11. sınıf, 12. sınıf ve mezun sayısal",
    bio: "Tıp fakültesi öğrencisi. Net artışını konu matrisi ve deneme kök neden analiziyle yönetir.",
    initials: "MY",
    degree: "YKS TR 47",
    uni: "İTÜ",
    tone: "from-primary to-primary-container",
  },
  {
    slug: "zeynep-kaya",
    name: "Zeynep Kaya",
    title: "PDR Uzmanı · YKS EA",
    expertise: "Eşit ağırlık, kaygı yönetimi",
    experience: "8 yıl PDR · 900+ öğrenci",
    group: "YKS eşit ağırlık ve sözel",
    bio: "Psikolojik danışmanlık kökenli. Programı öğrencinin gerçek ritmine göre kurar, veliyle şeffaf iletişim kurar.",
    initials: "ZK",
    degree: "PDR",
    uni: "Boğaziçi",
    tone: "from-secondary to-secondary-container",
  },
  {
    slug: "elif-demir",
    name: "Elif Demir",
    title: "LGS Yeni Nesil Koçu",
    expertise: "Yeni nesil soru, veli iş birliği",
    experience: "7 yıl LGS koçluğu",
    group: "7. ve 8. sınıf LGS",
    bio: "Okul ödevi ile LGS hazırlığını çarpıştırmadan yürütür. Dijital disiplin ve paragraf okuryazarlığı odaklı çalışır.",
    initials: "ED",
    degree: "LGS %0.1",
    uni: "Hacettepe",
    tone: "from-primary-container to-primary",
  },
  {
    slug: "ahmet-ozkan",
    name: "Ahmet Özkan",
    title: "Rehber Öğretmen · YKS/LGS",
    expertise: "Motivasyon, günlük disiplin",
    experience: "10 yıl rehberlik ve koçluk",
    group: "Disiplin kurmakta zorlanan öğrenciler",
    bio: "Günlük takip sistemini öğrencinin hayatına uyarlar. Kopuşları erken yakalar, programı onararak ilerletir.",
    initials: "AÖ",
    degree: "Rehberlik",
    uni: "ODTÜ",
    tone: "from-on-surface to-primary",
  },
];

export const faqs = [
  {
    q: "Koçluk sistemi nasıl çalışıyor?",
    a: "İlk görüşmede netler, hedef, okul temposu ve çalışma alışkanlığı analiz edilir. Ardından kişiye özel haftalık program hazırlanır. Koçunla birebir görüşmeler, deneme analizi, eksik konu takibi ve günlük/haftalık kontrol aynı panel üzerinden yürür.",
  },
  {
    q: "Koçumu nasıl seçebilirim?",
    a: "Ön görüşmede YKS veya LGS hedefinize, alanınıza ve çalışma ritminize göre koç eşleştirmesi yapılır. Uygun görülürse koç değişikliği talep edebilirsiniz.",
  },
  {
    q: "Görüşmeler online mı?",
    a: "Evet. Görüşmeler online yapılır. Böylece bulunduğun ilden bağımsız olarak aynı takip kalitesini alırsın.",
  },
  {
    q: "Görüşmeler ne kadar sürüyor?",
    a: "Haftalık birebir görüşmeler ortalama 40–50 dakikadır. Yoğun dönemlerde kısa check-in seansları eklenebilir.",
  },
  {
    q: "Haftada kaç görüşme yapılıyor?",
    a: "Standart paketlerde haftada bir birebir görüşme vardır. 6 aylık ve yıllık paketlerde ara check-in ve sınav dönemi ekstra seanslar bulunur.",
  },
  {
    q: "Çalışma programı nasıl hazırlanıyor?",
    a: "Program; mevcut net, eksik konular, okul yükü ve deneme takvimine göre hazırlanır. Her hafta verilerle güncellenir; kâğıt üzerinde kalan bir liste değildir.",
  },
  {
    q: "Koçlukta günlük takip var mı?",
    a: "Evet. 3 aylık ve üzeri paketlerde günlük mesaj/panel takibi vardır. Aylık pakette haftalık kontrol öne çıkar.",
  },
  {
    q: "Veli bilgilendiriliyor mu?",
    a: "Evet. Aylık veli görüşmesi veya yazılı rapor vardır. 6 aylık ve yıllık paketlerde veliler panele sınırlı erişim alır. Ayrıca dönemsel veli seminerleri düzenlenir.",
  },
  {
    q: "Paketler nasıl satın alınıyor?",
    a: "Paketler sayfasından paketi seçip ödeme formunu doldurursunuz. Kredi/banka kartı ile 3D Secure üzerinden tahsilat yapılır. Satın alma sonrası e-posta ve SMS ile bilgilendirme gider.",
  },
  {
    q: "Paket değişikliği yapılabilir mi?",
    a: "Evet. Süre uzatma veya YKS/LGS geçişi, mevcut paketin kullanılmayan kısmı mahsup edilerek planlanabilir. Koçunuzla görüştükten sonra işlem yapılır.",
  },
  {
    q: "İptal ve iade koşulları nedir?",
    a: "İlk görüşmeden sonra 7 gün içinde memnun kalmazsanız, kullanılmayan hizmet bedeli iade edilir. Başlayan dönemlerde iade, mesafeli satış sözleşmesindeki oranlara göre hesaplanır.",
  },
  {
    q: "YKS ve LGS öğrencileri için ayrı sistem mi uygulanıyor?",
    a: "Evet. Aynı panel altyapısı kullanılır; ancak program, deneme analizi ve veli iletişimi YKS ile LGS için ayrı kurgulanır.",
  },
];

export function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR").format(value) + " TL";
}

export function getPackage(id: string | null | undefined) {
  return packages.find((item) => item.id === id);
}
