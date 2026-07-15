# Yol Haritası

Öncelik sırasına göre geliştirilmesi gereken işler.

---

## 🔴 Critical — Hemen Yapılmalı

| # | Görev | Süre | Bağımlılık |
|---|-------|------|-----------|
| 1 | **Orchestrator yaz** — Agent'ları zincirle | 1 gün | Yok |
| 2 | **GitHub Secrets düzelt** — SSH deploy'u çalışır hale getir | 1 saat | VPS erişimi |
| 3 | **auto-bot.js → TS build** — Tek kod tabanına geç | 2 gün | Orchestrator |
| 4 | **Workflow store → DB** — In-memory'den kurtar | 0.5 gün | Yok |

---

## 🟡 High — Bu Hafta

| # | Görev | Süre | Bağımlılık |
|---|-------|------|-----------|
| 5 | **Admin panel agent entegrasyonu** — Workspace'e agent çıktılarını ekle | 1 gün | Orchestrator |
| 6 | **Dry run testleri** — Pipeline'ı gerçek veriyle test et | 1 gün | Orchestrator |
| 7 | **Prompt Store oluştur** — Prompt'ları koddan ayır | 0.5 gün | Yok |
| 8 | **auto-bot.js özellik eşitleme** — Kalite, SEO, tag eksiklerini kapat | 1 gün | auto-bot birleştirme |
| 9 | **AUTH_SECRET fix** — Build-time check'i kaldır | 0.5 gün | Yok |

---

## 🟠 Medium — Bu Ay

| # | Görev | Süre | Bağımlılık |
|---|-------|------|-----------|
| 10 | **Temel test suite** — Jest + critical path testleri | 2 gün | Yok |
| 11 | **Multi-provider AI** — OpenAI implementasyonu | 1 gün | Yok |
| 12 | **Revenue Platform tamamlama** | 2 gün | Yok |
| 13 | **Editorial Calendar** | 1 gün | Yok |
| 14 | **Entity Profile Pages** | 1 gün | Entity Engine |
| 15 | **Homepage Intelligence geliştirme** | 1 gün | Trend + Entity |
| 16 | **Distribution Center tamamlama** | 1 gün | Yok |

---

## 🟢 Low — Bu Çeyrek

| # | Görev | Süre | Bağımlılık |
|---|-------|------|-----------|
| 17 | **SQLite → PostgreSQL** | 3 gün | Yok |
| 18 | **Full test coverage (%60+)** | 3 gün | Temel test |
| 19 | **Gemini + Claude provider** | 2 gün | Multi-provider |
| 20 | **Advanced Analytics** | 2 gün | PostgreSQL |
| 21 | **Professional Article UI** | 2 gün | Yok |
| 22 | **Legacy temizliği** — deepseek.ts, auto-bot.ts, shell'ler | 1 gün | Orchestrator |
| 23 | **CI/CD iyileştirme** — Zero-downtime deploy, rollback | 1 gün | GitHub Secrets |
| 24 | **Monitoring + Alerting** | 2 gün | Yok |

---

## Zaman Çizelgesi

```
Hafta 1:        Hafta 2:        Hafta 3-4:       Ay 2-3:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Orchestrator│   │Admin     │    │Test      │    │PostgreSQL│
│SSH fix     │   │enteg.    │    │OpenAI    │    │Analytics │
│auto-bot    │   │Dry run   │    │Revenue   │    │Full test │
│birleştirme │   │Prompt    │    │Calendar  │    │Legacy    │
│Workflow DB │   │Store     │    │Entity    │    │temizliği │
└──────────┘    └──────────┘    │Homepage  │    │CI/CD     │
                                │Distrib.  │    │Monitoring│
                                └──────────┘    └──────────┘
```

---

## Tamamlanma Yüzdesi

```
FAZ 1 (Core):     ████████████████████ 100%
FAZ 2 (CMS):      ████████████████░░░░  80%
EPIC-001 (Agent): ████████████░░░░░░░░  60%
FAZ 3 (Integr.):  ░░░░░░░░░░░░░░░░░░░░   0%
FAZ 4 (Scale):    ░░░░░░░░░░░░░░░░░░░░   0%
────────────────────────────────────────────
GENEL:            ██████████████░░░░░░  70%
```
