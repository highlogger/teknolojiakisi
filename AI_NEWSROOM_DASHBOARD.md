# AI Newsroom Dashboard

**Route:** `/admin/newsroom`
**Versiyon:** 1.0.0
**Tarih:** 15 Temmuz 2026

---

## Genel Bakış

AI Newsroom Dashboard, tüm AI Newsroom pipeline'ını gerçek zamanlı izleyen merkezi kontrol panelidir. Orchestrator ve Queue ile entegre çalışır.

## Dashboard Bölümleri

| Bölüm | Açıklama |
|-------|----------|
| **Stats Cards** | Toplam/Aktif/Tamamlanan/Başarısız/İptal job sayıları |
| **Job Listesi** | Tüm job'lar, filtreleme (durum), arama (ID/kaynak) |
| **Pipeline Viz** | 7 adımlı pipeline görselleştirme |
| **Durum Dağılımı** | Her state'teki job sayısı bar chart |
| **Son Olaylar** | Son 15 event canlı stream |
| **Job Detay** | Modal — tüm adımlar, süre, hata detayı |

## API Endpoint'leri

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/newsroom/status` | Stats, jobs, events |
| `GET /api/newsroom/jobs/[id]` | Job detail + logs |

## Kullanılan Servisler

- `PipelineOrchestrator` — Job yönetimi
- `PipelineEvents` — Event stream
- `PipelineLogger` — Log verisi
- `PipelineRecovery` — Job store

## Mimari

```
/admin/newsroom/page.tsx (Server Component)
  └── DashboardClient.tsx (Client Component)
        ├── Stats Cards
        ├── Filter Bar
        ├── Job Table → Job Detail Modal
        ├── Pipeline Viz
        ├── Status Distribution
        └── Recent Events
```
