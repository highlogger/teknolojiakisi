# Servis Kaydı

Tüm `services/` altındaki modüllerin detaylı kaydı.

---

## AI Core Engine
| Alan | Değer |
|------|-------|
| **Klasör** | `services/ai/` |
| **Dosya** | 9 TS dosyası |
| **Versiyon** | v1 |
| **Durum** | ✅ Production |
| **Giriş** | AIMessage[], AIClientOptions |
| **Çıkış** | AIChatResponse, AIJSONResponse<T>, AIStreamChunk |
| **AI Provider** | DeepSeek (aktif), OpenAI/Gemini/Claude (hazır) |
| **Özellikler** | Retry (exponential backoff), JSON mode, Streaming, Timeout, Prompt registry |
| **Kullanan** | auto-bot.js, bot/generator.ts, agents/writer/, entity/extractor.ts |

---

## Content Engine
| Alan | Değer |
|------|-------|
| **Klasör** | `services/content/` |
| **Dosya** | 9 TS dosyası |
| **Durum** | ✅ Production |
| **State Machine** | 10 durum, 24 transition rule |
| **Özellikler** | Lifecycle hooks, Workflow logging, Metadata calculation, Role-based transitions |
| **Eksik** | Workflow store in-memory → DB migration gerekli |

---

## Bot Automation
| Alan | Değer |
|------|-------|
| **Klasör** | `services/bot/` (6 dosya) + `auto-bot.js` |
| **Durum** | ✅ Production (2 paralel sistem) |
| **Akış** | RSS/Web → Tech Filter → AI Generate (3 aşama) → Category → Publish |
| **Özellikler** | 25+ RSS/web kaynak, Duplicate kontrol, 48 saat filtresi, Trend/Fabrika içerik |
| **Problem** | İki sistem arası kod tekrarı (~%60), auto-bot.js eksik özellikler |

---

## Entity Engine
| Alan | Değer |
|------|-------|
| **Klasör** | `services/entity/` |
| **Dosya** | 9 TS dosyası |
| **Durum** | ✅ Production |
| **Entity Tipi** | 27 (Person, Company, Product, AI_Model, Programming_Language, Framework, ...) |
| **Pipeline** | AI Extract → Normalize → Resolve (exact→alias→slug→fuzzy) → Score |
| **Scoring** | Confidence %35 + Frequency %25 + Relevance %25 + Authority %15 |

---

## GEO Engine
| Alan | Değer |
|------|-------|
| **Klasör** | `services/geo/` |
| **Dosya** | 11 TS dosyası |
| **Durum** | ✅ Production |
| **Platform** | 8 (ChatGPT, Google AI, Gemini, Claude, Perplexity, Copilot, Brave, You.com) |
| **Skor** | 8 boyutlu (Entity, Authority, Freshness, Citation, Semantic, Answer, Trust, AI Readability) |
| **Modeller** | Citation, AI Summary (platform-bazlı), Key Takeaways, Related Questions |

---

## SEO Engine (Lib)
| Alan | Değer |
|------|-------|
| **Klasör** | `lib/seo.tsx` |
| **Dosya** | 1 TSX dosyası |
| **Durum** | ✅ Production |
| **Şemalar** | Organization, WebSite, BreadcrumbList, NewsArticle, CollectionPage, Person, AboutPage/ContactPage/SearchResultsPage |
| **Fonksiyonlar** | articleMetadata(), pageMetadata(), JsonLd component |

---

## Internal Links Engine
| Alan | Değer |
|------|-------|
| **Klasör** | `services/internal-links/` |
| **Dosya** | 4 TS dosyası |
| **Durum** | ✅ Tamamlandı |

---

## Related Content Engine
| Alan | Değer |
|------|-------|
| **Klasör** | `services/recommendation/` |
| **Dosya** | 3 TS dosyası |
| **Durum** | ✅ Tamamlandı |

---

## Google Discover Engine
| Alan | Değer |
|------|-------|
| **Klasör** | `services/discover/` |
| **Dosya** | 3 TS dosyası |
| **Durum** | ✅ Tamamlandı |

---

## Publisher Engine (Google News)
| Alan | Değer |
|------|-------|
| **Klasör** | `services/publisher/` |
| **Dosya** | 3 TS dosyası |
| **Durum** | ✅ Tamamlandı |
| **Özellikler** | Google News validator (11 check), Publisher metadata |

