/**
 * SEO & Metadata Agent — Type Definitions
 */

export interface SEOInput {
  article: { title: string; content: string; excerpt?: string };
  research: {
    source: { name: string; url: string };
    entities: { people: string[]; companies: string[]; products: string[]; technologies: string[] };
    relatedTopics: string[];
  };
  verification: { status: string; verificationScore: number };
  entities?: { entities: Array<{ name: string; type: string; confidence: number }> };
}

export interface SEOResult {
  version: string; generatedAt: string;
  seoScore: number;
  title: string; description: string; slug: string;
  canonical: string; robots: string; language: string;
  readingTime: string; wordCount: number;
  primaryKeyword: string; secondaryKeywords: string[];
  entityKeywords: string[]; topicKeywords: string[];
  openGraph: OGMeta;
  twitterCard: TwitterMeta;
  schema: { newsArticle: object; breadcrumbList: object; organization: object; website: object };
  newsMetadata: NewsMeta;
  discoverMetadata: DiscoverMeta;
  breadcrumbs: BreadcrumbItem[];
  featuredSnippet: string;
  internalLinks: Array<{ anchorText: string; url: string; confidence: number }>;
  validation: ValidationReport;
}

export interface OGMeta { ogTitle: string; ogDescription: string; ogImage: string; ogType: string; ogUrl: string; ogLocale: string; siteName: string; }
export interface TwitterMeta { twitterTitle: string; twitterDescription: string; twitterImage: string; twitterCard: string; }
export interface NewsMeta { publicationDate: string; modifiedDate: string; author: string; publisher: string; language: string; newsKeywords: string[]; }
export interface DiscoverMeta { priority: string; freshness: string; topic: string; isBreaking: boolean; isEvergreen: boolean; }
export interface BreadcrumbItem { name: string; url: string; position: number; }
export interface ValidationReport { score: number; passed: number; failed: number; warnings: number; checks: Array<{ category: string; name: string; status: "pass"|"fail"|"warn"; message: string }>; }
