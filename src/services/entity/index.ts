/**
 * Entity Intelligence Engine
 *
 * Merkezi varlık yönetim sistemi.
 * AI Core Engine ve Content Engine ile uyumlu.
 *
 * Kullanım:
 *   import { analyzeArticle, findEntity } from "@/services/entity";
 *   const result = await analyzeArticle(title, content);
 */

// ─── Service ────────────────────────────────────────────────
export {
  analyzeArticle,
  findEntity,
  getEntityStats,
  extractEntities,
  extractEntitiesFromText,
  resolveEntity,
  resolveEntities,
  areSameEntity,
  normalizeEntityName,
  calculateEntityScore,
  rankEntities,
  topEntities,
  registerEntity,
  getEntity,
  getEntityByName,
  updateEntity,
  queryEntities,
  registerExtractedEntities,
} from "./service";

// ─── Types ─────────────────────────────────────────────────
export { ENTITY_TYPE } from "./types";
export type {
  EntityType,
  Entity,
  EntityMetadata,
  ExtractedEntity,
  ExtractionResult,
  ResolutionResult,
  EntityScore,
  EntityQuery,
  EntityServiceResult,
} from "./types";

// ─── Config ────────────────────────────────────────────────
export {
  ENTITY_EXTRACTION_MODEL,
  ENTITY_TYPE_LABELS,
  CONFIDENCE_HIGH,
  CONFIDENCE_MEDIUM,
  CONFIDENCE_LOW,
  MIN_CONFIDENCE_FOR_STORAGE,
  KNOWN_ALIASES,
  RESOLVER_CONFIG,
} from "./config";
