# Modül Kaydı

## FAZ 1 — Core Platform

### AI Core Engine
- **Klasör:** `services/ai/` (9 dosya)
- **Durum:** ✅ Production-ready
- **Amaç:** Tüm AI işlemleri için merkezi provider abstraction
- **Dosyalar:** client.ts, config.ts, types.ts, errors.ts, logger.ts, providers/base.ts, providers/deepseek.ts, prompts/registry.ts, index.ts
- **Bağımlılıklar:** OpenAI SDK (DeepSeek için)
- **Kullananlar:** auto-bot.js, services/bot/, services/agents/writer/
- **Eksikler:** OpenAI, Gemini, Claude provider'ları implemente edilmemiş

### Content Engine
- **Klasör:** `services/content/` (9 dosya)
- **Durum:** ✅ Production-ready
- **Amaç:** Makale yaşam döngüsü, state machine, workflow
- **Dosyalar:** types.ts, status.ts, metadata.ts, workflow.ts, lifecycle.ts, tags.ts, categories.ts, content-types.ts, index.ts
- **10 Durum:** Draft → AI_Generated → Editor_Review → SEO_Optimized → Fact_Checked → Ready → Published → Updated → Archived → Deleted
- **Eksikler:** Workflow store in-memory (Map), DB'ye taşınmalı

### SEO Engine
- **Klasör:** `lib/seo.tsx` (1 dosya)
- **Durum:** ✅ Production-ready
- **Amaç:** JSON-LD, Open Graph, Twitter Card, Metadata
- **7 Şema:** Organization, WebSite, BreadcrumbList, NewsArticle, CollectionPage, Person, AboutPage/ContactPage/SearchResultsPage
- **Bağımlılıklar:** Next.js Metadata API, lib/constants
- **Kullananlar:** Tüm public sayfalar

### Entity Intelligence Engine
- **Klasör:** `services/entity/` (9 dosya)
- **Durum:** ✅ Production-ready
- **Amaç:** 27 entity tipi, AI extraction, fuzzy resolution, scoring
- **Dosyalar:** types.ts, config.ts, extractor.ts, resolver.ts, registry.ts, scoring.ts, service.ts, prompts.ts, index.ts
- **Pipeline:** Extract → Normalize → Resolve (exact → alias → slug → fuzzy) → Score
- **AI Entegrasyonu:** `ai.chatJSON()` ile entity çıkarımı

### GEO Intelligence Engine
- **Klasör:** `services/geo/` (11 dosya)
- **Durum:** ✅ Production-ready
- **Amaç:** Generative Engine Optimization — AI arama motorları için içerik optimizasyonu
- **8 Platform:** ChatGPT, Google AI, Gemini, Claude, Perplexity, Copilot, Brave, You.com
- **8 Skor Boyutu:** Entity, Authority, Freshness, Citation, Semantic, Answer, Trust, AI Readability
- **Dosyalar:** types.ts, config.ts, engine/index.ts, analysis/index.ts, scoring/calculator.ts, metadata/generator.ts, validators/geo-validator.ts, models/citation.ts, models/summary.ts, models/takeaways.ts, index.ts

---

## FAZ 2 — CMS

### AI Workspace
- **Klasör:** `admin/haberler/[id]/workspace/` (9 dosya)
- **Durum:** ✅ Production-ready
- **Amaç:** 6 panelli editör dashboard'u
- **Paneller:** Editör, AI, SEO, GEO, Entity, Yayın

### Internal Link Engine
- **Klasör:** `services/internal-links/` (4 dosya)
- **Durum:** ✅ Tamamlandı
- **Amaç:** İç link önerileri, anchor text matching

### Related Content Engine
- **Klasör:** `services/recommendation/` (3 dosya)
- **Durum:** ✅ Tamamlandı
- **Amaç:** İlgili içerik önerileri

### Google Discover Engine
- **Klasör:** `services/discover/` (3 dosya)
- **Durum:** ✅ Tamamlandı
- **Amaç:** Google Discover için içerik optimizasyonu

