# AI NEWSROOM ASSESSMENT

## Mevcut Sistemin AI Newsroom Mimarisine Uygunluk Değerlendirmesi

**Tarih:** 15 Temmuz 2026
**Değerlendirme:** Principal Software Architect, AI Systems Architect, News Automation Expert

---

## 1. AI Newsroom Hedef Mimarisi

```
┌──────────────────────────────────────────────────────────────────┐
│                     AI NEWSROOM PIPELINE                          │
│                                                                   │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐      │
│  │ RESEARCH │ → │VERIFY    │ → │  WRITE   │ → │   SEO    │      │
│  │  Agent   │   │  Agent   │   │  Agent   │   │  Agent   │      │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘      │
│       │              │              │              │              │
│       ▼              ▼              ▼              ▼              │
│  research.json  verification  article.md    seo.json             │
│                 .json         title_opts   metadata.json         │
│                               summary.txt  schema.json           │
│                                                                   │
│  ┌──────────┐   ┌──────────┐                                      │
│  │PUBLISHER │ ← │ EDITOR   │  ← SON KARAR                        │
│  │  Agent   │   │ IN CHIEF │                                      │
│  └──────────┘   └──────────┘                                      │
│       │              │                                             │
│       ▼              ▼                                             │
│  publish.json   editor_review.json                                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              AI CORE ENGINE (Provider Layer)               │    │
│  │  DeepSeek │ OpenAI │ Gemini │ Claude                      │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              SUPPORT ENGINES                               │    │
│  │  Entity │ GEO │ Content │ Trends │ Discover │ Distribution │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Mevcut Kod Bazında AI Newsroom Karşılaştırması

### 2.1 Research Agent Karşılığı

| AI Newsroom Bileşeni | Mevcut Karşılık | Durum | Açıklama |
|---------------------|-----------------|-------|----------|
| **RSS/Web Fetch** | `fetcher.ts` fetchFromRSS/fetchFromWeb | ✅ VAR | RSS + Web scraping çalışıyor |
| **Source Aggregation** | `fetcher.ts` + Source model | ⚠️ KISMEN | 25+ kaynak var ama aggregation yok |
| **Multi-source Research** | Yok | ❌ YOK | Tek kaynaktan okuyup geçiyor |
| **Deep Research** | Yok | ❌ YOK | Web araması, çoklu kaynak taraması yok |
| **Timeline Analysis** | Yok | ❌ YOK | Zaman çizelgesi oluşturma yok |
| **Entity Extraction (araştırma amaçlı)** | `entity/extractor.ts` | ⚠️ KISMEN | Var ama research pipeline'da kullanılmıyor |
| **Trend Analysis** | `trends/engine.ts` | ⚠️ KISMEN | Temel trend skorlaması var |
| **Structured Research Output** | Yok | ❌ YOK | research.json formatı yok |

**Genel Değerlendirme:** %25 tamam. Fetcher katmanı iyi, ancak research agent'ın gerektirdiği deep research, multi-source aggregation ve structured output tamamen eksik.

---

### 2.2 Verification Agent Karşılığı

| AI Newsroom Bileşeni | Mevcut Karşılık | Durum | Açıklama |
|---------------------|-----------------|-------|----------|
| **Kaynak Kontrolü** | Yok | ❌ YOK | Güvenilirlik kontrolü yok |
| **Tarih Kontrolü** | `filterRecentArticles(48)` | ⚠️ KISMEN | Sadece 48 saat filtresi, eski haber kontrolü yok |
| **Entity Doğrulama** | Yok | ❌ YOK | Entity engine var ama doğrulama için kullanılmıyor |
| **Teknik Doğruluk** | Yok | ❌ YOK | API/model/benchmark doğrulaması yok |
| **Sayısal Veri Kontrolü** | Yok | ❌ YOK | Fiyat/yüzde/benchmark doğrulaması yok |
| **Link Kontrolü** | Yok | ❌ YOK | URL çalışıyor mu kontrolü yok |
| **Duplicate Kontrolü** | `filterProcessedArticles()` | ⚠️ KISMEN | Sadece aynı URL kontrolü, içerik benzerliği yok |
| **Çelişki Analizi** | Yok | ❌ YOK | Kaynaklar arası çelişki tespiti yok |
| **Güven Skoru** | Yok | ❌ YOK | Verification score sistemi yok |
| **Verification Output** | Yok | ❌ YOK | verification.json formatı yok |

**Genel Değerlendirme:** %5 tamam. Mevcut sistemde neredeyse hiç verification katmanı yok. En büyük eksik.

---

### 2.3 Writer Agent Karşılığı

| AI Newsroom Bileşeni | Mevcut Karşılık | Durum | Açıklama |
|---------------------|-----------------|-------|----------|
| **İçerik Üretimi** | `generator.ts` translateAndRewrite | ⚠️ KISMEN | Çeviri + rewrite var ama özgün yazım değil |
| **Başlık Üretimi** | `generator.ts` optimizeSEO | ⚠️ KISMEN | SEO başlığı üretiyor ama 5 alternatifli değil |
| **Haber Yapısı** | Prompt'ta kısmen var | ⚠️ KISMEN | 5N1K kuralı prompt'ta var ama yapısal değil |
| **Teknik Detay** | Yok | ❌ YOK | API/benchmark/fiyat gibi yapısal teknik bölüm yok |
| **Kullanıcı Etkisi** | Prompt'ta "Türkiye bağlamı" | ⚠️ KISMEN | Prompt'ta isteniyor ama yapısal değil |
| **Önceki Durum** | Yok | ❌ YOK | Zaman çizelgesi/tarihçe karşılaştırması yok |
| **Uzman Değerlendirmesi** | Yok | ❌ YOK | Tarafsız analiz bölümü yok |
| **Kalite Kontrolü** | `qualityCheck()` | ✅ VAR | Türkçe karakter, anlatım bozukluğu kontrolü |
| **Rewrite vs Özgün** | Rewrite ağırlıklı | ❌ EKSİK | Research'e dayalı sıfırdan yazım yok |
| **Structured Output** | Yok | ❌ YOK | article.md, title_options.json formatı yok |

**Genel Değerlendirme:** %30 tamam. Temel içerik üretimi var ama AI Newsroom Writer Agent'ın gerektirdiği yapısal yaklaşımdan uzak.

---

### 2.4 SEO & Metadata Agent Karşılığı

| AI Newsroom Bileşeni | Mevcut Karşılık | Durum | Açıklama |
|---------------------|-----------------|-------|----------|
| **SEO Title** | `optimizeSEO()` metaTitle | ✅ VAR | AI ile üretiliyor |
| **Meta Description** | `optimizeSEO()` metaDescription | ✅ VAR | AI ile üretiliyor |
| **Slug** | `optimizeSEO()` + ensureUniqueSlug | ✅ VAR | SEO uyumlu slug oluşturuluyor |
| **Keywords** | `optimizeSEO()` tags | ⚠️ KISMEN | Etiket var ama primary/secondary ayrımı yok |
| **Open Graph** | `articleMetadata()` | ✅ VAR | OG + Twitter card |
| **Twitter Card** | `articleMetadata()` | ✅ VAR | summary_large_image |
| **JSON-LD NewsArticle** | `generateNewsArticleLd()` | ✅ VAR | Tam NewsArticle şeması |
| **Breadcrumb** | `generateBreadcrumbLd()` | ✅ VAR | BreadcrumbList şeması |
| **Organization** | `generateOrganizationLd()` | ✅ VAR | Organization şeması |
| **WebSite** | `generateWebSiteLd()` | ✅ VAR | SearchAction'lı |
| **Google News Metadata** | Yok | ❌ YOK | Özel Google News metadata alanları yok |
| **Discover Metadata** | Yok | ❌ YOK | Discover priority/freshness yok |
| **Featured Snippet** | Yok | ❌ YOK | Featured snippet adayı üretilmiyor |
| **SEO Score** | Yok | ❌ YOK | Skorlama sistemi yok |
| **Internal Link Candidates** | `internal-links/` servisi | ⚠️ KISMEN | Servis var ama SEO agent'a entegre değil |
| **Validation Report** | Yok | ❌ YOK | SEO validation report yok |
| **Canonical** | `articleMetadata()` | ✅ VAR | alternates.canonical |
| **Reading Time** | `metadata.ts` | ✅ VAR | Hesaplanıyor |

**Genel Değerlendirme:** %55 tamam. SEO altyapısı güçlü, ancak Google News, Discover ve validation eksik.

---

### 2.5 Publisher Agent Karşılığı

| AI Newsroom Bileşeni | Mevcut Karşılık | Durum | Açıklama |
|---------------------|-----------------|-------|----------|
| **Pre-publish Checks** | Yok | ❌ YOK | Yayın öncesi kontrol listesi yok |
| **Workflow State Machine** | `content/status.ts` | ✅ VAR | 24 transition rule |
| **Publish Modes** | `getAutoPublishSetting()` | ⚠️ KISMEN | Sadece auto-publish açık/kapalı |
| **Scheduled Publish** | Yok | ❌ YOK | Planlı yayın desteği yok |
| **Dry Run** | Yok | ❌ YOK | Yayın simülasyonu yok |
| **Transaction/Rollback** | Yok | ❌ YOK | Transaction mantığı yok |
| **URL Kontrolü** | `publishArticle()` slug check | ⚠️ KISMEN | Sadece slug unique kontrolü |
| **Cache Revalidation** | Yok | ❌ YOK | revalidatePath/tag tetikleme yok |
| **Notification Events** | Yok | ❌ YOK | Event sistemi yok |
| **Publish Logging** | BotLog modeli | ⚠️ KISMEN | Bot çalışma logu var ama publish logu değil |
| **Sitemap Update Event** | Yok | ❌ YOK | Sitemap güncelleme tetikleme yok |
| **Validation Report** | Yok | ❌ YOK | publication_report.json yok |

**Genel Değerlendirme:** %20 tamam. Status state machine var ama publish workflow ve kontroller eksik.

---

### 2.6 Editor-in-Chief Agent Karşılığı

| AI Newsroom Bileşeni | Mevcut Karşılık | Durum | Açıklama |
|---------------------|-----------------|-------|----------|
| **Editöryal Kontrol** | Yok | ❌ YOK | Otomatik editör kontrolü yok |
| **Haber Değeri** | Yok | ❌ YOK | Haber değeri skorlaması yok |
| **Kaynak Yeterliliği** | Yok | ❌ YOK | Minimum kaynak kontrolü yok |
| **Clickbait Tespiti** | Yok | ❌ YOK | Clickbait/abartı kontrolü yok |
| **Özgünlük Kontrolü** | Yok | ❌ YOK | Özgünlük/tekrar kontrolü yok |
| **Editöryal Karar** | Yok | ❌ YOK | APPROVED/REVISION/REJECTED mekanizması yok |
| **Yayın Önceliği** | Yok | ❌ YOK | Breaking/High/Normal/Low/Evergreen yok |
| **Performans Tahmini** | Yok | ❌ YOK | CTR/Discover/Organik tahmini yok |
| **Editorial Score** | Yok | ❌ YOK | Editöryal skor sistemi yok |
| **Revizyon Yönetimi** | Yok | ❌ YOK | Minor/major revision yönetimi yok |

**Genel Değerlendirme:** %0 tamam. Hiçbir editoryal karar mekanizması yok.

---

## 3. Genel Tamamlanma Oranı

| Agent | Tamamlanma | Durum |
|-------|-----------|-------|
| **Research Agent** | %25 | 🔴 Ciddi eksik |
| **Verification Agent** | %5 | 🔴 Neredeyse yok |
| **Writer Agent** | %30 | 🟡 Temel seviye |
| **SEO & Metadata Agent** | %55 | 🟡 Orta seviye |
| **Publisher Agent** | %20 | 🔴 Ciddi eksik |
| **Editor-in-Chief Agent** | %0 | 🔴 Hiç yok |
| **GENEL ORTALAMA** | **%23** | 🔴 |

---

## 4. Neler Korunabilir?

### Tamamen Korunacaklar (Olduğu gibi kullanılabilir)

| Bileşen | Neden |
|---------|-------|
| **AI Core Engine** (`services/ai/`) | Temiz provider abstraction, retry, JSON mode, streaming. AI Newsroom agent'larının temel AI katmanı olarak kullanılabilir |
| **SEO Lib** (`lib/seo.tsx`) | 7 JSON-LD tipi, Next.js Metadata API uyumlu. SEO Agent'ın output katmanı olarak kullanılabilir |
| **Content Engine State Machine** (`services/content/status.ts`) | 24 transition rule, Publisher Agent'ın workflow'u için temel |
| **Entity Engine** (`services/entity/`) | Entity çıkarımı, skorlama. Verification ve SEO agent'ları için kullanılabilir |
| **GEO Engine** (`services/geo/`) | 8 platform, 8 boyut skorlama. SEO Agent'a entegre edilebilir |
| **Fetcher** (`services/bot/fetcher.ts`) | RSS + Web scraping, duplicate filter, image extraction. Research Agent'ın fetch katmanı |
| **Prisma Schema** | Tüm modeller korunabilir, sadece yeni alanlar eklenir |

### Kısmen Korunacaklar (Modifiye edilerek kullanılabilir)

| Bileşen | Ne Değişmeli? |
|---------|---------------|
| **Tech Filter** (`quickTechFilter`) | Research Agent'a taşınmalı, keyword listesi genişletilmeli |
| **Prompts** (`prompts.ts`) | Her agent için ayrı prompt dosyalarına bölünmeli |
| **Publisher** (`publisher.ts`) | Publisher Agent'a dönüştürülmeli, pre-publish checks eklenmeli |
| **Admin Workspace** | Yeni agent çıktılarını gösterecek paneller eklenmeli |
| **Generator** (`generator.ts`) | Writer Agent'a dönüştürülmeli, research + verification input'lu |

---

## 5. Neler Tamamen Değişmeli / Yeniden Yazılmalı?

| Bileşen | Neden? | Yeni Yaklaşım |
|---------|--------|---------------|
| **auto-bot.js** | Monolitik, eksik özellikler, kod tekrarı | Build çıktısı olmalı veya komple kaldırılmalı |
| **Verify Katmanı** | Hiç yok | Sıfırdan Verification Agent yazılmalı |
| **Editor Review** | Hiç yok | Sıfırdan Editor-in-Chief Agent yazılmalı |
| **Publish Workflow** | Temel seviye, transaction yok | Publisher Agent sıfırdan yazılmalı |
| **Prompt Yönetimi** | Kod içine gömülü | Merkezi prompt store (DB veya ayrı dosyalar) |
| **Workflow Store** | In-memory Map | Veritabanına taşınmalı |
| **Pipeline Orchestrator** | `runBot()` içinde düz kod | Pipeline orchestration engine |

---

## 6. Migration Plan — Risk Sınıflandırması

### 0 Risk (Sadece yeni kod, mevcut sisteme dokunmaz)

| # | Görev | Açıklama |
|---|-------|----------|
| 1 | **Verification Agent** servisi yaz | Yeni `services/agents/verification/` — mevcut botu etkilemez |
| 2 | **Editor-in-Chief Agent** servisi yaz | Yeni `services/agents/editor-in-chief/` — mevcut botu etkilemez |
| 3 | **SEO Agent** bağımsız servis yaz | Yeni `services/agents/seo/` — mevcut SEO lib'i wrapper olarak kullanır |
| 4 | **Örnek JSON çıktıları** oluştur | Her agent için örnek output dosyaları |

### Düşük Risk (Mevcut servisleri extend eder)

| # | Görev | Açıklama |
|---|-------|----------|
| 5 | **Research Agent** servisi yaz | `fetcher.ts`'i kullanır, ek araştırma katmanları ekler |
| 6 | **Prompt Store** oluştur | `prompts/registry.ts`'i genişlet, prompt'ları ayrı dosyalara taşı |
| 7 | **Publisher Agent** servisi yaz | Content Engine state machine'i kullanır, ek kontroller ekler |
| 8 | **Workflow Store** DB'ye taşı | WorkflowEvent modeli ekle, in-memory'den DB'ye geç |

### Orta Risk (Mevcut kodu modifiye eder)

| # | Görev | Açıklama |
|---|-------|----------|
| 9 | **Writer Agent** servisi yaz | `generator.ts`'i dönüştür, research+verification input'lu hale getir |
| 10 | **Pipeline Orchestrator** yaz | Agent'ları sırayla çalıştıran merkezi orchestrator |
| 11 | **Admin Workspace** güncelle | Yeni agent çıktılarını gösterecek paneller ekle |
| 12 | **auto-bot.js** birleştirme | `services/bot/` build çıktısı olarak üret |

### Yüksek Risk (Core sistemi değiştirir)

| # | Görev | Açıklama |
|---|-------|----------|
| 13 | **Database migration** — yeni alanlar | Article, BotLog modellerine yeni alanlar |
| 14 | **Production bot geçişi** | auto-bot.js → yeni orchestrator geçişi |
| 15 | **Canlıya alma** | Tüm sistemi production'a deploy |

---

## 7. Tahmini Geliştirme Sırası

```
Faz 0: Altyapı (1-2 gün)
├── Task: Prompt Store oluşturma
├── Task: Workflow Store DB'ye taşıma
└── Task: Agent base class / interface oluşturma

