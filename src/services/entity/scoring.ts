/**
 * Entity Intelligence Engine — Scoring
 *
 * Entity güven skoru hesaplama.
 */

import type { Entity, EntityScore } from "./types";

// ─── Score Calculation ──────────────────────────────────────

/** Entity için kapsamlı skor hesapla */
export function calculateEntityScore(
  entity: Entity,
  options: {
    frequency?: number;
    relevance?: number;
    authority?: number;
  } = {}
): EntityScore {
  const frequency = options.frequency || 1;
  const relevance = options.relevance || 0.5;
  const authority = options.authority || 0.5;

  // Ağırlıklı toplam
  const weights = {
    confidence: 0.35,
    frequency: 0.25,
    relevance: 0.25,
    authority: 0.15,
  };

  const total =
    entity.confidence * weights.confidence +
    normalizeScore(frequency, 10) * weights.frequency +
    relevance * weights.relevance +
    authority * weights.authority;

  return {
    entityId: entity.id,
    name: entity.name,
    type: entity.type,
    confidence: entity.confidence,
    frequency,
    relevance,
    authority,
    total: Math.round(total * 100) / 100,
  };
}

/** Birden fazla entity için skor hesapla ve sırala */
export function rankEntities(
  entities: Entity[],
  options: {
    frequencyMap?: Map<string, number>;
    relevanceMap?: Map<string, number>;
  } = {}
): EntityScore[] {
  const scores = entities.map((e) =>
    calculateEntityScore(e, {
      frequency: options.frequencyMap?.get(e.id) || 1,
      relevance: options.relevanceMap?.get(e.id) || 0.5,
    })
  );

  return scores.sort((a, b) => b.total - a.total);
}

/** Top N entity'yi skora göre filtrele */
export function topEntities(scores: EntityScore[], n = 5): EntityScore[] {
  return scores.slice(0, n);
}

// ─── Helpers ────────────────────────────────────────────────

function normalizeScore(value: number, max: number): number {
  return Math.min(1, Math.max(0, value / max));
}
