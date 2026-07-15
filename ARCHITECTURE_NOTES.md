# ARCHITECTURE_NOTES.md

## Content Engine

## Content Lifecycle

```
Draft → AI Generated → Editor Review → SEO Optimized → Fact Checked → Ready → Published
  ↓           ↓              ↓               ↓                ↓           ↓          ↓
  └───────────┴──────────────┴───────────────┴────────────────┴───────────┘          │
                                     Herhangi bir aşamadan Draft'a dönülebilir        │
                                                                                      │
                              Published → Updated → Published                          │
                                  ↓                                                   │
                              Archived → Published                                     │
                                  ↓                                                   │
                              Deleted (son durum)                                       │
```

## Status Transition Rules

| From | To | Rol | Kural |
|------|----|----|-------|
| Herhangi | Draft | editor | Geri çekme |
| Herhangi | Deleted | admin | Silme |
| Draft/Ready dışı | Published | — | **ENGELLİ** (önce Ready olmalı) |
| Ready | Published | admin | Son onay admin'de |
| Published | Updated | editor | Güncelleme |
| Published | Archived | admin | Arşivleme |

## Module Yapısı

```
services/content/          ← Content Engine
├── types.ts               # Status enum, metadata, workflow types
├── status.ts              # State machine: 24 transition rule
├── metadata.ts            # Reading time, word count, 6 skor tipi
├── workflow.ts            # Workflow event logger
├── lifecycle.ts           # Lifecycle manager (hooks)
├── tags.ts                # Tag engine (AI suggestions)
├── categories.ts          # Category engine
├── content-types.ts       # 9 içerik tipi (sadece News aktif)
└── index.ts               # Barrel exports
```

## AI Core Entegrasyonu

- `lifecycle.onAiGenerated()` — AI içerik ürettiğinde metadata oluşturur
- `tags.suggestTagsFromAI()` — AI yanıtından etiket çıkarır
- `metadata.buildMetadata()` — AI provider/version tracking

---

## Entity Intelligence Engine

```
services/entity/
├── types.ts       # 27 entity tipi, extraction, resolution, scoring
├── config.ts      # Model, confidence thresholds, known aliases
├── registry.ts    # In-memory entity store + type index
├── resolver.ts    # Pipeline: exact → alias → slug → fuzzy
├── extractor.ts   # AI-powered entity extraction (JSON mode)
├── scoring.ts     # Weighted: confidence 35% + frequency 25% + relevance 25% + authority 15%
├── service.ts     # Main service: analyzeArticle(), findEntity()
├── prompts.ts     # NER extraction prompt
└── index.ts       # Barrel exports
```

### AI Core Integration
- `extractor.ts` → `ai.chatJSON()` ile entity çıkarımı
- JSON mode + type normalization + confidence filtering

### Content Engine Integration
- `analyzeArticle(title, content)` — makale entity'lerini analiz eder
- Gelecek: SEO tag'leri, GEO metadata, related articles, internal linking

---

## GEO Intelligence Engine

```
services/geo/
├── types.ts              # 8 platform, GEO score (8 boyut), analysis, citation, metadata
├── config.ts             # Platform weights, thresholds, readability config
├── engine/
│   └── index.ts          # analyzeArticleGEO() — tek çağrıda tam analiz
├── analysis/
│   └── index.ts          # Clarity, entity coverage, authority, structure, readability
├── scoring/
│   └── calculator.ts     # Ağırlıklı GEO skor hesaplama (8 boyut)
├── metadata/
│   └── generator.ts      # AI metadata: complexity, depth, freshness, authority
├── validators/
│   └── geo-validator.ts  # GEO uyumluluk kontrolü
├── models/
│   ├── citation.ts       # Kaynak gösterme modeli
│   ├── summary.ts        # Platform bazlı AI özet modeli
│   └── takeaways.ts      # Key takeaways + related questions
└── index.ts              # Barrel exports
```

### Desteklenen Platformlar (8)
ChatGPT, Google AI Overview, Gemini, Claude, Perplexity, Microsoft Copilot, Brave Search AI, You.com

### GEO Score Boyutları (8)
Entity, Authority, Freshness, Citation, Semantic, Answer, Trust, AI Readability

### Kullanım
```typescript
import { analyzeArticleGEO } from "@/services/geo";
const report = analyzeArticleGEO({ content, entityCount: 12 });
// → { analysis, score, metadata, validation, scoreLevel }
```

---

## AI Workspace (Editor Dashboard)

```
admin/haberler/[id]/workspace/
├── page.tsx              # Server component — article + categories + authors
├── EditorWorkspace.tsx   # Tab-based layout (6 panel)
└── components/
    ├── ArticleEditor.tsx  # Content editor panel (title, content, meta, sidebar)
    ├── AiPanel.tsx        # AI analysis (word count, reading time, tokens, source)
    ├── SeoPanel.tsx       # SEO score + meta title/desc/canonical checks
    ├── GeoPanel.tsx       # GEO score bars (8 dimension) + content signals
    ├── EntityPanel.tsx    # Entity categories (person, company, product, ...)
    ├── PublishPanel.tsx   # Workflow stage + visibility + dates + view count
    └── ArticleInfo.tsx    # Bottom bar (word count, read time, dates, views)
```