Faz 1: Bağımsız Agent'lar (3-5 gün)
├── TASK-003: Verification Agent (sıfırdan)
├── TASK-004: Writer Agent (generator.ts dönüşümü)
├── TASK-005: SEO & Metadata Agent (SEO lib + GEO wrapper)
├── TASK-006: Publisher Agent (content engine + kontroller)
└── TASK-007: Editor-in-Chief Agent (sıfırdan)

Faz 2: Entegrasyon (2-3 gün)
├── Research Agent geliştirme (fetcher.ts dönüşümü)
├── Pipeline Orchestrator (agent'ları zincirleme)
├── Admin panel güncellemeleri
└── auto-bot.js → orchestrator geçişi

Faz 3: Test & Canlıya Alma (2-3 gün)
├── Dry run testleri
├── Production deployment
├── Monitoring
└── Fine-tuning
```

---

## 8. Önceliklendirme Matrisi

| Öncelik | Agent | Neden |
|---------|-------|-------|
| **P0** | Verification Agent | En büyük risk: doğrulanmamış haber yayınlamak |
| **P0** | Editor-in-Chief Agent | Kalite kontrolü için kritik |
| **P1** | Writer Agent | Mevcut içerik kalitesini yükseltmek için |
| **P1** | SEO Agent | Google News/Discover için gerekli |
| **P2** | Publisher Agent | Workflow ve güvenli yayın için |
| **P3** | Research Agent | Mevcut fetcher yeterli, sonra geliştirilir |

---

## 9. Kritik Başarı Faktörleri

1. **Mevcut bot çalışmaya devam etmeli** — migration sırasında production etkilenmemeli
2. **Her agent bağımsız çalışabilmeli** — loose coupling
3. **Standart JSON formatları** — agent'lar arası kontrat net olmalı
4. **AI Core Engine tek AI giriş noktası olmalı** — agent'lar doğrudan API çağırmamalı
5. **Test edilebilir olmalı** — her agent bağımsız test edilebilmeli
6. **Dry run desteği** — gerçek yayın yapmadan test edilebilmeli

---

## 10. Sonuç

Mevcut TeknolojiAkışı sistemi, AI Newsroom mimarisine geçiş için sağlam bir temel sunmaktadır. AI Core Engine, SEO kütüphanesi, Entity/GEO engine'leri ve Content Engine state machine'i doğrudan kullanılabilir durumdadır.

Ancak sistemin %77'si AI Newsroom standartlarını karşılamamaktadır. En kritik eksikler **Verification Agent** ve **Editor-in-Chief Agent**'tır — bu iki bileşen olmadan doğrulanmamış, editörden geçmemiş haberler yayınlanmaya devam edecektir.

Önerilen yaklaşım: **Faz 1'de tüm agent'ları bağımsız servisler olarak geliştir, mevcut botu değiştirme. Faz 2'de orchestrator ile entegre et ve kademeli olarak production'a geç.**
