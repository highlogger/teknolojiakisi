# CURRENT BOT ARCHITECTURE

## TeknolojiAkışı Mevcut Haber Botu Mimari Analizi

**Tarih:** 15 Temmuz 2026
**Analiz Kapsamı:** Tüm bot sistemi, AI servisleri, content engine, destek servisleri
**Analiz Türü:** Read-only — kod değişikliği yapılmadı

---

## 1. Mevcut Mimari — Genel Bakış

```
┌─────────────────────────────────────────────────────────────────┐
│                      TeknolojiAkışı Platformu                    │
│                       Next.js 14 + SQLite                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────────────────────────┐       │
│  │  auto-bot.js  │    │     services/bot/ (TS Modül)      │       │
│  │  (CommonJS)   │    │  index / fetcher / generator /    │       │
│  │  Docker üretim│    │  prompts / publisher / trigger    │       │
│  │  Monolitik    │    │  Admin panel trigger + dev        │       │
│  └──────┬───────┘    └──────────────┬───────────────────┘       │
│         │                           │                            │
│         └───────────┬───────────────┘                            │
│                     │                                            │
│         ┌───────────▼───────────┐                                │
│         │    AI Core Engine     │                                │
│         │  services/ai/ (7 dosya)│                               │
│         │  DeepSeek (aktif)     │                                │
│         │  OpenAI/Gemini/Claude  │                               │
│         │  (hazır, implemente   │                                │
│         │   edilmemiş)          │                                │
│         └───────────┬───────────┘                                │
│                     │                                            │
│         ┌───────────▼───────────┐                                │
│         │   Prisma / SQLite     │                                │
│         │   9 model, 7 tablo    │                                │
│         └───────────────────────┘                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               Destek Servis Katmanları                     │   │
│  │  Content Engine │ Entity Engine │ GEO Engine │ Publisher │   │
│  │  SEO Lib │ Distribution │ Trends │ Discover │ Internal   │   │
│  │  Links │ Recommendation │ Research Asst │ Revenue        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Admin Panel                             │   │
│  │  Dashboard │ Bot Yönetimi │ Haber CRUD │ Workspace        │   │
│  │  AI Panel │ SEO Panel │ GEO Panel │ Entity Panel │ Publish│   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Frontend & SEO                            │   │
│  │  Sitemap │ RSS │ News Sitemap │ robots.txt │ JSON-LD      │   │
│  │  7 Schema tipi │ Next.js Metadata API                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Detaylı Modül Analizi

### 2.1 Bot Sistemi — İKİ PARALEL SİSTEM

#### A. `auto-bot.js` (Production / Docker)

| Özellik | Durum |
|----------|-------|
| **Dil** | JavaScript (CommonJS) |
| **Satır** | 354 |
| **Yapı** | Monolitik (tek `tick()` fonksiyonu) |
| **Çalışma** | `setInterval` — her 120 dakikada bir |
| **Tip güvenliği** | Yok |
| **Bağımlılık** | `tsx` gerektirmez, `node auto-bot.js` ile çalışır |

**Akış:**
```
tick()
 ├─ Kaynakları getir (isActive: true)
 ├─ Her kaynak için:
 │   ├─ RSS parse (rss-parser)
 │   ├─ quickTechFilter() — anahtar kelime tabanlı
 │   ├─ Duplicate kontrol (originalUrl)
 │   ├─ AI: tek çağrıda çeviri + başlık + özet + içerik
 │   ├─ AI: kategori sınıflandırma (ayrı çağrı)
 │   ├─ Slug + excerpt oluşturma (manuel)
 │   ├─ DB insert (article + botLog)
 │   └─ 800ms bekleme
 └─ Sonuç raporu
