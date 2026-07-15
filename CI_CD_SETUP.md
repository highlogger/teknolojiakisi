# CI/CD Setup Guide — TeknolojiAkışı

## git push ile Otomatik Deployment

```
git add .
git commit -m "güncelleme"
git push origin main

→ GitHub Actions otomatik deploy eder
→ https://teknolojiakisi.com.tr güncellenir
```

---

## 1. GitHub Secrets

Repository → Settings → Secrets and variables → Actions → New repository secret

| Secret | Açıklama | Örnek |
|--------|----------|-------|
| `SERVER_HOST` | VPS IP adresi | `45.136.6.64` |
| `SERVER_USER` | SSH kullanıcı adı | `root` |
| `SERVER_PORT` | SSH port | `22` |
| `SERVER_SSH_KEY` | Private SSH key | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `PROJECT_PATH` | Proje dizini | `/opt/teknolojiakisi` |

---

## 2. VPS SSH Key Kurulumu

```bash
# Lokalde SSH key oluştur
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Public key'i VPS'e ekle
ssh-copy-id -i ~/.ssh/github_actions.pub root@45.136.6.64

# GitHub Secrets'a ekle
cat ~/.ssh/github_actions
# → SERVER_SSH_KEY
```

---

## 3. VPS Git Remote

```bash
ssh root@45.136.6.64
cd /opt/teknolojiakisi

git init
git remote add origin https://github.com/KULLANICI/teknolojiakisi.git
git fetch origin
git reset --hard origin/main
```

---

## 4. İlk Push

```bash
cd teknolojiakisi
git init
git remote add origin https://github.com/KULLANICI/teknolojiakisi.git
git add .
git commit -m "Initial CI/CD setup"
git push -u origin main
```

---

## 5. Workflow İzleme

GitHub → Repository → Actions → "Deploy to Production"

---

## Workflow Adımları

| Adım | Süre (tahmini) |
|------|---------------|
| Checkout | ~5s |
| SSH bağlantı | ~2s |
| git pull | ~3s |
| Config check | ~1s |
| Docker build | ~90s (cached) |
| Container start | ~10s |
| Health check | ~15s |
| Cleanup | ~5s |
| **Toplam** | **~2 dakika** |

---

## Rollback (manuel)

```bash
ssh root@45.136.6.64
cd /opt/teknolojiakisi
git reflog                          # önceki commit'i bul
git reset --hard <commit-hash>      # geri dön
docker compose up -d                # yeniden başlat
```