---

## Content Opportunities Engine
| Alan | Değer |
|------|-------|
| **Klasör** | `services/content-opportunities/` |
| **Dosya** | 3 TS dosyası |
| **Durum** | ✅ Tamamlandı |

---

## Trend Intelligence
| Alan | Değer |
|------|-------|
| **Klasör** | `services/trends/` |
| **Dosya** | 3 TS dosyası |
| **Durum** | ✅ Tamamlandı |
| **Scoring** | Volume, Velocity, Acceleration, Relevance, Authority |

---

## Topic Hub
| Alan | Değer |
|------|-------|
| **Klasör** | `services/topics/` |
| **Dosya** | 1 TS dosyası |
| **Durum** | ✅ Tamamlandı (2026-07-15) |
| **Konu** | 26 kayıtlı konu |
| **Fonksiyonlar** | getTopic(), getAllTopics(), searchTopics(), getTopicStats() |
| **Kullanan** | `app/(public)/topics/[slug]/page.tsx` |

---

## Source Intelligence
| Alan | Değer |
|------|-------|
| **Klasör** | `services/sources/` |
| **Dosya** | 1 TS dosyası |
| **Durum** | ✅ Tamamlandı (2026-07-15) |
| **Skor** | 5 boyut (Reliability, Authority, Freshness, Consistency, Diversity) |
| **Rating** | AAA, AA, A, B, C, D, F |
| **Fonksiyonlar** | analyzeSource(), listSources() |
| **Kullanan** | `app/(public)/source/[slug]/page.tsx` |

---

## Author Authority
| Alan | Değer |
|------|-------|
| **Klasör** | `services/authors/` |
| **Dosya** | 1 TS dosyası |
| **Durum** | ✅ Tamamlandı (2026-07-15) |
| **Skor** | 5 boyut (Authority, Consistency, Expertise, Engagement, Trust) |
| **Rating** | S, A+, A, B, C, New |
| **E-E-A-T** | Experience, Expertise, Authoritativeness, Trustworthiness |
| **Fonksiyonlar** | analyzeAuthor(), listTopAuthors() |
| **Kullanan** | `app/(public)/yazar/[slug]/page.tsx` |

---

## Distribution Center
| Alan | Değer |
|------|-------|
| **Klasör** | `services/distribution/` |
| **Dosya** | 2 TS dosyası |
| **Durum** | ⚠️ Temel |
| **Kanallar** | X, Facebook, LinkedIn, Telegram, Email, Push, RSS, Sitemap |

---

## Revenue Platform
| Alan | Değer |
|------|-------|
| **Klasör** | `services/revenue/` |
| **Dosya** | 2 TS dosyası |
| **Durum** | 🔴 Shell |

---

## Writer Agent (AI Newsroom)
| Alan | Değer |
|------|-------|
| **Klasör** | `services/agents/writer/` |
| **Dosya** | 8 TS dosyası |
| **Durum** | ⏳ Orchestrator bekliyor |
| **Giriş** | research.json + verification.json |
| **Çıkış** | article.md, title_options.json, excerpt.txt, summary.txt |
| **AI** | AI Core Engine (content-writer, headline-writer) |

---

## SEO Agent (AI Newsroom)
| Alan | Değer |
|------|-------|
| **Klasör** | `services/agents/seo/` |
| **Dosya** | 3 TS dosyası |
| **Durum** | ⏳ Orchestrator bekliyor |
| **Giriş** | article.md + entities |
| **Çıkış** | seo.json, schema.json, metadata.json, OG, Twitter, Discover |

---

## Publisher Agent (AI Newsroom)
| Alan | Değer |
|------|-------|
| **Klasör** | `services/agents/publisher/` |
| **Dosya** | 1 TS dosyası |
| **Durum** | ⏳ Orchestrator bekliyor |
| **Modlar** | Immediate, Scheduled, Manual, Dry Run |
| **DB** | Prisma (article create + BotLog) |

---

## Editor-in-Chief Agent (AI Newsroom)
| Alan | Değer |
|------|-------|
| **Klasör** | `services/agents/editor-in-chief/` |
| **Dosya** | 1 TS dosyası |
| **Durum** | ⏳ Orchestrator bekliyor |
| **Kararlar** | APPROVED, MINOR_REVISION, MAJOR_REVISION, REJECTED |
