# TeknolojiAkışı — Kapsamlı Proje Analizi

**Analiz Tarihi:** 15 Temmuz 2026
**Analist Seviyesi:** CTO / Staff Software Engineer / Next.js Mimarı
**Proje Versiyonu:** 0.1.0

---

## İçindekiler

1. [Proje Özeti](#1-proje-özeti)
2. [Teknoloji Yığını](#2-teknoloji-yığını)
3. [Klasör Yapısı](#3-klasör-yapısı)
4. [Route Analizi](#4-route-analizi)
5. [Component Analizi](#5-component-analizi)
6. [Veritabanı Analizi](#6-veritabanı-analizi)
7. [Haber Sistemi](#7-haber-sistemi)
8. [SEO Analizi](#8-seo-analizi)
9. [GEO (AI Search) Analizi](#9-geo-ai-search-analizi)
10. [Performans Analizi](#10-performans-analizi)
11. [Güvenlik Analizi](#11-güvenlik-analizi)
12. [Kod Kalitesi](#12-kod-kalitesi)
13. [Eksik Özellikler](#13-eksik-özellikler)
14. [İyileştirme Fırsatları](#14-iyileştirme-fırsatları)
15. [Yol Haritası](#15-yol-haritası)
16. [İlk 100 Görev](#16-i̇lk-100-görev)
17. [Genel Puanlama](#17-genel-puanlama)

---

## 1. Proje Özeti

### Bu proje ne amaçla geliştirilmiş?

TeknolojiAkışı, **Türkçe teknoloji haberleri** yayınlayan, **yapay zeka destekli** bir haber portalıdır. Deepseek API kullanarak RSS kaynaklarından İngilizce teknoloji haberlerini otomatik olarak çeker, Türkçe'ye çevirip yeniden yazar, SEO optimizasyonu yapar ve yayınlar. Proje, Türkiye'deki teknoloji okurlarına hitap eden, **Google News**, **Google Discover** ve **AI arama motorları** (ChatGPT, Claude, Gemini, Perplexity) için optimize edilmiş bir içerik platformudur.

### Mevcut geliştirme seviyesi

**MVP (Minimum Viable Product) aşamasında.** Temel işlevler çalışıyor: haber çekme, AI ile içerik üretme, yayınlama, kategorilendirme. Admin paneli işlevsel ancak ham. Production'da Docker üzerinde çalışıyor.

### Genel mimari değerlendirmesi

Proje **Next.js 14 App Router** üzerine inşa edilmiş, **SQLite + Prisma** ile veri yönetimi yapan, **NextAuth v5** ile kimlik doğrulama sağlayan, **Docker** tabanlı deployment'a sahip bir yapıdadır.

**Mimari desen:** Monolitik Next.js uygulaması. API routes ve sayfa render'ı aynı uygulama içinde. Bot servisi ayrı bir container'da çalışıyor.

**Genel değerlendirme:** Hızlı prototiplenmiş, işlevsel bir proje. Teknik borç birikmiş durumda. Production'da çalışıyor ancak profesyonel seviyeye ulaşmak için önemli iyileştirmeler gerekiyor.

### Güçlü yönleri

1. **Kapsamlı SEO altyapısı:** JSON-LD şemaları (Organization, WebSite, NewsArticle, BreadcrumbList, CollectionPage, Person, AboutPage, ContactPage, SearchResultsPage) eksiksiz uygulanmış. 9 farklı şema tipi destekleniyor.
2. **AI pipeline:** 3 aşamalı içerik üretimi (çeviri → kalite kontrol → SEO optimizasyonu) profesyonelce kurgulanmış.
3. **Teknoloji filtresi:** 139 tech anahtar kelimesi ve 20+ non-tech regex pattern ile kapsamlı içerik filtreleme.
4. **Docker deployment:** Multi-stage build, healthcheck, Nginx reverse proxy, SSL — production-ready.
5. **LLM crawler desteği:** `/llms-full.txt` endpoint'i ile AI arama motorlarına özel içerik listesi.
6. **Dil kalitesi kontrolü:** Türkçe karakter validasyonu, kalite kontrol prompt'ları.
7. **İki bot versiyonu:** TypeScript (tam özellikli) ve CommonJS (production, bağımlılıksız).

### Zayıf yönleri

1. **İki ayrı bot implementasyonu:** `auto-bot.js` (production) ve `services/bot/` (TypeScript) arasında kod tekrarı ve davranış farklılıkları var. TS bot'taki tech filtre, SEO pipeline, kalite kontrol gibi özellikler JS bot'ta eksik.
2. **Hata yönetimi:** Boş catch blokları (`catch {}`) yaygın. Sessiz hatalar debugging'i zorlaştırıyor.
3. **State management yok:** Client component'ler tamamen `useState` ile yönetiliyor. Büyüdükçe sorun olacak.
4. **Form validation yok:** ArticleForm'da hiçbir input validasyonu yok.
5. **Test yok:** Sıfır unit test, integration test, e2e test.
6. **Resim optimizasyonu:** `images.unoptimized: true` ile tüm Next.js resim optimizasyonu devre dışı bırakılmış.
7. **Tip güvenliği:** `any` kullanımları mevcut.
8. **Sabit API key:** Production env dosyasında API key commit'lenmiş durumda.
9. **Veritabanı:** SQLite, 10K+ makale sonrası performans sorunu yaşayacak.
10. **SEO içerik kalitesi:** TRENDING_TOPICS ve FACTORY_TOPICS'teki konuların bazıları güncelliğini yitirmiş (2025 referansları).

---

## 2. Teknoloji Yığını

| Kategori | Teknoloji | Versiyon | Açıklama |
|----------|-----------|----------|----------|
| **Framework** | Next.js | 14.2.35 | App Router, Server Components |
| **UI Kütüphanesi** | React | ^18 | Client/Server component hibrit |
| **Dil** | TypeScript | ^5 | Strict mode aktif |
| **CSS** | Tailwind CSS | ^3.4.1 | Utility-first, custom animasyonlar |
| **ORM** | Prisma | ^6.19.3 | SQLite adapter |
| **Veritabanı** | SQLite | - | `file:./dev.db`, single-file |
| **Authentication** | NextAuth | ^5.0.0-beta.31 | Credentials provider, JWT |
| **Şifreleme** | bcryptjs | ^3.0.3 | 12 salt round |
| **AI/LLM** | OpenAI SDK | ^6.45.0 | Deepseek API (uyumlu) |
| **RSS Parser** | rss-parser | ^3.13.0 | Feed çekme |
| **Web Scraping** | cheerio | ^1.2.0 | jQuery benzeri DOM seçici |
| **HTTP Client** | axios | ^1.18.1 | Web scraping için |
| **Slugify** | slugify | ^1.6.9 | Türkçe karakter desteği |
| **Tarih** | date-fns | ^4.4.0 | (Import edilmiş ama kullanımı sınırlı) |
| **Env** | dotenv | ^17.4.2 | Ortam değişkenleri |
| **Dev Tools** | tsx | ^4.23.0 | TypeScript execution |
| **Dev Tools** | ts-node | ^10.9.2 | TypeScript execution |
| **Lint** | ESLint | ^8 | eslint-config-next |
| **CSS Build** | PostCSS | ^8 | Tailwind derlemesi |
| **Container** | Docker | - | Multi-stage build |
| **Reverse Proxy** | Nginx | alpine | SSL termination, cache |
| **Deployment** | Docker Compose | v3 | 3 servis (app, bot, nginx) |

### Eksik Teknolojiler

| İhtiyaç | Önerilen Teknoloji |
|---------|-------------------|
| Rich Text Editor | TipTap, Lexical veya Quill |
| Form Validation | Zod + React Hook Form |
| State Management | Zustand veya Jotai |
| Testing | Vitest + Testing Library + Playwright |
| Image CDN | Cloudinary veya Vercel Image Optimization |
| Monitoring | Sentry veya Axiom |
| Analytics | Vercel Analytics veya Plausible |
| Cache | Redis (VPS'te) veya Vercel ISR |
| Email | Resend veya Nodemailer |
| Sitemap (büyük) | Dinamik index-sitemap |

---

## 3. Klasör Yapısı

```
teknolojiakışı/
├── prisma/                         # Veritabanı şeması ve seed
│   ├── schema.prisma               # 9 model, SQLite
│   ├── seed.ts                     # Başlangıç verisi
│   └── dev.db                      # GERÇEK veritabanı (4.8MB, 623+ haber)
├── public/                         # Statik dosyalar
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (metadata, fonts, JSON-LD)
│   │   ├── globals.css             # Tailwind + prose stilleri
│   │   ├── sitemap.ts              # /sitemap.xml — dinamik
│   │   ├── (public)/               # Public route grubu
│   │   │   ├── layout.tsx          # Public layout (Header, Footer, Ticker, Ads)
│   │   │   ├── page.tsx            # Anasayfa (hero + grid + sidebar)
│   │   │   ├── haber/[slug]/       # Haber detay
│   │   │   ├── kategori/[slug]/    # Kategori listesi
│   │   │   ├── arama/              # Arama sayfası
│   │   │   ├── hakkimizda/         # Hakkımızda
│   │   │   ├── iletisim/           # İletişim
│   │   │   └── yazar/[slug]/       # Yazar sayfası
│   │   ├── admin/                  # Admin route grubu
│   │   │   ├── layout.tsx          # Admin layout (Sidebar)
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── giris/              # Login
│   │   │   ├── haberler/           # Haber CRUD
│   │   │   ├── bot/                # Bot kontrol + kaynaklar + loglar
│   │   │   ├── yazarlar/           # Yazar yönetimi
│   │   │   ├── kategoriler/        # Kategori yönetimi
│   │   │   └── ayarlar/            # Site ayarları
│   │   ├── api/                    # REST API routes
│   │   │   ├── articles/           # GET (list), POST
│   │   │   ├── articles/[id]/      # GET, PUT, DELETE
│   │   │   ├── auth/[...nextauth]/ # NextAuth handlers
│   │   │   ├── authors/            # GET, POST
│   │   │   ├── bot/logs/           # GET (paginated)
│   │   │   ├── bot/trigger/        # POST (manual trigger)
│   │   │   ├── categories/         # GET, POST
│   │   │   ├── search/             # GET (full-text)
│   │   │   ├── settings/           # GET, PUT
│   │   │   ├── sources/            # GET, POST
│   │   │   └── tags/               # GET, POST
│   │   └── llms-full.txt/          # AI crawler endpoint'i
│   ├── components/                 # Paylaşımlı componentler
│   │   ├── layout/                 # Header, Footer
│   │   ├── news/                   # AdBanner, BreakingTicker
│   │   ├── admin/                  # AdminSidebar, ArticleActions, ArticleForm
│   │   ├── seo/                    # BOŞ — SEO componentleri lib/seo.tsx'e taşınmış
│   │   └── ui/                     # BOŞ — UI primitives için ayrılmış
│   ├── lib/                        # Paylaşımlı kütüphaneler
│   │   ├── auth.ts                 # NextAuth konfigürasyonu
│   │   ├── constants.ts            # Sabitler (kaynaklar, kategoriler, yazarlar)
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── deepseek.ts             # Deepseek/OpenAI API wrapper
│   │   ├── seo.tsx                 # JSON-LD üreteçleri + metadata yardımcıları
│   │   └── utils.ts                # slugify, formatDate, timeAgo, vb.
│   ├── services/                   # İş mantığı servisleri
│   │   └── bot/                    # Haber botu
│   │       ├── index.ts            # Orchestrator (runBot)
│   │       ├── fetcher.ts          # RSS/Web fetcher
│   │       ├── generator.ts        # AI pipeline (3 aşama)
│   │       ├── prompts.ts          # Tüm AI prompt'ları + filtreler
│   │       ├── publisher.ts        # Veritabanı kayıt
│   │       └── trigger.ts          # CLI tetikleyici
│   ├── types/                      # TypeScript tip tanımları
│   │   └── index.ts                # Tüm tipler (5 type, 6 interface)
│   └── middleware.ts               # NextAuth middleware (admin koruma)
├── auto-bot.js                     # Production bot (CommonJS, 250 satır)
├── auto-bot.ts                     # Dev bot (TypeScript, 45 satır)
├── Dockerfile                      # Multi-stage production build
├── docker-compose.yml              # 3 servis (app, bot, nginx)
├── nginx.conf                      # Reverse proxy + SSL + rate limiting
├── deploy.sh                       # Deployment script
├── DEPLOY.md                       # Deployment dökümantasyonu
├── .env.example                    # Şablon
├── .env.production                 # Production değişkenleri
├── dev.db                          # BOŞ veritabanı (135KB) — yanıltıcı!
└── package.json                    # Bağımlılıklar
```

### Kritik Bulgu: İki Ayrı dev.db

Projede **iki farklı** `dev.db` dosyası bulunmaktadır:

| Konum | Boyut | İçerik |
|-------|-------|--------|
| `./dev.db` | 135 KB | **BOŞ** — Prisma'nın yanlışlıkla oluşturduğu dosya |
| `./prisma/dev.db` | 4.8 MB | **GERÇEK veritabanı** — 623 haber, 11 kategori, 22 kaynak |

**Dockerfile** şu anda kökteki boş `dev.db`'yi kopyalamaktadır. Production build'de `prisma/dev.db` kullanılmalıdır. Bu bug tespit edilmiş ve düzeltilmiştir.

---

## 4. Route Analizi

### Public Sayfalar

| Route | Tip | Veri Kaynağı | revalidate |
|-------|-----|-------------|------------|
| `/` | Server Component | Anasayfa | 300s (ISR) |
| `/haber/[slug]` | Server Component | Haber detay | `force-dynamic` |
| `/kategori/[slug]` | Server Component | Kategori listesi | `force-dynamic` |
| `/yazar/[slug]` | Server Component | Yazar sayfası | `force-dynamic` |
| `/arama` | Client Component | Arama | — |
| `/hakkimizda` | Static | Statik | — |
| `/iletisim` | Static | Statik | — |

### Admin Sayfaları

| Route | Tip | Açıklama |
|-------|-----|----------|
| `/admin` | Server Component | Dashboard (istatistikler) |
| `/admin/giris` | Client Component | Login form |
| `/admin/haberler` | Server Component | Haber listesi (paginated) |
| `/admin/haberler/yeni` | Client Component | Yeni haber form |
| `/admin/haberler/[id]/duzenle` | Client Component | Haber düzenleme form |
| `/admin/bot` | Server Component | Bot kontrol paneli |
| `/admin/bot/kaynaklar` | Server Component | Kaynak yönetimi |
| `/admin/bot/loglar` | Server Component | Bot logları |
| `/admin/yazarlar` | Server Component | Yazar yönetimi |
| `/admin/kategoriler` | Server Component | Kategori yönetimi |
| `/admin/ayarlar` | Server Component | Site ayarları |

### API Routes

| Route | Method | Auth | Açıklama |
|-------|--------|------|----------|
| `/api/articles` | GET, POST | POST: auth | Liste/oluştur |
| `/api/articles/[id]` | GET, PUT, DELETE | PUT/DELETE: auth | Detay/güncelle/sil |
| `/api/auth/[...nextauth]` | GET, POST | — | NextAuth |
| `/api/authors` | GET, POST | POST: auth | Liste/oluştur |
| `/api/bot/logs` | GET | auth | Bot logları |
| `/api/bot/trigger` | POST | auth | Bot manuel tetikleme |
| `/api/categories` | GET, POST | POST: auth | Liste/oluştur |
| `/api/search` | GET | — | Tam metin arama |
| `/api/settings` | GET, PUT | PUT: auth | Site ayarları |
| `/api/sources` | GET, POST | POST: auth | Liste/oluştur |
| `/api/tags` | GET, POST | POST: auth | Liste/oluştur |

### Özel Route'lar

| Route | Açıklama |
|-------|----------|
| `/sitemap.xml` | Dinamik XML sitemap (5000 makale limitli) |
| `/llms-full.txt` | AI crawler'lar için düz metin haber listesi (son 50) |

### Middleware

- **Dosya:** `src/middleware.ts`
- **Kapsam:** `/admin/:path*`
- **İşlev:** `/admin/*` route'larını korur, `/admin/giris` hariç
- **Redirect:** Yetkisiz erişimi `/admin/giris?callbackUrl=...` yönlendirir
- **Giriş yapmış kullanıcı:** `/admin/giris` sayfasından `/admin` yönlendirir

### Eksik Route'lar

1. ❌ **RSS Feed** (`/rss.xml`, `/feed`) — Google News ve RSS okuyucular için kritik
2. ❌ **AMP sayfaları** — Google News için faydalı
3. ❌ **404 sayfası** — Özel `not-found.tsx` yok (sadece Next.js default)
4. ❌ **500/error sayfası** — Özel `error.tsx` yok
5. ❌ **loading.tsx** — Hiçbir sayfada loading state yok
6. ❌ **Sitemap index** — 5000'den fazla makale için sitemap-index gerekli
7. ❌ **API rate limit** — Sadece nginx seviyesinde, uygulama seviyesinde yok
8. ❌ **API documentation** — OpenAPI/Swagger yok

---

## 5. Component Analizi

### Mevcut Componentler (7 adet)

| Component | Satır | Tip | Konum |
|-----------|-------|-----|-------|
| `Header` | 147 | Client (`"use client"`) | `components/layout/` |
| `Footer` | 70 | Server | `components/layout/` |
| `AdBanner` | 43 | Server | `components/news/` |
| `BreakingTicker` | 63 | Server (async) | `components/news/` |
| `AdminSidebar` | 128 | Client (`"use client"`) | `components/admin/` |
| `ArticleActions` | 79 | Client (`"use client"`) | `components/admin/` |
| `ArticleForm` | 342 | Client (`"use client"`) | `components/admin/` |

### Ortak Componentler

1. **Header** — Sticky header, kategori navigasyonu, mobil drawer menu, scroll shadow efekti. En karmaşık client component.
2. **Footer** — 4 sütunlu grid, sosyal medya ikonları, yapay zeka disclaimer'ı.
3. **AdminSidebar** — Mobil responsive, 8 navigasyon öğesi, kullanıcı bilgi kartı, sign-out.

### Tekrar Eden Pattern'ler

1. **SVG ikonları inline** — Twitter, RSS, arama, hamburger ikonları her component'te tekrar tekrar yazılmış. Bir **Icon library** veya en azından `icons.tsx` dosyası oluşturulmalı.
2. **Link component'leri** — `next/link` wrapper'ları her yerde tekrar ediyor.
3. **Loading/error state'leri** — BotTriggerButton dışında hiçbir yerde loading state yok.

### Çok Büyük Componentler

1. **ArticleForm (342 satır):** Form alanları, SEO bölümü, tag yönetimi, validation ve error handling aynı component'te. Şu parçalara bölünmeli:
   - `ArticleFormContainer` (ana form)
   - `ArticleBasicFields` (başlık, özet, içerik)
   - `ArticleMetaFields` (kategori, yazar, durum, görsel)
   - `ArticleSeoFields` (meta title, meta description)
   - `ArticleTagInput` (tag yönetimi)

2. **Header (147 satır):** Mobil drawer ve desktop nav aynı component'te. `MobileDrawer` ayrı bir component olmalı.

### Bölünmesi Gereken Componentler

1. **Header → Header + MobileDrawer + CategoryNav + SearchButton**
2. **ArticleForm → ArticleForm + FormSection + SeoSection + TagInput**
3. **AdminSidebar → Sidebar + SidebarNav + UserInfo + SignOutButton**

### Yeniden Kullanılabilir Componentler (Eksik)

1. ❌ `Button` — Her yerde farklı button stilleri
2. ❌ `Input` — Form input'ları standardize edilmemiş
3. ❌ `Card` — Haber kartları
4. ❌ `Badge` — Durum/kategori badge'leri
5. ❌ `Pagination` — Sayfalama
6. ❌ `EmptyState` — Boş durum gösterimi
7. ❌ `LoadingSpinner` — Yükleme göstergesi
8. ❌ `ErrorBoundary` — Hata yakalama
9. ❌ `ConfirmDialog` — Onay dialog'u
10. ❌ `Toast/Notification` — Bildirim sistemi
11. ❌ `Breadcrumb` — İç navigasyon
12. ❌ `SocialShare` — Sosyal medya paylaşım butonları

### Boş Klasörler

- `components/seo/` — BOŞ. SEO componentleri `lib/seo.tsx` içinde.
- `components/ui/` — BOŞ. UI primitives için placeholder.

---

## 6. Veritabanı Analizi

### Şema Özeti (9 model)

```
User (1) ──┐
            ├── Article ──┬── ArticleTag ── Tag
Category ──┘              │
Author ─────┘              │
Source ─────┘              │
                           │
BotLog ──── Source         │
SiteSetting (bağımsız)     │
```

### İlişkiler

| İlişki | Tip | Durum |
|--------|-----|-------|
| User → Article | Yok! | ⚠️ Eksik |
| Category → Article | 1:N | ✅ |
| Author → Article | 1:N | ✅ |
| Source → Article | 1:N | ✅ |
| Source → BotLog | 1:N | ✅ |
| Article ↔ Tag | N:M (ArticleTag) | ✅ |
| Category → Source | 1:N | ✅ |

### Normalizasyon

- **3NF uyumlu.** Tekrarlayan veri yok.
- `SiteSetting` key-value pattern'i esnek ama tip güvenliği zayıf.
- `ArticleTag` composite key doğru uygulanmış.

### İndeksler

| İndeks | Tablo | Sütunlar | Değerlendirme |
|--------|-------|----------|---------------|
| Primary | Tümü | `id` | ✅ CUID — sıralanabilir |
| Unique | Article | `slug` | ✅ |
| Unique | Category | `name`, `slug` | ✅ |
| Unique | Author | `slug` | ✅ |
| Unique | Tag | `name`, `slug` | ✅ |
| Unique | Source | Yok | ⚠️ `feedUrl` unique olmalı |
| Unique | User | `email` | ✅ |
| Unique | SiteSetting | `key` | ✅ |
| Composite | Article | `(status, publishedAt)` | ✅ Sorgu performansı |
| Foreign | Article | `categoryId` | ✅ |
| Foreign | Article | `authorId` | ✅ |
| Foreign | Article | `slug` | ✅ (gereksiz — unique zaten) |

### Performans

| Konu | Durum | Not |
|------|-------|-----|
| N+1 sorgu riski | Orta | İlişkili veriler include ile çekiliyor |
| Sayfalama | Var | `getPagination()` offset-based — büyük veride yavaş |
| Full-text search | Var | `article.title/excerpt/content` LIKE sorgusu — 10K+ makalede yavaş |
| Aggregate | Yok | `viewCount` manuel increment |
| Cache | Yok | Prisma Accelerate veya Redis önerilir |

### Ölçeklenebilirlik

| Konu | SQLite Sınırı | Çözüm |
|------|--------------|-------|
| Eşzamanlı yazma | 1 writer | PostgreSQL geçişi |
| Veri boyutu | ~1GB pratik limit | PostgreSQL veya sharding |
| Backups | Dosya kopyalama | pg_dump / WAL |
| Replication | Yok | PostgreSQL streaming replication |

### Eksik Tablolar

1. ❌ **Media** — Görsel/medya yönetimi için ayrı tablo
2. ❌ **Comment** — Yorum sistemi
3. ❌ **Newsletter** — E-posta aboneliği
4. ❌ **Redirect** — SEO yönlendirmeleri
5. ❌ **Vote/Reaction** — Beğeni/oy sistemi
6. ❌ **RelatedArticle** — İlişkili haberler (manuel)
7. ❌ **ScheduledPost** — Planlı yayın

### Gereksiz / Optimize Edilebilir Tablolar

1. `SiteSetting` — Key-value yerine typed config dosyası veya ortam değişkenleri daha uygun olabilir. Ancak admin panelden yönetilebilmesi avantaj.

### Geliştirme Önerileri

1. **PostgreSQL'e geçiş** (orta vadede) — 10K+ haber, eşzamanlı kullanıcı, full-text search için
2. **Cursor-based pagination** — Offset yerine cursor, büyük veri setlerinde daha hızlı
3. **FTS index** — SQLite FTS5 veya PostgreSQL `tsvector`
4. **Soft delete** — `deletedAt` alanı ekle, article'ları geri alınabilir yap
5. **Changelog/audit** — Önemli değişiklikleri logla
6. **Database backup schedule** — Otomatik yedekleme cron job'ı

---

## 7. Haber Sistemi

### Makale Modeli

**Güçlü yönler:**
- AI metadata tracking (model, token kullanımı)
- SEO alanları (metaTitle, metaDescription)
- Öne çıkan (isFeatured) desteği
- Görüntülenme sayısı (viewCount)
- 3 durum: draft, published, archived

**Eksikler:**
- ❌ Tahmini okuma süresi
- ❌ İçerik versiyonlama/revision history
- ❌ Planlı yayın (scheduledAt)
- ❌ İçerik tipi (haber, analiz, rehber, video)
- ❌ Paylaşım sayısı
- ❌ Okunma yüzdesi / engagement metrics

### Kategori Sistemi

- 11 kategori tanımlı, renk kodlu, sıralanabilir
- Her kategoriye ait kaynaklar (Source) ilişkilendirilebilir
- ✅ İyi yapılandırılmış

### Etiket Sistemi

- N:M ilişki ArticleTag üzerinden
- AI otomatik etiket öneriyor (SEO prompt'unda)
- Slugify ile normalize ediliyor
- ✅ Doğru implementasyon

### Yazar Sistemi

- 4 bot yazar (`BOT_AUTHORS`) ve manuel yazarlar
- `isBot` flag'i ile ayrım
- Avatar, bio, uzmanlık alanı
- ✅ Yeterli

### Yayın Akışı

```
RSS/Web → Fetcher → Tech Filter → AI Pipeline (3 aşama) → Publisher → DB
```

**TS Bot (tam özellikli):**
```
1. RSS/Web'den çek
2. 48 saat filtresi
3. Duplicate kontrolü
4. Tech filtre (139 keyword + 20 regex)
5. AI: Çeviri + Yeniden Yazım (deepseek-chat, 4096 token)
6. AI: Kalite Kontrolü (deepseek-chat, 4096 token)
7. AI: SEO Optimizasyonu (deepseek-chat, JSON mode)
8. AI: Kategori Sınıflandırma
9. Veritabanına kaydet + tag'leri oluştur
```

**JS Bot (production, basitleştirilmiş):**
```
1. RSS'den çek
2. Duplicate kontrolü
3. AI: Başlık + Özet + İçerik (deepseek-chat, 2048 token)
4. "genel" kategorisine kaydet
5. İlk bot yazarı seç
```

**⚠️ Kritik fark:** JS bot'ta tech filtre, SEO pipeline, kalite kontrolü ve kategori sınıflandırma YOK.

### Eksikler

1. ❌ **Planlı yayın** — `scheduledAt` alanı ve cron job
2. ❌ **İçerik versiyonlama** — Düzenleme geçmişi
3. ❌ **Toplu işlem** — Admin'de toplu silme/durum değiştirme
4. ❌ **İçerik şablonları** — Belirli formatlar (inceleme, haber, rehber)
5. ❌ **Inline resim yönetimi** — İçerik içindeki resimleri yönetme
6. ❌ **İlişkili haberler** — Otomatik/manuel ilişkilendirme
7. ❌ **Okuma listesi** — Kullanıcıların sonra okuyacağı haberler
8. ❌ **Haber bülteni** — E-posta ile günlük/haftalık özet

---

## 8. SEO Analizi

| Kriter | Puan | Durum | Açıklama |
|--------|------|-------|----------|
| **Meta Title** | 9/10 | ✅ | Dinamik, article.metaTitle veya title |
| **Meta Description** | 9/10 | ✅ | Dinamik, article.metaDescription veya excerpt |
| **Canonical URL** | 10/10 | ✅ | Tüm sayfalarda `alternates.canonical` |
| **Open Graph** | 9/10 | ✅ | Title, description, image, type, locale, siteName |
| **Twitter Card** | 9/10 | ✅ | summary_large_image, site, creator |
| **Sitemap** | 7/10 | ⚠️ | Var ama 5000 makale limitli, sitemap-index yok |
| **Robots.txt** | 7/10 | ⚠️ | Var ama dynamic değil (statik dosya) |
| **RSS Feed** | 0/10 | ❌ | Hiç yok — Google News için kritik |
| **Breadcrumb** | 9/10 | ✅ | JSON-LD BreadcrumbList mevcut |
| **Schema.org** | 10/10 | ✅ | 9 farklı JSON-LD şeması |
| **JSON-LD** | 10/10 | ✅ | Organization, WebSite, NewsArticle, BreadcrumbList, CollectionPage, Person, AboutPage, ContactPage, SearchResultsPage |
| **Pagination** | 6/10 | ⚠️ | Sadece sayfa numarası, rel=prev/next yok |
| **Internal Linking** | 5/10 | ⚠️ | Kategoriler ve etiketler üzerinden sınırlı |
| **Heading Yapısı** | 7/10 | ⚠️ | AI içerikte h2/h3 var ama sayfa yapısı tutarsız |
| **Image Alt Text** | 3/10 | ❌ | AI içerikte alt text yok |
| **URL Yapısı** | 8/10 | ✅ | `/haber/slug`, `/kategori/slug` — temiz |
| **Mobile Friendly** | 8/10 | ✅ | Responsive tasarım, mobil drawer |
| **PageSpeed** | 5/10 | ⚠️ | Resim optimizasyonu kapalı, CSS büyük |
| **Structured Data Testing** | 9/10 | ✅ | Zengin JSON-LD, hata yok |
| **Language Tag** | 10/10 | ✅ | `<html lang="tr">`, `inLanguage: tr-TR` |
| **Geo Tags** | 10/10 | ✅ | geo.region, geo.placename, geo.position, ICBM, DC.* |
| **Keywords** | 8/10 | ✅ | 44 keyword meta tag'de ama Google artık kullanmıyor |

**SEO Toplam Puan: 7.4/10**

---

## 9. GEO (AI Search) Analizi

### Generative Engine Optimization — AI arama motorlarına hazırlık

| Kriter | ChatGPT | Gemini | Claude | Perplexity | Puan |
|--------|---------|--------|--------|------------|------|
| **JSON-LD** | ✅ | ✅ | ✅ | ✅ | 10/10 |
| **llms-full.txt** | ✅ | ✅ | ✅ | ✅ | 10/10 |
| **Temiz HTML yapısı** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 6/10 |
| **Semantic HTML** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 5/10 |
| **İçerik kalitesi (Türkçe)** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 6/10 |
| **Yapılandırılmış içerik** | ✅ | ✅ | ✅ | ✅ | 8/10 |
| **Güncel içerik** | ✅ | ✅ | ✅ | ✅ | 8/10 |
| **Otorite sinyalleri** | ❌ | ❌ | ❌ | ❌ | 3/10 |

### Detaylı Analiz

**Güçlü yönler:**
1. `/llms-full.txt` endpoint'i — AI crawler'lar için özel olarak tasarlanmış, son 50 haberi düz metin olarak listeliyor. Bu, AI arama optimizasyonu için en iyi pratiklerden biri.
2. JSON-LD yapılandırılmış veri — Google'ın AI Overview ve Gemini'in kaynak olarak kullanabileceği zengin metadata.
3. `articleBody` JSON-LD'de — AI modellerin içeriği tam olarak anlamasını sağlar.

**Zayıf yönler:**
1. **Semantic HTML eksikliği:** `<article>`, `<section>`, `<aside>`, `<nav>` gibi semantik etiketler yetersiz kullanılmış.
2. **Otorite sinyalleri:** Backlink, sosyal proof, yazar otoritesi (schema.org `author` Person detayı) eksik.
3. **İçerik güncelliği:** `dateModified` JSON-LD'de var ama sayfada görünür "Son güncelleme" tarihi yok.
4. **Kaynak gösterme:** AI tarafından üretilen haberlerde orijinal kaynak (`isBasedOn`) var, iyi ama yetersiz.

### Eksikler

1. ❌ **FAQ/HowTo schema** — Rehber içerikleri için
2. ❌ **VideoObject schema** — Video içerikleri için
3. ❌ **Speakable schema** — Sesli asistanlar için
4. ❌ **Citations/metadata** — AI tarafından kaynak gösterilmeyi kolaylaştıracak ek meta veriler
5. ❌ **Content freshness score** — İçerik tazeliğini belirten makine-okunur veri

**GEO Toplam Puan: 7.0/10**

---

## 10. Performans Analizi

### Server Components vs Client Components

| Bileşen | Tip | Değerlendirme |
|---------|-----|---------------|
| Public sayfalar | Server Components | ✅ Doğru — SEO için ideal |
| Admin sayfaları | Server Components | ✅ Doğru |
| Header | Client (`"use client"`) | ⚠️ Gerekli (scroll event, mobile menu state) |
| AdminSidebar | Client | ⚠️ Gerekli (mobile toggle) |
| ArticleForm | Client | ✅ Gerekli (form state) |
| ArticleActions | Client | ✅ Gerekli (fetch, state) |

### Optimizasyon Durumu

| Kriter | Durum | Açıklama |
|--------|-------|----------|
| **Dynamic Import** | ❌ | Hiç kullanılmamış |
| **Lazy Loading** | ❌ | `next/dynamic` yok |
| **Image Optimization** | ❌ | `images.unoptimized: true` — tamamen kapalı |
| **Font Optimization** | ✅ | `next/font` ile Inter Google Fonts |
| **Cache (ISR)** | ⚠️ | Sadece anasayfada `revalidate = 300` ve BreakingTicker'da `revalidate = 120` |
| **Streaming** | ❌ | `loading.tsx` yok, Suspense yok |
| **Suspense** | ❌ | Hiçbir yerde kullanılmamış |
| **Partial Prerendering** | ❌ | Kullanılmamış |
| **Bundle Size** | ⚠️ | First Load JS: 87.3 kB (paylaşımlı) + sayfa bazında |
| **CSS Size** | ⚠️ | Tailwind purge çalışıyor, ek CSS (prose-article) var |
| **Middleware** | ⚠️ | 141 kB — büyük, next-auth nedeniyle |

### Sayfa Bazında First Load JS

| Sayfa | First Load JS |
|-------|--------------|
| Anasayfa | 96.2 kB |
| Haber detay | 96.2 kB |
| Admin dashboard | 96.2 kB |
| Admin giris | 91.6 kB |
| Admin haberler | 96.7 kB |
| İletişim | 96.8 kB |

### Performans Puanı: 4.5/10

---

## 11. Güvenlik Analizi

### Authentication

| Kriter | Durum | Not |
|--------|-------|-----|
| NextAuth v5 | ✅ | JWT strategy |
| bcrypt | ✅ | 12 salt round |
| Session yönetimi | ✅ | JWT token, role bilgisi |
| Login sayfası | ✅ | Özel `/admin/giris` |
| Brute force koruması | ❌ | Login rate limiting yok |
| Session timeout | ❌ | maxAge yapılandırılmamış |
| 2FA | ❌ | Yok |

### Authorization

| Kriter | Durum | Not |
|--------|-------|-----|
| Middleware koruması | ✅ | `/admin/*` route'ları |
| Role-based access | ⚠️ | Role var ama API'da kontrol yok |
| API auth kontrolü | ✅ | `auth()` çağrısı ile |
| Direct object reference | ⚠️ | Article delete'te ownership kontrolü zayıf |

### Environment Variables

| Kriter | Durum | Not |
|--------|-------|-----|
| `.env` gitignore'da | ✅ | |
| `.env.production` | ❌ | **API key commit'lenmiş durumda!** |
| Örnek şablon | ✅ | `.env.example` |
| Runtime validation | ❌ | `zod` ile env validation yok |

### Diğer

| Kriter | Durum | Not |
|--------|-------|-----|
| **XSS Koruması** | ⚠️ | `dangerouslySetInnerHTML` JSON-LD'de kullanılıyor (güvenli), ama içerik sanitize edilmiyor |
| **SQL Injection** | ✅ | Prisma parametrize sorgular |
| **CSRF** | ⚠️ | NextAuth built-in CSRF koruması, ama API route'larda manuel kontrol yok |
| **Rate Limiting** | ⚠️ | Sadece nginx seviyesinde `/api/bot/trigger` için |
| **CSP Headers** | ❌ | Content-Security-Policy yok |
| **HSTS** | ❌ | Nginx'de yapılandırılmamış |
| **Input Validation** | ❌ | Form ve API input'ları validate edilmiyor |

### Kritik Riskler

1. 🔴 **API key ifşası:** `.env.production` dosyası GitHub'a pushlanırsa Deepseek API key'i herkes tarafından kullanılabilir.
2. 🔴 **Rate limiting eksikliği:** `/api/search` ve diğer public endpoint'ler rate limit'siz.
3. 🟡 **Session güvenliği:** `AUTH_SECRET` zayıf olabilir, session maxAge yok.

### Güvenlik Puanı: 4.5/10

---

## 12. Kod Kalitesi

### TypeScript Kullanımı

| Kriter | Değerlendirme |
|--------|---------------|
| Strict mode | ✅ Aktif |
| Tip tanımları | ✅ `types/index.ts` merkezi |
| `any` kullanımı | ⚠️ `(session.user as any).role` — tip güvenliği bypass |
| Type guard'lar | ❌ Yok |
| Generic'ler | ✅ `PaginatedResponse<T>`, `chatJSON<T>` |
| Enum yerine union types | ✅ `ArticleStatus`, `SourceType` vb. |

### Clean Code

| Kriter | Puan | Not |
|--------|------|-----|
| İsimlendirme | 8/10 | Türkçe-İngilizce karışık ama tutarlı |
| Fonksiyon boyutu | 6/10 | `runBot()` 275 satır — çok uzun |
| Dosya boyutu | 7/10 | `prompts.ts` ~400 satır — bölünebilir |
| Yorum/Dokümantasyon | 7/10 | JSDoc var ama tutarsız |
| Magic number/string | 5/10 | Bazı sabitler constants.ts'te, bazıları inline |

### SOLID

| Prensip | Uyum |
|---------|------|
| **S**ingle Responsibility | ⚠️ `runBot()` çok fazla şey yapıyor |
| **O**pen/Closed | ⚠️ Yeni kaynak tipi eklemek için fetcher'ı değiştirmek gerek |
| **L**iskov Substitution | ✅ (OOP pattern kullanılmamış) |
| **I**nterface Segregation | ⚠️ `ArticleWithRelations` çok büyük |
| **D**ependency Inversion | ❌ Servisler direkt prisma import ediyor |

### Dosya Organizasyonu

- **İyi:** Servisler `services/` altında, tipler `types/` altında, lib `lib/` altında
- **Kötü:** İki ayrı bot implementasyonu (`auto-bot.js` ve `services/bot/`) farklı yerlerde
- **Eksik:** `hooks/` klasörü yok (custom hook'lar component'lerle aynı dosyada değil, hiç yok)

### Teknik Borçlar

1. **İki bot implementasyonu:** `auto-bot.js` (250 satır) ve `services/bot/index.ts` (312 satır) fonksiyonel olarak farklı. Birleştirilmeli.
2. **Boş catch blokları:** `catch {}` pattern'i en az 7 yerde kullanılmış.
3. **Inline CSS:** Bazı style'lar inline (örn: `style={{ backgroundColor: cat.color }}`).
4. **Sert bağımlılıklar:** Servisler direkt `prisma` import ediyor, dependency injection yok.
5. **Test eksikliği:** 0 test.

### Kod Kalitesi Puanı: 5.5/10

---

## 13. Eksik Özellikler

### Kritik Eksikler (Production'a Engel)

1. ❌ **Hata izleme (Sentry/Axiom)** — Production hataları görünmez
2. ❌ **Yedekleme stratejisi** — Manuel, otomatik değil
3. ❌ **Monitoring/alerting** — Sunucu durumu bilinmiyor
4. ❌ **API rate limiting** — Suistimale açık
5. ❌ **Input validation** — Güvenlik riski

### Önemli Eksikler

6. ❌ **RSS Feed** — Google News için zorunlu
7. ❌ **Resim optimizasyonu** — Sayfa hızı düşük
8. ❌ **Full-text search** — 10K+ makalede yavaş
9. ❌ **E-posta bildirimi** — Bülten, şifre sıfırlama
10. ❌ **Analytics** — Ziyaretçi istatistikleri yok
11. ❌ **Yorum sistemi** — Kullanıcı etkileşimi yok
12. ❌ **Sosyal medya entegrasyonu** — Otomatik paylaşım yok
13. ❌ **CDN** — Statik dosyalar için
14. ❌ **Redis cache** — Veritabanı yükünü azaltmak için

### İyiye Sahip Olacaklar

15. ❌ **Dark mode** — Kullanıcı tercihi
16. ❌ **Çoklu dil** — Sadece Türkçe
17. ❌ **PWA** — Mobil uygulama deneyimi
18. ❌ **A/B testing** — Başlık/görsel optimizasyonu
19. ❌ **Web push notifications** — Anlık bildirim
20. ❌ **İçerik öneri motoru** — Kişiselleştirilmiş öneriler

---

## 14. İyileştirme Fırsatları

### Mimari İyileştirmeler

1. **Repository Pattern:** Servislerin direkt Prisma'ya bağımlılığını kaldır. `ArticleRepository`, `SourceRepository` gibi abstraction'lar ekle. Test edilebilirliği artırır.

2. **Dependency Injection:** `runBot()` fonksiyonu tüm bağımlılıkları import ediyor. Bir DI container (veya en azından factory functions) ile test edilebilir hale getir.

3. **Event-driven bot:** Bot iş akışını event'lere böl (`ArticleFetched`, `ContentGenerated`, `ArticlePublished`). Her aşama bağımsız test edilebilir ve yeniden denenebilir olur.

4. **Module federation:** `auto-bot.js` ve `services/bot/` tek bir kaynakta birleştirilmeli. JS bot, TS bot'un CommonJS build'i olmalı.

5. **CQRS (basitleştirilmiş):** Okuma (read) ve yazma (write) işlemlerini ayır. Read'ler için cache, write'lar için queue.

### Kod Organizasyonu

6. **Feature-based organizasyon:** Şu anki `components/`, `app/`, `lib/` yapısından `features/articles/`, `features/bot/`, `features/admin/` yapısına geç.

7. **Barrel exports:** `index.ts` dosyaları ile import'ları basitleştir.

8. **shared/ui kit:** `components/ui/` klasörünü doldur — Button, Input, Card, Badge, Modal, vb.

### Veri Yönetimi

9. **Redis cache layer:** Sık okunan veriler (kategoriler, popüler haberler) için.

10. **Prisma Accelerate:** Edge caching ve connection pooling.

11. **Veritabanı migration'ları:** `prisma migrate dev` yerine `prisma migrate deploy` (production'da güvenli).

### Developer Experience

12. **Husky + lint-staged:** Pre-commit hook'lar.

13. **Storybook:** Component kataloğu.

14. **Swagger/OpenAPI:** API dokümantasyonu.

15. **Changelog:** Automated changelog (changesets).

---

## 15. Yol Haritası

### 🔴 Kritik (İlk 2 Hafta)

| # | Görev | Süre |
|---|-------|------|
| 1 | `.env.production`'ı Git'ten çıkar, `.env.local` kullan | 1 saat |
| 2 | API input validation (Zod) ekle | 4 saat |
| 3 | Rate limiting (uygulama seviyesi) | 3 saat |
| 4 | `auto-bot.js` ve `services/bot/` birleştir | 8 saat |
| 5 | Hata izleme (Sentry) kur | 2 saat |
| 6 | Otomatik veritabanı yedeği (cron) | 2 saat |
| 7 | CSP ve HSTS header'ları ekle | 2 saat |
| 8 | Dockerfile — doğru dev.db yolunu düzelt | 1 saat |

### 🟡 Orta (İlk 1 Ay)

| # | Görev | Süre |
|---|-------|------|
| 9 | RSS Feed oluştur | 4 saat |
| 10 | Resim optimizasyonu (next/image veya Cloudinary) | 6 saat |
| 11 | Google Analytics / Plausible | 2 saat |
| 12 | E-posta bülteni (Resend) | 6 saat |
| 13 | UI component kit (Button, Card, Badge, vb.) | 12 saat |
| 14 | Form validation (React Hook Form + Zod) | 4 saat |
| 15 | Test altyapısı (Vitest + Testing Library) | 4 saat |
| 16 | loading.tsx ve error.tsx sayfaları | 3 saat |
| 17 | Sitemap-index (5000+ makale için) | 2 saat |
| 18 | Dark mode | 8 saat |

### 🟢 Düşük (İlk 3 Ay)

| # | Görev | Süre |
|---|-------|------|
| 19 | PostgreSQL geçişi | 16 saat |
| 20 | Redis cache | 8 saat |
| 21 | Comment sistemi | 16 saat |
| 22 | Storybook | 8 saat |
| 23 | PWA desteği | 8 saat |
| 24 | İçerik öneri motoru | 16 saat |
| 25 | Çoklu dil desteği | 24 saat |
| 26 | CI/CD pipeline (GitHub Actions) | 8 saat |
| 27 | Load testing (k6/Artillery) | 4 saat |

---

## 16. İlk 100 Görev

| # | Öncelik | Zorluk | Süre (saat) | Görev | Katkı |
|---|---------|--------|-------------|-------|-------|
| 1 | 🔴 | Kolay | 0.5 | `.env.production`'daki API key'i kaldır, `.gitignore`'a ekle | Güvenlik |
| 2 | 🔴 | Kolay | 1 | `AUTH_SECRET`'i güvenli rastgele değerle değiştir | Güvenlik |
| 3 | 🔴 | Orta | 3 | API route'lara Zod validasyonu ekle | Güvenlik |
| 4 | 🔴 | Kolay | 1 | CSP header'ları ekle (nginx veya next.config) | Güvenlik |
| 5 | 🔴 | Kolay | 0.5 | Nginx'de HSTS header'ı aktif et | Güvenlik |
| 6 | 🔴 | Kolay | 2 | API genel rate limiting (uygulama seviyesi) | Güvenlik |
| 7 | 🔴 | Kolay | 0.5 | Login rate limiting (brute force koruması) | Güvenlik |
| 8 | 🔴 | Kolay | 1 | Session maxAge yapılandır (NextAuth) | Güvenlik |
| 9 | 🔴 | Kolay | 1 | Sentry/Axiom hata izleme kurulumu | Operasyon |
| 10 | 🔴 | Kolay | 1 | Otomatik DB yedekleme cron job | Operasyon |
| 11 | 🔴 | Kolay | 0.5 | Dockerfile — `COPY prisma/dev.db` (doğru dosya) düzelt | Build |
| 12 | 🔴 | Orta | 6 | `auto-bot.js` ve `services/bot/` birleştir, tek kaynak | Mimari |
| 13 | 🔴 | Kolay | 1 | `auto-bot.js`'a tech filtre ekle | Kalite |
| 14 | 🔴 | Kolay | 2 | `auto-bot.js`'a SEO pipeline ekle | SEO |
| 15 | 🔴 | Orta | 3 | Hata yönetimi — boş catch bloklarını temizle | Kalite |
| 16 | 🟡 | Kolay | 2 | RSS Feed oluştur (`/rss.xml`, `/feed`) | SEO |
| 17 | 🟡 | Kolay | 2 | Google News sitemap (`/news-sitemap.xml`) | SEO |
| 18 | 🟡 | Orta | 2 | Sitemap-index (5000+ makale bölme) | SEO |
| 19 | 🟡 | Kolay | 1 | `robots.txt` dinamik hale getir | SEO |
| 20 | 🟡 | Kolay | 1 | Sayfalara `rel=prev/next` ekle | SEO |
| 21 | 🟡 | Orta | 4 | Resim optimizasyonu (next/image aktif et) | Performans |
| 22 | 🟡 | Kolay | 1 | `loading.tsx` — tüm sayfalara loading state | UX |
| 23 | 🟡 | Kolay | 1 | `error.tsx` — özel hata sayfası | UX |
| 24 | 🟡 | Kolay | 1 | `not-found.tsx` — özel 404 sayfası | UX |
| 25 | 🟡 | Orta | 4 | React Hook Form + Zod ile form validasyonu | UX |
| 26 | 🟡 | Orta | 3 | Toast notification sistemi | UX |
| 27 | 🟡 | Orta | 3 | Confirm dialog component'i | UX |
| 28 | 🟡 | Kolay | 2 | Empty state component'i | UX |
| 29 | 🟡 | Kolay | 2 | Pagination component'i (yeniden kullanılabilir) | UX |
| 30 | 🟡 | Orta | 3 | Breadcrumb component'i (client-side render) | UX |
| 31 | 🟡 | Kolay | 2 | Social share butonları (Twitter, Facebook, LinkedIn, WhatsApp) | Trafik |
| 32 | 🟡 | Kolay | 2 | Google Analytics 4 entegrasyonu | Analitik |
| 33 | 🟡 | Kolay | 2 | Google Search Console doğrulama | SEO |
| 34 | 🟡 | Orta | 4 | UI component kit: Button, Input, Select, Textarea | DX |
| 35 | 🟡 | Orta | 2 | UI component kit: Card, Badge, Tag | DX |
| 36 | 🟡 | Kolay | 2 | UI component kit: LoadingSpinner, Skeleton | UX |
| 37 | 🟡 | Kolay | 1 | SVG ikonları `icons.tsx` dosyasına taşı | DX |
| 38 | 🟡 | Orta | 4 | `ArticleForm` component'ini böl | DX |
| 39 | 🟡 | Kolay | 2 | `Header` component'ini böl (MobileDrawer ayır) | DX |
| 40 | 🟡 | Orta | 4 | Test altyapısı kur (Vitest + Testing Library + Playwright) | Kalite |
| 41 | 🟡 | Kolay | 2 | İlk unit testler (utils, slugify, formatDate) | Kalite |
| 42 | 🟡 | Orta | 3 | API route integration testleri | Kalite |
| 43 | 🟡 | Orta | 3 | Bot pipeline unit testleri | Kalite |
| 44 | 🟡 | Kolay | 1 | `date-fns` bağımlılığını kullan veya kaldır | Temizlik |
| 45 | 🟡 | Kolay | 1 | Kullanılmayan import'ları temizle | Temizlik |
| 46 | 🟡 | Orta | 3 | `runBot()` fonksiyonunu böl (single responsibility) | Mimari |
| 47 | 🟡 | Orta | 2 | Repository pattern — `ArticleRepository` | Mimari |
| 48 | 🟡 | Kolay | 2 | Barrel exports (`index.ts`) ekle | DX |
| 49 | 🟡 | Kolay | 1 | Font optimization — `next/font` düzgün yapılandır | Performans |
| 50 | 🟡 | Orta | 3 | CSS optimizasyonu — kullanılmayan stilleri temizle | Performans |
| 51 | 🟡 | Orta | 2 | Dynamic import (`next/dynamic`) — ağır component'ler | Performans |
| 52 | 🟡 | Orta | 3 | Suspense boundary'leri ekle | Performans |
| 53 | 🟡 | Kolay | 2 | `middleware.ts` — sadece `/admin` matcher | Performans |
| 54 | 🟡 | Orta | 4 | İçerik için rich text editor (TipTap/Lexical) | Admin |
| 55 | 🟡 | Orta | 3 | Admin — toplu işlemler (toplu silme, durum değiştirme) | Admin |
| 56 | 🟡 | Kolay | 2 | Admin — dashboard grafikleri (Chart.js) | Admin |
| 57 | 🟡 | Orta | 4 | Admin — medya kütüphanesi (resim yükleme) | Admin |
| 58 | 🟡 | Kolay | 2 | Admin — yazar profil resmi yükleme | Admin |
| 59 | 🟡 | Kolay | 2 | Admin — site ayarları formunu iyileştir | Admin |
| 60 | 🟡 | Orta | 2 | `Article` modeline `readingTime` alanı ekle | İçerik |
| 61 | 🟡 | Kolay | 1 | `Article` modeline `contentType` alanı ekle | İçerik |
| 62 | 🟡 | Orta | 3 | Planlı yayın (`scheduledAt`) desteği | İçerik |
| 63 | 🟡 | Orta | 2 | Soft delete (`deletedAt`) | Veri |
| 64 | 🟡 | Kolay | 1 | İlişkili haberler (basit — aynı kategoriden) | İçerik |
| 65 | 🟡 | Kolay | 2 | `viewCount` artırımı (middleware veya API) | İçerik |
| 66 | 🟡 | Orta | 2 | FTS5 (SQLite full-text search) index'i | Performans |
| 67 | 🟡 | Kolay | 1 | `Source.feedUrl` unique constraint ekle | Veri |
| 68 | 🟡 | Orta | 2 | `prisma migrate deploy` production'da kullan | Veri |
| 69 | 🟡 | Kolay | 1 | Admin — bot log detay sayfası | Admin |
| 70 | 🟡 | Orta | 3 | Admin — kaynak test et (RSS fetch preview) | Admin |
| 71 | 🟡 | Kolay | 2 | HTML semantic etiketleri düzelt | SEO/AI |
| 72 | 🟡 | Kolay | 1 | FAQ/HowTo JSON-LD ekle (rehber içerikleri için) | AI SEO |
| 73 | 🟡 | Kolay | 2 | `robots.txt` — AI crawler'lar için özel izinler | AI SEO |
| 74 | 🟡 | Kolay | 2 | `llms-full.txt` — son 100 makaleye çıkar | AI SEO |
| 75 | 🟡 | Kolay | 1 | E-posta bülteni abonelik formu | Trafik |
| 76 | 🟡 | Orta | 4 | E-posta bülteni gönderim sistemi (Resend) | Trafik |
| 77 | 🟡 | Orta | 3 | Sosyal medya otomatik paylaşım (Twitter API) | Trafik |
| 78 | 🟢 | Zor | 8 | Dark mode | UX |
| 79 | 🟢 | Zor | 16 | PostgreSQL geçişi | Ölçek |
| 80 | 🟢 | Orta | 8 | Redis cache katmanı | Performans |
| 81 | 🟢 | Zor | 16 | Yorum sistemi | Etkileşim |
| 82 | 🟢 | Orta | 8 | Storybook kurulumu | DX |
| 83 | 🟢 | Zor | 8 | PWA desteği | Mobil |
| 84 | 🟢 | Zor | 24 | Çoklu dil desteği (EN/TR) | Trafik |
| 85 | 🟢 | Orta | 8 | CI/CD pipeline (GitHub Actions) | DX |
| 86 | 🟢 | Orta | 4 | Load testing (k6/Artillery) | Kalite |
| 87 | 🟢 | Zor | 16 | İçerik öneri motoru | Etkileşim |
| 88 | 🟢 | Orta | 4 | `Prisma Accelerate` veya `Prisma Optimize` | Performans |
| 89 | 🟢 | Orta | 3 | Husky + lint-staged + commitlint | DX |
| 90 | 🟢 | Kolay | 2 | ESLint kurallarını sıkılaştır (`any` yasağı, unused vars) | Kalite |
| 91 | 🟢 | Kolay | 1 | `changesets` ile changelog otomasyonu | DX |
| 92 | 🟢 | Orta | 4 | A/B test altyapısı (başlık/görsel için) | Optimizasyon |
| 93 | 🟢 | Orta | 6 | Web push notifications | Trafik |
| 94 | 🟢 | Kolay | 2 | Okuma listesi (localStorage) | UX |
| 95 | 🟢 | Orta | 4 | Görsel CDN (Cloudinary) | Performans |
| 96 | 🟢 | Orta | 2 | `middleware.ts` — geo-redirect veya dil tespiti | UX |
| 97 | 🟢 | Kolay | 1 | `site_settings` — typed config (Zod schema) | DX |
| 98 | 🟢 | Orta | 4 | Feedback form (sayfa altı) | Etkileşim |
| 99 | 🟢 | Orta | 4 | Admin — kullanıcı yönetimi (çoklu admin) | Admin |
| 100 | 🟢 | Kolay | 2 | `README.md` güncelle (kurulum, geliştirme, deploy) | DX |

**Toplam tahmini süre: ~350 saat (yaklaşık 9 hafta tam zamanlı)**

---

## 17. Genel Puanlama

| Kriter | Puan (1-10) | Açıklama |
|--------|-------------|----------|
| **Mimari** | 5.5/10 | Monolitik, işlevsel ama teknik borçlu. Repository pattern, DI, event-driven eksik. |
| **Kod Kalitesi** | 5.5/10 | Boş catch blokları, büyük fonksiyonlar, kod tekrarı. TypeScript iyi kullanılmış. |
| **Performans** | 4.5/10 | Resim optimizasyonu kapalı, ISR sınırlı, streaming/Suspense yok. |
| **Güvenlik** | 4.5/10 | API key ifşası riski, rate limiting zayıf, CSP/HSTS yok. Auth iyi. |
| **SEO** | 7.5/10 | JSON-LD mükemmel, RSS eksik, resim alt text eksik. |
| **GEO (AI Search)** | 7.0/10 | llms-full.txt yenilikçi, JSON-LD güçlü. Semantik HTML ve otorite sinyalleri zayıf. |
| **Ölçeklenebilirlik** | 4.0/10 | SQLite sınırlı, tekil sunucu, cache yok. 10K+ makale sonrası sorun. |
| **Geliştirici Deneyimi** | 5.0/10 | Test yok, Storybook yok, boş klasörler var. Net klasör yapısı iyi. |

### **Genel Proje Puanı: 5.4/10**

### Son Değerlendirme

TeknolojiAkışı, **hızlı prototiplenmiş, işlevsel bir MVP.** Konsept ve temel uygulama doğru yolda. AI pipeline, SEO altyapısı ve Docker deployment'ı etkileyici.

Ancak **production-grade** bir uygulama olmaktan uzak. Güvenlik açıkları (API key ifşası, rate limiting eksikliği), test eksikliği, kod tekrarı ve ölçeklenebilirlik sorunları mevcut.

**Öncelikli aksiyonlar:**
1. API key'i Git'ten çıkar
2. Test altyapısını kur
3. İki bot implementasyonunu birleştir
4. RSS Feed ekle
5. İzleme (Sentry) kur

Bu 5 madde tamamlandığında proje **7/10** seviyesine çıkacaktır.

---

*Bu rapor CTO/Staff Engineer seviyesinde hazırlanmıştır. Hiçbir kod değişikliği yapılmamıştır.*
