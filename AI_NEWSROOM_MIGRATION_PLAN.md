# AI NEWSROOM MIGRATION PLAN

## TeknolojiAkışı — Mevcut Bottan AI Newsroom Mimarisine Geçiş Planı

**Tarih:** 15 Temmuz 2026
**Hazırlayan:** Principal Software Architect
**Versiyon:** 1.0

---

## İçindekiler

1. [Yönetici Özeti](#1-yönetici-özeti)
2. [Geçiş Stratejisi](#2-geçiş-stratejisi)
3. [Faz 0: Altyapı Hazırlığı](#3-faz-0-altyapı-hazırlığı)
4. [Faz 1: Agent Geliştirme](#4-faz-1-agent-geliştirme)
5. [Faz 2: Entegrasyon](#5-faz-2-entegrasyon)
6. [Faz 3: Test ve Canlıya Alma](#6-faz-3-test-ve-canlıya-alma)
7. [Risk Yönetimi](#7-risk-yönetimi)
8. [Kontrat Tanımları](#8-kontrat-tanımları)
9. [Başarı Metrikleri](#9-başarı-metrikleri)

---

## 1. Yönetici Özeti

### Mevcut Durum

TeknolojiAkışı, günde ~300 teknoloji haberi üreten AI destekli bir haber platformudur. Mevcut sistem iki paralel bot (`auto-bot.js` ve `services/bot/`) ile çalışmakta, ancak:

- ❌ **Doğrulama katmanı yok** — haberler doğrulanmadan yayınlanıyor
- ❌ **Editöryal kontrol yok** — kalite standardı tutarsız
- ❌ **Kod tekrarı var** — iki bot sistemi arasında %60 tekrar
- ❌ **Yapılandırılmış çıktı yok** — agent'lar arası standart kontrat yok

### Hedef

6 bağımsız AI agent'tan oluşan AI Newsroom pipeline'ı:
**Research → Verify → Write → SEO → Editor Review → Publish**

### Yaklaşım

**Strangler Fig Pattern** — mevcut sistemi kademeli olarak değiştir:
1. Yeni agent'ları bağımsız servisler olarak yaz
2. Mevcut bot ile paralel çalıştır
3. Yeni pipeline'ı test et
4. Eski botu kaldır

### Süre Tahmini

**Toplam: 8-12 iş günü** (fazlara göre dağılım aşağıda)

---

## 2. Geçiş Stratejisi

### Strangler Fig Pattern — Adım Adım

```
ADIM 1: Mevcut Sistem (Hiçbir şey değişmez)
┌──────────────────────────────────────────┐
│  auto-bot.js  +  services/bot/           │
│  RSS → Filter → AI → Publish             │
│  (çalışmaya devam eder)                  │
└──────────────────────────────────────────┘

ADIM 2: Agent'ları Paralel Geliştir
┌──────────────────────────────────────────┐
│  auto-bot.js  +  services/bot/           │  ← Değişmez
│  (çalışmaya devam eder)                  │
├──────────────────────────────────────────┤
│  services/agents/                        │  ← Yeni kod
│  ├── verification/   (Task-003)          │
│  ├── writer/         (Task-004)          │
│  ├── seo/            (Task-005)          │
│  ├── publisher/      (Task-006)          │
│  └── editor-in-chief/(Task-007)          │
└──────────────────────────────────────────┘

ADIM 3: Orchestrator ile Entegre Et
┌──────────────────────────────────────────┐
│  auto-bot.js (yedek)                     │  ← Yedekte kalır
├──────────────────────────────────────────┤
│  services/agents/orchestrator.ts         │  ← Yeni ana sistem
│  Research → Verify → Write → SEO →       │
│  Editor → Publish                        │
└──────────────────────────────────────────┘

ADIM 4: Eski Sistemi Kaldır
┌──────────────────────────────────────────┐
│  services/agents/orchestrator.ts         │  ← Tek sistem
│  + services/agents/* (6 agent)           │
│  auto-bot.js → build çıktısı olur        │
└──────────────────────────────────────────┘
```

---

## 3. Faz 0: Altyapı Hazırlığı

**Süre:** 1-2 iş günü
**Risk:** Düşük
**Mevcut sisteme etki:** Yok (sadece ekleme)

### 3.1 Agent Base Interface

```typescript
// services/agents/base/types.ts
export interface AgentInput {
  /** Önceki agent'ların çıktı dosyalarının path'leri */
  inputs: Record<string, string>;
  /** Agent'a özel konfigürasyon */
  config?: Record<string, unknown>;
}

export interface AgentOutput {
  /** Agent başarılı mı? */
  success: boolean;
  /** Çıktı dosyalarının path'leri */
  outputs: Record<string, string>;
  /** JSON olarak sonuç (standart alanlar) */
  summary: {
    status: string;
    score?: number;
    confidence?: number;
    warnings: string[];
    errors: string[];
  };
  /** Süre (ms) */
  duration: number;
}

export interface AgentInterface {
  readonly name: string;
  readonly version: string;
  execute(input: AgentInput): Promise<AgentOutput>;
  dryRun(input: AgentInput): Promise<AgentOutput>;
}
```

### 3.2 Prompt Store

Tüm prompt'ları `services/bot/prompts.ts`'ten çıkarıp ayrı dosyalara taşı:

```
services/agents/prompts/
├── research.ts        # Research agent prompt'ları
├── verification.ts    # Verification agent prompt'ları
├── writer.ts          # Writer agent prompt'ları
├── seo.ts             # SEO agent prompt'ları
├── publisher.ts       # Publisher agent prompt'ları
└── editor-in-chief.ts # Editor-in-chief agent prompt'ları
```

### 3.3 Workflow Store — In-Memory'den DB'ye

Prisma'ya `WorkflowEvent` modeli ekle:

```prisma
model WorkflowEvent {
  id          String   @id @default(cuid())
  articleId   String   @map("article_id")
  agentName   String   @map("agent_name")
  fromStatus  String?  @map("from_status")
  toStatus    String   @map("to_status")
  actor       String
  note        String?
  metadata    String?  // JSON string
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([articleId])
  @@map("workflow_events")
}
```

### 3.4 Dizin Yapısı

```
services/agents/
├── base/
│   ├── types.ts          # Agent interface + input/output types
│   └── index.ts
├── prompts/              # Tüm agent prompt'ları
│   ├── research.ts
│   ├── verification.ts
│   ├── writer.ts
│   ├── seo.ts
│   ├── publisher.ts
│   └── editor-in-chief.ts
├── research/             # Task-002 (Faz 2'de)
├── verification/         # Task-003
├── writer/               # Task-004
├── seo/                  # Task-005
├── publisher/            # Task-006
├── editor-in-chief/      # Task-007
└── orchestrator.ts       # Faz 2'de
```

---

## 4. Faz 1: Agent Geliştirme

**Süre:** 3-5 iş günü
**Risk:** Düşük (mevcut sisteme dokunmaz)
**Yaklaşım:** Her agent bağımsız bir TypeScript servisi olarak geliştirilir

### 4.1 TASK-003: Verification Agent

**Öncelik:** P0 (En kritik)
**Süre:** 1 iş günü
**Mevcut kodu kullanır:** Entity Engine (`services/entity/`), `fetcher.ts` duplicate kontrolü

```
services/agents/verification/
├── index.ts           # Ana servis — verify(researchJson) → verification.json
├── source-checker.ts  # Kaynak güvenilirliği kontrolü
├── date-checker.ts    # Tarih doğrulama, eski haber tespiti
├── entity-checker.ts  # Entity Engine ile entity doğrulama
├── technical-checker.ts # API/model/benchmark doğrulaması
├── number-checker.ts  # Sayısal veri kontrolü
├── link-checker.ts    # URL durumu kontrolü (axios HEAD)
├── duplicate-checker.ts # İçerik benzerliği kontrolü
├── conflict-analyzer.ts # Kaynaklar arası çelişki analizi
├── scorer.ts          # Güven skoru hesaplama (6 boyut)
├── types.ts           # Verification tipleri
├── prompts.ts         # Verification prompt'ları
├── constants.ts       # Eşik değerleri, güven skoru ağırlıkları
└── README.md          # Kullanım dokümantasyonu
```

**Kontrat:**
- **Input:** `research.json`
- **Output:** `verification.json`
- **Status değerleri:** `VERIFIED | LIKELY_VERIFIED | NEEDS_EDITOR_REVIEW | INSUFFICIENT_EVIDENCE | CONFLICTING_INFORMATION | REJECT`

### 4.2 TASK-004: Writer Agent

**Öncelik:** P1
**Süre:** 1 iş günü
**Mevcut kodu kullanır:** `generator.ts` translateAndRewrite, qualityCheck

```
services/agents/writer/
├── index.ts           # Ana servis — write(research, verification) → article.md
├── headline-writer.ts # 5 alternatif başlık üretici
├── content-writer.ts  # Ana içerik yazımı (research'e dayalı)
├── structure-builder.ts # Haber yapısı oluşturucu (9 bölüm)
├── quality-checker.ts # Kalite kontrolü (mevcut qualityCheck dönüşümü)
├── image-suggester.ts # Görsel önerileri
├── link-suggester.ts  # İç link önerileri
├── types.ts           # Writer tipleri
├── prompts.ts         # Writer prompt'ları (gazetecilik kuralları)
└── README.md
```

**Kontrat:**
- **Input:** `research.json` + `verification.json`
- **Output:** `article.md`, `title_options.json`, `excerpt.txt`, `summary.txt`, `image_suggestions.json`, `internal_link_candidates.json`

### 4.3 TASK-005: SEO & Metadata Agent

**Öncelik:** P1
**Süre:** 1 iş günü
**Mevcut kodu kullanır:** `lib/seo.tsx` (tüm JSON-LD), `services/geo/`, `services/entity/`, `services/publisher/validator.ts`

```
services/agents/seo/
├── index.ts              # Ana servis
├── seo-analyzer.ts       # SEO skor hesaplama
├── metadata-generator.ts # Tüm metadata üretimi (seo.json, metadata.json)
├── schema-generator.ts   # JSON-LD üretimi (mevcut SEO lib wrapper)
├── og-generator.ts       # Open Graph + Twitter Card
├── news-metadata.ts      # Google News özel metadata
├── discover-metadata.ts  # Google Discover özel metadata
├── breadcrumb-generator.ts # Breadcrumb yapısı
├── featured-snippet.ts   # Featured snippet adayı
├── internal-link-matcher.ts # Internal link eşleştirme
├── validator.ts          # SEO validation (title length, desc length, schema)
├── scorer.ts             # Overall SEO Score
├── types.ts
├── prompts.ts
└── README.md
```

**Kontrat:**
- **Input:** `article.md` + `research.json` + `verification.json` + `entities.json`
- **Output:** `seo.json`, `metadata.json`, `schema.json`, `structured_data.json`, `breadcrumbs.json`, `news_metadata.json`, `open_graph.json`, `twitter_card.json`, `featured_snippet.json`, `validation_report.json`

### 4.4 TASK-006: Publisher Agent

**Öncelik:** P2
**Süre:** 1 iş günü
**Mevcut kodu kullanır:** `services/content/` (state machine, lifecycle), `publisher.ts` (DB işlemleri)

```
services/agents/publisher/
├── index.ts              # Ana servis
├── preflight-checker.ts  # Yayın öncesi tüm kontroller
├── workflow-manager.ts   # Workflow state machine (Content Engine wrapper)
├── url-manager.ts        # Slug unique, 301 kontrolü
├── publisher-modes.ts    # Immediate, Scheduled, Manual, Dry Run
├── transaction-manager.ts # Rollback desteği
├── cache-manager.ts      # Revalidation event'leri
├── event-emitter.ts      # ARTICLE_PUBLISHED vs event'leri
├── sitemap-notifier.ts   # Sitemap güncelleme event'leri
├── logger.ts             # Publish loglama
├── types.ts
└── README.md
```

**Kontrat:**
- **Input:** Tüm önceki agent çıktıları + `editor_review.json`
- **Output:** `publication_report.json`, `publish_log.json`, `publish_events.json`, `workflow_state.json`

### 4.5 TASK-007: Editor-in-Chief Agent

**Öncelik:** P0 (En kritik)
**Süre:** 1 iş günü
**Mevcut kodu kullanır:** Yok (tamamen sıfırdan)

```
services/agents/editor-in-chief/
├── index.ts              # Ana servis
├── news-value-checker.ts # Haber değeri değerlendirmesi
├── originality-checker.ts # Özgünlük / daha önce işlendi mi?
├── headline-reviewer.ts  # Başlık kalitesi (clickbait, abartı kontrolü)
├── content-reviewer.ts   # İçerik kalitesi (tekrar, uzatma, yapı)
├── source-reviewer.ts    # Kaynak yeterliliği (min 2 bağımsız)
├── technical-reviewer.ts # Teknik doğruluk değerlendirmesi
├── neutrality-checker.ts # Tarafsızlık kontrolü
├── seo-reviewer.ts       # SEO doğallığı (keyword stuffing)
├── market-reviewer.ts    # Türkiye okuyucusu için değer
├── image-reviewer.ts     # Kapak görseli uygunluğu
├── scorer.ts             # 13 boyutlu editoryal skor
├── decision-engine.ts    # APPROVED / MINOR_REVISION / MAJOR_REVISION / REJECTED
├── priority-assigner.ts  # Breaking / High / Normal / Low / Evergreen
├── performance-estimator.ts # CTR, Discover, Organik tahmini
├── types.ts
├── prompts.ts
└── README.md
```

**Kontrat:**
- **Input:** Tüm önceki agent çıktıları (`research.json`, `verification.json`, `article.md`, `seo.json`, `metadata.json`, `entities.json`, `publication_report.json`)
- **Output:** `editor_review.json`

---

## 5. Faz 2: Entegrasyon

**Süre:** 2-3 iş günü
**Risk:** Orta

### 5.1 Research Agent (Task-002)

Mevcut `fetcher.ts` + `generator.ts` bir kısmını kullanarak Research Agent oluştur:

```
services/agents/research/
├── index.ts           # Ana servis
├── fetcher.ts         # Mevcut fetcher.ts wrapper
├── deep-researcher.ts # Web araması, çoklu kaynak taraması
├── aggregator.ts      # Çoklu kaynaktan bilgi birleştirme
├── timeline-builder.ts # Zaman çizelgesi oluşturma
├── entity-extractor.ts # Entity Engine wrapper
├── types.ts
├── prompts.ts
└── README.md
```

### 5.2 Pipeline Orchestrator

```typescript
// services/agents/orchestrator.ts
export async function runNewsroomPipeline(
  source: Source,
  options?: PipelineOptions
): Promise<PipelineResult> {
  // Adım 1: Research
  const research = await researchAgent.execute({ source });
  if (!research.success) return fail("research_failed", research);

  // Adım 2: Verification
  const verification = await verificationAgent.execute({
    inputs: { research: research.outputs.research }
  });
  if (verification.summary.status === "REJECT") {
    return fail("verification_rejected", verification);
  }

  // Adım 3: Writer
  const writer = await writerAgent.execute({
    inputs: {
      research: research.outputs.research,
      verification: verification.outputs.verification
    }
  });

  // Adım 4: SEO
  const seo = await seoAgent.execute({
    inputs: {
      article: writer.outputs.article,
      research: research.outputs.research,
      verification: verification.outputs.verification
    }
  });

  // Adım 5: Editor-in-Chief
  const editor = await editorInChiefAgent.execute({
    inputs: {
      research: research.outputs.research,
      verification: verification.outputs.verification,
      article: writer.outputs.article,
      seo: seo.outputs.seo
    }
  });

  if (editor.summary.status === "REJECTED") {
    return fail("editor_rejected", editor);
  }

  // Adım 6: Publisher (sadece APPROVED ise)
  if (editor.summary.status === "APPROVED") {
    const publish = await publisherAgent.execute({
      inputs: {
        article: writer.outputs.article,
        seo: seo.outputs.seo,
        editor: editor.outputs.review
      },
      config: { mode: options?.publishMode || "draft" }
    });
    return { success: true, stages: { research, verification, writer, seo, editor, publish } };
  }

  return { success: false, stages: { research, verification, writer, seo, editor } };
}
```

### 5.3 auto-bot.js Dönüşümü

```javascript
// auto-bot.js — Build çıktısı olarak üretilecek
// package.json build script:
// "build:bot": "esbuild src/services/agents/orchestrator.ts --bundle --platform=node --outfile=auto-bot.js --external:@prisma/client --external:rss-parser --external:axios --external:cheerio"
```

### 5.4 Admin Panel Güncellemeleri

Admin Workspace'e eklenecek yeni paneller:

| Panel | İçerik |
|-------|--------|
| 🔍 **Research** | Kaynaklar, bulgular, timeline |
| ✅ **Verification** | Doğrulama sonuçları, güven skoru, warning'ler |
| ✍️ **Writer** | Başlık alternatifleri, içerik, quality score |
| 🚀 **SEO** | SEO skoru, metadata, schema önizleme |
| 👑 **Editor** | Editöryal skor, karar, revizyon notları |
| 📰 **Publish** | Workflow state, publish log, event'ler |

---

## 6. Faz 3: Test ve Canlıya Alma

**Süre:** 2-3 iş günü
**Risk:** Orta-Yüksek

### 6.1 Test Stratejisi

| Test Türü | Kapsam |
|-----------|--------|
| **Birim Testi** | Her agent bağımsız test edilir (mock input ile) |
| **Entegrasyon Testi** | Pipeline zinciri Dry Run modunda test edilir |
| **Dry Run** | Gerçek kaynaklarla pipeline çalıştırılır, publish edilmez |
| **A/B Test** | Eski bot + yeni pipeline paralel çalışır, çıktılar karşılaştırılır |
| **Manual Review** | Yeni pipeline çıktıları manuel editör kontrolünden geçer |

### 6.2 Canlıya Alma Adımları

```
1. Dry Run testleri (1 gün)
   └─ Gerçek kaynaklarla, publish kapalı

2. Paralel çalıştırma (2 gün)
   ├─ Eski bot: çalışmaya devam (primary)
   └─ Yeni pipeline: dry run veya draft modunda

3. Kademeli geçiş (1 gün)
   ├─ Yeni pipeline: auto-publish açık (önce %25 kaynak)
   ├─ Eski bot: kalan %75 kaynak
   └─ Monitoring

4. Tam geçiş (1 gün)
   ├─ Yeni pipeline: tüm kaynaklar
   └─ Eski bot: durdurulur

5. Rollback planı
   └─ Eski bot hemen tekrar başlatılabilir (sıcak yedek)
```

---

## 7. Risk Yönetimi

### Risk Matrisi

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| **AI maliyeti artışı** | Yüksek | Orta | Token limitleri, batch processing, caching |
| **Pipeline süresi uzun** | Orta | Orta | Paralel agent çalıştırma, timeout yönetimi |
| **Agent uyumsuz JSON çıktısı** | Yüksek | Düşük | Validation + fallback, retry mekanizması |
| **Production kesintisi** | Düşük | Yüksek | Eski bot sıcak yedek, kademeli geçiş |
| **DeepSeek API downtime** | Orta | Yüksek | Multi-provider desteği ekle (Faz 2) |
| **Verification false positive** | Orta | Yüksek | Human-in-the-loop (Editor-in-Chief) |

### Rollback Planı

Her aşamada geri dönüş mümkün:
- **Faz 1:** Agent'lar bağımsız, geri dönüş gerektirmez
- **Faz 2:** Orchestrator ayrı process, eski bot çalışmaya devam eder
- **Faz 3:** Eski bot sıcak yedekte, tek komutla geri dönülebilir

---

## 8. Kontrat Tanımları

### Agent'lar Arası Standart JSON Formatları

#### research.json
```json
{
  "version": "1.0",
  "generatedAt": "ISO 8601",
  "source": { "name": "...", "url": "...", "type": "rss|web" },
  "findings": [{
    "section": "overview|technical|timeline|impact|background",
    "content": "...",
    "sources": [{ "url": "...", "name": "...", "type": "official|press|community" }],
    "confidence": 0-100
  }],
  "entities": { "people": [], "companies": [], "products": [], "technologies": [] },
  "timeline": [{ "date": "...", "event": "..." }],
  "relatedTopics": ["..."]
}
```

#### verification.json
```json
{
  "version": "1.0",
  "status": "VERIFIED|LIKELY_VERIFIED|NEEDS_EDITOR_REVIEW|INSUFFICIENT_EVIDENCE|CONFLICTING_INFORMATION|REJECT",
  "confidence": 0-100,
  "verificationScore": 0-100,
  "officialSource": true,
  "independentSources": 4,
  "conflicts": [{ "field": "...", "sourceA": "...", "sourceB": "..." }],
  "warnings": ["..."],
  "missingInformation": ["..."],
  "checks": {
    "sources": true, "dates": true, "entities": true,
    "technical": true, "numbers": true, "links": true,
    "duplicates": true, "consistency": true
  },
  "scores": {
    "sourceScore": 0-100, "factScore": 0-100,
    "consistencyScore": 0-100, "entityScore": 0-100,
    "freshnessScore": 0-100
  }
}
```

#### editor_review.json
```json
{
  "version": "1.0",
  "decision": "APPROVED|MINOR_REVISION|MAJOR_REVISION|REJECTED",
  "confidence": 0-100,
  "editorialScore": 0-100,
  "priority": "breaking|high|normal|low|evergreen",
  "googleNews": "PASS|FAIL|WARN",
  "discover": "PASS|FAIL|WARN",
  "scores": {
    "newsValue": 0-100, "originality": 0-100,
    "sourceQuality": 0-100, "technicalAccuracy": 0-100,
    "readability": 0-100, "seoQuality": 0-100,
    "discoverPotential": 0-100, "googleNewsCompliance": 0-100,
    "userValue": 0-100, "authority": 0-100,
    "headlineQuality": 0-100, "openingQuality": 0-100
  },
  "summary": "...",
  "warnings": ["..."],
  "requiredChanges": [{ "section": "...", "issue": "...", "priority": "high|medium|low" }],
  "estimatedPerformance": {
    "ctr": "low|medium|high",
    "googleNewsPotential": "low|medium|high",
    "discoverPotential": "low|medium|high",
    "organicTrafficPotential": "low|medium|high",
    "evergreenPotential": "low|medium|high"
  }
}
```

---

## 9. Başarı Metrikleri

### Teknik Başarı Kriterleri

| Metrik | Mevcut | Hedef |
|--------|--------|-------|
| **Agent başarı oranı** | N/A | ≥ %90 success rate |
| **Pipeline tamamlanma süresi** | ~15-30 sn/makale | ≤ 60 sn/makale |
| **Kod tekrarı** | %60 (iki bot) | %0 |
| **Test coverage** | %0 | ≥ %60 |
| **Hata yakalama (verification)** | Yok | ≥ %95 false positive önleme |

### Editoryal Başarı Kriterleri

| Metrik | Mevcut | Hedef |
|--------|--------|-------|
| **Doğrulanmış haber oranı** | %0 | ≥ %80 VERIFIED |
| **Editor onay oranı** | Yok | ≥ %70 APPROVED |
| **Revizyon oranı** | Yok | ≤ %20 MINOR_REVISION |
| **Red oranı** | Yok | ≤ %10 REJECTED |
| **SEO skoru** | ~60 | ≥ %85 |
| **Google News uyumluluğu** | ~%70 | ≥ %90 |

---

## Ek A: Görev Özet Tablosu

| Task ID | Görev | Faz | Öncelik | Süre | Risk |
|---------|-------|-----|---------|------|------|
| **TASK-001** | Migration Assessment | 0 | P0 | ✅ Done | 0 |
| **TASK-003** | Verification Agent | 1 | P0 | 1 gün | 0 |
| **TASK-004** | Writer Agent | 1 | P1 | 1 gün | Düşük |
| **TASK-005** | SEO Agent | 1 | P1 | 1 gün | Düşük |
| **TASK-006** | Publisher Agent | 1 | P2 | 1 gün | Düşük |
| **TASK-007** | Editor-in-Chief Agent | 1 | P0 | 1 gün | 0 |
| Research Agent | Research Agent | 2 | P3 | 0.5 gün | Düşük |
| Orchestrator | Pipeline Entegrasyonu | 2 | P1 | 1 gün | Orta |
| auto-bot dönüşümü | Build sistemi | 2 | P2 | 0.5 gün | Orta |
| Admin güncelleme | Panel ekleme | 2 | P3 | 1 gün | Düşük |
| Test | Kapsamlı test | 3 | P1 | 2 gün | Düşük |
| Canlıya alma | Production geçiş | 3 | P1 | 1 gün | Yüksek |

---

## Ek B: Klasör Yapısı (Hedef)

```
services/
├── ai/                      # AI Core Engine (korunur)
├── agents/                  # AI Newsroom (YENİ)
│   ├── base/types.ts
│   ├── prompts/
│   ├── research/
│   ├── verification/
│   ├── writer/
│   ├── seo/
│   ├── publisher/
│   ├── editor-in-chief/
│   └── orchestrator.ts
├── bot/                     # Mevcut bot (geçiş sonrası deprecated)
├── content/                 # Content Engine (korunur, genişletilir)
├── entity/                  # Entity Engine (korunur)
├── geo/                     # GEO Engine (korunur)
├── publisher/               # Publisher Engine (korunur, genişletilir)
├── trends/                  # Trends (korunur)
├── discover/                # Discover (korunur)
├── distribution/            # Distribution (korunur)
├── internal-links/          # Internal Links (korunur)
├── recommendation/          # Recommendation (korunur)
├── content-opportunities/   # Content Opportunities (korunur)
├── research-assistant/      # (deprecated — Research Agent'a taşınır)
└── revenue/                 # (shell)
```

---

## Sonuç

Bu migration planı, **0 risk ile başlayıp** (Faz 1: bağımsız agent geliştirme), **kademeli olarak** (Faz 2: entegrasyon) AI Newsroom mimarisine geçişi sağlar. Her aşamada eski sisteme geri dönüş mümkündür.

En kritik iki agent (Verification ve Editor-in-Chief) **mevcut sisteme hiç dokunmadan** geliştirilebilir ve test edilebilir. Bu iki agent tek başına bile haber kalitesinde çok büyük bir sıçrama sağlayacaktır.
