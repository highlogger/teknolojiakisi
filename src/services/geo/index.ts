/**
 * GEO Intelligence Engine
 *
 * Generative Engine Optimization — AI arama motorları için içerik optimizasyonu.
 * ChatGPT, Google AI Overview, Gemini, Claude, Perplexity ve diğerleri için.
 *
 * Kullanım:
 *   import { analyzeArticleGEO } from "@/services/geo";
 *   const report = analyzeArticleGEO({ content, entityCount: 12 });
 */

// ─── Engine ─────────────────────────────────────────────────
export { analyzeArticleGEO } from "./engine";
export type { GEOReport } from "./engine";

// ─── Analysis ───────────────────────────────────────────────
export {
  analyzeContent,
  analyzeClarity,
  analyzeEntityCoverage,
  analyzeEntityDensity,
  analyzeAuthority,
  analyzeStructure,
  analyzeReadability,
} from "./analysis";

// ─── Scoring ────────────────────────────────────────────────
export { calculateGEOScore, getScoreLevel } from "./scoring/calculator";

// ─── Metadata ───────────────────────────────────────────────
export { generateGEOMetadata, getFreshnessLevel } from "./metadata/generator";

// ─── Validator ──────────────────────────────────────────────
export { validateGEO } from "./validators/geo-validator";

// ─── Models ─────────────────────────────────────────────────
export { createCitation, validateCitation, scoreCitations } from "./models/citation";
export { createSummary, validateSummaryLength, getSummaryStats } from "./models/summary";
export { createTakeaway, rankTakeaways, createRelatedQuestion, filterRelevantQuestions } from "./models/takeaways";

// ─── Types ──────────────────────────────────────────────────
export { GEO_PLATFORM } from "./types";
export type {
  GEOPlatform,
  GEOScore,
  GEOAnalysis,
  AuthoritySignals,
  GEOMetadata,
  Citation,
  AISummary,
  KeyTakeaway,
  RelatedQuestion,
  KnowledgeSignal,
  GEOValidation,
  GEOIssue,
} from "./types";

// ─── Config ─────────────────────────────────────────────────
export {
  PLATFORM_LABELS,
  GEO_SCORE_WEIGHTS,
  GEO_THRESHOLDS,
  PLATFORM_CONFIG,
  READABILITY_CONFIG,
  FRESHNESS_CONFIG,
} from "./config";
