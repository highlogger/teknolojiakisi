# WRITER AGENT

## AI Newsroom — Haber Yazma Servisi

**Versiyon:** 1.0.0
**Tarih:** 15 Temmuz 2026
**Tip:** Servis katmanı — mevcut sistemi değiştirmez

---

## Genel Bakış

Writer Agent, Research Agent ve Verification Agent çıktılarını kullanarak tamamen özgün Türkçe teknoloji haberleri yazan bağımsız bir servistir.

### Görevi

- Research + Verification verilerini kullanarak özgün haber yazmak
- 5 alternatif SEO uyumlu başlık üretmek
- 7 bölümlü profesyonel haber yapısı oluşturmak
- Kalite kontrolü yapmak
- Görsel önerileri sunmak
- İç link adayları belirlemek

### Yapmadıkları

- ❌ RSS haberini rewrite etmez
- ❌ SEO metadata üretmez
- ❌ Schema/metadata üretmez
- ❌ Publish etmez
- ❌ Kategori/etiket belirlemez
- ❌ Admin/UI işlemi yapmaz

---

## Kullanım

```typescript
import { write, execute, dryRun } from "@/services/agents/writer";

const result = await write(researchJson, verificationJson);
// → WriterResult { article, titleOptions, excerpt, summary, ... }
```

## Agent Interface ile

```typescript
const output = await execute({
  inputs: {
    research: researchJson,
    verification: verificationJson
  }
});
// → AgentOutput { outputs: { article, titleOptions, ... }, summary }
```

---

## Haber Yapısı (7 Bölüm)

| # | Bölüm | İçerik |
|---|-------|--------|
| 1 | **Giriş** | Kim? Ne? Ne zaman? Neden önemli? (5N1K) |
| 2 | **Ana Gelişme** | Araştırma bulguları, mantıklı sırayla |
| 3 | **Teknik Ayrıntılar** | API, benchmark, donanım, fiyat, sürüm (varsa) |
| 4 | **Kullanıcı Etkisi** | Son kullanıcı, geliştirici, şirket, Türkiye |
| 5 | **Önceki Durum** | Zaman çizelgesi, eski sürüm karşılaştırması |
| 6 | **Uzman Değerlendirmesi** | Avantajlar, riskler, sınırlamalar, bilinmeyenler |
| 7 | **Sonuç** | Toparlama, abartısız kapanış |

---

## Ön Kontrol

Verification.status değerine göre yazım kararı:

| Verification Status | Writer Davranışı |
|---------------------|-----------------|
| VERIFIED | ✅ Yaz |
| LIKELY_VERIFIED | ✅ Yaz |
| NEEDS_EDITOR_REVIEW | ✅ Yaz (düşük güvenle) |
| INSUFFICIENT_EVIDENCE | ❌ Engelle — yetersiz kanıt |
| CONFLICTING_INFORMATION | ❌ Engelle — çelişki var |
| REJECT | ❌ Engelle — red |

---

## Yazım Kuralları

- Türkçe doğal dil
- Akıcı, kısa paragraflar (3-5 cümle)
- Teknik doğruluk
- Tarafsızlık ve objektiflik
- Spekülasyon/tahmin yasak
- Kaynaksız bilgi eklenemez
- Clickbait kesinlikle yasak

### Yasaklı İfadeler

"Şok", "Bomba", "İnanamayacaksınız", "Ezber bozdu", "Ortalığı karıştırdı", "Yok sattı", "Resmen yıktı", "Çılgın", "Muhteşem", "Efsane", "Devrim niteliğinde", "Tarihi bir adım"

---

## Kalite Kontrolü

Yazım sonrası 8 boyutlu otomatik kontrol:

1. **Başlık doğruluğu** — Clickbait, keyword stuffing
2. **Tekrar kontrolü** — Aynı cümle tekrarı
3. **Gereksiz paragraf** — Çok kısa/doldurma paragraflar
4. **Türkçe karakter** — ğ, ş, ı, ç, ö, ü kontrolü
5. **Robotik ifade** — "Elbette", "İşte karşınızda", "Bu makalede"
6. **Tarafsızlık** — Aşırı olumlu/olumsuz öznel ifadeler
7. **Kaynaksız iddia** — "En iyi", "Lider", "Rakipsiz"
8. **Teknik hata** — Rezerve

---

## Çıktılar

| Dosya | Format | Açıklama |
|-------|--------|----------|
| `article.md` | Markdown | 7 bölümlü tam makale |
| `title_options.json` | JSON | 5 alternatif başlık (SEO skorlu) |
| `excerpt.txt` | Text | 2-3 cümle spot |
| `summary.txt` | Text | 1 paragraf özet |
| `image_suggestions.json` | JSON | Görsel önerileri (tip, kaynak, alt metin) |
| `internal_link_candidates.json` | JSON | İç link adayları (anchor, URL, güven) |

---

## Dosya Yapısı

```
services/agents/writer/
├── index.ts              # Ana servis — write(), execute(), dryRun()
├── types.ts              # WriterResult, TitleOption, SectionContent, vb.
├── prompts.ts            # Tüm AI prompt'ları (6 prompt seti)
├── headline-writer.ts    # 5 başlık üretici + seçici + doğrulayıcı
├── content-writer.ts     # AI ile özgün içerik yazımı + bölüm ayrıştırma
├── quality-checker.ts    # 8 boyutlu kalite kontrolü
├── image-suggester.ts    # Görsel önerileri (AI + fallback)
└── link-suggester.ts     # İç link adayı üretici
```

---

## Bağımlılıklar

- **AI Core Engine:** `services/ai/` — İçerik yazımı ve başlık üretimi için
- **Verification Agent:** Input olarak verification.json
- **Prisma/DB:** Yok (read-only)

---

## Kabul Kriterleri

- [x] Writer Agent yalnızca Research ve Verification çıktılarını kullanır
- [x] Tamamen özgün metin üretir
- [x] Rewrite yapmaz
- [x] Markdown çıktısı üretir
- [x] Çıktılar standart formattadır
- [x] Mevcut botu bozmaz
- [x] AI Core Engine ile uyumlu
- [x] Örnek article.md, title_options.json, summary.txt oluşturuldu
