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

