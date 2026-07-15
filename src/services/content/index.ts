/**
 * Content Engine
 *
 * Merkezi içerik yönetim altyapısı.
 *
 * Kullanım:
 *   import { lifecycle, status, metadata, workflow, tags, categories } from "@/services/content";
 */

// ─── Lifecycle ──────────────────────────────────────────────
export {
  getLifecycleState,
  transitionStatus,
  initializeLifecycle,
  onAiGenerated,
  publishArticle,
  onTransition,
  triggerHooks,
} from "./lifecycle";
export type { LifecycleState } from "./lifecycle";

// ─── Status ────────────────────────────────────────────────
export {
  canTransition,
  getAvailableTransitions,
  transition,
  requiresEditorReview,
  statusLabel,
  statusColor,
  STATUS_TRANSITIONS,
} from "./status";

// ─── Metadata ──────────────────────────────────────────────
export {
  calculateWordCount,
  calculateReadingTime,
  buildMetadata,
  updateMetadata,
  setScore,
  validateMetadata,
} from "./metadata";
export type { MetadataInput } from "./metadata";

// ─── Workflow ──────────────────────────────────────────────
export {
  logWorkflowEvent,
  getWorkflowHistory,
  getCurrentStatus,
  countTransitions,
  getWorkflowSummary,
} from "./workflow";

// ─── Tags ──────────────────────────────────────────────────
export {
  attachTags,
  detachTags,
  replaceTags,
  suggestTagsFromAI,
  getPopularTags,
} from "./tags";
export type { TagSuggestionInput } from "./tags";

// ─── Categories ────────────────────────────────────────────
export {
  createCategory,
  findCategoryBySlug,
  getCategoryArticleCount,
  getCategoryList,
} from "./categories";
export type { CategoryTree } from "./categories";

// ─── Content Types ─────────────────────────────────────────
export {
  getContentTypeConfig,
  getEnabledContentTypes,
  getAllContentTypes,
  isContentTypeEnabled,
} from "./content-types";
export type { ContentTypeConfig } from "./content-types";

// ─── Types ─────────────────────────────────────────────────
export {
  CONTENT_STATUS,
  CONTENT_TYPE,
  DEFAULT_METADATA,
} from "./types";
export type {
  ContentStatus,
  ContentType,
  ContentMetadata,
  StatusTransition,
  WorkflowEvent,
  ContentRevision,
  TransitionResult,
  ArticleEngineData,
} from "./types";
