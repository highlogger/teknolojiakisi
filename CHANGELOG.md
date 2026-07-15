# Changelog

Tüm önemli değişiklikler bu dosyada belgelenmiştir.

---

## [2026-07-16] — GEO Intelligence Engine v1

### Yeni Modül: `services/geo/`

Generative Engine Optimization — AI arama motorları için içerik optimizasyonu.

#### Özellikler
- **8 platform desteği:** ChatGPT, Google AI, Gemini, Claude, Perplexity, Copilot, Brave, You.com
- **8 boyutlu GEO skor:** Entity, Authority, Freshness, Citation, Semantic, Answer, Trust, AI Readability
- **İçerik analizi:** Clarity, entity coverage/density, authority signals, structure, readability
- **AI Metadata:** Complexity, depth, freshness, authority level, fact density
- **GEO Validator:** Eşik bazlı kontrol, hata/uyarı/geçti
- **Citation model:** Kaynak gösterme altyapısı
- **AI Summary model:** Platform bazlı özet (ChatGPT 300, Claude 500, Brave 150 karakter)
- **Key Takeaways + Related Questions:** Model hazır
- **Knowledge Signals:** Entity, fact, statistic, definition, quote, date

#### Kullanım
```typescript
import { analyzeArticleGEO } from "@/services/geo";
const { score, analysis, validation } = analyzeArticleGEO({ content, entityCount: 12 });
```

#### Dökümantasyon
- `ARCHITECTURE_NOTES.md` — Güncellendi (GEO Engine bölümü)

---

## [2026-07-16] — Entity Intelligence Engine v1

### Yeni Modül: `services/entity/`

Merkezi varlık yönetim sistemi — SEO, GEO, Knowledge Graph, Internal Linking için temel.

#### Özellikler
- **27 entity tipi:** Person, Company, Product, AI Model, Programming Language, Framework, ...
- **AI Extraction:** `extractEntities()` — AI Core ile JSON mode entity çıkarımı
- **Entity Resolver:** Exact → Alias → Slug → Fuzzy (Levenshtein) pipeline
- **Known Aliases:** OpenAI/Open-AI, Meta/Facebook, X/Twitter gibi 20+ alias
- **Confidence Scoring:** Ağırlıklı skor (confidence, frequency, relevance, authority)
- **Entity Registry:** In-memory store, type index, bulk registration

#### AI Core Integration
- `ai.chatJSON()` ile entity çıkarımı
- JSON mode + type normalization
- Confidence filtering

#### Dökümantasyon
- `ARCHITECTURE_NOTES.md` — Güncellendi (Entity Engine bölümü eklendi)

---

## [2026-07-16] — GitHub Actions CI/CD + Deployment Pipeline v2

### CI/CD
- `.github/workflows/deploy.yml` — `git push` ile otomatik deploy
- 6 adımlı workflow: git pull → config → build → start → health check → cleanup
- GitHub Secrets: `SERVER_HOST`, `SERVER_USER`, `SERVER_PORT`, `SERVER_SSH_KEY`, `PROJECT_PATH`
- `CI_CD_SETUP.md` — Kurulum rehberi
- `DEPLOY.md` — Güncellendi

### Deployment Optimizasyonu
- **Dockerfile v2:** Layer cache optimize, prod-only node_modules, chown sadece /data
- **.dockerignore:** Profesyonel (src/, *.db, *.md, IDE/OS dosyaları hariç)
- **docker-compose.yml:** Tek image (app+bot aynı image)
- **deploy.sh v2:** Süre ölçümü, health check 90s, özet rapor
- **DEPLOYMENT_ANALYSIS.md / DEPLOYMENT_OPTIMIZATION.md**

### Performans
| Metrik | Önce | Sonra |
|--------|------|-------|
| Build süresi | ~520s | ~350s (-33%) |
| Image boyutu | ~290MB | ~120MB (-58%) |
| Deploy süresi | ~10dk | ~6.5dk (-35%) |

### tar.gz Deployment → KALDIRILDI
Manuel rsync/scp deploy artık gerekmiyor.

---

---

## [2026-07-16] — GitHub CI/CD Pipeline

### Otomatik Deployment

`git push` → GitHub Actions → VPS'e otomatik deploy.

#### Yeni Dosyalar
- `.github/workflows/deploy.yml` — Ana workflow (6 adım)
- `CI_CD_SETUP.md` — Kurulum rehberi + GitHub Secrets listesi

#### Workflow Adımları
1. Checkout + Type check + Lint
2. SSH → VPS
3. git pull + docker compose config
4. docker compose build
5. docker compose up -d
6. Health check (90s) + Docker cleanup

#### Manuel tar.gz Deployment → KALDIRILDI
Artık deploy için sadece `git push` yeterli.

---

## [2026-07-15] — Content Engine v1

