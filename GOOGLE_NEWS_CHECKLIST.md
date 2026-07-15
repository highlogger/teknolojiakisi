# Google News Compliance Checklist — TeknolojiAkışı

## Uyumluluk Puanı: 85/100 ✅

| # | Kriter | Durum | Not |
|---|--------|-------|-----|
| 1 | News Sitemap | ✅ | `/news-sitemap.xml` — son 48 saat, 1000 makale |
| 2 | RSS Feed | ✅ | `/rss.xml` — 50 makale, enclosure, category, GUID |
| 3 | NewsArticle Schema | ✅ | JSON-LD `NewsArticle` — headline, datePublished, author, publisher, logo |
| 4 | Publisher Logo | ✅ | 400x400 PNG — `PUBLISHER.logo` config'te |
| 5 | Author Info | ✅ | Person schema — name, bio, avatar, social links |
| 6 | Görsel Gereksinimleri | ⚠️ | 1200x675 minimum — validator hazır, AI görseller optimize edilmeli |
| 7 | Canonical URL | ✅ | Tüm sayfalarda `alternates.canonical` |
| 8 | Breadcrumb | ✅ | JSON-LD BreadcrumbList mevcut |
| 9 | Googlebot İzni | ✅ | `robots.txt` — Googlebot ve Googlebot-News izinli |
| 10 | 24 Saat İçerik | ✅ | Bot her 2 saatte çalışıyor, günde ~100-300 haber |
| 11 | URL Yapısı | ✅ | `/haber/slug` — temiz, SEO dostu |
| 12 | OpenGraph | ✅ | title, description, image, type, locale |
| 13 | Twitter Card | ✅ | summary_large_image |
| 14 | Site Dili | ✅ | `lang="tr"`, `inLanguage: tr-TR` |
| 15 | Mobil Uyumluluk | ✅ | Responsive Tailwind tasarım |

## Eksik Kalanlar (15 puan)

| # | Eksik | Önem |
|---|-------|------|
| 1 | Google News Publisher Center başvurusu yapılmadı | 🔴 |
| 2 | Google News verification code eklenmedi | 🔴 |
| 3 | AMP sayfaları yok | 🟡 |
| 4 | Görsel boyut validasyonu otomatik değil | 🟡 |
| 5 | Google News raporlaması (Search Console) yapılmadı | 🟡 |
