# Amfi Koçluk — Ürün & Operasyon Brifingi

**Versiyon:** Canlı MVP+ (Kasım 2026)  
**Alan adı:** https://amfikocluk.com  
**Ürün tipi:** Online YKS & LGS koçluk işletim sistemi (üyelik + panel + Meet + ödeme)

---

## 1. Tek cümle

Amfi Koçluk; öğrencinin üye olup paket aldığı, danışmanın program ve görüşmeyi yönettiği, velinin çocuğu takip ettiği, yönetimin eşleştirme / ödeme / Meet altyapısını işlettiği dijital koçluk platformudur.

---

## 2. Problem & çözüm

| Problem | Çözüm |
|--------|--------|
| Koçluk süreci dağınık (WhatsApp, Excel, takvim) | Tek panel: program, deneme, görüşme, sipariş |
| Görüşme planlama zor | Öğrenci slot seçer → Google Meet otomatik oluşur |
| Veli karanlıkta kalır | Veli paneli ile çocuğun program/deneme görünümü |
| Operasyon elle yürür | Admin: öğrenci–danışman eşleştirme, ödeme, içerik |

---

## 3. Roller ve yetkiler

### 3.1 Öğrenci
- Üye olur, e-postasını doğrular, paket satın alır.
- Panel: özet, program, denemeler, görüşmeler, siparişler.
- Danışmanı varsa Meet randevusu alır; görevleri tamamlar.
- **Paket yoksa** program / deneme kapalıdır.

### 3.2 Veli
- Genelde yönetim tarafından açılır; çocuğa bağlanır.
- Çocuğun özet / program / deneme / siparişini görür.
- Veli görüşme **talebi** açabilir; Meet linki görmez.
- Görev işaretleyemez, paket satın alamaz, Meet randevusu alamaz.

### 3.3 Danışman
- Sadece kendisine atanan öğrencileri görür.
- Haftalık program / görev yazar, gün notu bırakır.
- Takvimde müsaitlik kapatır / açar.
- Geçmiş Meet’leri “yapıldı / yapılmadı + not” işler.
- Veli taleplerini onaylar veya kapatır.

### 3.4 Yönetim (Admin)
- Öğrenci / danışman yönetimi, danışman atama, paket atama.
- Ödemeler, ön görüşme talepleri, mesajlar.
- Site içeriği (logo, menü, slider, görseller).
- Google hesabını bağlar → tüm Meet linkleri bu hesaptan üretilir.

---

## 4. Ana kullanıcı yolculuğu

```
Ziyaretçi → Üye ol → E-posta doğrula → Giriş
       → Paket satın al → (Admin danışman atar)
       → Randevu al (Meet) → Programı uygula → Deneme / takip
```

### Adım adım
1. **Kayıt** (`/uye-ol`) — paketsiz öğrenci hesabı.
2. **Doğrulama** — maile gelen link (24 saat); doğrulanmadan giriş yok.
3. **Giriş** (`/giris`) — role göre doğru panele yönlendirme.
4. **Paket** (`/paketler` → `/odeme`) — kart veya havale + dekont.
5. **Eşleştirme** — admin danışman atar.
6. **Görüşme** — öğrenci slot seçer; Meet linki oluşur.
7. **Takip** — danışman program yazar; öğrenci görevleri işler; veli izler.

---

## 5. Ödeme senaryosu

| Yöntem | Davranış |
|--------|----------|
| **Kart (demo)** | Başarılıysa paket hemen aktif. Kart numarası `0000` ile biterse bilinçli başarısız senaryo. |
| **Havale / EFT** | Dekont zorunlu → durum `havale_bekliyor`. Paket otomatik açılmaz; yönetim paket atayarak tamamlar. |

> Not: Canlıda gerçek POS (iyzico / PayTR vb.) henüz bağlı değil; kart akışı demo tahsilattır.

---

## 6. Görüşme & Meet kuralları

