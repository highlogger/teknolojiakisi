# BOT_REFACTOR_PLAN.md

## Bot Sistemleri Karşılaştırma Analizi

**Tarih:** 15 Temmuz 2026  
**Analiz Türü:** Kod karşılaştırması — hiçbir değişiklik yapılmadı  
**İncelenen:** `auto-bot.js` (354 satır) vs `services/bot/` (6 dosya, ~1200 satır)

---

## 1. Yapısal Karşılaştırma

| Kriter | `auto-bot.js` | `services/bot/` |
|--------|---------------|-----------------|
| **Dil** | JavaScript (CommonJS) | TypeScript (ES Modules) |
| **Dosya sayısı** | 1 | 6 (index, fetcher, generator, prompts, publisher, trigger) |
| **Satır sayısı** | 354 | ~1200 |
| **Çalışma şekli** | `setInterval` loop | `runBot()` fonksiyon |
| **Tip güvenliği** | Yok | Tam TypeScript, `src/types/` ile |
| **Modülerlik** | Monolitik | 6 modüle ayrılmış |
| **Test edilebilirlik** | Düşük (her şey tek fonksiyonda) | Orta (modüller bağımsız test edilebilir) |
| **Hata yönetimi** | `try/catch` her kaynak için | `try/catch` her aşama için |
| **Docker uyumluluğu** | `node auto-bot.js` (tsx gerektirmez) | `npx tsx` gerekir |

---

## 2. Özellik Karşılaştırması

### 2.1 AI Pipeline

| Aşama | `auto-bot.js` (v3) | `services/bot/` |
|-------|-------------------|-----------------|
| **Çeviri + Yeniden Yazım** | ✅ Tek API çağrısı (2048 token) | ✅ `translateAndRewrite()` (4096 token) |
| **Kalite Kontrolü** | ❌ Yok | ✅ `qualityCheck()` — Türkçe karakter, anlatım bozukluğu, robotik ifadeler |
| **SEO Optimizasyonu** | ❌ Yok (manuel metaTitle/Description substring) | ✅ `optimizeSEO()` — JSON mode, başlık, slug, meta, etiket |
| **Kategori Sınıflandırma** | ✅ Ayrı API çağrısı | ✅ Ayrı API çağrısı |
| **Toplam API çağrısı/makale** | 2 | 4 (3 pipeline + 1 kategori) |

### 2.2 Fetcher

| Özellik | `auto-bot.js` | `services/bot/` |
|---------|---------------|-----------------|
| **RSS desteği** | ✅ `rss-parser` inline import | ✅ `fetchFromRSS()` |
| **Web scraping** | ❌ Yok | ✅ `fetchFromWeb()` — cheerio + axios |
| **48 saat filtresi** | ❌ Yok (tüm feed çekilir) | ✅ `filterRecentArticles()` |
| **Duplicate kontrolü** | ✅ `originalUrl` check | ✅ `filterProcessedArticles()` |
| **User-Agent** | ❌ Default | ✅ `TeknolojiAkisiBot/1.0` |
| **Resim çıkarma** | ❌ Yok | ✅ `extractImageFromRSSItem()` — enclosure, content, media |
| **Web scraping CSS selector** | ❌ Yok | ✅ Configurable selectors |

### 2.3 Tech Filtre

| Özellik | `auto-bot.js` (v3) | `services/bot/` |
|---------|-------------------|-----------------|
| **TECH_KEYWORDS** | ✅ 87 keyword | ✅ 139 keyword |
| **NON_TECH_PATTERNS** | ✅ 15 pattern | ✅ 20 pattern |
| **AI tabanlı kontrol** | ❌ Yok | ✅ `TECH_RELEVANCE_SYSTEM` prompt |
| **Filtre konumu** | Fetch sonrası, AI öncesi | Fetch sonrası, AI öncesi |

### 2.4 İçerik Üretimi

| Özellik | `auto-bot.js` | `services/bot/` |
|---------|---------------|-----------------|
| **SEO Trend İçerik** | ❌ Yok | ✅ 12 TRENDING_TOPICS |
| **Fabrika İçerik** | ❌ Yok | ✅ 89 FACTORY_TOPICS |
| **Tag yönetimi** | ❌ Yok (tags oluşturulmuyor) | ✅ `publishArticle()` — tag upsert + articleTag ilişkisi |
| **Slug benzersizlik** | Timestamp suffix | `ensureUniqueSlug()` |
| **Özet çıkarımı** | AI ÖZET bölümünden | HTML'den ilk paragraf |

### 2.5 Logging

