/**
 * GEO Intelligence Engine — Configuration
 */

import type { GEOPlatform } from "./types";
import { GEO_PLATFORM as P } from "./types";

// ─── Platform Labels ────────────────────────────────────────

export const PLATFORM_LABELS: Record<GEOPlatform, string> = {
  [P.CHATGPT]: "ChatGPT",
  [P.GOOGLE_AI]: "Google AI Overview",
  [P.GEMINI]: "Gemini",
  [P.CLAUDE]: "Claude",
  [P.PERPLEXITY]: "Perplexity",
  [P.COPILOT]: "Microsoft Copilot",
  [P.BRAVE]: "Brave Search AI",
  [P.YOU]: "You.com",
};

// ─── Scoring Weights ────────────────────────────────────────

export const GEO_SCORE_WEIGHTS = {
  entity: 0.20,
  authority: 0.15,
  freshness: 0.15,
  citation: 0.10,
  semantic: 0.15,
  answer: 0.10,
  trust: 0.10,
  aiReadability: 0.05,
};

// ─── Thresholds ─────────────────────────────────────────────

export const GEO_THRESHOLDS = {
  /** Bu skorun altı "low" */
  low: 0.4,
  /** Bu skorun üstü "high" */
  high: 0.7,
  /** Minimum yayınlanabilir GEO skoru */
  minPublishable: 0.3,
  /** Hedef GEO skoru */
  target: 0.7,
};

// ─── Readability Config ─────────────────────────────────────

export const READABILITY_CONFIG = {
  /** Hedef cümle uzunluğu (kelime) */
  targetSentenceLength: 15,
  /** Maksimum paragraf uzunluğu (cümle) */
  maxParagraphSentences: 5,
  /** Hedef Flesch-Kincaid seviyesi */
  targetFleschKincaid: 60,
};

// ─── Freshness Config ───────────────────────────────────────

export const FRESHNESS_CONFIG = {
  breaking: 6,   // saat
  recent: 48,    // saat
  current: 168,  // saat (1 hafta)
  dated: 720,    // saat (30 gün)
  // üstü archival
};

// ─── Platform-Specific Config ───────────────────────────────

export const PLATFORM_CONFIG: Record<GEOPlatform, {
  maxSummaryLength: number;
  prefersStructuredData: boolean;
  prefersCitations: boolean;
  prefersFreshContent: boolean;
}> = {
  [P.CHATGPT]:       { maxSummaryLength: 300, prefersStructuredData: true,  prefersCitations: true,  prefersFreshContent: true },
  [P.GOOGLE_AI]:     { maxSummaryLength: 200, prefersStructuredData: true,  prefersCitations: true,  prefersFreshContent: true },
  [P.GEMINI]:        { maxSummaryLength: 250, prefersStructuredData: true,  prefersCitations: false, prefersFreshContent: false },
  [P.CLAUDE]:        { maxSummaryLength: 500, prefersStructuredData: true,  prefersCitations: true,  prefersFreshContent: false },
  [P.PERPLEXITY]:    { maxSummaryLength: 200, prefersStructuredData: false, prefersCitations: true,  prefersFreshContent: true },
  [P.COPILOT]:       { maxSummaryLength: 250, prefersStructuredData: true,  prefersCitations: true,  prefersFreshContent: true },
  [P.BRAVE]:         { maxSummaryLength: 150, prefersStructuredData: false, prefersCitations: false, prefersFreshContent: true },
  [P.YOU]:           { maxSummaryLength: 200, prefersStructuredData: false, prefersCitations: false, prefersFreshContent: false },
};
