# Teknik Borç Kaydı

---

## 🔴 Kritik (P0)

| # | Borç | Etki | Çözüm |
|---|------|------|-------|
| 1 | **Orchestrator eksik** | 4 AI agent yazıldı ama zincirlenmedi, kullanılamıyor | `services/agents/orchestrator.ts` yaz |
| 2 | **GitHub Actions SSH başarısız** | Deploy otomatik çalışmıyor, site güncellenmiyor | GitHub Secrets güncelle |
| 3 | **Test yok** | %0 coverage, her değişiklik riskli | Jest + Playwright ekle |

---

## 🟡 Yüksek (P1)

| # | Borç | Etki | Çözüm |
|---|------|------|-------|
| 4 | **İki bot sistemi** | auto-bot.js + services/bot/ arası %60 kod tekrarı, 2 yerde bug fix | auto-bot.js → build çıktısı yap |
| 5 | **Workflow store in-memory** | Process restart'ta tüm workflow geçmişi kaybolur | WorkflowEvent modeli + DB |
| 6 | **Prompt'lar kod içinde** | Güncelleme için deploy gerekir, A/B test zor | Prompt Store (DB veya ayrı dosya) |
| 7 | **auto-bot.js eksik özellikler** | Kalite kontrolü, SEO optimizasyonu, tag yönetimi yok | TS bot ile birleştir |
| 8 | **AUTH_SECRET build-time check** | Docker build'te env var gerekli, build arg hack'i ile çözüldü | Build-time check'i kaldır, sadece runtime |
| 9 | **Hard-coded API key fallback** | `"sk-placeholder"` auto-bot.js'te | Kaldır, env var zorunlu olsun |

---

## 🟠 Orta (P2)

| # | Borç | Etki | Çözüm |
|---|------|------|-------|
| 10 | **SQLite production** | Concurrent write limit, ölçeklenemez | PostgreSQL migration |
| 11 | **Tek AI provider** | DeepSeek downtime → bot durur | OpenAI/Gemini/Claude implemente et |
| 12 | **Topic hardcoded liste** | 39 topic kodda sabit, yeni topic için deploy | Topic Registry servisi (yapıldı) |
| 13 | **TypeScript strict mode** | Bazı `any` tipleri var | Kademeli tip güvenliği |
| 14 | **Rate limiting sadece Nginx'te** | Uygulama seviyesi koruma yok | API rate limiting middleware |
| 15 | **Monolitik CSS** | Tek globals.css, büyüyor | CSS modules veya Tailwind JIT optimize |

---

## 🟢 Düşük (P3)

| # | Borç | Etki | Çözüm |
|---|------|------|-------|
| 16 | **Shell servisler** | `revenue/` boş, kod kalabalığı | Tamamla veya kaldır |
| 17 | **Legacy deepseek.ts** | AI Core Engine varken gereksiz | Kaldır, tüm import'ları güncelle |
| 18 | **auto-bot.ts dev runner** | `trigger.ts` varken gereksiz | Birleştir |
| 19 | **Dokümantasyon dağınık** | 10+ MD dosyası root'ta | `docs/` klasörüne taşı (yapıldı) |
| 20 | **Hard-coded admin credentials** | `admin@teknolojiakisi.com / admin123` deploy.sh'te | Seed script'ine taşı, env var yap |

---

## Özet

| Seviye | Sayı |
|--------|------|
| 🔴 Kritik (P0) | 3 |
| 🟡 Yüksek (P1) | 6 |
| 🟠 Orta (P2) | 6 |
| 🟢 Düşük (P3) | 5 |
| **Toplam** | **20** |