| Özellik | `auto-bot.js` (v3) | `services/bot/` |
|---------|-------------------|-----------------|
| **Inline logger** | ✅ ~30 satır custom | ✅ `botLogger` import |
| **BotLog DB kaydı** | ✅ Per-source | ✅ Per-source |
| **Source fetch time** | ✅ Manuel | ✅ `updateSourceFetchTime()` |
| **Error detay** | Hata mesajı | Hata mesajı + duration |

---

## 3. Kod Tekrarları

### 3.1 Tamamen Aynı Kod Blokları

Aşağıdaki kodlar iki sistemde de **birebir aynı** (farklı syntax ile):

1. **TECH_KEYWORDS dizisi** — `auto-bot.js` satır 57-74, `prompts.ts` TECH_KEYWORDS
2. **NON_TECH_PATTERNS regex dizisi** — `auto-bot.js` satır 77-93, `prompts.ts` NON_TECH_PATTERNS
3. **quickTechFilter fonksiyonu** — `auto-bot.js` satır 96-105, `prompts.ts` quickTechFilter
4. **createBotLog fonksiyonu** — `auto-bot.js` satır 128-143, `publisher.ts` createBotLog
5. **classifyCategory mantığı** — `auto-bot.js` satır 108-124, `generator.ts` classifyCategory
6. **AI model adı** — Her ikisi de `"deepseek-chat"`
7. **MAX_PER_SOURCE / MAX_TOTAL** — Her ikisi de 3/25
8. **Slug oluşturma mantığı** — Aynı regex, aynı timestamp suffix
9. **Prisma sorguları** — `source.findMany`, `article.findFirst({ originalUrl })`, `article.create`

### 3.2 Benzer Ama Farklı Kod

