/**
 * Entity Intelligence Engine — Service
 *
 * Merkezi entity servisi.
 * SEO, GEO, Related Articles, Knowledge Graph, Tag Engine, Internal Linking tarafından kullanılacak.
 */

import { extractEntities } from "./extractor";
import { resolveEntity } from "./resolver";
import { registerExtractedEntities, queryEntities, getStats } from "./registry";
import { calculateEntityScore, rankEntities } from "./scoring";
import { MIN_CONFIDENCE_FOR_STORAGE } from "./config";
import type { Entity, ExtractedEntity, EntityScore, EntityServiceResult } from "./types";

// ─── Analyze Content ────────────────────────────────────────

/** Bir makaleyi analiz et ve entity'leri çıkar */
export async function analyzeArticle(
  title: string,
  content: string
): Promise<EntityServiceResult<{
  extracted: ExtractedEntity[];
  registered: Entity[];
  topEntities: EntityScore[];
}>> {
  try {
    // 1. AI ile entity çıkarımı
    const extraction = await extractEntities(title, content);

    if (!extraction.success || extraction.entities.length === 0) {
      return {
        success: true,
        data: { extracted: [], registered: [], topEntities: [] },
      };
    }

    // 2. Entity'leri kaydet
    const registered = registerExtractedEntities(extraction.entities);

    // 3. Skor hesapla ve sırala
    const scores = rankEntities(registered);

    return {
      success: true,
      data: {
        extracted: extraction.entities,
        registered,
        topEntities: scores.slice(0, 10),
      },
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: (error as Error).message,
    };
  }
}

// ─── Entity Lookup ──────────────────────────────────────────

/** Entity ara */
export async function findEntity(name: string): Promise<EntityServiceResult<Entity | null>> {
  try {
    const result = resolveEntity(name);
    return {
      success: true,
      data: result.entity,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: (error as Error).message,
    };
  }
}

// ─── Statistik ──────────────────────────────────────────────

export function getEntityStats() {
  return getStats();
}

// ─── Re-export for convenience ──────────────────────────────

export { extractEntities, extractEntitiesFromText } from "./extractor";
export { resolveEntity, resolveEntities, areSameEntity, normalizeEntityName } from "./resolver";
export { calculateEntityScore, rankEntities, topEntities } from "./scoring";
export {
  registerEntity,
  getEntity,
  getEntityByName,
  updateEntity,
  queryEntities,
  registerExtractedEntities,
} from "./registry";
