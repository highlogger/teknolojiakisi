# Pipeline Dokümantasyonu

## 1. Mevcut Bot Akışı (Production)

```
┌──────────────────────────────────────────────────────────┐
│              auto-bot.js — 120 dk interval                │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────┐    ┌──────────────┐                        │
│  │ 25+ RSS  │    │  Web Scraping │  cheerio + axios       │
│  │  Feed    │    │  (CSS select) │                        │
│  └────┬─────┘    └──────┬───────┘                        │
│       │                 │                                 │
│       └────────┬────────┘                                 │
│                ▼                                          │
│  ┌────────────────────────┐                              │
│  │   48 Saat + Tech       │  filterRecentArticles(48)     │
│  │   Filtre               │  quickTechFilter()            │
│  └───────────┬────────────┘  139 keyword, 20 pattern      │
│              ▼                                            │
│  ┌────────────────────────┐                              │
│  │   Duplicate Kontrol    │  filterProcessedArticles()    │
│  └───────────┬────────────┘  originalUrl check            │
│              ▼                                            │
│  ┌────────────────────────────────────┐                   │
│  │        AI Pipeline (3 aşama)       │                   │
│  │  [1] translateAndRewrite 4096 tok │  deepseek-chat     │
│  │  [2] qualityCheck         4096 tok │                   │
│  │  [3] optimizeSEO (JSON)   2048 tok │                   │
│  └───────────┬────────────────────────┘                   │
│              ▼                                            │
│  ┌────────────────────────┐                              │
│  │   Kategori AI          │  classifyCategory()           │
│  └───────────┬────────────┘  50 token                     │
│              ▼                                            │
│  ┌────────────────────────────────────────┐               │
│  │           Publish                       │              │
│  │  Tag upsert → Article create → BotLog  │              │
│  │  Status: autoPublish ? publish : draft │              │
│  └────────────────────────────────────────┘               │
│                                                           │
│  ── Ek: Trend/Fabrika İçerik ──                          │
│  12 TRENDING_TOPICS + 89 FACTORY_TOPICS                   │
│  AI generate (tek çağrı) → Direct DB insert               │
└──────────────────────────────────────────────────────────┘
```

---

## 2. AI Newsroom Hedef Akışı (Orchestrator)

```
┌──────────────────────────────────────────────────────────┐
│            AI Newsroom Pipeline (HEDEF)                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐                                    │
│  │  RESEARCH        │  RSS/Web + Deep Research            │
│  │  Agent           │  → research.json                    │
│  └────────┬─────────┘                                    │
│           ▼                                               │
│  ┌──────────────────┐                                    │
│  │  VERIFICATION    │  8 kontrol modülü                   │
│  │  Agent           │  → verification.json               │
│  │  (KALDIRILDI)    │  VERIFIED / REJECT / ...           │
│  └────────┬─────────┘                                    │
│           ▼                                               │
│  ┌──────────────────┐                                    │
│  │  WRITER          │  7 bölüm, 5 başlık                  │
│  │  Agent           │  → article.md                      │
│  │  ✅ HAZIR        │  AI Core Engine                    │
│  └────────┬─────────┘                                    │
│           ▼                                               │
│  ┌──────────────────┐                                    │
│  │  SEO             │  4 schema, OG, Twitter              │
│  │  Agent           │  → seo.json, metadata.json         │
│  │  ✅ HAZIR        │  Discover, Google News             │
│  └────────┬─────────┘                                    │
│           ▼                                               │
│  ┌──────────────────┐                                    │
│  │  EDITOR-IN-CHIEF │  20 kontrol, 13 skor               │
│  │  Agent           │  → editor_review.json              │
│  │  ✅ HAZIR        │  APPROVED / REJECTED               │
│  └────────┬─────────┘                                    │
│           ▼                                               │
│  ┌──────────────────┐                                    │
│  │  PUBLISHER       │  9 pre-check, transaction          │
│  │  Agent           │  → publication_report.json         │
│  │  ✅ HAZIR        │  Prisma → Article + BotLog         │
│  └──────────────────┘                                    │
│                                                           │
│  ⚠️ Orchestrator: YAZILMADI                              │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Content Engine State Machine

```
                    ┌─────────┐
                    │  DRAFT  │
                    └────┬────┘
                         │ (editor)
                         ▼
                 ┌───────────────┐
                 │  AI_GENERATED │
                 └───────┬───────┘
                         │ (editor)
                         ▼
                ┌────────────────┐
                │ EDITOR_REVIEW  │
                └───────┬────────┘
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
     ┌──────────┐ ┌──────────┐ ┌──────────┐
     │   SEO    │ │  FACT    │ │  DRAFT   │
     │OPTIMIZED │ │ CHECKED  │ │ (geri)   │
     └────┬─────┘ └────┬─────┘ └──────────┘
          │            │
          └─────┬──────┘
                ▼
         ┌──────────┐
         │  READY   │
         └────┬─────┘
              │ (admin ONLY)
              ▼
       ┌────────────┐
       │ PUBLISHED  │
       └──┬────┬────┘
          │    │
          ▼    ▼
   ┌─────────┐ ┌──────────┐
   │ UPDATED │ │ ARCHIVED │
   └────┬────┘ └────┬─────┘
        │           │
        ▼           ▼
   ┌─────────┐ ┌──────────┐
   │PUBLISHED│ │ DELETED  │ (son)
   └─────────┘ └──────────┘
```

---

## 4. Veri Akışı (Data Flow)

```
[External RSS/Web] → [fetcher.ts] → [FetchedArticle]
                                         │
                                    [quickTechFilter]
                                         │
                                    [filterProcessed]
                                         │
                                    [generator.ts] ← [AI Core Engine → DeepSeek API]
                                         │
                                    [GeneratedArticle]
                                         │
                                    [publisher.ts] → [Prisma → SQLite]
                                         │
                                    [Article (DB)]
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
             [Public Pages]       [Admin Pages]        [RSS/Sitemap]
             haber/[slug]         haberler/[id]/        rss.xml
             kategori/[slug]      workspace             sitemap.xml
             yazar/[slug]                               news-sitemap.xml
             topics/[slug]
             source/[slug]
```