```

**Eksiklikler (TS bota göre):**
- ❌ Kalite kontrolü (Türkçe karakter, anlatım bozukluğu)
- ❌ AI SEO optimizasyonu
- ❌ Web scraping (sadece RSS)
- ❌ 48 saat filtresi
- ❌ SEO Trend + Fabrika içerik üretimi
- ❌ Tag yönetimi
- ❌ Resim çıkarma
- ❌ User-Agent başlığı
- ❌ Type safety

#### B. `services/bot/` (TypeScript / Dev + Admin)

| Dosya | Satır | Görev |
|-------|-------|-------|
| `index.ts` | 314 | Orchestrator: fetch → filter → generate → publish + trending |
| `fetcher.ts` | 211 | RSS + Web scraping + duplicate/recent filter + image extraction |
| `generator.ts` | 197 | 3-stage AI pipeline: translate → quality → SEO |
| `prompts.ts` | 495 | Tüm AI prompt'ları + tech filter + trending/factory topics |
| `publisher.ts` | 177 | DB işlemleri: article create, tag upsert, botLog, settings |
| `trigger.ts` | ~30 | CLI trigger (`npx tsx src/services/bot/trigger.ts`) |

**Akış:**
```
runBot()
 ├─ Kaynakları getir (priority desc)
 ├─ Her kaynak için:
 │   ├─ fetchFromSource() — RSS veya Web scraping
 │   ├─ filterRecentArticles(48 saat)
 │   ├─ filterProcessedArticles() — duplicate kontrol
 │   ├─ quickTechFilter() — anahtar kelime + regex
 │   ├─ generateArticle() — 3 aşamalı AI pipeline:
 │   │   ├─ [1/3] translateAndRewrite() — çeviri + yeniden yazım
 │   │   ├─ [2/3] qualityCheck() — kalite kontrolü
 │   │   └─ [3/3] optimizeSEO() — SEO metadata (JSON mode)
 │   ├─ classifyCategory() — AI kategori
 │   ├─ publishArticle() — DB insert + tag upsert
 │   └─ 500ms bekleme
 ├─ SEO Trend İçerik (12 TRENDING_TOPICS + 89 FACTORY_TOPICS)
 └─ Sonuç raporu
```

---

### 2.2 AI Core Engine (`services/ai/`)

**Mimari:** Provider abstraction pattern

```
services/ai/
├── client.ts        # AIClient sınıfı — tek giriş noktası
│   Metotlar: chat(), chatJSON(), chatWithPrompt(),
│             chatJSONWithPrompt(), chatStream(),
│             simple(), simpleJSON()
├── config.ts        # Model tanımları, provider config, token limitleri
├── types.ts         # Tam TypeScript tip sistemi
├── errors.ts        # AIError sınıfı, classifyError, factory fonksiyonlar
├── logger.ts        # AI operasyonları için logger
├── providers/
│   ├── base.ts      # AIProviderInterface kontratı
│   └── deepseek.ts  # DeepSeek implementasyonu (OpenAI SDK)
└── prompts/
    └── registry.ts  # In-memory prompt registry
```

**Özellikler:**
- ✅ Retry logic (exponential backoff, 3 retry, 1s-30s)
- ✅ Timeout (60s default)
- ✅ JSON mode
- ✅ Streaming
- ✅ Provider abstraction (DeepSeek aktif, OpenAI/Gemini/Claude hazır)
- ✅ Prompt registry (5 pre-registered prompt)
- ✅ Lazy-loading provider
- ✅ Error classification (network, timeout, rate limit, JSON parse, provider, validation)

**Değerlendirme:** AI Core Engine iyi tasarlanmış, temiz mimari. Tek eksik: diğer provider'lar implemente edilmemiş.

---

### 2.3 Content Engine (`services/content/`)

```
services/content/
├── types.ts         # ContentStatus (10), ContentType (9), metadata, workflow
├── status.ts        # 24 transition rule, state machine
├── metadata.ts      # Reading time, word count, 6 skor tipi
├── workflow.ts      # In-memory workflow event logger
├── lifecycle.ts     # Lifecycle manager (hooks, transition)
├── tags.ts          # Tag engine (AI suggestions)
├── categories.ts    # Category engine
├── content-types.ts # 9 içerik tipi konfigürasyonu
└── index.ts         # Barrel exports
```

**Status Flow:**
```
Draft → AI_Generated → Editor_Review → SEO_Optimized → Fact_Checked → Ready → Published
                                                                                   ↓
                                                          Published ← Updated      ↓
                                                                   ↓              ↓
                                                              Archived → Published
                                                                   ↓
                                                               Deleted (son)