- Saat aralığı: **12:00–21:00**, 15 dakikalık dilimler.
- En erken randevu: **yarın** (aynı gün yok).
- Seçilen saatten itibaren **60 dk** blok (çakışma engeli).
- Son Google Meet’ten sonra **7 gün** yeni randevu alınamaz.
- Paket kotaları (yaklaşık): 1 ay → 4, 3 ay → 12, 6 ay → 24, sınava kadar → hafta sayısı.
- Danışman atanmamışsa veya Google bağlı değilse Meet oluşmaz.

---

## 7. Panel haritası

### Öğrenci
- `/panel/ogrenci` — özet  
- `/panel/ogrenci/program`  
- `/panel/ogrenci/denemeler`  
- `/panel/ogrenci/gorusmeler`  
- `/panel/ogrenci/siparisler`

### Veli
- `/panel/ogrenci?veli=1` (+ program, deneme, sipariş; görüşme menüsü yok)

### Danışman
- `/panel/danisman`  
- `/panel/danisman/ogrenciler` · `/ogrenciler/[id]`  
- `/panel/danisman/takvim`  
- `/panel/danisman/ara-gorusmeler`  
- `/panel/danisman/notlar` · `/talepler`

### Yönetim
- `/panel/admin`  
- `/panel/admin/ogrenciler` · `/danismanlar` · `/odemeler` · `/talepler` · `/mesajlar`  
- `/panel/admin/icerik/*` (logo, menü, slider, görseller)

### Pazarlama
- `/` · `/paketler` · `/odeme` · `/uye-ol` · `/giris` · `/on-gorusme` · `/iletisim`

---

## 8. Teknik özet (satış / devir için)

| Katman | Seçim |
|--------|--------|
| Frontend / App | Next.js (App Router) |
| Veritabanı | MySQL + Prisma |
| Auth | Oturum çerezi (rol bazlı) |
| Mail | Natro SMTP (doğrulama linki) |
| Görüşme | Google Calendar API → Meet linki |
| Hosting | VPS (Nginx + PM2 + SSL) |
| Domain | amfikocluk.com |

---

## 9. Operasyon checklist (günlük / haftalık)

**Yönetim**
- [ ] Google bağlantısı sağlıklı mı?
- [ ] Yeni ödemeler / havale dekontları
- [ ] Danışman–öğrenci atamaları
- [ ] Ön görüşme talepleri

**Danışman**
- [ ] Müsaitlik takvimi
- [ ] Haftalık program yazımı
- [ ] Ara görüşme işaretleme
- [ ] Veli talepleri

**Öğrenci**
- [ ] Paket aktif mi?
- [ ] Randevu / Meet
- [ ] Görev tamamlama

---

## 10. Bilinen sınırlar (şeffaf)

1. Kart ödemesi gerçek POS değil (demo).
2. Havale sonrası paket aktivasyonu manuel (admin paket atar).
3. Deneme ekleme ağırlıklı olarak danışman/seed tarafında; öğrenci yalnızca görüntüler.
4. Landing’deki bazı istatistikler pazarlama içeriğidir; kanıt seti güçlendirilmelidir.
5. Google bağlantısı nadiren kopabilir; admin panelden yeniden bağlanır.

---

## 11. Değer özeti (satış / yatırımcı notu)

**Bugün ne var?**  
Canlı, çalışan, çok rollü koçluk MVP+: üyelik, doğrulama, paket, panel, Meet, danışman operasyonu.

**Değeri ne artırır?**
- Gerçek POS + otomatik havale onayı  
- Kanıtlı öğrenci / ciro metrikleri  
- Daha zengin mentör & başarı hikâyeleri  
- Ölçülebilir retention (haftalık aktif öğrenci)

---

*Bu brifing, mevcut kod ve canlı kurulumla uyumlu ürün senaryosunu özetler. Güncelleme: Kasım 2026.*