### Panels (6 tabs)
| Tab | İçerik |
|-----|--------|
| ✏️ Editör | Başlık, içerik, kategori, yazar, etiket, SEO form |
| 🤖 AI | Word count, reading time, tokens, AI model, source |
| 🔍 SEO | Meta title/desc/canonical, SEO score bar |
| 🌐 GEO | 8 boyutlu GEO skor, content sinyalleri |
| 🏷️ Entity | 9 entity kategorisi + boş durum |
| 🚀 Yayın | Workflow stage, status, tarihler, view count |

### Route: `/admin/haberler/[id]/workspace`

---

## AI Newsroom — Verification Agent v1

```
services/agents/verification/
├── index.ts              # Ana servis — verify(research) → verification.json
├── types.ts              # VerificationResult, ResearchInput, 15+ tip
├── constants.ts           # Skor ağırlıkları, eşik değerleri, referans listeleri
├── source-checker.ts      # Kaynak güvenilirliği (resmi/bağımsız/güven skoru)
├── date-checker.ts        # Tarih doğrulama (güncel/eski/tekrar/saat dilimi)
├── entity-checker.ts      # Entity doğrulama (şirket/ürün/kişi/model isimleri)
├── technical-checker.ts   # Teknik doğruluk (API/framework/dil/sürüm/benchmark)
├── number-checker.ts      # Sayısal veri kontrolü (fiyat/yüzde/kapasite/perf)
├── link-checker.ts        # URL/link kontrolü (format/domain/erişilebilirlik)
├── duplicate-checker.ts   # İçerik benzerliği (DB sorgusu, Jaccard skoru)
├── conflict-analyzer.ts   # Kaynak çelişki analizi (sayısal/sürüm/tarih/timeline)
└── scorer.ts              # 6 boyutlu skor + VERIFICATION STATUS belirleme
```

### 8 Kontrol Modülü
| Modül | Kontrol |
|-------|---------|
| **Source Checker** | ≥2 bağımsız kaynak, resmi kaynak, güven skoru ≥40 |
| **Date Checker** | Güncellik (24/72 saat), eskime (7 gün), tekrar (30 gün), saat dilimi |
| **Entity Checker** | 27 entity tipi referans karşılaştırması, fuzzy matching |
| **Technical Checker** | API/framework/dil/OS/donanım referans listeleri |
| **Number Checker** | Fiyat, yüzde, kapasite, performans — şüpheli değer tespiti |
| **Link Checker** | URL format, domain güvenilirliği, protokol kontrolü |
| **Duplicate Checker** | Prisma DB sorgusu, Jaccard benzerlik (%85+ dupe, %60+ uyarı) |
| **Conflict Analyzer** | Sayısal çelişki (%20+), sürüm/tarih/timeline çelişkisi |

### 6 Karar Durumu
`VERIFIED` (≥85) → `LIKELY_VERIFIED` (≥70) → `NEEDS_EDITOR_REVIEW` (≥50) → `INSUFFICIENT_EVIDENCE` (≥30) → `CONFLICTING_INFORMATION` → `REJECT` (<30)

### Skor Ağırlıkları
Source %25 | Fact %20 | Consistency %20 | Entity %15 | Freshness %10 | Technical %10

### Kullanım
```typescript
import { verify, execute, dryRun } from "@/services/agents/verification";
const result = await verify(researchJson);
// → { status: "VERIFIED", confidence: 96, verificationScore: 94, ... }
```

### Dökümantasyon
- `VERIFICATION_AGENT.md` — Tam kullanım kılavuzu
- `example-verification.json` — Örnek çıktı

---

## AI Newsroom — Writer Agent v1

```
services/agents/writer/
├── index.ts              # Ana servis — write(research, verification) → article.md
├── types.ts              # WriterResult, TitleOption, SectionContent, QualityCheck
├── prompts.ts            # 6 AI prompt seti (başlık, yazım, kalite, görsel, link)
├── headline-writer.ts    # 5 başlık üretici (5 stil) + SEO skor + doğrulayıcı
├── content-writer.ts     # AI ile özgün yazım + verification ön kontrol + fallback
├── quality-checker.ts    # 8 boyutlu kalite kontrolü (başlık, tekrar, robotik, tarafsızlık)
├── image-suggester.ts    # 6 görsel tipi önerisi (AI + fallback)
└── link-suggester.ts     # 30+ topic mapping, entity bazlı iç link adayları
```

### Haber Yapısı (7 Bölüm)
Giriş (5N1K) → Ana Gelişme → Teknik Ayrıntılar → Kullanıcı Etkisi → Önceki Durum → Uzman Değerlendirmesi → Sonuç

### Ön Kontrol
VERIFIED/LIKELY_VERIFIED → yaz | NEEDS_EDITOR_REVIEW → yaz (düşük güven) | INSUFFICIENT_EVIDENCE/CONFLICT/REJECT → engelle

### Kalite Kontrolü (8 Boyut)
Başlık doğruluğu, tekrar, gereksiz paragraf, Türkçe karakter, robotik ifade, tarafsızlık, kaynaksız iddia, teknik hata

### Kullanım
```typescript
import { write } from "@/services/agents/writer";
const result = await write(researchJson, verificationJson);
// → { article, titleOptions, excerpt, summary, imageSuggestions, internalLinkCandidates }
```

### Dökümantasyon
- `WRITER_AGENT.md` — Tam kullanım kılavuzu
- `example-article.md` — Örnek makale
- `example-title-options.json` — Örnek başlık alternatifleri
- `example-summary.txt` — Örnek özet

