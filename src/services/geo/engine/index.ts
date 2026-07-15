/**
 * GEO Engine — Main Engine
 *
 * Tüm GEO analizini tek çağrıda yapar.
 */

import { analyzeContent } from "../analysis";
import { calculateGEOScore, getScoreLevel } from "../scoring/calculator";
import { generateGEOMetadata } from "../metadata/generator";
import { validateGEO } from "../validators/geo-validator";
import type { GEOScore, GEOAnalysis, GEOMetadata, GEOValidation } from "../types";

export interface GEOReport {
  analysis: GEOAnalysis;
  score: GEOScore;
  metadata: GEOMetadata;
  validation: GEOValidation;
  scoreLevel: "low" | "medium" | "high";
}

export function analyzeArticleGEO(params: {
  content: string;
  entityCount?: number;
  citationCount?: number;
  sourceCount?: number;
  authorBio?: string | null;
  originalUrl?: string | null;
}): GEOReport {
  const analysis = analyzeContent(params.content, {
    entityCount: params.entityCount,
    authorBio: params.authorBio,
    originalUrl: params.originalUrl,
  });

  const score = calculateGEOScore(analysis);
  const metadata = generateGEOMetadata({
    entityCount: params.entityCount || 0,
    citationCount: params.citationCount || 0,
    sourceCount: params.sourceCount || 0,
    content: params.content,
    scores: {},
  });
  const validation = validateGEO(analysis);

  return {
    analysis,
    score,
    metadata,
    validation,
    scoreLevel: getScoreLevel(score.overall),
  };
}
