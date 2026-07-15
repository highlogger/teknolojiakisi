# Klasör Yapısı

```
teknolojiakışı/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (public)/                     # Public sayfalar
│   │   │   ├── page.tsx                  # Ana sayfa
│   │   │   ├── haber/[slug]/page.tsx     # Haber detay
│   │   │   ├── kategori/[slug]/page.tsx  # Kategori listesi
│   │   │   ├── yazar/[slug]/page.tsx     # Yazar profili
│   │   │   ├── topics/[slug]/page.tsx    # Konu sayfası
│   │   │   ├── source/[slug]/page.tsx    # Kaynak profili
│   │   │   ├── arama/page.tsx            # Arama
│   │   │   ├── hakkimizda/page.tsx       # Hakkımızda
│   │   │   └── iletisim/                 # İletişim
│   │   ├── admin/                        # Admin panel
│   │   │   ├── page.tsx                  # Admin ana sayfa
│   │   │   ├── giris/page.tsx            # Login
│   │   │   ├── dashboard/page.tsx        # Dashboard
│   │   │   ├── haberler/                 # Haber CRUD
│   │   │   │   ├── [id]/duzenle/         # Haber düzenle
│   │   │   │   ├── [id]/workspace/       # Editor workspace (6 panel)
│   │   │   │   └── yeni/                 # Yeni haber
│   │   │   ├── bot/                      # Bot yönetimi
│   │   │   ├── kategoriler/              # Kategori yönetimi
│   │   │   ├── yazarlar/                 # Yazar yönetimi
│   │   │   └── ayarlar/                  # Site ayarları
│   │   ├── api/                          # REST API
│   │   │   ├── articles/                 # Makale CRUD
│   │   │   ├── auth/                     # NextAuth handler
│   │   │   ├── authors/                  # Yazar API
│   │   │   ├── categories/               # Kategori API
│   │   │   ├── tags/                     # Etiket API
│   │   │   ├── sources/                  # Kaynak API
│   │   │   ├── settings/                 # Ayar API
│   │   │   ├── search/                   # Arama API
│   │   │   └── bot/                      # Bot trigger + logs API
│   │   ├── sitemap.ts                    # XML Sitemap
│   │   ├── rss.xml/route.ts             # RSS Feed
│   │   ├── news-sitemap.xml/route.ts    # Google News Sitemap
│   │   └── globals.css                   # Global CSS
│   ├── components/                       # React Component'leri
│   │   ├── admin/                        # Admin (Sidebar, Actions, Form)
│   │   ├── article/                      # Article (ProgressBar, TOC)
│   │   ├── home/                         # Homepage (Hero, Latest, Categories)
│   │   ├── layout/                       # Layout (Header, Footer)
│   │   └── news/                         # News (AdBanner, Breaking)
│   ├── lib/                              # Core kütüphaneler
│   │   ├── auth.ts                       # NextAuth v5 config
│   │   ├── db.ts                         # PrismaClient singleton
│   │   ├── seo.tsx                       # SEO/JSON-LD (7 şema)
│   │   ├── logger.ts                     # Structured logger (5 seviye)
│   │   ├── validation.ts                 # Zod şemaları (12 schema)
│   │   ├── utils.ts                      # Yardımcı fonksiyonlar
│   │   ├── constants.ts                  # Site sabitleri
│   │   └── deepseek.ts                   # Legacy DeepSeek wrapper
│   ├── services/                         # İş mantığı servisleri
│   │   ├── agents/                       # AI Newsroom (YENİ)
│   │   │   ├── base/types.ts             # Agent interface
│   │   │   ├── writer/                   # Writer Agent (8 dosya)
│   │   │   ├── seo/                      # SEO Agent (3 dosya)
│   │   │   ├── publisher/                # Publisher Agent (1 dosya)
│   │   │   └── editor-in-chief/          # Editor-in-Chief Agent (1 dosya)
│   │   ├── ai/                           # AI Core Engine (9 dosya)
│   │   ├── bot/                          # Bot Automation (6 dosya)
│   │   ├── content/                      # Content Engine (9 dosya)
│   │   ├── entity/                       # Entity Engine (9 dosya)
│   │   ├── geo/                          # GEO Engine (11 dosya)
│   │   ├── internal-links/               # Internal Link Engine (4 dosya)
│   │   ├── recommendation/               # Related Content Engine (3 dosya)
│   │   ├── discover/                     # Google Discover Engine (3 dosya)
│   │   ├── publisher/                    # Publisher Engine (3 dosya)
│   │   ├── content-opportunities/        # Content Opportunities (3 dosya)
│   │   ├── trends/                       # Trend Intelligence (3 dosya)
│   │   ├── topics/                       # Topic Hub (1 dosya)
│   │   ├── sources/                      # Source Intelligence (1 dosya)
│   │   ├── authors/                      # Author Authority (1 dosya)
│   │   ├── distribution/                 # Distribution Center (2 dosya)
│   │   └── revenue/                      # Revenue Platform shell (2 dosya)
│   ├── types/                            # Global TypeScript tipleri
│   └── middleware.ts                     # Auth middleware (RBAC)
├── prisma/
│   ├── schema.prisma                     # 9 model (SQLite)
│   └── seed.ts                           # Seed script
├── public/                               # Statik dosyalar
├── docs/                                 # Dokümantasyon (bu klasör)
├── .github/workflows/deploy.yml          # CI/CD pipeline
├── Dockerfile                            # Multi-stage Docker build
├── docker-compose.yml                    # 3-service Docker stack
├── nginx.conf                            # Nginx reverse proxy
├── auto-bot.js                           # Production bot (CommonJS)
├── auto-bot.ts                           # Dev bot runner
├── package.json                          # Bağımlılıklar
├── tsconfig.json                         # TypeScript config
└── tailwind.config.ts                    # Tailwind config
```
