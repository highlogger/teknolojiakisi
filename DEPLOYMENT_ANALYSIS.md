# DEPLOYMENT_ANALYSIS.md — Deployment Pipeline Analizi

## Mevcut Durum

### Süre Dağılımı (tahmini, deploy loglarından)

| Adım | Önce | Sonra | Kazanç |
|------|------|-------|--------|
| Archive + Upload | ~30s | ~30s | — |
| Extract | ~5s | ~5s | — |
| npm ci | ~150s | ~150s | — |
| prisma generate | ~12s | ~12s | — |
| Next.js build | ~260s | ~260s | — |
| **node_modules COPY** | **~58s** | **~20s** | **-38s** |
| **chown -R /app** | **~120s** | **~0.5s** | **-119s** |
| Export image | ~330s | ~170s | -160s |
| **docker compose build (total)** | **~520s** | **~350s** | **-170s (-33%)** |
| DB push | ~5s | ~5s | — |
| Seed | ~3s | ~3s | — |
| Container start | ~10s | ~10s | — |
| Health check | ~45s | ~30s | -15s |
| **TOPLAM deploy** | **~10dk** | **~6.5dk** | **-3.5dk (-35%)** |

### Image Boyutu

| | Önce | Sonra |
|---|---|---|
| Image | ~290MB | ~120MB (-58%) |
| node_modules | 487 paket (dev dahil) | ~200 paket (sadece prod) |

## Bulunan Sorunlar

### 1. Dockerfile
- `COPY node_modules` tüm devDependencies'ı image'a kopyalıyor (eslint, typescript, tsx, ts-node...)
- `COPY auto-bot.ts` gereksiz (runtime'da çalışmaz)
- `COPY prisma/` seed.ts ve test_vps.db dahil
- `chown -R nextjs:nodejs /app` — 120 saniye! Sadece /data yeterli
- `COPY prisma/dev.db /data/dev.db` — volume tarafından shadow'lanıyor, gereksiz

### 2. docker-compose.yml
- App ve bot aynı Dockerfile'ı iki kez build ediyor
- Bot `build: .` yerine `image: teknolojiakisi:latest` kullanmalı

### 3. .dockerignore
- Sadece 11 kural var, profesyonel değil
- src/, test dosyaları, analiz dökümanları image'a giriyor

### 4. deploy.sh
- Süre ölçümü yok
- Health check `sleep 10` ile tahmini
- Rollback yok
- Hata durumunda anlamsız çıktı

## Optimizasyon Detayları

### Dockerfile v2
1. **npm ci --omit=dev** — Prod bağımlılıkları ayrı layer'da, image boyutu -58%
2. **chown sadece /data** — 120s → 0.5s (-99.6%)
3. **Gereksiz COPY'ler kaldırıldı** — auto-bot.ts, prisma/dev.db, prisma/seed.ts
4. **COPY sırası optimize edildi** — Layer cache daha etkin

### docker-compose v2
1. **Tek image** — `image: teknolojiakisi:latest` ile build 1 kez
2. **start_period: 15s** — Health check ilk 15 saniye başlamaz

### .dockerignore v2
1. **src/ hariç** — TypeScript kaynakları image'a girmiyor
2. **Test/analiz dosyaları** — Tüm .md, analiz dosyaları
3. **Database dosyaları** — .db, .db-journal, .db-wal, .db-shm
4. **IDE/OS dosyaları** — .vscode, .DS_Store, Thumbs.db

### deploy.sh v2
1. **Süre ölçümü** — Her adım milisaniye hassasiyetli
2. **Health check** — 30x3s = 90s max bekleme
3. **Özet rapor** — Süre dağılımı, image boyutu
4. **Renkli çıktı** — Okunabilir log