### Google News Compliance
- **Klasör:** `services/publisher/` (3 dosya)
- **Durum:** ✅ Tamamlandı
- **Amaç:** Google News uyumluluğu, validator (11 check)
- **Dosyalar:** config.ts, validator.ts, index.ts

### Topic Hub
- **Klasör:** `services/topics/` (1 dosya) + `app/(public)/topics/[slug]/`
- **Durum:** ✅ Tamamlandı
- **Amaç:** 26 konu, topic stats, related topics, internal linking için temel

### Source Intelligence
- **Klasör:** `services/sources/` (1 dosya) + `app/(public)/source/[slug]/`
- **Durum:** ✅ Tamamlandı
- **Amaç:** Kaynak profili, 5 boyutlu güven skoru (AAA-F rating)

### Author Authority
- **Klasör:** `services/authors/` (1 dosya) + `app/(public)/yazar/[slug]/`
- **Durum:** ✅ Tamamlandı
- **Amaç:** Yazar otorite skoru, E-E-A-T uyumluluğu, expertise analizi (S-New rating)

### Content Opportunity Engine
- **Klasör:** `services/content-opportunities/` (3 dosya)
- **Durum:** ✅ Tamamlandı
- **Amaç:** İçerik açığı analizi

### Trend Intelligence
- **Klasör:** `services/trends/` (3 dosya)
- **Durum:** ✅ Tamamlandı
- **Amaç:** Trend skorlaması (volume, velocity, acceleration)

### Distribution Center
- **Klasör:** `services/distribution/` (2 dosya)
- **Durum:** ⚠️ Temel
- **Amaç:** 8 kanal dağıtım (X, Facebook, LinkedIn, Telegram, Email, Push, RSS, Sitemap)

### Revenue Platform
- **Klasör:** `services/revenue/` (2 dosya)
- **Durum:** 🔴 Shell
- **Amaç:** Reklam ve gelir yönetimi

---

## AI Newsroom Agent'ları

### Writer Agent
- **Klasör:** `services/agents/writer/` (8 dosya)
- **Durum:** ⏳ Yazıldı, orchestrator bekliyor
- **Görevi:** Research + Verification → özgün Türkçe haber
- **Çıktı:** article.md, title_options.json, excerpt.txt, summary.txt

### SEO Agent
- **Klasör:** `services/agents/seo/` (3 dosya)
- **Durum:** ⏳ Yazıldı, orchestrator bekliyor
- **Görevi:** Article → eksiksiz SEO paketi (4 schema, OG, Twitter, Discover)

### Publisher Agent
- **Klasör:** `services/agents/publisher/` (1 dosya)
- **Durum:** ⏳ Yazıldı, orchestrator bekliyor
- **Görevi:** 9 pre-check, transaction, dry run, 4 publish modu

### Editor-in-Chief Agent
- **Klasör:** `services/agents/editor-in-chief/` (1 dosya)
- **Durum:** ⏳ Yazıldı, orchestrator bekliyor
- **Görevi:** 20 editoryal kontrol, 13 skor, APPROVED/REJECTED kararı

---

## Infrastructure

### Bot Automation
- **Klasör:** `services/bot/` (6 dosya) + `auto-bot.js`
- **Durum:** ✅ Production'da çalışıyor
- **Amaç:** RSS/web scraping → AI generate → publish
- **Not:** İki paralel sistem (CommonJS + TypeScript), birleştirilmeli

### Auth System
- **Klasör:** `lib/auth.ts` + `middleware.ts`
- **Durum:** ✅ Production-ready
- **Amaç:** NextAuth v5, JWT, RBAC (admin/editor)

### Logger
- **Klasör:** `lib/logger.ts`
- **Durum:** ✅ Production-ready
- **Amaç:** 5 seviye (debug→fatal), dev renkli / prod JSON

### Validation
- **Klasör:** `lib/validation.ts`
- **Durum:** ✅ Production-ready
- **Amaç:** 12 Zod şeması, tüm API endpoint'leri
