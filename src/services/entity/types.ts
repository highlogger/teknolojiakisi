/**
 * Entity Intelligence Engine — Type Definitions
 *
 * Merkezi varlık yönetimi.
 * AI Core Engine ve Content Engine ile uyumlu.
 */

// ─── Entity Type Enum ──────────────────────────────────────

export const ENTITY_TYPE = {
  PERSON: "person",
  COMPANY: "company",
  PRODUCT: "product",
  SOFTWARE: "software",
  HARDWARE: "hardware",
  TECHNOLOGY: "technology",
  PROGRAMMING_LANGUAGE: "programming_language",
  FRAMEWORK: "framework",
  OPERATING_SYSTEM: "operating_system",
  GAME: "game",
  MOVIE: "movie",
  EVENT: "event",
  CONFERENCE: "conference",
  COUNTRY: "country",
  CITY: "city",
  ORGANIZATION: "organization",
  CRYPTOCURRENCY: "cryptocurrency",
  STOCK: "stock",
  WEBSITE: "website",
  SERVICE: "service",
  DEVICE: "device",
  BROWSER: "browser",
  SOCIAL_PLATFORM: "social_platform",
  AI_MODEL: "ai_model",
  AI_COMPANY: "ai_company",
  UNIVERSITY: "university",
  RESEARCH_PAPER: "research_paper",
  PATENT: "patent",
} as const;

export type EntityType = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE];

// ─── Entity ────────────────────────────────────────────────

export interface Entity {
  id: string;
  name: string;
  slug: string;
  type: EntityType;
  aliases: string[];
  description: string | null;
  confidence: number; // 0-1
  source: "ai_extraction" | "manual" | "imported";
  firstSeen: string; // ISO date
  lastSeen: string; // ISO date
  metadata: EntityMetadata;
}

// ─── Entity Metadata ───────────────────────────────────────

export interface EntityMetadata {
  wikipediaUrl?: string;
  websiteUrl?: string;
  twitterHandle?: string;
  foundedYear?: number;
  headquarters?: string;
  ticker?: string; // Stock/crypto sembolü
  parent?: string; // Ana şirket
  category?: string;
  tags: string[];
  customFields: Record<string, string>;
}

// ─── Entity Extraction ─────────────────────────────────────

export interface ExtractedEntity {
  name: string;
  type: EntityType;
  confidence: number; // 0-1
  position?: { start: number; end: number }; // İçerikteki konum
  context?: string; // Geçtiği cümle
  metadata?: Partial<EntityMetadata>;
}

export interface ExtractionResult {
  success: boolean;
  entities: ExtractedEntity[];
  totalFound: number;
  provider: string;
  model: string;
  duration: number; // ms
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  error?: string;
}

// ─── Entity Resolution ─────────────────────────────────────

export interface ResolutionCandidate {
  entityId: string;
  name: string;
  score: number; // Benzerlik skoru 0-1
  matchedBy: "exact" | "alias" | "fuzzy" | "ai";
}

export interface ResolutionResult {
  input: string;
  resolved: boolean;
  entity: Entity | null;
  candidates: ResolutionCandidate[];
  bestMatch: ResolutionCandidate | null;
}

// ─── Entity Score ──────────────────────────────────────────

export interface EntityScore {
  entityId: string;
  name: string;
  type: EntityType;
  confidence: number; // AI confidence 0-1
  frequency: number; // İçerikte geçme sayısı
  relevance: number; // Konuyla ilgililik 0-1
  authority: number; // Otorite skoru 0-1
  total: number; // Ağırlıklı toplam
}

// ─── Entity Query ──────────────────────────────────────────

export interface EntityQuery {
  type?: EntityType | EntityType[];
  search?: string;
  minConfidence?: number;
  limit?: number;
  sortBy?: "name" | "confidence" | "lastSeen" | "frequency";
  sortOrder?: "asc" | "desc";
}

// ─── Service Result ────────────────────────────────────────

export interface EntityServiceResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}
