/**
 * GEO Engine — Key Takeaways & Related Questions Models
 */

import type { KeyTakeaway, RelatedQuestion } from "../types";

// ─── Key Takeaways ──────────────────────────────────────────

export function createTakeaway(text: string, order: number, importance = 0.5): KeyTakeaway {
  return { id: `kt_${Date.now().toString(36)}_${order}`, text, order, importance };
}

export function rankTakeaways(takeaways: KeyTakeaway[]): KeyTakeaway[] {
  return [...takeaways].sort((a, b) => b.importance - a.importance);
}

// ─── Related Questions ──────────────────────────────────────

export function createRelatedQuestion(question: string, relevance = 0.5): RelatedQuestion {
  return {
    id: `rq_${Date.now().toString(36)}`,
    question,
    answer: null,
    relevance,
    generatedAt: null,
  };
}

export function filterRelevantQuestions(questions: RelatedQuestion[], threshold = 0.5): RelatedQuestion[] {
  return questions.filter((q) => q.relevance >= threshold);
}

// ─── Knowledge Signals ──────────────────────────────────────

export { type KnowledgeSignal } from "../types";
