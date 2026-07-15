# DEPLOYMENT_OPTIMIZATION.md — Optimizasyon Rehberi

## Rollback Stratejisi

```bash
# Deployment öncesi mevcut image'ı etiketle
docker tag teknolojiakisi:latest teknolojiakisi:previous

# Başarısız deploy durumunda geri dön
docker compose down
docker tag teknolojiakisi:previous teknolojiakisi:latest
docker compose up -d
```

## Build Cache Optimizasyonu

```dockerfile
# Layer sıralaması (en az değişen en üstte):
COPY package*.json ./         # ~2 haftada bir değişir  → CACHED
COPY prisma/schema.prisma ./  # ~1 ayda bir değişir     → CACHED
RUN npm ci                    # schema/package değişince → CACHED
COPY . .                      # Her deploy'da değişir
```

Build cache hit oranı: **ilk 3 layer ~%90 cached**

## Gelecek Optimizasyonlar

1. **BuildKit cache mount** — `RUN --mount=type=cache,target=/root/.npm npm ci`
2. **Multi-arch build** — AMD64 + ARM64
3. **CI/CD pipeline** — GitHub Actions ile otomatik deploy
4. **Blue-green deployment** — İki container set, sıfır downtime
5. **Image signing** — Docker Content Trust / Cosign
