/**
 * Entity Intelligence Engine — Registry
 *
 * Entity kayıt defteri.
 * In-memory store — ileride veritabanına bağlanacak.
 */

import type { Entity, EntityType, EntityQuery } from "./types";
import { type ExtractedEntity } from "./types";
import { MIN_CONFIDENCE_FOR_STORAGE } from "./config";
import { slugify } from "@/lib/utils";

// ─── In-Memory Store ────────────────────────────────────────

const entities = new Map<string, Entity>();
const typeIndex = new Map<string, Set<string>>(); // type → entity ID'leri

// ─── CRUD ──────────────────────────────────────────────────

export function registerEntity(entity: Entity): Entity {
  entities.set(entity.id, entity);

  // Type index güncelle
  if (!typeIndex.has(entity.type)) {
    typeIndex.set(entity.type, new Set());
  }
  typeIndex.get(entity.type)!.add(entity.id);

  return entity;
}

export function getEntity(id: string): Entity | undefined {
  return entities.get(id);
}

export function getEntityByName(name: string): Entity | undefined {
  const slug = slugify(name);
  const all = Array.from(entities.values());
  for (const entity of all) {
    if (entity.slug === slug) return entity;
    if (entity.aliases.some((a: string) => slugify(a) === slug)) return entity;
  }
  return undefined;
}

export function updateEntity(id: string, updates: Partial<Entity>): Entity | undefined {
  const entity = entities.get(id);
  if (!entity) return undefined;

  const updated = { ...entity, ...updates, lastSeen: new Date().toISOString() };
  entities.set(id, updated);
  return updated;
}

export function queryEntities(query: EntityQuery = {}): Entity[] {
  let results = Array.from(entities.values());

  // Type filtresi
  if (query.type) {
    const types = Array.isArray(query.type) ? query.type : [query.type];
    const ids = new Set<string>();
    for (const t of types) {
      const typeIds = typeIndex.get(t);
      if (typeIds) typeIds.forEach((id) => ids.add(id));
    }
    results = results.filter((e) => ids.has(e.id));
  }

  // Arama
  if (query.search) {
    const lower = query.search.toLowerCase();
    results = results.filter(
      (e) =>
        e.name.toLowerCase().includes(lower) ||
        e.aliases.some((a) => a.toLowerCase().includes(lower))
    );
  }

  // Confidence filtresi
  if (query.minConfidence !== undefined) {
    results = results.filter((e) => e.confidence >= query.minConfidence!);
  }

  // Sıralama
  const sortBy = query.sortBy || "confidence";
  const sortOrder = query.sortOrder || "desc";
  results.sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case "name": cmp = a.name.localeCompare(b.name); break;
      case "confidence": cmp = a.confidence - b.confidence; break;
      case "lastSeen": cmp = a.lastSeen.localeCompare(b.lastSeen); break;
      case "frequency": cmp = (a.metadata.customFields["frequency"] || "0").localeCompare(b.metadata.customFields["frequency"] || "0"); break;
    }
    return sortOrder === "desc" ? -cmp : cmp;
  });

  // Limit
  if (query.limit) results = results.slice(0, query.limit);

  return results;
}

// ─── Bulk Operations ───────────────────────────────────────

export function registerExtractedEntities(
  extracted: ExtractedEntity[],
  source: Entity["source"] = "ai_extraction"
): Entity[] {
  const registered: Entity[] = [];

  for (const ex of extracted) {
    if (ex.confidence < MIN_CONFIDENCE_FOR_STORAGE) continue;

    const existing = getEntityByName(ex.name);
    if (existing) {
      // Mevcut entity'yi güncelle
      const updated = updateEntity(existing.id, {
        confidence: Math.max(existing.confidence, ex.confidence),
        lastSeen: new Date().toISOString(),
      });
      if (updated) registered.push(updated);
    } else {
      // Yeni entity oluştur
      const now = new Date().toISOString();
      const entity = registerEntity({
        id: `ent_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        name: ex.name,
        slug: slugify(ex.name),
        type: ex.type,
        aliases: [],
        description: null,
        confidence: ex.confidence,
        source,
        firstSeen: now,
        lastSeen: now,
        metadata: {
          tags: [],
          customFields: {},
          ...ex.metadata,
        },
      });
      registered.push(entity);
    }
  }

  return registered;
}

export function getStats(): {
  total: number;
  byType: Record<string, number>;
  avgConfidence: number;
} {
  const all = Array.from(entities.values());
  const byType: Record<string, number> = {};

  let totalConf = 0;
  for (const e of all) {
    byType[e.type] = (byType[e.type] || 0) + 1;
    totalConf += e.confidence;
  }

  return {
    total: all.length,
    byType,
    avgConfidence: all.length > 0 ? totalConf / all.length : 0,
  };
}
