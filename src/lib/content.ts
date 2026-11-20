export const brand = {
  name: "Amfi Koçluk",
  tagline: "Hedefin Amfide",
  phone: "+90 544 873 26 34",
  phoneHref: "tel:+905448732634",
  whatsapp: "905448732634",
  whatsappHref: "https://wa.me/905448732634",
  email: "info@amfikocluk.com",
  address: "İstasyon Mahallesi 1. İncirli Sok. No:3 İç Kapı No:6",
  mapsUrl:
    "https://www.google.com/maps?q=%C4%B0stasyon+Mahallesi+1.+%C4%B0ncirli+Sok.+No:3+%C4%B0%C3%A7+Kap%C4%B1+No:6&output=embed",
  instagram: "https://instagram.com/amfikocluk",
  youtube: "https://youtube.com/@amfikocluk",
  tiktok: "https://www.tiktok.com/@amfikocluk",
};

export const bankTransfer = {
  bankName: "Kuveyt Türk",
  accountName: "Elvan Baran Karalar",
  iban: "TR70 0020 5000 0949 0435 1000 02",
  branch: "Zeytinburnu Şubesi",
  descriptionHint: "Açıklamaya öğrenci adını ve e-postasını yazın.",
};

export type Program = "yks" | "lgs";

export type PackageId =
  | "yks-aylik"
  | "yks-yillik"
  | "lgs-aylik"
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
    name: "Aylık Paket",
    duration: "1 ay",
    months: 1,
    price: 3990,
    meetings: "Haftada 1 birebir görüşme",
    programPrep: "Kişiye özel haftalık program",
    trialAnalysis: "Ayda 2 deneme analizi",
    tracking: "Haftalık çalışma kontrolü",
    parentMeeting: "Ayda 1 veli bilgilendirme",
    extras: ["Sınav kaygısı seminer kaydı"],
  },
  {
    id: "yks-yillik",
    program: "yks",
    name: "Sınava Kadar Paket",
    duration: "Sınava kadar",
    months: 12,
    price: 29990,
    popular: true,
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
    name: "Aylık Paket",
    duration: "1 ay",
    months: 1,
    price: 3990,
    meetings: "Haftada 1 birebir görüşme",
    programPrep: "Kişiye özel haftalık program",
    trialAnalysis: "Ayda 2 deneme analizi",
    tracking: "Haftalık çalışma kontrolü",
    parentMeeting: "Ayda 1 veli bilgilendirme",
    extras: ["Sınav kaygısı seminer kaydı"],
  },
  {
    id: "lgs-yillik",
    program: "lgs",
    name: "Sınava Kadar Paket",
    duration: "Sınava kadar",
    months: 12,
    price: 29990,
    popular: true,
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
    a: "Standart aylık pakette haftada bir birebir görüşme vardır. Sınava kadar pakette ara check-in ve sınav dönemi ekstra seanslar bulunur.",
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
