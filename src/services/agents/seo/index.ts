/**
 * SEO & Metadata Agent — Main Service
 *
 * AI Newsroom SEO agent'ı.
 * Writer Agent çıktısını kullanarak eksiksiz SEO paketi üretir.
 * Mevcut SEO lib, Entity Engine ve GEO Engine ile entegre.
 *
 * Kullanım:
 *   import { optimizeSEO } from "@/services/agents/seo";
 *   const result = await optimizeSEO(input);
 */

import type { AgentInput, AgentOutput } from "@/services/agents/base/types";
import type { SEOInput, SEOResult, OGMeta, TwitterMeta, NewsMeta, DiscoverMeta, BreadcrumbItem, ValidationReport } from "./types";
import { slugify, stripHtml, countWords, readingTime } from "./utils";

export const AGENT_NAME = "SEO & Metadata Agent";
export const AGENT_VERSION = "1.0.0";

// ─── Main API ────────────────────────────────────────────────

export async function optimizeSEO(input: SEOInput): Promise<SEOResult> {
  const startTime = Date.now();
  const { article, research, verification } = input;

  // ─── 1. Temel SEO ─────────────────────────────────────
  const plainText = article.content.replace(/<[^>]*>/g, "");
  const wordCount = countWords(plainText);
  const readTime = readingTime(wordCount);

  // Primary keyword: en önemli entity veya topic
  const primaryKeyword = research.entities?.products?.[0]
    || research.entities?.companies?.[0]
    || research.entities?.technologies?.[0]
    || research.relatedTopics?.[0]
    || "teknoloji";

  // Secondary keywords
  const secondaryKeywords = [
    ...(research.entities?.companies || []).slice(0, 2),
    ...(research.entities?.products || []).slice(0, 2),
    ...(research.entities?.technologies || []).slice(0, 2),
    ...(research.relatedTopics || []).slice(0, 3),
  ].filter(k => k !== primaryKeyword).slice(0, 8);

  // Entity + topic keywords
  const entityKeywords = [
    ...(research.entities?.people || []),
    ...(research.entities?.companies || []),
    ...(research.entities?.products || []),
    ...(research.entities?.technologies || []),
  ].slice(0, 10);

  const topicKeywords = (research.relatedTopics || []).slice(0, 5);

  // SEO Title (60 karakter hedef)
  const seoTitle = article.title.length > 60
    ? article.title.substring(0, 57) + "..."
    : article.title;

  // Meta Description (160 karakter)
  const metaDescription = (article.excerpt || plainText)
    .substring(0, 157).trim() + "...";

  // Slug
  const slug = slugify(article.title);

  // ─── 2. Open Graph ─────────────────────────────────────
  const openGraph: OGMeta = {
    ogTitle: seoTitle,
    ogDescription: metaDescription,
    ogImage: "https://teknolojiakisi.com.tr/og-default.png",
    ogType: "article",
    ogUrl: `https://teknolojiakisi.com.tr/haber/${slug}`,
    ogLocale: "tr_TR",
    siteName: "TeknolojiAkışı",
  };

  // ─── 3. Twitter Card ───────────────────────────────────
  const twitterCard: TwitterMeta = {
    twitterTitle: seoTitle,
    twitterDescription: metaDescription,
    twitterImage: openGraph.ogImage,
    twitterCard: "summary_large_image",
  };

  // ─── 4. JSON-LD Schema ─────────────────────────────────
  const schema = generateSchemas(article.title, slug, metaDescription, article.content, research);

  // ─── 5. Google News Metadata ───────────────────────────
  const newsMetadata: NewsMeta = {
    publicationDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString(),
    author: "TeknolojiAkışı Editör",
    publisher: "TeknolojiAkışı",
    language: "tr",
    newsKeywords: [primaryKeyword, ...secondaryKeywords.slice(0, 5)],
  };

  // ─── 6. Google Discover Metadata ───────────────────────
  const discoverMetadata: DiscoverMeta = {
    priority: verification.verificationScore >= 85 ? "high" : verification.verificationScore >= 60 ? "normal" : "low",
    freshness: verification.verificationScore >= 80 ? "breaking" : "evergreen",
    topic: primaryKeyword,
    isBreaking: verification.verificationScore >= 90,
    isEvergreen: wordCount > 800,
  };

  // ─── 7. Breadcrumbs ────────────────────────────────────
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Anasayfa", url: "https://teknolojiakisi.com.tr", position: 1 },
    { name: primaryKeyword.charAt(0).toUpperCase() + primaryKeyword.slice(1), url: `https://teknolojiakisi.com.tr/topic/${slugify(primaryKeyword)}`, position: 2 },
    { name: article.title.substring(0, 50), url: `https://teknolojiakisi.com.tr/haber/${slug}`, position: 3 },
  ];

  // ─── 8. Featured Snippet ───────────────────────────────
  const featuredSnippet = generateFeaturedSnippet(plainText);

  // ─── 9. Internal Links ─────────────────────────────────
  const internalLinks = generateInternalLinks(research, article.content);

  // ─── 10. Validation ────────────────────────────────────
  const validation = validateSEO(seoTitle, metaDescription, slug, article);

  // ─── 11. SEO Score ─────────────────────────────────────
  const seoScore = calculateSEOScore(validation, verification.verificationScore);

  return {
    version: AGENT_VERSION,
    generatedAt: new Date().toISOString(),
    seoScore,
    title: seoTitle,
    description: metaDescription,
    slug,
    canonical: `https://teknolojiakisi.com.tr/haber/${slug}`,
    robots: "index, follow, max-image-preview:large",
    language: "tr",
    readingTime: readTime,
    wordCount,
    primaryKeyword,
    secondaryKeywords,
    entityKeywords,
    topicKeywords,
    openGraph,
    twitterCard,
    schema,
    newsMetadata,
    discoverMetadata,
    breadcrumbs,
    featuredSnippet,
    internalLinks,
    validation,
  };
}

