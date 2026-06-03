# Mythos Forum - Sistem Tasarımı ve Uygulama Planı

## 1. Veritabanı Şeması (Database Schema - Firestore)

### `users` Koleksiyonu
Kullanıcı profili, RPG ilerlemesi ve Quality Score (Kalite Puanı) verilerini tutar.
- `uid` (String): Firebase Auth ID
- `username` (String)
- `xp` (Number): Toplam kazanılan deneyim puanı.
- `level` (Number): Mevcut seviye (RPG Progression).
- `quality_score` (Number): Topluluktan alınan upvote ve admin feature'larına göre hesaplanan itibar puanı (0-100).
- `daily_xp_earned` (Number): Spam önlemek için günlük kazanılan XP sınırı takibi.
- `last_xp_reset` (Timestamp): Günlük sınırın sıfırlanma zamanı.
- `shadow_banned` (Boolean): Sistem tarafından abuse tespit edilirse `true` olur, gönderileri başkasına gözükmez.

### `categories` Koleksiyonu
Mitoloji kategorilerini tutar.
- `id` (String): Kategori ID (örn: `greek`, `norse`)
- `name` (String): Görünen ad ("Yunan Mitolojisi")
- `slug` (String): SEO dostu URL parçası (`yunan-mitolojisi`)
- `description` (String): Kategori açıklaması.
- `icon` (String): UI için ikon veya görsel referansı.

### `threads` Koleksiyonu (Konular)
- `id` (String)
- `categoryId` (String): Ait olduğu kategori.
- `authorId` (String)
- `title` (String)
- `slug` (String): SEO friendly URL (`/t/yunan/zeusun-dogusu`)
- `content` (String)
- `tags` (Array<String>)
- `upvotes` (Number)
- `isFeatured` (Boolean): Admin tarafından öne çıkarılmış (Quality Score bonusu verir).
- `createdAt` (Timestamp)

### `comments` Koleksiyonu (Yorumlar)
- `id` (String)
- `threadId` (String)
- `parentId` (String | null): Nested (iç içe) yorum sistemi için. Ana yorumsa null.
- `authorId` (String)
- `content` (String)
- `upvotes` (Number)
- `isSolution` (Boolean): Konuyu açan kişi tarafından "Çözüm" işaretlenmişse.
- `createdAt` (Timestamp)

### `xp_logs` Koleksiyonu (Server-side XP Log & Abuse Prevention)
XP kazanımlarının server tarafında doğrulanması ve Rate Limiting için log kayıtları.
- `id` (String)
- `userId` (String)
- `action` (String): `CREATE_THREAD`, `ADD_COMMENT`, `RECEIVED_UPVOTE`, `MARKED_SOLUTION`
- `amount` (Number): Kazanılan XP miktarı.
- `timestamp` (Timestamp)
- `targetId` (String): Hangi konu/yorum üzerinde işlem yapıldı.

### `cards` ve `user_cards` Koleksiyonları (Collectible Kart Sistemi)
**cards:**
- `id` (String)
- `name` (String): "Zeus", "Odin", "Erlik Han", "Amaterasu" vb.
- `description` (String)
- `rarity` (String): `COMMON`, `RARE`, `EPIC`, `LEGENDARY`, `MYTHIC`
- `imageUrl` (String)
- `dropChance` (Number)

**user_cards:**
- `userId` (String)
- `cardId` (String)
- `quantity` (Number): Duplicate sistemi için (aynı karttan kaç tane var).
- `acquiredAt` (Timestamp)

---

## 2. Server-side XP Sistemi & Abuse Prevention

### API Endpoint Tasarımı (Cloudflare Pages Functions)
Proje şu anda Cloudflare üzerinde barındırıldığı için Next.js API Routes yerine birebir aynı mantıkla çalışan **Cloudflare Pages Functions** (`/functions/api/`) kullanılacak. 
Kullanıcı client (tarayıcı) üzerinden Firestore'a direkt XP yazamaz. Her etkileşimde bir Event API'ye gider:

1. `POST /api/actions/post_thread`
2. `POST /api/actions/post_comment`
3. `POST /api/actions/upvote`

**Abuse Prevention (Spam Koruması) Kuralları API İçinde Şöyle İşler:**
1. **Rate Limiting:** Kullanıcı yorum atma isteği gönderdiğinde API `xp_logs` tablosuna bakar. Son 1 saat içinde 10'dan fazla yorum atıldıysa XP vermez, sadece yorumu kaydeder (XP Cooldown).
2. **Günlük XP Sınırı:** Bir günde maksimum kazanılacak XP 200'dür. API, kullanıcının `daily_xp_earned` değerini kontrol eder, limiti aştıysa XP işlemini pas geçer.
3. **Fake Upvote Koruması:** Aynı kullanıcının kendine ait yan hesaplarla (aynı IP) upvote attığı tespit edilirse `shadow_banned = true` yapılır (Soft Penalty).
4. **Quality Score Multiplier:** Kullanıcının Content Quality Score'u (Kalite Puanı) 80'in üzerindeyse, yaptığı her yorum 2 XP yerine 3 XP (1.5x) kazandırır. Kalitesiz spam içerik üretenlerin puanı 20'nin altındaysa 0 XP (Ceza) kazanırlar.

---

## 3. Frontend Geliştirmeleri ve UI Components

1. **CategoryNavigation:** Forum ana sayfasında mitoloji kategorilerini ikonlarıyla (🏛️ Yunan, 🪓 Nordik, 🐺 Türk, 🐪 Mısır, 🌸 Japon) listeleyen bileşen.
2. **NestedCommentList:** Yorumların birbirine yanıt verebildiği (Reddit tarzı) derinlemesine hiyerarşik UI.
3. **Mention & Quote Sistemi:** RichText içerisine `@` işaretiyle kullanıcı etiketleme ve alıntı formatı ekleme özelliği.
4. **CardInventory (Envanter):** Profil sayfasında sahip olunan "Mitolojik Kartları" nadirlik renklerine göre (Efsanevi=Sarı, Epik=Mor vb.) parlama animasyonlarıyla sergileyen arayüz.
5. **Trade & Duplicate Yıkım Sistemi:** Fazladan olan kartları (duplicate) parçalayarak ekstra XP kazanma mantığı.

---

## 4. Uygulama Adımları (Roadmap)

Eğer bu tasarımı onaylıyorsanız, kodu güncellemeye şu adımlarla başlayacağım:
*   **Adım 1:** Veritabanı arayüzlerinin (`types.ts`) güncellenmesi ve Kategori sisteminin UI olarak tasarlanması.
*   **Adım 2:** Server-side API'nin (`functions` klasörü) kurulması ve XP / Spam algoritmasının kodlanması.
*   **Adım 3:** Nested (İç içe) yorum yapısının ve SEO uyumlu URL'lerin (Slug) frontend'e entegrasyonu.
*   **Adım 4:** Collectible Kart sisteminin veri altyapısı ve Profil sayfasındaki envanter tasarımının yapılması.
