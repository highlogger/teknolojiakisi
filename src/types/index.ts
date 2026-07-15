export type ArticleStatus = "draft" | "published" | "archived";
export type SourceType = "rss" | "web";
export type SourceLanguage = "tr" | "en";
export type BotLogStatus = "success" | "error" | "no_new" | "partial";
export type UserRole = "admin" | "editor";

export interface ArticleWithRelations {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  categoryId: string | null;
  authorId: string | null;
  sourceId: string | null;
  originalUrl: string | null;
  originalTitle: string | null;
  language: string;
  status: ArticleStatus;
  isAiGenerated: boolean;
  aiModel: string | null;
  aiPromptTokens: number | null;
  aiCompletionTokens: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isFeatured: boolean;
  publishedAt: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string; color: string } | null;
  author: { id: string; name: string; slug: string; avatar: string | null } | null;
  tags: { tag: { id: string; name: string; slug: string } }[];
}

export interface FetchedArticle {
  title: string;
  url: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  publishedAt?: Date;
  sourceId: string;
  sourceName: string;
  language: SourceLanguage;
  category?: string;
}

export interface GeneratedArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  categoryId?: string;
  featuredImagePrompt?: string;
}

export interface BotRunResult {
  sourceId: string;
  sourceName: string;
  status: BotLogStatus;
  articlesFound: number;
  articlesGenerated: number;
  articlesPublished: number;
  errorMessage?: string;
  durationMs: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  siteUrl: string;
  defaultOgImage: string;
  googleAnalyticsId: string;
  googleVerificationCode: string;
  socialTwitter: string;
  socialFacebook: string;
  socialInstagram: string;
  socialYoutube: string;
  autoPublish: boolean;
  postsPerPage: number;
}
