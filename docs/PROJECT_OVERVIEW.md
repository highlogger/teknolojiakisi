# TeknolojiAkışı — Proje Genel Bakış

> **Okuma Süresi:** 15 dakika  
> **Son Güncelleme:** 15 Temmuz 2026  
> **Versiyon:** 2.1.0

---

## Proje Nedir?

TeknolojiAkışı, **AI destekli otomatik Türkçe teknoloji haber platformudur.** 
Next.js 14 tabanlı, 3-container Docker stack olarak VPS'te çalışır.

### Temel Yetenekler
- 🤖 **Auto Bot:** 25+ RSS/web kaynaktan her 2 saatte bir haber çeker, AI ile Türkçe'ye uyarlar
- 🧠 **AI Core Engine:** DeepSeek, OpenAI, Gemini, Claude için provider abstraction
- 📰 **Content Engine:** 10 durumlu state machine, workflow, lifecycle hooks
- 🔍 **SEO Engine:** 7 JSON-LD tipi, Google News/Discover uyumlu
- 🏷️ **Entity Engine:** 27 entity tipi, AI extraction, fuzzy resolution
- 🌐 **GEO Engine:** 8 AI platformu için Generative Engine Optimization
- ✍️ **AI Newsroom:** Writer Agent + SEO Agent + Publisher Agent + Editor-in-Chief Agent
- 📊 **Admin Panel:** 6 panelli editor workspace (AI, SEO, GEO, Entity, Publish)

---

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| **Framework** | Next.js 14.2 (App Router) |
| **Dil** | TypeScript (src/), JavaScript (auto-bot.js) |
| **Database** | SQLite (Prisma ORM) |
| **AI** | DeepSeek (aktif), OpenAI/Gemini/Claude (hazır) |
| **Auth** | NextAuth v5 (Credentials + JWT) |
| **Deployment** | Docker Compose (app + bot + nginx) |
| **CI/CD** | GitHub Actions → SSH → VPS |
| **Styling** | Tailwind CSS |
| **Validation** | Zod |

---

## Sistem Bileşenleri

```
┌─────────────────────────────────────────────────┐
│              TeknolojiAkışı Platformu            │
├─────────────────────────────────────────────────┤
│  Frontend (Next.js 14)                          │
│  ├── Public: Ana sayfa, haber, kategori, yazar  │
│  ├── Admin: Dashboard, Workspace, Bot yönetimi  │
│  └── API: REST endpoints (articles, auth, bot)  │
├─────────────────────────────────────────────────┤
│  AI Newsroom (YENİ)                             │
│  ├── Writer Agent                               │
│  ├── SEO Agent                                  │
│  ├── Publisher Agent                            │
│  └── Editor-in-Chief Agent                      │
├─────────────────────────────────────────────────┤
│  Core Services                                  │
│  ├── AI Core Engine (provider abstraction)      │
│  ├── Content Engine (state machine)             │
│  ├── Entity Engine (27 entity types)            │
│  └── GEO Engine (8 platforms)                   │
├─────────────────────────────────────────────────┤
│  Support Services                               │
│  ├── Bot Automation (RSS + Web scraping)        │
│  ├── Internal Links Engine                      │
│  ├── Related Content Engine                     │
│  ├── Google Discover Engine                     │
│  ├── Publisher Engine (Google News validator)   │
│  ├── Content Opportunities Engine               │
│  ├── Trend Intelligence                         │
│  ├── Topic Hub                                  │
│  ├── Source Intelligence                        │
│  ├── Author Authority                           │
│  ├── Distribution Center                        │
│  └── Revenue Platform (shell)                   │
├─────────────────────────────────────────────────┤
│  Infrastructure                                 │
│  ├── Prisma/SQLite                              │
│  ├── NextAuth (JWT + RBAC)                      │
│  ├── Logger (structured + JSON)                 │
│  ├── SEO Lib (7 JSON-LD types)                  │
│  └── Validation (Zod schemas)                   │
└─────────────────────────────────────────────────┘
```

---

## Hızlı Başlangıç

```bash
# Geliştirme
npm install
cp .env.example .env  # DEEPSEEK_API_KEY ekle
npx prisma db push
npx tsx prisma/seed.ts
npm run dev

# Production
docker compose up -d
```

---

## Önemli Dosyalar

| Dosya | Amaç |
|-------|------|
| `auto-bot.js` | Production bot (Docker'da çalışır) |
| `src/services/bot/` | TypeScript bot modülü |
| `src/services/ai/` | AI Core Engine |
| `src/services/content/` | Content Engine state machine |
| `src/services/agents/` | AI Newsroom agent'ları |
| `prisma/schema.prisma` | Database şeması (9 model) |
| `src/lib/seo.tsx` | SEO/JSON-LD kütüphanesi |
| `src/middleware.ts` | Auth middleware |

---

## Durum Özeti

| Kategori | Tamamlanan | Eksik/Shell |
|----------|-----------|-------------|
| Core Services | 5/5 | 0 |
| AI Agents | 4/6 | Orchestrator, Research |
| Support Services | 13/15 | Revenue (shell) |
| Admin Panel | 8/8 | 0 |
| Frontend | 10/10 | 0 |

**Genel Tamamlanma: %92**
