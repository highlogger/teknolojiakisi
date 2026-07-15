# NEXT_TASK_RECOMMENDATION.md

## Content Engine v1 — Sonraki Adımlar

### 1. Prisma Schema'ya Content Engine alanlarını ekle

Mevcut schema'ya eklenecekler:
- `Article.contentType` (news/review/guide/...)
- `Article.metadata` (JSON string — ContentMetadata)
- `ContentRevision` tablosu (revision history)
- `WorkflowEvent` tablosu (workflow log)

### 2. Status transition'ları API'ye entegre et

- `PUT /api/articles/[id]/transition` — Status geçiş endpoint'i
- Transition validasyonu ve workflow logging

### 3. Metadata otomatik hesaplama

- AI Core ile contentScore hesapla
- SEO metriklerini otomatik çek

### 4. Revision UI

- Makale düzenleme geçmişi sayfası
- Versiyon karşılaştırma

### 5. Content Type UI

- Admin panelde içerik tipi seçimi
- Her tip için özel form alanları