```

**Değerlendirme:**
- ✅ İyi tasarlanmış state machine
- ✅ Role-based transition control
- ✅ Workflow event logging
- ✅ Lifecycle hooks
- ⚠️ Workflow store **in-memory** (Map) — process restart'ta kaybolur
- ⚠️ Sadece 1 içerik tipi aktif (news)

---

### 2.4 Entity Intelligence Engine (`services/entity/`)

```
services/entity/ — 10 dosya
├── extractor.ts    # AI-powered entity extraction (JSON mode)
├── resolver.ts     # Pipeline: exact → alias → slug → fuzzy
├── scoring.ts      # Weighted: confidence 35% + frequency 25% + relevance 25% + authority 15%
├── service.ts      # Main: analyzeArticle(), findEntity()
└── ...
```

**Değerlendirme:** Kapsamlı, iyi tasarlanmış. AI Core Engine ile entegre.

---

### 2.5 GEO Intelligence Engine (`services/geo/`)

```
services/geo/ — 10 dosya
├── engine/        # analyzeArticleGEO() — tek çağrıda tam analiz
├── analysis/      # Clarity, entity, authority, structure, readability
├── scoring/       # 8 boyutlu GEO skor
├── metadata/      # AI metadata generator
├── validators/    # GEO uyumluluk kontrolü
└── models/        # Citation, summary, takeaways
```

**8 Platform:** ChatGPT, Google AI Overview, Gemini, Claude, Perplexity, Copilot, Brave, You.com
**8 Skor Boyutu:** Entity, Authority, Freshness, Citation, Semantic, Answer, Trust, AI Readability

**Değerlendirme:** İleri seviye, iyi tasarlanmış. Doğrudan kullanılabilir.

---

### 2.6 Publisher Engine (`services/publisher/`)

```
services/publisher/
├── config.ts      # PUBLISHER metadata, NEWS_IMAGE_REQUIREMENTS
└── validator.ts   # Google News compliance scoring (11 check)
```

**Değerlendirme:** Temel seviyede. Sadece validasyon var, publish iş akışı yok.

---

### 2.7 Diğer Servisler

| Servis | Durum | Dosya |
|--------|-------|-------|
| **Distribution** | Temel | engine.ts — 8 kanal (X, FB, LinkedIn, Telegram, Email, Push, RSS, Sitemap) |
| **Trends** | Temel | engine.ts — volume, velocity, acceleration scoring |
| **Discover** | Temel | Google Discover analizi |
| **Internal Links** | Temel | İç link önerileri |
| **Recommendation** | Temel | İlgili içerik önerileri |
| **Content Opportunities** | Temel | İçerik açığı analizi |
| **Research Assistant** | Shell | Sadece iskelet |
| **Revenue** | Shell | Sadece iskelet |

---

### 2.8 SEO Sistemi (`src/lib/seo.tsx`)

| Bileşen | Durum |
|---------|-------|
| `generateOrganizationLd()` | ✅ |
| `generateWebSiteLd()` | ✅ (SearchAction ile) |
| `generateBreadcrumbLd()` | ✅ |
| `generateNewsArticleLd()` | ✅ (tam NewsArticle şeması) |
| `generateCollectionPageLd()` | ✅ |
| `generatePersonLd()` | ✅ |
| `generateAboutPageLd()` | ✅ |
| `generateContactPageLd()` | ✅ |
| `generateSearchResultsPageLd()` | ✅ |
| `articleMetadata()` | ✅ (OG + Twitter + canonical) |
| `pageMetadata()` | ✅ |
| `JsonLd` component | ✅ |

**Değerlendirme:** SEO kütüphanesi iyi tasarlanmış. 7 JSON-LD şema tipi, Next.js Metadata API uyumlu.

---

### 2.9 Database (Prisma/SQLite)

**9 Model:**

| Model | Açıklama |
|-------|----------|
| User | Admin/editor auth (email, passwordHash, role) |
| Category | 11 kategori (yapay-zeka, mobil, web, donanim, yazilim, oyun, bilim, guvenlik, sosyal-medya, otomotiv, genel) |
| Author | İnsan ve bot yazarlar (isBot flag) |
| Article | Ana içerik (title, slug, content, status, AI metadata, SEO, viewCount) |
| Tag | Etiketler (many-to-many via ArticleTag) |
| ArticleTag | Join table |
| Source | RSS/web kaynakları (25+ kaynak, feedUrl, selector, priority) |
| BotLog | Bot çalışma logları |
| SiteSetting | Key-value ayar deposu |

---

## 3. Haber Akışı Diyagramı

### Mevcut Akış (Production — auto-bot.js)

```
┌─────────┐
│   RSS   │  25+ kaynak, 2 saatte bir
│  Feed   │
└────┬────┘
     │ rss-parser
     ▼
