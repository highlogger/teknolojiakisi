/**
 * Entity Intelligence Engine — Extractor
 *
 * AI ile içerikten entity çıkarımı.
 * AI Core Engine ile entegre.
 */

import { ai } from "@/services/ai";
import type { ExtractedEntity, ExtractionResult } from "./types";
import { ENTITY_EXTRACTION_SYSTEM, buildExtractionPrompt } from "./prompts";
import { ENTITY_EXTRACTION_MODEL, ENTITY_EXTRACTION_TEMPERATURE, ENTITY_EXTRACTION_MAX_TOKENS } from "./config";
import { normalizeEntityName } from "./resolver";

// ─── Main Extraction ───────────────────────────────────────

export async function extractEntities(
  title: string,
  content: string,
  options?: { maxEntities?: number }
): Promise<ExtractionResult> {
  const start = Date.now();

  const response = await ai.chatJSON<{
    entities: Array<{
      name: string;
      type: string;
      confidence: number;
    }>;
  }>(
    [
      { role: "system", content: ENTITY_EXTRACTION_SYSTEM },
      { role: "user", content: buildExtractionPrompt(title, content, options?.maxEntities || 20) },
    ],
    {
      model: ENTITY_EXTRACTION_MODEL,
      temperature: ENTITY_EXTRACTION_TEMPERATURE,
      maxTokens: ENTITY_EXTRACTION_MAX_TOKENS,
    }
  );

  if (!response.success || !response.parsed?.entities) {
    return {
      success: false,
      entities: [],
      totalFound: 0,
      provider: response.provider,
      model: response.model,
      duration: Date.now() - start,
      usage: response.usage,
      error: response.error?.message || "Entity extraction failed",
    };
  }

  const entities = response.parsed.entities
    .filter((e) => e.name && e.type && e.confidence > 0)
    .map((e) => ({
      name: normalizeEntityName(e.name),
      type: normalizeEntityType(e.type),
      confidence: Math.min(1, Math.max(0, e.confidence)),
    }));

  return {
    success: true,
    entities,
    totalFound: entities.length,
    provider: response.provider,
    model: response.model,
    duration: Date.now() - start,
    usage: response.usage,
  };
}

// ─── Quick Extract (kısa metinler için) ─────────────────────

export async function extractEntitiesFromText(
  text: string,
  maxEntities = 10
): Promise<ExtractedEntity[]> {
  const result = await extractEntities(text.substring(0, 100), text, { maxEntities });
  return result.entities;
}

// ─── Helpers ────────────────────────────────────────────────

function normalizeEntityType(type: string): ExtractedEntity["type"] {
  const lower = type.toLowerCase().trim();

  const typeMap: Record<string, string> = {
    "person": "person",
    "company": "company",
    "product": "product",
    "software": "software",
    "hardware": "hardware",
    "technology": "technology",
    "programming language": "programming_language",
    "programming_language": "programming_language",
    "framework": "framework",
    "operating system": "operating_system",
    "os": "operating_system",
    "game": "game",
    "movie": "movie",
    "film": "movie",
    "event": "event",
    "conference": "conference",
    "country": "country",
    "city": "city",
    "organization": "organization",
    "organisation": "organization",
    "cryptocurrency": "cryptocurrency",
    "crypto": "cryptocurrency",
    "stock": "stock",
    "website": "website",
    "service": "service",
    "device": "device",
    "browser": "browser",
    "social platform": "social_platform",
    "social_platform": "social_platform",
    "social media": "social_platform",
    "ai model": "ai_model",
    "ai_model": "ai_model",
    "llm": "ai_model",
    "ai company": "ai_company",
    "ai_company": "ai_company",
    "university": "university",
    "research paper": "research_paper",
    "research_paper": "research_paper",
    "paper": "research_paper",
    "patent": "patent",
  };

  return (typeMap[lower] || "technology") as ExtractedEntity["type"];
}