// ─── Schema Generator ────────────────────────────────────────

function generateSchemas(title: string, slug: string, description: string, content: string, research: SEOInput["research"]) {
  const url = `https://teknolojiakisi.com.tr/haber/${slug}`;
  const now = new Date().toISOString();

  return {
    newsArticle: {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: title,
      description,
      articleBody: content.replace(/<[^>]*>/g, "").substring(0, 5000),
      url,
      datePublished: now,
      dateModified: now,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "TeknolojiAkışı" },
      publisher: {
        "@type": "Organization",
        name: "TeknolojiAkışı",
        url: "https://teknolojiakisi.com.tr",
        logo: { "@type": "ImageObject", url: "https://teknolojiakisi.com.tr/logo.png" },
      },
      isAccessibleForFree: true,
      inLanguage: "tr",
      copyrightYear: new Date().getFullYear(),
      spatialCoverage: { "@type": "Place", name: "Türkiye" },
    },
    breadcrumbList: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Anasayfa", item: "https://teknolojiakisi.com.tr" },
        { "@type": "ListItem", position: 2, name: title.substring(0, 50), item: url },
      ],
    },
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "TeknolojiAkışı",
      url: "https://teknolojiakisi.com.tr",
      logo: "https://teknolojiakisi.com.tr/logo.png",
    },
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "TeknolojiAkışı",
      url: "https://teknolojiakisi.com.tr",
      inLanguage: "tr-TR",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://teknolojiakisi.com.tr/arama?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
  };
}

// ─── Featured Snippet ────────────────────────────────────────

function generateFeaturedSnippet(plainText: string): string {
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 30);
  if (sentences.length >= 3) {
    return sentences.slice(0, 3).join(". ").trim() + ".";
  }
  return plainText.substring(0, 300).trim();
}

// ─── Internal Links ──────────────────────────────────────────

function generateInternalLinks(research: SEOInput["research"], content: string): SEOResult["internalLinks"] {
  const links: SEOResult["internalLinks"] = [];

  const topicMap: Record<string, string> = {
    openai: "/topic/openai", google: "/topic/google", microsoft: "/topic/microsoft",
    apple: "/topic/apple", meta: "/topic/meta", tesla: "/topic/tesla", nvidia: "/topic/nvidia",
    "yapay zeka": "/topic/yapay-zeka", gpt: "/topic/gpt", chatgpt: "/topic/chatgpt",
    claude: "/topic/claude", gemini: "/topic/gemini", deepseek: "/topic/deepseek",
    blockchain: "/topic/blockchain", kripto: "/topic/kripto", siber: "/topic/siber-guvenlik",
  };

  const allEntities = [
    ...(research.entities?.companies || []),
    ...(research.entities?.products || []),
    ...(research.entities?.technologies || []),
  ];

  for (const entity of allEntities) {
    const lower = entity.toLowerCase();
    for (const [key, url] of Object.entries(topicMap)) {
      if (lower.includes(key) || key.includes(lower)) {
        links.push({ anchorText: entity, url, confidence: 85 });
        break;
      }
    }
  }

  return links.slice(0, 8);
}

