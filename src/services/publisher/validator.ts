/**
 * Google News Validator
 *
 * Google News uyumluluğunu kontrol eder.
 */

import { PUBLISHER, NEWS_IMAGE_REQUIREMENTS } from "./config";

export interface NewsValidationReport {
  score: number; // 0-100
  checks: NewsCheck[];
  passed: number;
  failed: number;
  warnings: number;
  isCompliant: boolean;
}

export interface NewsCheck {
  category: string;
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
  recommendation?: string;
}

export function validateGoogleNewsCompliance(params: {
  hasRSS: boolean;
  hasNewsSitemap: boolean;
  hasNewsArticleSchema: boolean;
  hasPublisherLogo: boolean;
  hasAuthorInfo: boolean;
  hasCanonical: boolean;
  articleCount24h: number;
  hasFeaturedImage: boolean;
  imageWidth?: number;
  hasBreadcrumb: boolean;
  robotsAllowsGooglebot: boolean;
  robotsAllowsGooglebotNews: boolean;
}): NewsValidationReport {
  const checks: NewsCheck[] = [];

  checks.push({
    category: "RSS",
    name: "RSS Feed",
    status: params.hasRSS ? "pass" : "fail",
    message: params.hasRSS ? "RSS Feed mevcut" : "RSS Feed bulunamadı",
    recommendation: !params.hasRSS ? "/rss.xml route'u oluşturun" : undefined,
  });

  checks.push({
    category: "Sitemap",
    name: "News Sitemap",
    status: params.hasNewsSitemap ? "pass" : "fail",
    message: params.hasNewsSitemap ? "News Sitemap mevcut" : "News Sitemap bulunamadı",
    recommendation: !params.hasNewsSitemap ? "/news-sitemap.xml oluşturun" : undefined,
  });

  checks.push({
    category: "Schema",
    name: "NewsArticle Schema",
    status: params.hasNewsArticleSchema ? "pass" : "fail",
    message: params.hasNewsArticleSchema ? "JSON-LD NewsArticle mevcut" : "JSON-LD NewsArticle eksik",
  });

  checks.push({
    category: "Publisher",
    name: "Publisher Logo",
    status: params.hasPublisherLogo ? "pass" : "fail",
    message: params.hasPublisherLogo ? "Publisher logo mevcut" : "Publisher logo eksik",
    recommendation: !params.hasPublisherLogo ? "400x400 PNG logo ekleyin" : undefined,
  });

  checks.push({
    category: "Author",
    name: "Author Bilgisi",
    status: params.hasAuthorInfo ? "pass" : "warn",
    message: params.hasAuthorInfo ? "Author bilgisi mevcut" : "Author bilgisi eksik",
  });

  checks.push({
    category: "Image",
    name: "Görsel Gereksinimleri",
    status: params.hasFeaturedImage && (params.imageWidth || 0) >= NEWS_IMAGE_REQUIREMENTS.minWidth ? "pass" : params.hasFeaturedImage ? "warn" : "fail",
    message: params.hasFeaturedImage
      ? `Görsel mevcut${params.imageWidth ? ` (${params.imageWidth}px)` : ""}`
      : "Öne çıkan görsel eksik",
    recommendation: !params.hasFeaturedImage ? "En az 1200x675 piksel görsel ekleyin" : undefined,
  });

  checks.push({
    category: "Indexing",
    name: "Googlebot İzni",
    status: params.robotsAllowsGooglebot ? "pass" : "fail",
    message: params.robotsAllowsGooglebot ? "Googlebot engellenmemiş" : "Googlebot engelleniyor!",
  });

  checks.push({
    category: "Indexing",
    name: "Googlebot-News İzni",
    status: params.robotsAllowsGooglebotNews ? "pass" : "warn",
    message: params.robotsAllowsGooglebotNews ? "Googlebot-News engellenmemiş" : "Googlebot-News kontrol edilemedi",
  });

  checks.push({
    category: "Content",
    name: "24 Saat İçerik Üretimi",
    status: params.articleCount24h >= 3 ? "pass" : params.articleCount24h >= 1 ? "warn" : "fail",
    message: `Son 24 saatte ${params.articleCount24h} haber`,
    recommendation: params.articleCount24h < 3 ? "Günde en az 3 haber hedefleyin" : undefined,
  });

  checks.push({
    category: "Technical",
    name: "Canonical URL",
    status: params.hasCanonical ? "pass" : "warn",
    message: params.hasCanonical ? "Canonical URL mevcut" : "Canonical URL eksik",
  });

  checks.push({
    category: "Technical",
    name: "Breadcrumb",
    status: params.hasBreadcrumb ? "pass" : "warn",
    message: params.hasBreadcrumb ? "Breadcrumb mevcut" : "Breadcrumb yapısı geliştirilebilir",
  });

  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const warnings = checks.filter((c) => c.status === "warn").length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    score,
    checks,
    passed,
    failed,
    warnings,
    isCompliant: score >= 80 && failed === 0,
  };
}
