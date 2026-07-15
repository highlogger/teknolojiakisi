# VERIFICATION AGENT

## AI Newsroom — Doğrulama Servisi

**Versiyon:** 1.0.0
**Tarih:** 15 Temmuz 2026
**Tip:** Read-only servis — mevcut sistemi değiştirmez

---

## Genel Bakış

Verification Agent, Research Agent tarafından hazırlanan araştırma dosyasını (research.json) doğrulayan bağımsız bir servistir.

### Görevi

- Kaynak güvenilirliğini kontrol et
- Tarih doğrulaması yap
- Entity (şirket, ürün, kişi) isimlerini doğrula
- Teknik terimlerin doğruluğunu kontrol et
- Sayısal verileri (fiyat, yüzde, benchmark) kontrol et
- Linklerin çalıştığını doğrula
- Duplicate içerik kontrolü yap
- Kaynaklar arası çelişkileri analiz et
- Güven skoru hesapla

### Yapmadıkları

- ❌ Haber yazmaz
- ❌ SEO üretmez
- ❌ Publish etmez
- ❌ Schema/metadata üretmez
- ❌ Admin/UI işlemi yapmaz
- ❌ Database migration yapmaz

---

## Kullanım

```typescript
import { verify } from "@/services/agents/verification";

const research = {
  version: "1.0",
  generatedAt: "2026-07-15T10:00:00Z",
  source: { name: "TechCrunch", url: "https://techcrunch.com/...", type: "rss" },
  findings: [
    {
      section: "overview",
      content: "OpenAI bugün GPT-5 modelini duyurdu...",
      sources: [
        { url: "https://openai.com/blog/...", name: "OpenAI Blog", type: "official" },
        { url: "https://techcrunch.com/...", name: "TechCrunch", type: "press" }
      ],
      confidence: 95
    }
  ],
  entities: {
    people: ["Sam Altman"],
    companies: ["OpenAI"],
    products: ["GPT-5"],
    technologies: ["LLM", "Transformer"]
  },
  timeline: [
    { date: "2026-07-15T10:00:00Z", event: "GPT-5 duyuruldu" }
  ],
  relatedTopics: ["AI", "LLM", "GPT"]
};

const result = await verify(research);
// → { status: "VERIFIED", confidence: 96, verificationScore: 94, ... }
```

## Agent Interface ile Kullanım

```typescript
import { execute } from "@/services/agents/verification";

const output = await execute({
  inputs: { research: researchJson },
  config: {}
});
// → AgentOutput { success, outputs: { verification }, summary, duration }
```

---

## Doğrulama Kriterleri

### Kaynak Kontrolü
- En az 2 bağımsız güvenilir kaynak
- Resmi kaynak varlığı
- Kaynak güven skoru ≥ 40/100
- Kaynaklar arası çelişki tespiti

### Tarih Kontrolü
- Yayın tarihi doğrulaması
- Eski haber tekrarı tespiti (7+ gün)
- Saat dilimi farkı kontrolü
- Gelecek tarih tespiti

### Entity Kontrolü
- Şirket isimleri referans listesiyle karşılaştırma
- Ürün isimleri doğrulama
- Versiyon numarası kontrolü
- Model isimleri doğrulama
- Fuzzy matching ile yazım hatası tespiti

### Teknik Doğruluk
- API isimleri
- Framework isimleri
- Programlama dili isimleri
- Benchmark değerleri
- Sürüm numaraları

### Sayısal Veriler
- Fiyat bilgileri (şüpheli değer tespiti)
- Yüzde değerleri (%100+ kontrolü)
- Performans metrikleri
- Kapasite/boyut bilgileri

### Link Kontrolü
- URL format kontrolü
- Domain güvenilirliği
- Geçersiz protokol tespiti

### Duplicate Kontrolü
- Veritabanında benzer makale araması
- Jaccard benzerlik skoru
- Yüksek benzerlik (%85+) → duplicate
- Orta benzerlik (%60+) → uyarı

