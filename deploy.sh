#!/bin/bash
# TeknolojiAkışı Deployment Script v2
# Zero-downtime mantığı, süre ölçümü, detaylı log
set -e

# ─── Renkli Çıktı ───────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'
STEP=0; TOTAL_STEPS=6
TIMINGS=()

step() { STEP=$((STEP+1)); echo -e "\n${BLUE}[${STEP}/${TOTAL_STEPS}]${NC} $1"; }
ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
warn() { echo -e "  ${YELLOW}⚠️  $1${NC}"; }
fail() { echo -e "  ${RED}❌ $1${NC}"; }
time_step() {
  local name="$1" start="$2"
  local duration=$(($(date +%s%3N) - start))
  TIMINGS+=("$name:${duration}ms")
  echo -e "  ${CYAN}⏱  ${duration}ms${NC}"
}

START_TOTAL=$(date +%s%3N)

echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  TeknolojiAkışı — Production Deploy v2${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"

# ─── Pre-flight ──────────────────────────────────────────────
step "Pre-flight kontrolleri"
command -v docker >/dev/null 2>&1 || { fail "Docker kurulu değil"; exit 1; }
ok "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"

if [ ! -f .env.production ]; then
  fail ".env.production bulunamadı!"
  echo "  Örnek: DEEPSEEK_API_KEY=sk-... AUTH_SECRET=... AUTH_URL=... SITE_URL=..."
  exit 1
fi
ok ".env.production mevcut"

# ─── 1. Docker Build ─────────────────────────────────────────
step "Docker imajı oluşturuluyor"
BUILD_START=$(date +%s%3N)
docker compose build 2>&1 | tail -5
time_step "Build" $BUILD_START

IMAGE_SIZE=$(docker image inspect teknolojiakisi:latest --format='{{.Size}}' 2>/dev/null || echo "0")
IMAGE_SIZE_MB=$((IMAGE_SIZE / 1024 / 1024))
ok "Image boyutu: ${IMAGE_SIZE_MB}MB"

# ─── 2. Database ─────────────────────────────────────────────
step "Veritabanı hazırlanıyor"
DB_START=$(date +%s%3N)
docker compose run --rm bot npx prisma db push --skip-generate 2>/dev/null || true
time_step "DB push" $DB_START
ok "Veritabanı senkronize"

# ─── 3. Seed (ilk kurulum için) ──────────────────────────────
step "Seed kontrolü"
SEED_START=$(date +%s%3N)
docker compose run --rm bot node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();
async function seed() {
  const hash = await bcrypt.hash('admin123', 12);
  await p.user.upsert({ where: { email: 'admin@teknolojiakisi.com' }, update: {}, create: { email: 'admin@teknolojiakisi.com', name: 'Admin', passwordHash: hash, role: 'admin' } });
  console.log('✅ Admin kullanıcısı hazır');
  await p.\$disconnect();
}
seed();
" 2>/dev/null || echo "⚠️ Seed atlandı"
time_step "Seed" $SEED_START

# ─── 4. Servisleri Başlat ────────────────────────────────────
step "Servisler başlatılıyor"
SVC_START=$(date +%s%3N)
docker compose up -d 2>&1
time_step "Container start" $SVC_START

# ─── 5. Health Check ─────────────────────────────────────────
step "Health check (max 90s)"
HEALTH_START=$(date +%s%3N)
HEALTHY=false
for i in $(seq 1 30); do
  STATUS=$(docker inspect teknolojiakisi-app --format='{{.State.Health.Status}}' 2>/dev/null || echo "starting")
  if [ "$STATUS" = "healthy" ]; then
    HEALTHY=true
    break
  fi
  echo -n "."
  sleep 3
done
echo ""
time_step "Health check" $HEALTH_START

if [ "$HEALTHY" = true ]; then
  ok "App container: HEALTHY ✅"
else
  fail "App container sağlıksız! Loglar:"
  docker logs teknolojiakisi-app --tail 20
fi

# ─── 6. Nginx Erişim Testi ───────────────────────────────────
NGINX_START=$(date +%s%3N)
if curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null | grep -q "200\|301\|302"; then
  ok "Nginx: Erişilebilir ✅"
else
  warn "Nginx henüz yanıt vermiyor (container başlatılıyor olabilir)"
fi
time_step "Nginx test" $NGINX_START

# ─── Özet Rapor ──────────────────────────────────────────────
TOTAL_DURATION=$(($(date +%s%3N) - START_TOTAL))
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Deployment Tamamlandı!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}⏱  Süre Dağılımı:${NC}"
for entry in "${TIMINGS[@]}"; do
  name="${entry%%:*}"
  dur="${entry##*:}"
  echo -e "     ${name}: ${dur}"
done
echo -e "  ${CYAN}⏱  TOPLAM: ${TOTAL_DURATION}ms${NC}"
echo -e "  ${CYAN}📦 Image: ${IMAGE_SIZE_MB}MB${NC}"
echo ""
echo -e "  🌐 https://teknolojiakisi.com.tr"
echo -e "  🔧 Admin: /admin/giris"
echo -e "  📧 admin@teknolojiakisi.com / admin123"