1. **AI çağrısı tek vs çok aşamalı** — JS tek çağrı (başlık+özet+içerik), TS 3 çağrı (çeviri, kalite, SEO)
2. **Fetcher** — JS sadece RSS, TS RSS + Web scraping
3. **Tag oluşturma** — JS yok, TS `tag.upsert` + `articleTag.create`
4. **Author seçimi** — JS rastgele `isBot: true`, TS `getDefaultBotAuthor()` (fallback'li)

---

## 4. `auto-bot.js` Eksik Özellikleri (TS bot'a göre)

| # | Eksik Özellik | Etki | TS'deki Konum |
|---|--------------|------|---------------|
| 1 | **Kalite kontrolü** | Türkçe karakter hataları, robotik ifadeler filtrelenmez | `generator.ts qualityCheck()` |
| 2 | **SEO optimizasyonu (AI)** | Meta title/description substring ile yapılıyor, AI optimizasyonu yok | `generator.ts optimizeSEO()` |
| 3 | **Web scraping** | Sadece RSS kaynaklar desteklenir | `fetcher.ts fetchFromWeb()` |
| 4 | **48 saat filtresi** | Eski haberler de işlenebilir | `fetcher.ts filterRecentArticles()` |
| 5 | **SEO Trend İçerik** | 12 trend konu + 89 fabrika konusu üretilmez | `index.ts` TRENDING_TOPICS, FACTORY_TOPICS |
| 6 | **Tag yönetimi** | Haberlere etiket eklenmez (SEO kaybı) | `publisher.ts publishArticle()` |
| 7 | **Resim çıkarma** | RSS'teki görseller alınmaz | `fetcher.ts extractImageFromRSSItem()` |
| 8 | **User-Agent** | Default User-Agent, bazı kaynaklar engelleyebilir | `fetcher.ts` |
| 9 | **Daha kapsamlı prompt** | TS bot'taki prompt'lar daha detaylı (15 kural vs 1 paragraf) | `prompts.ts` |
| 10 | **Type safety** | Runtime hataları daha olası | Tüm TS dosyaları |

---

## 5. `services/bot/` Eksiklikleri (JS bot'a göre)

| # | Eksiklik | Açıklama |
|---|---------|----------|
| 1 | **CommonJS çıktısı yok** | Docker'da çalışmak için `tsx` gerekiyor (build süresini uzatır) |
| 2 | **Inline logger yok** | `botLogger` import'u production build'de çalışır ama dev'de `tsx` gerekir |
| 3 | **Başlık+Özet+İçerik formatı kullanılmaz** | JS bot'taki BASLIK/OZET/ICERIK formatı daha yapılandırılmış |

---

## 6. Mimari Karşılaştırma

```
auto-bot.js (Monolitik)              services/bot/ (Modüler)
─────────────────────────            ────────────────────────
tick()                               runBot()
  ├─ RSS parse                         ├─ fetchFromSource()
  ├─ quickTechFilter                   │   ├─ fetchFromRSS()
  ├─ AI: translate (tek çağrı)         │   └─ fetchFromWeb()
  ├─ AI: classifyCategory              ├─ filterRecentArticles()
  ├─ Slug + excerpt                    ├─ filterProcessedArticles()
  ├─ DB insert                         ├─ quickTechFilter()
  └─ createBotLog                      ├─ generateArticle()
                                         │   ├─ translateAndRewrite()
                                         │   ├─ qualityCheck()
                                         │   └─ optimizeSEO()
                                         ├─ classifyCategory()
                                         ├─ publishArticle()
                                         │   ├─ tag upsert
                                         │   └─ articleTag create
                                         ├─ TRENDING_TOPICS loop
                                         ├─ FACTORY_TOPICS loop
                                         ├─ updateSourceFetchTime()
                                         └─ createBotLog()
```

---

## 7. Token Maliyet Karşılaştırması

| | `auto-bot.js` | `services/bot/` |
|---|--------------|----------------|
| **Makale başına API çağrısı** | 2 | 4 |
| **Çeviri token** | 2048 max | 4096 max |
| **Kalite token** | — | 4096 max |
| **SEO token** | — | JSON mode |
| **Kategori token** | 30 max | 50 max |
| **Trend içerik token** | — | 4096 max |
| **Tahmini maliyet/makale** | ~$0.002 | ~$0.008 |
| **Günlük (300 haber)** | ~$0.60 | ~$2.40 |

---

## 8. Birleştirme Stratejisi

### Hedef: Tek kaynak kod, iki çıktı (TypeScript modül + CommonJS production build)

### Strateji A: TS → JS Build (Önerilen)

```
services/bot/ (tek kaynak)
    ├─ index.ts          ← Orchestrator
    ├─ fetcher.ts        ← RSS + Web scraping
    ├─ generator.ts      ← 3-stage AI pipeline
    ├─ prompts.ts        ← Tüm prompt'lar + filtreler
    ├─ publisher.ts      ← DB işlemleri
    └─ trigger.ts        ← CLI entry

Build süreci:
    npx tsc services/bot/ → dist/bot.js (CommonJS)
    VEYA
    npx esbuild services/bot/index.ts → dist/bot.js (tek dosya, CommonJS)

Docker:
    COPY --from=builder /app/dist/bot.js ./
    CMD ["node", "bot.js"]
```

### Strateji B: Feature Flag'li Tek Dosya

`auto-bot.js`'i `services/bot/`'un birebir CommonJS kopyası yap.  
Tüm özellikler JS'te de olsun. `tsx` gereksinimi ortadan kalksın.

### Strateji C: Hybrid (Kısa Vadeli)

1. `services/bot/`'u koru (admin panel trigger için)
2. `auto-bot.js`'i `services/bot/`'un build çıktısı yap
3. Build script: `esbuild src/services/bot/index.ts --bundle --platform=node --outfile=auto-bot.js`

---

## 9. Adım Adım Birleştirme Planı

| Adım | Görev | Tahmini Süre | Risk |
|------|-------|-------------|------|
| 1 | `auto-bot.js`'e **kalite kontrolü** ekle | 1 saat | Düşük |
| 2 | `auto-bot.js`'e **SEO optimizasyonu** ekle | 2 saat | Orta |
| 3 | `auto-bot.js`'e **tag yönetimi** ekle | 1 saat | Düşük |
| 4 | `auto-bot.js`'e **web scraping** ekle | 2 saat | Orta |
| 5 | `auto-bot.js`'e **48 saat filtresi** ekle | 0.5 saat | Düşük |
| 6 | `auto-bot.js`'e **SEO Trend + Fabrika** ekle | 3 saat | Yüksek |
| 7 | `auto-bot.js` prompt'larını TS bot ile aynı yap | 1 saat | Düşük |
| 8 | `services/bot/`'a **CommonJS build** ekle (`esbuild`) | 1 saat | Düşük |
| 9 | `auto-bot.js`'i sil, build çıktısını kullan | 0.5 saat | Orta |
| 10 | Test: İki bot aynı çıktıyı üretiyor mu? | 2 saat | Düşük |

**Toplam tahmini süre: ~14 saat (2 iş günü)**

---

## 10. Öneri

**Strateji A + C (Hybrid Build)** önerilir:

1. `services/bot/` TypeScript kaynak olarak kalsın — tüm özellikler burada geliştirilsin
2. `esbuild` ile `auto-bot.js` otomatik üretilsin (build script)
3. `package.json`'a `"build:bot": "esbuild src/services/bot/index.ts --bundle --platform=node --outfile=auto-bot.js"` eklensin
4. `auto-bot.js` artık manuel edit'lenmesin, her zaman build çıktısı olsun

Bu yaklaşım:
- ✅ Tek kod tabanı (DRY)
- ✅ TypeScript tip güvenliği
- ✅ Production'da `tsx` gerektirmez
- ✅ Admin panel trigger ile aynı kodu kullanır
- ✅ Gelecekteki özellikler otomatik iki tarafa da yansır