// ─── Validation ──────────────────────────────────────────────

function validateSEO(title: string, description: string, slug: string, article: SEOInput["article"]): ValidationReport {
  const checks: ValidationReport["checks"] = [];

  // Title length
  const titleOk = title.length >= 40 && title.length <= 70;
  checks.push({ category: "Title", name: "Başlık Uzunluğu", status: titleOk ? "pass" : title.length < 40 ? "warn" : "warn", message: `${title.length} karakter (ideal: 50-70)` });

  // Description length
  const descOk = description.length >= 120 && description.length <= 160;
  checks.push({ category: "Meta", name: "Meta Description", status: descOk ? "pass" : "warn", message: `${description.length} karakter (ideal: 140-160)` });

  // Slug
  const slugOk = slug.length > 5 && slug.length < 80 && !/[^a-z0-9-]/.test(slug);
  checks.push({ category: "URL", name: "Slug", status: slugOk ? "pass" : "fail", message: slugOk ? "SEO uyumlu" : "Slug hatalı" });

  // Content length
  const contentOk = article.content.length > 500;
  checks.push({ category: "Content", name: "İçerik Uzunluğu", status: contentOk ? "pass" : "fail", message: `${article.content.length} karakter` });

  // Canonical
  checks.push({ category: "Technical", name: "Canonical URL", status: "pass", message: "Mevcut" });

  // Schema
  checks.push({ category: "Schema", name: "JSON-LD", status: "pass", message: "NewsArticle + Breadcrumb + Organization + WebSite" });

  // OG
  checks.push({ category: "Social", name: "Open Graph", status: "pass", message: "Mevcut" });

  // Twitter
  checks.push({ category: "Social", name: "Twitter Card", status: "pass", message: "summary_large_image" });

  // Keywords
  checks.push({ category: "Keywords", name: "Odak Kelime", status: "pass", message: "Mevcut" });

  // Image
  checks.push({ category: "Image", name: "Sosyal Medya Görseli", status: "warn", message: "og-default.png kullanılıyor — özel görsel önerilir" });

  const passed = checks.filter(c => c.status === "pass").length;
  const failed = checks.filter(c => c.status === "fail").length;
  const warnings = checks.filter(c => c.status === "warn").length;
  const score = Math.round((passed / checks.length) * 100);

  return { score, passed, failed, warnings, checks };
}

// ─── SEO Score ───────────────────────────────────────────────

function calculateSEOScore(validation: ValidationReport, verificationScore: number): number {
  // Validation %60 + Verification Score %40
  return Math.round(validation.score * 0.6 + verificationScore * 0.4);
}

// ─── Agent Interface ─────────────────────────────────────────

export async function execute(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now();
  try {
    const seoInput = input.inputs as unknown as SEOInput;
    if (!seoInput?.article) {
      return { success: false, outputs: {}, summary: { status: "ERROR", score: 0, confidence: 0, warnings: [], errors: ["article.md input'u bulunamadı."] }, duration: Date.now() - startTime };
    }
    const result = await optimizeSEO(seoInput);

    return {
      success: result.seoScore >= 60,
      outputs: {
        seo: result,
        metadata: { title: result.title, description: result.description, slug: result.slug, canonical: result.canonical, language: result.language, readingTime: result.readingTime, wordCount: result.wordCount },
        schema: result.schema,
        structuredData: result.schema,
        breadcrumbs: result.breadcrumbs,
        newsMetadata: result.newsMetadata,
        openGraph: result.openGraph,
        twitterCard: result.twitterCard,
        featuredSnippet: result.featuredSnippet,
        validationReport: result.validation,
      },
      summary: { status: result.seoScore >= 80 ? "SUCCESS" : "NEEDS_REVIEW", score: result.seoScore, confidence: 90, warnings: result.validation.checks.filter(c => c.status === "warn").map(c => c.message), errors: result.validation.checks.filter(c => c.status === "fail").map(c => c.message) },
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return { success: false, outputs: {}, summary: { status: "ERROR", score: 0, confidence: 0, warnings: [], errors: [`SEO hatası: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`] }, duration: Date.now() - startTime };
  }
}

export async function dryRun(input: AgentInput): Promise<AgentOutput> {
  const result = await execute(input);
  return { ...result, summary: { ...result.summary, status: `DRY_RUN: ${result.summary.status}` } };
}

export const seoAgent = { name: AGENT_NAME, version: AGENT_VERSION, execute, dryRun };
export default seoAgent;