┌─────────┐
│  Fetch  │  max 3/source, max 25/run
└────┬────┘
     │
     ▼
┌─────────┐
│  Tech   │  quickTechFilter()
│ Filter  │  87 keyword, 15 non-tech pattern
└────┬────┘
     │ ~%60-70 elenir
     ▼
┌─────────┐
│Duplicate│  originalUrl check
│ Check   │
└────┬────┘
     │
     ▼
┌─────────┐
│   AI    │  TEK çağrı: çeviri + başlık + özet + içerik
│Generate │  Model: deepseek-chat, max 2048 token
└────┬────┘
     │
     ▼
┌─────────┐
│Category │  AI sınıflandırma (ayrı çağrı, 30 token)
│Classify │  11 kategori
└────┬────┘
     │
     ▼
┌─────────┐
│ Publish │  DB insert: article + botLog
│         │  Slug: timestamp suffix
│         │  Status: autoPublish ? published : draft
└─────────┘
```

### Gelişmiş Akış (TypeScript — services/bot/)

```
┌─────────┐    ┌──────────────┐
│   RSS   │    │  Web Scraping │  cheerio + axios
│  Feed   │    │  (CSS selector)│
└────┬────┘    └──────┬───────┘
     │                │
     └───────┬────────┘
             ▼
┌───────────────────┐
│  48 Saat Filtresi  │  filterRecentArticles(48)
└────────┬──────────┘
         ▼
┌───────────────────┐
│  Duplicate Check   │  filterProcessedArticles()
└────────┬──────────┘
         ▼
┌───────────────────┐
│   Tech Filter      │  quickTechFilter()
│                    │  139 keyword, 20 pattern
└────────┬──────────┘
         ▼
┌───────────────────────────────────────────┐
│          AI Pipeline (3 aşama)             │
│                                            │
│  [1/3] Translate & Rewrite                │
│         Model: deepseek-chat              │
│         Token: 4096                       │
│         Prompt: 12 kural, gazetecilik      │
│                                            │
│  [2/3] Quality Check                      │
│         Türkçe karakter, anlatım bozukluğu │
│         Robotik ifade temizliği            │
│         Token: 4096                       │
│                                            │
│  [3/3] SEO Optimization                   │
│         JSON mode                         │
│         Başlık, slug, meta, etiket         │
│         Token: 2048                       │
└──────────────┬────────────────────────────┘
               ▼
┌───────────────────┐
│ Category Classify  │  AI, 50 token
└────────┬──────────┘
         ▼
┌───────────────────┐
│     Publish        │
│  Tag upsert        │
│  Article create    │
│  ArticleTag create │
│  BotLog create     │
└───────────────────┘
```

**Ek Akış — Trend/Fabrika İçerik:**
```
TRENDING_TOPICS (12) + FACTORY_TOPICS (89)
         │
         ▼
┌───────────────────┐
│   AI Generate      │  Tek çağrı, 4096 token
│   (deepseek-chat) │  Rehber/tutorial formatı
└────────┬──────────┘
         ▼
