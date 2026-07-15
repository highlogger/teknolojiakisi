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

