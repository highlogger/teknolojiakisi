/**
 * Content Engine — Type Definitions
 *
 * Merkezi içerik yönetim tipleri.
 * AI Core Engine ile uyumlu.
 */

// ─── Content Status ────────────────────────────────────────

export const CONTENT_STATUS = {
  DRAFT: "draft",
  AI_GENERATED: "ai_generated",
  EDITOR_REVIEW: "editor_review",
  SEO_OPTIMIZED: "seo_optimized",
  FACT_CHECKED: "fact_checked",
  READY: "ready",
  PUBLISHED: "published",
  UPDATED: "updated",
  ARCHIVED: "archived",
  DELETED: "deleted",
} as const;

export type ContentStatus = (typeof CONTENT_STATUS)[keyof typeof CONTENT_STATUS];

// ─── Content Type ──────────────────────────────────────────

export const CONTENT_TYPE = {
  NEWS: "news",
  REVIEW: "review",
  GUIDE: "guide",
  COMPARISON: "comparison",
  OPINION: "opinion",
  INTERVIEW: "interview",
  VIDEO: "video",
  PODCAST: "podcast",
  LIVE_BLOG: "live_blog",
} as const;

export type ContentType = (typeof CONTENT_TYPE)[keyof typeof CONTENT_TYPE];

// ─── Metadata ───────────────────────────────────────────────

export interface ContentMetadata {
  /** Okuma süresi (dakika) */
  readingTime: number | null;
  /** Kelime sayısı */
  wordCount: number | null;
  /** Dil */
  language: string;
  /** Orijinal kaynak adı */
  originalSource: string | null;
  /** Orijinal URL */
  originalUrl: string | null;
  /** İçe aktarma tarihi */
  importDate: string | null;
  /** Son güncelleme tarihi */
  updatedDate: string | null;
  /** AI sağlayıcı */
  aiProvider: string | null;
  /** AI model versiyonu */
  aiVersion: string | null;
  /** Kullanılan prompt versiyonu */
  promptVersion: string | null;

  // Skorlar (henüz hesaplanmıyor, altyapı hazır)
  contentScore: number | null;
  seoScore: number | null;
  geoScore: number | null;
  factScore: number | null;
  editorialScore: number | null;
  qualityScore: number | null;
  totalScore: number | null;
}

export const DEFAULT_METADATA: ContentMetadata = {
  readingTime: null,
  wordCount: null,
  language: "tr",
  originalSource: null,
  originalUrl: null,
  importDate: null,
  updatedDate: null,
  aiProvider: null,
  aiVersion: null,
  promptVersion: null,
  contentScore: null,
  seoScore: null,
  geoScore: null,
  factScore: null,
  editorialScore: null,
  qualityScore: null,
  totalScore: null,
};

// ─── Status Transition ─────────────────────────────────────

export interface StatusTransition {
  from: ContentStatus;
  to: ContentStatus;
  allowed: boolean;
  requiresRole?: "admin" | "editor";
  requiresCheck?: string; // Hangi kontrolün yapılması gerektiği
}

// ─── Workflow Event ────────────────────────────────────────

export interface WorkflowEvent {
  id: string;
  articleId: string;
  fromStatus: ContentStatus | null;
  toStatus: ContentStatus;
  actor: string; // "system" | "admin" | "editor" | "ai"
  timestamp: string;
  metadata?: Record<string, unknown>;
  note?: string;
}

// ─── Revision ──────────────────────────────────────────────

export interface ContentRevision {
  id: string;
  articleId: string;
  version: number;
  title: string;
  content: string;
  excerpt: string | null;
  status: ContentStatus;
  createdAt: string;
  createdBy: string;
  changeNote: string | null;
  diff?: string; // İleride diff algoritması için
}

// ─── Transition Result ─────────────────────────────────────

export interface TransitionResult {
  success: boolean;
  fromStatus: ContentStatus;
  toStatus: ContentStatus;
  error?: string;
  workflowEvent?: WorkflowEvent;
}

// ─── Article with Engine Fields ────────────────────────────

export interface ArticleEngineData {
  articleId: string;
  status: ContentStatus;
  contentType: ContentType;
  metadata: ContentMetadata;
  currentVersion: number;
  workflowHistory: WorkflowEvent[];
}
