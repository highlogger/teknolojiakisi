# Agent Kaydı

AI Newsroom pipeline'ındaki tüm agent'ların kaydı.

---

## Writer Agent
| Alan | Değer |
|------|-------|
| **Klasör** | `services/agents/writer/` (8 dosya) |
| **Versiyon** | 1.0.0 |
| **Durum** | ✅ Kod hazır, ⏳ orchestrator bekliyor |
| **Görevi** | Research + Verification → özgün Türkçe haber yaz |
| **Girdi** | `research.json` + `verification.json` |
| **Çıktı** | `article.md`, `title_options.json`, `excerpt.txt`, `summary.txt`, `image_suggestions.json`, `internal_link_candidates.json` |
| **Sonraki** | SEO Agent |
| **AI** | AI Core Engine (headline-writer, content-writer) |
| **Ön Kontrol** | verification.status REJECT/CONFLICT → yazımı engeller |
| **Yapı** | 7 bölüm (Giriş, Ana Gelişme, Teknik, Kullanıcı, Önceki, Uzman, Sonuç) |
| **Kalite** | 8 boyutlu otomatik kontrol |

---

## SEO Agent
| Alan | Değer |
|------|-------|
| **Klasör** | `services/agents/seo/` (3 dosya) |
| **Versiyon** | 1.0.0 |
| **Durum** | ✅ Kod hazır, ⏳ orchestrator bekliyor |
| **Görevi** | Article → eksiksiz SEO/metadata paketi |
| **Girdi** | `article.md` + `research.json` + `entities.json` |
| **Çıktı** | `seo.json`, `metadata.json`, `schema.json`, `open_graph.json`, `twitter_card.json`, `news_metadata.json`, `structured_data.json`, `breadcrumbs.json`, `featured_snippet.json`, `validation_report.json` |
| **Sonraki** | Editor-in-Chief Agent |
| **Schema** | NewsArticle, BreadcrumbList, Organization, WebSite |
| **SEO Score** | Validation %60 + Verification Score %40 |

---

## Publisher Agent
| Alan | Değer |
|------|-------|
| **Klasör** | `services/agents/publisher/` (1 dosya) |
| **Versiyon** | 1.0.0 |
| **Durum** | ✅ Kod hazır, ⏳ orchestrator bekliyor |
| **Görevi** | Tüm çıktıları doğrula → güvenli yayın |
| **Girdi** | Tüm agent çıktıları + `editor_review.json` |
| **Çıktı** | `publication_report.json`, `publish_log.json`, `workflow_state.json` |
| **Sonraki** | — (son aşama) |
| **Modlar** | Immediate, Scheduled, Manual Approval, Dry Run |
| **Kontroller** | 9 pre-flight check |
| **DB** | Prisma (transaction + BotLog) |

---

## Editor-in-Chief Agent
| Alan | Değer |
|------|-------|
| **Klasör** | `services/agents/editor-in-chief/` (1 dosya) |
| **Versiyon** | 1.0.0 |
| **Durum** | ✅ Kod hazır, ⏳ orchestrator bekliyor |
| **Görevi** | SON KARAR — tüm çıktıları değerlendir |
| **Girdi** | Tüm agent çıktıları |
| **Çıktı** | `editor_review.json` |
| **Sonraki** | Publisher Agent |
| **Kontroller** | 20 editoryal kontrol |
| **Skor** | 13 boyutlu |
| **Kararlar** | APPROVED, MINOR_REVISION, MAJOR_REVISION, REJECTED |
| **Öncelik** | Breaking, High, Normal, Low, Evergreen |

---

## Eksik Agent'lar

### Research Agent
- **Durum:** ❌ Yazılmadı
- **Not:** Mevcut `bot/fetcher.ts` geçici olarak kullanılabilir

### Orchestrator
- **Durum:** ❌ Yazılmadı
- **Görevi:** Tüm agent'ları zincirleme: Research → Verification → Writer → SEO → Editor → Publisher
- **Kritiklik:** P0 — tüm agent'lar hazır, sadece zincirlenmeleri gerekiyor

---

## Agent Interface

Tüm agent'lar ortak interface'i implemente eder:

```typescript
// services/agents/base/types.ts
interface AgentInterface {
  readonly name: string;
  readonly version: string;
  execute(input: AgentInput): Promise<AgentOutput>;
  dryRun(input: AgentInput): Promise<AgentOutput>;
}

interface AgentInput {
  inputs: Record<string, unknown>;
  config?: Record<string, unknown>;
}

interface AgentOutput {
  success: boolean;
  outputs: Record<string, unknown>;
  summary: { status: string; score?: number; confidence?: number; warnings: string[]; errors: string[] };
  duration: number;
}
```
