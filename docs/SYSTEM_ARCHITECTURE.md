# Sistem Mimarisi

## Deployment Mimarisi

```
┌─────────────────────────────────────────────────┐
│                VPS (45.136.6.64)                 │
│              Docker Compose Stack                │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐             │
│  │   nginx      │  │   app        │             │
│  │   alpine     │  │   Next.js    │             │
│  │   :80 :443   │─▶│   :3000      │             │
│  │   SSL/HTTP2  │  │   standalone │             │
│  │   Cache      │  │              │             │
│  │   Rate Limit │  └──────┬───────┘             │
│  └──────────────┘         │                     │
│                           │ depends_on          │
│  ┌──────────────┐         ▼                     │
│  │   bot        │  ┌──────────────┐             │
│  │   auto-bot   │  │   SQLite     │             │
│  │   .js        │  │   /data/     │             │
│  │   120 dk     │  │   dev.db     │             │
│  │   interval   │  └──────────────┘             │
│  └──────────────┘                               │
│                                                  │
│  CI/CD: GitHub Actions → SSH → git pull →       │
│         docker compose build → up -d             │
└─────────────────────────────────────────────────┘
```

---

## Katmanlı Mimari

```
┌─────────────────────────────────────────────────┐
│              PRESENTATION LAYER                  │
│  Next.js Pages + Components + API Routes         │
│  Public: /, /haber/[slug], /kategori/[slug]     │
│  Admin: /admin/dashboard, /admin/haberler/*     │
│  API: /api/articles, /api/bot/trigger, ...      │
├─────────────────────────────────────────────────┤
│              SERVICE LAYER                       │
│  ┌─────────────┐  ┌──────────────┐              │
│  │ AI Newsroom │  │ Core Services│              │
│  │ Writer      │  │ AI Core      │              │
│  │ SEO         │  │ Content      │              │
│  │ Publisher   │  │ Entity       │              │
│  │ Editor      │  │ GEO          │              │
│  └─────────────┘  └──────────────┘              │
│  ┌──────────────────────────────────┐           │
│  │ Support Services                 │           │
│  │ Bot | Topics | Sources | Authors │           │
│  │ Internal Links | Related | Trends│           │
│  │ Discover | Publisher | Revenue   │           │
│  └──────────────────────────────────┘           │
├─────────────────────────────────────────────────┤
│              DATA LAYER                          │
│  Prisma ORM → SQLite                            │
│  9 Model: User, Article, Category, Author,      │
│  Tag, Source, BotLog, SiteSetting, ArticleTag   │
├─────────────────────────────────────────────────┤
│              INFRASTRUCTURE                      │
│  Auth: NextAuth v5 (JWT + RBAC)                 │
│  Logger: Structured (5 level, dev/prod)         │
│  Validation: Zod (12 schema)                    │
│  SEO: 7 JSON-LD types, Metadata API             │
└─────────────────────────────────────────────────┘
```

---

## Database Schema

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │     │ Category │     │  Author  │
│ ──────── │     │ ──────── │     │ ──────── │
│ id       │     │ id       │     │ id       │
│ email    │     │ name     │     │ name     │
│ name     │     │ slug     │     │ slug     │
│ password │     │ color    │     │ avatar   │
│ role     │     │ sortOrder│     │ bio      │
└──────────┘     └────┬─────┘     │ isBot    │
                      │           └────┬─────┘
                      │                │
       ┌──────────────┼────────────────┘
       ▼              ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Source  │────▶│ Article  │◀────│   Tag    │
│ ──────── │     │ ──────── │     │ ──────── │
│ id       │     │ id       │     │ id       │
│ name     │     │ title    │     │ name     │
│ url      │     │ slug     │     │ slug     │
│ type     │     │ content  │     └──────────┘
│ feedUrl  │     │ status   │          │
│ language │     │ excerpt  │          │
│ priority │     │ metaTitle│     ┌────┴─────┐
└──────────┘     │ metaDesc │     │ArticleTag│
                 │ featured │     │ ──────── │
┌──────────┐     │ aiModel  │     │articleId │
│ BotLog   │     │ aiTokens │     │ tagId    │
│ ──────── │     │ viewCount│     └──────────┘
│ id       │     │ origUrl  │
│ sourceId │     │ pubDate  │
│ status   │     │ category*│
│ articles │     │ author*  │
│ duration │     │ source*  │
└──────────┘     └──────────┘
```

---

## Dosya Organizasyonu

| Katman | Klasör | Amaç |
|--------|--------|------|
| **Pages** | `app/(public)/` | Kullanıcıya gösterilen sayfalar |
| **Admin** | `app/admin/` | Yönetim paneli |
| **API** | `app/api/` | REST endpoint'leri |
| **Components** | `components/` | Paylaşılan React component'leri |
| **Services** | `services/` | İş mantığı servisleri |
| **Lib** | `lib/` | Core kütüphaneler |
| **Types** | `types/` | Global TypeScript tipleri |
| **Config** | `prisma/`, `*.config.*` | Konfigürasyon |
