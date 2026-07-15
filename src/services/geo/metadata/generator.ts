/**
 * GEO Engine — AI Metadata Generator
 *
 * Makale için AI metadata alanları.
 */

import type { GEOMetadata, GEOPlatform, GEOScore } from "../types";
import { calculateWordCount } from "@/services/content/metadata";
import { GEO_THRESHOLDS } from "../config";

export function generateGEOMetadata(params: {
  entityCount: number;
  citationCount: number;
  sourceCount: number;
  content: string;
  scores: Partial<Record<GEOPlatform, GEOScore>>;
}): GEOMetadata {
  const wordCount = calculateWordCount(params.content);
  const factDensity = params.entityCount > 0 ? Math.round((params.entityCount / wordCount) * 1000 * 100) / 100 : 0;

  return {
    entityCount: params.entityCount,
    citationCount: params.citationCount,
    readingComplexity: wordCount > 1500 ? "high" : wordCount > 800 ? "medium" : "low",
    factDensity,
    sourceCount: params.sourceCount,
    authorityLevel: params.sourceCount >= 3 ? "high" : params.sourceCount >= 1 ? "medium" : "low",
    freshnessLevel: "current",
    contentDepth: wordCount > 2000 ? "comprehensive" : wordCount > 1000 ? "deep" : wordCount > 500 ? "moderate" : "shallow",
    platformScores: params.scores,
    generatedAt: new Date().toISOString(),
  };
}

export function getFreshnessLevel(hoursSincePublished: number): GEOMetadata["freshnessLevel"] {
  if (hoursSincePublished <= 6) return "breaking";
  if (hoursSincePublished <= 48) return "recent";
  if (hoursSincePublished <= 168) return "current";
  if (hoursSincePublished <= 720) return "dated";
  return "archival";
}