### Çelişki Analizi
- Sayısal veri çelişkileri (%20+ fark → çelişki)
- Sürüm/tarih çelişkileri
- Timeline kronoloji kontrolü

---

## Kararlar

| Durum | Açıklama |
|-------|----------|
| **VERIFIED** | Tüm kontroller başarılı, skor ≥ 85 |
| **LIKELY_VERIFIED** | Çoğu kontrol başarılı, skor ≥ 70 |
| **NEEDS_EDITOR_REVIEW** | Bazı kontroller başarısız, skor ≥ 50 |
| **INSUFFICIENT_EVIDENCE** | Yetersiz kanıt, skor ≥ 30 |
| **CONFLICTING_INFORMATION** | Kaynaklar arası çelişki var |
| **REJECT** | Skor < 30 veya duplicate tespit edildi |

---

## Skor Sistemi

### Ağırlıklar

| Boyut | Ağırlık |
|-------|---------|
| Kaynak Güvenilirliği | %25 |
| Olgusal Doğruluk | %20 |
| Tutarlılık | %20 |
| Entity Doğruluğu | %15 |
| Güncellik | %10 |
| Teknik Doğruluk | %10 |

---

## Dosya Yapısı

```
services/agents/verification/
├── index.ts              # Ana servis — verify()
├── types.ts              # Tüm tip tanımları (15 interface)
├── constants.ts           # Eşik değerleri, referans listeleri
├── source-checker.ts      # Kaynak güvenilirliği kontrolü
├── date-checker.ts        # Tarih doğrulama
├── entity-checker.ts      # Entity isim doğrulama
├── technical-checker.ts   # Teknik terim doğrulama
├── number-checker.ts      # Sayısal veri kontrolü
├── link-checker.ts        # URL/link kontrolü
├── duplicate-checker.ts   # İçerik benzerliği kontrolü
├── conflict-analyzer.ts   # Kaynak çelişki analizi
└── scorer.ts              # Skor hesaplama + durum belirleme
```

---

## Çıktı Formatı

Standart `verification.json`:

```json
{
  "version": "1.0.0",
  "generatedAt": "ISO 8601",
  "status": "VERIFIED | LIKELY_VERIFIED | NEEDS_EDITOR_REVIEW | INSUFFICIENT_EVIDENCE | CONFLICTING_INFORMATION | REJECT",
  "confidence": 0-100,
  "verificationScore": 0-100,
  "officialSource": true,
  "independentSources": 4,
  "conflicts": [],
  "warnings": [],
  "missingInformation": [],
  "checks": {
    "sources": true, "dates": true, "entities": true,
    "technical": true, "numbers": true, "links": true,
    "duplicates": true, "consistency": true
  },
  "scores": {
    "sourceScore": 0-100, "factScore": 0-100,
    "consistencyScore": 0-100, "entityScore": 0-100,
    "freshnessScore": 0-100, "technicalScore": 0-100
  }
}
```

---

## Bağımlılıklar

- **AI Core Engine:** Yok (şu an kural-tabanlı, gelecekte AI destekli kontroller eklenebilir)
- **Entity Engine:** Yok (kendi referans listesini kullanır, istenirse entegre edilebilir)
- **Prisma/DB:** `duplicate-checker.ts` — benzer makale araması için
- **Dış servisler:** Yok

---

## Kabul Kriterleri

- [x] Verification Agent tamamen bağımsız çalışır
- [x] Research Agent çıktısını kullanır (research.json)
- [x] Writer Agent'tan bağımsız
- [x] Standart verification.json üretir
- [x] Mevcut botu bozmaz
- [x] Mevcut mimariyi değiştirmez
- [x] Sadece servis katmanı geliştirilmiştir
- [x] AI Core Engine ile uyumlu
- [x] Örnek verification.json oluşturuldu
