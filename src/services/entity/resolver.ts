/**
 * Entity Intelligence Engine — Resolver
 *
 * Farklı yazımları aynı entity altında toplar.
 * Exact match → Alias match → Fuzzy match → AI match
 */

import type { Entity, ResolutionCandidate, ResolutionResult } from "./types";
import { getEntityByName, getEntity } from "./registry";
import { KNOWN_ALIASES, RESOLVER_CONFIG } from "./config";
import { slugify } from "@/lib/utils";

// ─── Name Normalization ─────────────────────────────────────

export function normalizeEntityName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")       // Çoklu boşlukları tek boşluğa
    .replace(/[-–—]/g, "-")     // Farklı tireleri standart tireye
    .replace(/[""]/g, '"')      // Farklı tırnakları standart
    .replace(/['']/g, "'");
}

// ─── Resolution Pipeline ────────────────────────────────────

/** Verilen ismi mevcut entity'lere karşı çözümle */
export function resolveEntity(
  inputName: string,
  options?: { useAI?: boolean }
): ResolutionResult {
  const name = normalizeEntityName(inputName);
  const candidates: ResolutionCandidate[] = [];

  // 1. Exact match
  const exact = getEntityByName(name);
  if (exact) {
    candidates.push({ entityId: exact.id, name: exact.name, score: 1.0, matchedBy: "exact" });
  }

  // 2. Known alias match
  for (const [canonical, aliases] of Object.entries(KNOWN_ALIASES)) {
    if (canonical === name || aliases.some((a) => normalizeEntityName(a) === name)) {
      const entity = getEntityByName(canonical);
      if (entity && !candidates.find((c) => c.entityId === entity.id)) {
        candidates.push({ entityId: entity.id, name: entity.name, score: 0.95, matchedBy: "alias" });
      }
    }
  }

  // 3. Slug match (Türkçe/İngilizce karakter farklarını normalleştirir)
  const nameSlug = slugify(name);
  for (const [canonical, aliases] of Object.entries(KNOWN_ALIASES)) {
    if (slugify(canonical) === nameSlug) {
      const entity = getEntityByName(canonical);
      if (entity && !candidates.find((c) => c.entityId === entity.id)) {
        candidates.push({ entityId: entity.id, name: entity.name, score: 0.9, matchedBy: "fuzzy" });
      }
    }
    for (const alias of aliases) {
      if (slugify(alias) === nameSlug) {
        const entity = getEntityByName(canonical);
        if (entity && !candidates.find((c) => c.entityId === entity.id)) {
          candidates.push({ entityId: entity.id, name: entity.name, score: 0.9, matchedBy: "fuzzy" });
        }
      }
    }
  }

  // 4. Fuzzy match (basit Levenshtein tabanlı)
  for (const [canonical] of Object.entries(KNOWN_ALIASES)) {
    const similarity = stringSimilarity(name.toLowerCase(), canonical.toLowerCase());
    if (similarity >= RESOLVER_CONFIG.minFuzzyScore) {
      const entity = getEntityByName(canonical);
      if (entity && !candidates.find((c) => c.entityId === entity.id)) {
        candidates.push({ entityId: entity.id, name: entity.name, score: similarity, matchedBy: "fuzzy" });
      }
    }
  }

  // En iyi adayı seç
  let bestMatch: ResolutionCandidate | null = null;
  if (candidates.length > 0) {
    bestMatch = candidates.reduce((best, c) => (c.score > best.score ? c : best), candidates[0]);
  }

  const resolved = bestMatch !== null && bestMatch.score >= RESOLVER_CONFIG.minFuzzyScore;

  return {
    input: inputName,
    resolved,
    entity: resolved && bestMatch ? getEntity(bestMatch.entityId) || null : null,
    candidates,
    bestMatch,
  };
}

/** Birden fazla entity ismini çözümle */
export function resolveEntities(names: string[]): ResolutionResult[] {
  return names.map((name) => resolveEntity(name));
}

/** İki entity aynı mı kontrol et */
export function areSameEntity(name1: string, name2: string): boolean {
  const n1 = normalizeEntityName(name1);
  const n2 = normalizeEntityName(name2);

  if (n1 === n2) return true;
  if (slugify(n1) === slugify(n2)) return true;

  const result = resolveEntity(n1);
  return result.resolved && result.entity?.name === n2;
}

// ─── String Similarity (Levenshtein-based) ──────────────────

function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;

  const maxLen = Math.max(a.length, b.length);
  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLen;
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}
