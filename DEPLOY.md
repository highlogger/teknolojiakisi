# TeknolojiAkışı — Deployment Rehberi

> 🚀 **Otomatik CI/CD:** `git push origin main` yeterli.
> Detaylar için [CI_CD_SETUP.md](CI_CD_SETUP.md)

## Gereksinimler

- **VPS Sunucu** (önerilen: Contabo ~$6/ay, Hetzner ~$4/ay, DigitalOcean ~$6/ay)
  - En az: 2 GB RAM, 20 GB SSD, Ubuntu 22.04/24.04
- **Domain**: teknolojiakisi.com.tr (DNS A kaydı VPS IP'sine yönlenmiş)

## Hızlı Kurulum (5 adım)

### 1. VPS'e bağlan
```bash
ssh root@VPS_IP
```

### 2. Docker kur
```bash
curl -fsSL https://get.docker.com | sh
```

### 3. Projeyi yükle
```bash
# Lokal bilgisayarından:
rsync -avz --exclude 'node_modules' --exclude '.next' ./ root@VPS_IP:/opt/teknolojiakisi/

# Veya GitHub üzerinden:
git clone https://github.com/KULLANICI/teknolojiakisi.git /opt/teknolojiakisi
```

### 4. Yapılandır
```bash
cd /opt/teknolojiakisi

# .env.production düzenle
nano .env.production

# AUTH_SECRET oluştur
echo "AUTH_SECRET=$(openssl rand -hex 32)" >> .env.production
```

### 5. Başlat
```bash
chmod +x deploy.sh
./deploy.sh
```

## Servisler

| Servis | Port | Açıklama |
|--------|------|----------|
| **app** | 3000 | Next.js uygulaması |
| **bot** | - | Sürekli haber botu (her 2 saat) |
| **nginx** | 80/443 | Reverse proxy |

## Yararlı Komutlar

```bash
# Durum kontrolü
docker compose ps

# Logları izle
docker compose logs -f app
docker compose logs -f bot

# Yeniden başlat
docker compose restart

# Güncelleme
docker compose down
docker compose build --no-cache
docker compose up -d

# Veritabanı yedeği
docker compose exec app cp /data/dev.db /data/backup-$(date +%Y%m%d).db

# Botu manuel çalıştır
docker compose exec bot node auto-bot.js
```

## SSL (Let's Encrypt)

```bash
# Certbot kur
apt install certbot python3-certbot-nginx -y

# Sertifika al
certbot --nginx -d teknolojiakisi.com.tr -d www.teknolojiakisi.com.tr

# Otomatik yenileme test
certbot renew --dry-run
```

## Admin Bilgileri

- **URL**: https://teknolojiakisi.com.tr/admin/giris
- **Email**: admin@teknolojiakisi.com
- **Şifre**: admin123 (ilk girişten sonra değiştirin!)
