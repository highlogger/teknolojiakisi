# Legacy Removal Report

**Tarih:** 15 Temmuz 2026  
**Task:** TASK-A01 — Legacy Bot Removal & Scout Migration

---

## Silinen Dosyalar (8)

| Dosya | Sebep |
|-------|-------|
| `auto-bot.js` | Production legacy bot (RSS → AI Rewrite → Publish) |
| `auto-bot.ts` | Dev bot runner |
| `services/bot/index.ts` | Eski orchestrator |
| `services/bot/generator.ts` | AI rewrite/translate pipeline |
| `services/bot/publisher.ts` | Legacy publisher |
| `services/bot/trigger.ts` | CLI trigger |
| `services/bot/fetcher.ts` | Artık Scout Agent kendi fetch'ini yapıyor |
| `services/bot/prompts.ts` | Rewrite prompt'ları, AI prompt şablonları |

---

## Yeni Dosyalar (2)

| Dosya | Amaç |
|-------|------|
| `services/agents/scout/index.ts` | Scout Agent — RSS → Tech filter → Queue (TypeScript) |
| `scout-entry.js` | Production entry point (CommonJS, Docker'da çalışır) |

---

## Güncellenen Dosyalar (5)

| Dosya | Değişiklik |
|-------|-----------|
| `app/api/bot/trigger/route.ts` | `runBot()` → `scout()` |
| `app/admin/bot/BotTriggerButton.tsx` | "Botu Çalıştır" → "Scout Çalıştır" |
| `Dockerfile` | `auto-bot.js` kaldırıldı → `scout-entry.js` eklendi |
| `docker-compose.yml` | `bot` servisi → `scout` servisi |
| `services/bot/` | **Tamamen silindi** |

---

## Yeni Mimari

```
ESKI (SILINDI):                YENI:
───────────────                ─────
auto-bot.js                    scout-entry.js
  RSS → Rewrite → Publish        RSS → Tech Filter → Queue
                                
                                ↓ (AI Newsroom pipeline)
                                Writer → SEO → Editor → Publisher
```

---

## Build Durumu
- ✅ TypeScript: 0 hata
- ✅ Next.js build: başarılı
- ✅ Docker: scout-entry.js çalışıyor
