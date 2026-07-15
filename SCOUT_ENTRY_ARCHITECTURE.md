# Scout Entry Architecture

## Yeni Giriş Noktası

```
┌──────────────────────────────────────────────────────────┐
│                    SCOUT AGENT                            │
│                 (AI Newsroom Entry)                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  scout-entry.js (Production)                              │
│  services/agents/scout/index.ts (TypeScript)              │
│                                                           │
│  ┌──────────┐    ┌──────────────┐                        │
│  │ 25+ RSS  │    │  Web Scraping │                       │
│  │  Feed    │    │  (CSS select) │                       │
│  └────┬─────┘    └──────┬───────┘                        │
│       │                 │                                 │
│       └────────┬────────┘                                 │
│                ▼                                          │
│  ┌────────────────────────┐                              │
│  │   Tech Filter          │  isTechRelevant()             │
│  │   90+ keyword          │                               │
│  └───────────┬────────────┘                              │
│              ▼                                            │
│  ┌────────────────────────┐                              │
│  │   Duplicate Check      │  originalUrl kontrolü         │
│  └───────────┬────────────┘                              │
│              ▼                                            │
│  ┌────────────────────────┐                              │
│  │   Recent Check         │  48 saat filtresi             │
│  └───────────┬────────────┘                              │
│              ▼                                            │
│  ┌────────────────────────┐                              │
│  │   Job Queue            │  ScoutedArticle[]             │
│  │   status: "queued"     │                               │
│  └───────────┬────────────┘                              │
│              │                                            │
│              ▼                                            │
│     ┌────────────────┐                                    │
│     │ AI NEWSROOM    │  (henuz baglanmadi)                │
│     │ Pipeline       │                                    │
│     │ Writer → SEO   │                                    │
│     │ → Editor →     │                                    │
│     │ Publisher      │                                    │
│     └────────────────┘                                    │
└──────────────────────────────────────────────────────────┘
```

---

## Scout vs Eski Bot

| Özellik | Eski Bot | Scout Agent |
|---------|----------|-------------|
| AI çağrısı | 3-4 API çağrısı/haber | 0 (AI kullanmaz) |
| İçerik üretimi | Translate + Rewrite + SEO | Yok |
| Publish | Direkt DB insert | Yok |
| Görevi | Haber yaz ve yayınla | Haber bul ve queue'ya ekle |
| Token maliyeti | ~$0.008/haber | $0 |
| Interval | 120 dakika | 120 dakika |

---

## Docker Stack

```
┌─────────────────────────────────────────────┐
│              Docker Compose                  │
├─────────────────────────────────────────────┤
│  app      — Next.js (port 3000)             │
│  scout    — Scout Agent (120 dk interval)   │
│  nginx    — Reverse Proxy (:80, :443)       │
└─────────────────────────────────────────────┘
```