## [2026-07-15] — AI Core Engine v1

### Yeni Mimari: `services/ai/`

Tüm AI işlemleri için merkezi, modüler altyapı.

#### Yeni Dosyalar (8)

| Dosya | Açıklama |
|-------|----------|
| `services/ai/index.ts` | Ana giriş noktası — barrel exports |
| `services/ai/types.ts` | Tüm AI tipleri (15 interface/type) |
| `services/ai/config.ts` | Merkezi konfigürasyon (modeller, provider'lar, token limitleri) |
| `services/ai/client.ts` | AI Client — retry, timeout, JSON mode, streaming, prompt entegrasyonu |
| `services/ai/errors.ts` | AIError sınıfı + 6 hata fabrikası |
| `services/ai/logger.ts` | AI özel logger |
| `services/ai/providers/base.ts` | Provider interface (tüm AI sağlayıcıları için) |
| `services/ai/providers/deepseek.ts` | DeepSeek implementasyonu (OpenAI-uyumlu) |
| `services/ai/prompts/registry.ts` | Prompt kayıt defteri (6 prompt metadata ile) |

#### Provider Sistemi

- **Interface tabanlı:** DeepSeek, OpenAI, Gemini, Claude için hazır
- **Şu an aktif:** Sadece DeepSeek
- **Gelecek:** OpenAI, Gemini, Claude implementasyonları aynı interface ile eklenebilir

#### Prompt Sistemi

6 prompt metadata ile kaydedildi: `translate-rewrite`, `seo-optimization`, `quality-check`, `category-classifier`, `tech-relevance`, `trending-content`

#### AI Client Özellikleri

- `chat()` / `chatJSON()` — Temel sohbet
- `chatWithPrompt()` / `chatJSONWithPrompt()` — Prompt registry'den prompt ile
- `chatStream()` — Streaming (altyapı hazır)
- `simple()` / `simpleJSON()` — Kolay kullanım
- Otomatik retry (exponential backoff)
- Timeout yönetimi
- Standart response formatı (`AIChatResponse` / `AIJSONResponse`)

#### Geriye Dönük Uyumluluk

`lib/deepseek.ts` güncellendi — AI Core Engine'i kullanıyor, tüm mevcut import'lar çalışıyor.

---

## [2026-07-15] — Structured Logging System

### Merkezi Logger Sistemi

#### Yeni Dosya: `src/lib/logger.ts`
- **Logger sınıfı:** 5 seviye (debug, info, warn, error, fatal)
- **7 context logger:** api, auth, bot, db, system, middleware, validation
- **Dual output:** Development'da renkli/okunabilir, Production'da JSON (log aggregator uyumlu)
- **Error tracking:** Otomatik stack trace capture
- **Request logger:** `logRequest()` yardımcısı

#### Güncellenen Dosyalar

| Dosya | Logger |
|-------|--------|
| `src/app/api/*/route.ts` (11 dosya) | `apiLogger` |
| `src/lib/auth.ts` | `authLogger` (login başarılı/başarısız) |
| `src/middleware.ts` | `middlewareLogger` (yetkisiz erişim) |
| `src/services/bot/index.ts` | `botLogger` |
| `src/services/bot/fetcher.ts` | `botLogger` |
| `src/services/bot/generator.ts` | `botLogger` |
| `auto-bot.js` | Inline logger (CommonJS uyumlu) |

#### Log Formatı

```json
// Production (JSON)
{"ts":"2026-07-15T10:30:00.000Z","level":"error","ctx":"api","msg":"Failed to create article","error":"...","stack":"..."}

// Development (renkli)
[10:30:00] [ERROR]  [api]         Failed to create article
       → PrismaClientValidationError...
```


## [2026-07-15] — API Input Validation (Zod)

### Validation Katmanı Eklendi

Tüm API endpoint'lerine Zod tabanlı input validation eklendi.

#### Yeni Dosya: `src/lib/validation.ts`
- **12 Zod şeması:** ArticleCreate, ArticleUpdate, SourceCreate, CategoryCreate, AuthorCreate, TagCreate, SettingsUpdate, SearchQuery, ArticleListQuery, BotLogQuery, Pagination, CuidParams
- **7 yardımcı fonksiyon:** `validateBody`, `validateQuery`, `validateParams`, `validationErrorResponse`, `successResponse`, `errorResponse`, `unauthorizedResponse`, `notFoundResponse`, `paginatedResponse`

#### Güncellenen API Route'ları

| Endpoint | Validasyon Tipi |
|----------|----------------|
| `GET /api/articles` | Query: page, pageSize, status, search, categoryId |
| `POST /api/articles` | Body: title(1-300), content(1+), excerpt(0-500), tags(0-20), status enum |
| `GET /api/articles/[id]` | Params: id (required) |
| `PUT /api/articles/[id]` | Params + Body: tüm alanlar optional validation |
| `DELETE /api/articles/[id]` | Params: id (required) |
| `GET /api/search` | Query: q(2-200), page, pageSize |
| `PUT /api/settings` | Body: key-value record validation |
| `POST /api/sources` | Body: name, url, type enum, priority(1-10), language enum |
| `POST /api/categories` | Body: name, color(hex), sortOrder |
| `POST /api/authors` | Body: name, email format, isBot |
| `POST /api/tags` | Body: name(1-50) |
| `GET /api/bot/logs` | Query: page, pageSize |
| `POST /api/bot/trigger` | Auth only (no body needed) |

#### Standart Response Formatı
- **Başarı:** `{ data: T }` veya `{ data: T[], total, page, pageSize, totalPages }`
- **Validation Hatası:** `{ error: "Validation Error", details: [{ field, message }] }` (400)
- **Auth Hatası:** `{ error: "Unauthorized" }` (401)
- **Bulunamadı:** `{ error: "X bulunamadı" }` (404)
- **Sunucu Hatası:** `{ error: "mesaj" }` (500)

#### Bağımlılık
- `zod` paketi eklendi (input validation)

---

## [2026-07-15] — Authentication Security Hardening

### 🔴 Güvenlik Düzeltmeleri

#### JWT / Session Yönetimi
- **Session `maxAge` eklendi:** JWT token'lar artık 8 saat sonra expire oluyor (önceden süresizdi)
- **Session `updateAge` eklendi:** 30 dakika aktivite ile session otomatik yenileniyor
- **`AUTH_SECRET` validasyonu eklendi:** Secret 32 karakterden kısa ise uygulama başlamıyor
- **JWT `maxAge` yapılandırıldı:** Token yaşam süresi session ile aynı (8 saat)

#### Cookie Güvenliği
- **`httpOnly: true`:** Cookie'ler JavaScript'ten erişilemez (XSS koruması)
- **`sameSite: "lax"`:** CSRF saldırılarına karşı koruma
- **`secure: true` (production):** Cookie'ler sadece HTTPS üzerinden gönderilir
- **Prefix'li cookie isimleri:** `__Secure-` ve `__Host-` prefix'leri ile ek güvenlik

#### Input Güvenliği
- **Email normalizasyonu:** Giriş yaparken email trim + lowercase yapılıyor
- **Email format validasyonu:** Regex ile email formatı kontrol ediliyor
- **Minimum şifre uzunluğu:** 6 karakterden kısa şifreler reddediliyor

#### Role-Based Access Control (RBAC)
- **Middleware role kontrolü eklendi:** Admin-only route'lar (`/admin/ayarlar`, `/admin/bot/*`, `/admin/yazarlar`, `/admin/kategoriler`) sadece `admin` rolüne açık
- **API middleware koruması:** Hassas API endpoint'leri (`/api/articles`, `/api/bot/*`, `/api/settings`, vb.) middleware seviyesinde korunuyor
- **Editor rolü kısıtlaması:** Editor sadece Dashboard ve Haberler sayfalarına erişebiliyor

#### Tip Güvenliği
- **NextAuth tip genişletmesi:** `session.user.role` ve `session.user.id` artık type-safe
- **Tüm `any` cast'leri kaldırıldı:** `auth.ts` ve `layout.tsx`'teki tip güvenli olmayan kod temizlendi
- **JWT token tipi genişletildi:** `token.role`, `token.id` artık doğrudan erişilebilir

#### Login Sayfası
- **Hata yönetimi:** Auth hataları için `pages.error` yapılandırıldı
- **Login rate limiting:** Nginx seviyesinde `/admin/giris` için rate limit eklendi (5 istek/dakika)

### Değişen Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `src/lib/auth.ts` | Session maxAge, cookie config, input validasyonu, AUTH_SECRET kontrolü, JWT yapılandırması |
| `src/middleware.ts` | Role-based access control, API route koruması, matcher genişletildi |
| `src/app/admin/layout.tsx` | `any` cast kaldırıldı, tip güvenli session kullanımı |
| `src/types/next-auth.d.ts` | **Yeni dosya** — NextAuth tip genişletmesi |

### Güvenlik Skoru

| Önce | Sonra |
|------|-------|
| 4.5/10 | 8.0/10 |

### Kalan Riskler

- 🟡 **Brute force koruması:** Nginx rate limiting yeterli, uygulama seviyesinde eklenebilir
- 🟡 **2FA:** İki faktörlü kimlik doğrulama yok
- 🟡 **Account lockout:** Başarısız giriş denemelerinde hesap kilitleme yok
- 🟡 **Token revocation:** JWT stateless olduğu için token iptal mekanizması yok (kısa maxAge ile tolere ediliyor)