┌───────────────────┐
│   Direct Publish   │  Article create (kategori + tag yok)
└───────────────────┘
```

---

## 4. Kod Kalitesi Değerlendirmesi

### Her Modül İçin Puanlama (1-10)

| Modül | Architecture | Readability | Maintainability | Scalability | Performance | Security | Testability | **Ortalama** |
|-------|-------------|------------|----------------|-------------|-------------|----------|-------------|--------------|
| **auto-bot.js** | 3 | 4 | 2 | 2 | 5 | 4 | 1 | **3.0** |
| **services/bot/** | 7 | 7 | 7 | 6 | 6 | 5 | 5 | **6.1** |
| **AI Core Engine** | 8 | 8 | 8 | 7 | 7 | 6 | 7 | **7.3** |
| **Content Engine** | 7 | 8 | 7 | 5 | 7 | 6 | 6 | **6.6** |
| **Entity Engine** | 8 | 7 | 7 | 7 | 6 | 5 | 6 | **6.6** |
| **GEO Engine** | 8 | 7 | 7 | 7 | 6 | 5 | 5 | **6.4** |
| **Publisher Engine** | 5 | 7 | 5 | 4 | 6 | 5 | 5 | **5.3** |
| **SEO Lib** | 7 | 7 | 7 | 6 | 7 | 5 | 5 | **6.3** |
| **Prompts** | 5 | 6 | 4 | 4 | 6 | 5 | 3 | **4.7** |
| **Fetcher** | 6 | 7 | 6 | 5 | 6 | 5 | 5 | **5.7** |
| **Distribution** | 5 | 6 | 5 | 4 | 5 | 4 | 4 | **4.7** |
| **Trends** | 5 | 6 | 5 | 4 | 5 | 4 | 4 | **4.7** |

---

## 5. Güçlü Yönler

1. **AI Core Engine:** Temiz provider abstraction, retry logic, JSON mode, streaming — production-ready
2. **SEO Kütüphanesi:** 7 JSON-LD tipi, Next.js Metadata API uyumlu, Google News ready
3. **Entity + GEO Engines:** İleri seviye, AI arama motorları için optimize
4. **Content Engine State Machine:** 24 transition rule, role-based, workflow logging
5. **TypeScript Bot:** Modüler, test edilebilir, 6 dosyaya ayrılmış
6. **Admin Workspace:** 6 panelli editör dashboard'u (AI, SEO, GEO, Entity, Publish)
7. **Docker + CI/CD:** Production-ready deployment pipeline
8. **Sitemap/RSS/News Sitemap:** Tam SEO altyapısı

---

## 6. Zayıf Yönler

1. **İki Paralel Bot Sistemi:** `auto-bot.js` ve `services/bot/` arasında kod tekrarı (~%60)
2. **auto-bot.js Eksik:** Kalite kontrolü, SEO optimizasyonu, tag yönetimi, web scraping, trending içerik yok
3. **Verification Yok:** Fact-checking, kaynak doğrulama, entity kontrolü katmanı eksik
4. **Editor Review Yok:** Otomatik editoryal karar mekanizması yok
5. **Publish Workflow Yok:** Yayın öncesi kontroller, rollback, transaction yok
6. **Workflow Store In-Memory:** Process restart'ta tüm workflow geçmişi kaybolur
7. **SQLite:** Production'da ölçeklenebilirlik sorunu
8. **Tek Provider:** Sadece DeepSeek aktif, diğerleri implemente edilmemiş
9. **Prompt Yönetimi:** Prompt'lar kod içine gömülü, merkezi yönetim yok
10. **Test Yok:** Hiçbir test dosyası bulunamadı

---

## 7. Teknik Borçlar

| # | Borç | Şiddet | Etki |
|---|------|--------|------|
| 1 | İki bot sistemi arası kod tekrarı | Yüksek | Bakım maliyeti, bug riski |
| 2 | auto-bot.js eksik özellikleri | Yüksek | Düşük kaliteli üretim içeriği |
| 3 | In-memory workflow store | Orta | Veri kaybı riski |
| 4 | SQLite production kullanımı | Orta | Ölçeklenebilirlik |
| 5 | Prompt'ların kod içine gömülü olması | Orta | Güncelleme zorluğu |
| 6 | Test eksikliği | Yüksek | Regresyon riski |
| 7 | Diğer AI provider'ların eksikliği | Düşük | Vendor lock-in |
| 8 | Hard-coded değerler (API key fallback: "sk-placeholder") | Orta | Güvenlik |
| 9 | Workflow event'lerin DB'ye yazılmaması | Orta | Audit trail eksik |
| 10 | Shell servisler (research-assistant, revenue) | Düşük | Tamamlanmamış özellikler |

---

## 8. Risk Analizi

| Risk | Olasılık | Etki | Puan |
|------|----------|------|------|
| DeepSeek API downtime | Orta | Yüksek — bot tamamen durur | 🔴 8/10 |
| SQLite concurrent write limit | Orta | Orta — performans düşüşü | 🟡 6/10 |
| İki bot farklı içerik üretmesi | Yüksek | Orta — kalite tutarsızlığı | 🟡 7/10 |
| auto-bot.js'te hata olması | Orta | Yüksek — production'da çalışan bot | 🔴 7/10 |
| AI "halüsinasyon" içeriği | Orta | Yüksek — yanlış haber yayınlama | 🔴 8/10 |
| Prompt injection / abuse | Düşük | Orta — kaynak içerikten prompt injection | 🟡 5/10 |
| Rate limiting (DeepSeek API) | Orta | Orta — bot yavaşlaması | 🟡 5/10 |

---

## 9. Bağımlılık Haritası

```
auto-bot.js ─────────────┬──► PrismaClient ──► SQLite
                         ├──► OpenAI SDK ────► DeepSeek API
                         └──► rss-parser

