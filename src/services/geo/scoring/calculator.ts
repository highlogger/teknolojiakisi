/**
 * GEO Engine — Score Calculator
 *
 * GEO skor hesaplama.
 */

import type { GEOScore, GEOAnalysis } from "../types";
import { GEO_SCORE_WEIGHTS } from "../config";

export function calculateGEOScore(analysis: GEOAnalysis): GEOScore {
  const entity = analysis.entityCoverage * 0.6 + (analysis.entityDensity > 5 ? 0.4 : 0.2);
  const authority = analysis.authoritySignals.total;
  const freshness = analysis.freshness;
  const citation = analysis.citationQuality;
  const semantic = analysis.semanticRichness * 0.5 + analysis.contentClarity * 0.3 + analysis.informationGain * 0.2;
  const answer = analysis.answerQuality * 0.6 + analysis.questionCoverage * 0.4;
  const trust = analysis.authoritySignals.total * 0.5 + analysis.sourceQuality * 0.3 + analysis.citationQuality * 0.2;
  const aiReadability = analysis.readability * 0.4 + analysis.structure * 0.4 + analysis.contentClarity * 0.2;

  const overall = Math.round((
    entity * GEO_SCORE_WEIGHTS.entity +
    authority * GEO_SCORE_WEIGHTS.authority +
    freshness * GEO_SCORE_WEIGHTS.freshness +
    citation * GEO_SCORE_WEIGHTS.citation +
    semantic * GEO_SCORE_WEIGHTS.semantic +
    answer * GEO_SCORE_WEIGHTS.answer +
    trust * GEO_SCORE_WEIGHTS.trust +
    aiReadability * GEO_SCORE_WEIGHTS.aiReadability
  ) * 100) / 100;

  return {
    entity: Math.round(entity * 100) / 100,
    authority: Math.round(authority * 100) / 100,
    freshness: Math.round(freshness * 100) / 100,
    citation: Math.round(citation * 100) / 100,
    semantic: Math.round(semantic * 100) / 100,
    answer: Math.round(answer * 100) / 100,
    trust: Math.round(trust * 100) / 100,
    aiReadability: Math.round(aiReadability * 100) / 100,
    overall,
  };
}

export function getScoreLevel(score: number): "low" | "medium" | "high" {
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}