services/bot/ ───────────┬──► @/lib/db (Prisma)
                         ├──► @/lib/deepseek ─► AI Core Engine ─► DeepSeek API
                         ├──► @/lib/logger
                         ├──► @/lib/utils
                         ├──► rss-parser
                         ├──► axios + cheerio
                         └──► services/ai/ (prompts)

AI Core Engine ──────────┬──► OpenAI SDK (DeepSeek)
                         ├──► process.env.*
                         └──► services/ai/prompts/registry

Content Engine ──────────┬──► services/content/* (iç bağımlılık)
                         └──► Yok (in-memory)

Entity Engine ───────────┬──► AI Core Engine (ai.chatJSON)
                         └──► services/entity/*

GEO Engine ──────────────┬──► services/geo/* (iç bağımlılık)
                         └──► Yok (kural tabanlı + AI)

SEO Lib ─────────────────┬──► @/lib/constants
                         └──► next (Metadata API)

Admin Panel ─────────────┬──► NextAuth (middleware)
                         ├──► Prisma
                         ├──► AI Core Engine
                         ├──► Entity Engine
                         ├──► GEO Engine
                         └──► Content Engine
```

---

## 10. Deployment Mimarisi

```
┌─────────────────────────────────────────────┐
│                  VPS (Docker)                │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   app    │  │   bot    │  │  nginx   │  │
│  │ Next.js  │  │ auto-bot │  │ alpine   │  │
│  │ 14       │  │   .js    │  │          │  │
│  │          │  │ 2 saatte │  │ SSL      │  │
│  │ Port 3000│  │ bir loop │  │ HTTP/2   │  │
│  └──────────┘  └──────────┘  │ Cache    │  │
│                               │ Rate Lim.│  │
│                               └──────────┘  │
│                                              │
│  GitHub Actions CI/CD:                       │
│  SSH → git pull → docker compose build → up │
└─────────────────────────────────────────────┘
```

---

## Özet

TeknolojiAkışı, sağlam bir Next.js 14 altyapısı üzerine kurulu, iyi tasarlanmış AI servis katmanlarına sahip bir teknoloji haber platformudur. En büyük problem, iki paralel bot sisteminin varlığı ve eksik AI pipeline aşamalarıdır (verification, writer, SEO agent, publisher, editor-in-chief). AI Newsroom mimarisi bu boşlukları dolduracak şekilde tasarlanmalıdır.
