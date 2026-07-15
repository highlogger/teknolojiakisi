/**
 * GEO Intelligence Engine — Type Definitions
 *
 * Generative Engine Optimization için merkezi tipler.
 * AI Core, Content Engine ve Entity Engine ile uyumlu.
 */

// ─── Platform ───────────────────────────────────────────────

export const GEO_PLATFORM = {
  CHATGPT: "chatgpt",
  GOOGLE_AI: "google_ai_overview",
  GEMINI: "gemini",
  CLAUDE: "claude",
  PERPLEXITY: "perplexity",
  COPILOT: "microsoft_copilot",
  BRAVE: "brave_search_ai",
  YOU: "you_com",
} as const;

export type GEOPlatform = (typeof GEO_PLATFORM)[keyof typeof GEO_PLATFORM];

// ─── GEO Score ──────────────────────────────────────────────

export interface GEOScore {
  /** Entity varlığı ve doğruluğu */
  entity: number;
  /** Kaynak otoritesi ve güvenilirliği */
  authority: number;
  /** İçerik tazeliği */
  freshness: number;
  /** Kaynak gösterme kalitesi */
  citation: number;
  /** Semantik zenginlik */
  semantic: number;
  /** Soru-cevap kalitesi */
  answer: number;
  /** Güven skoru */
  trust: number;
  /** AI okunabilirliği */
  aiReadability: number;
  /** Toplam GEO skoru (ağırlıklı) */
  overall: number;
}

// ─── GEO Analysis ───────────────────────────────────────────

export interface GEOAnalysis {
  /** İçerik netliği 0-1 */
  contentClarity: number;
  /** Entity kapsamı 0-1 */
  entityCoverage: number;
  /** Entity yoğunluğu (kelime başına) */
  entityDensity: number;
  /** Otorite sinyalleri */
  authoritySignals: AuthoritySignals;
  /** Kaynak kalitesi */
  sourceQuality: number;
  /** Tazelik skoru */
  freshness: number;
  /** Atıf kalitesi */
  citationQuality: number;
  /** Okunabilirlik skoru */
  readability: number;
  /** Yapısal skor */
  structure: number;
  /** Soru kapsamı */
  questionCoverage: number;
  /** Cevap kalitesi */
  answerQuality: number;
  /** Bağlam bütünlüğü */
  contextCompleteness: number;
  /** Semantik zenginlik */
  semanticRichness: number;
  /** Bilgi kazancı */
  informationGain: number;
}

export interface AuthoritySignals {
  hasAuthorBio: boolean;
  hasSourceUrl: boolean;
  hasReferences: boolean;
  hasOriginalContent: boolean;
  domainAuthority: number;
  authorExpertise: number;
  total: number;
}

// ─── GEO Metadata ───────────────────────────────────────────

export interface GEOMetadata {
  entityCount: number;
  citationCount: number;
  readingComplexity: "low" | "medium" | "high";
  factDensity: number;
  sourceCount: number;
  authorityLevel: "low" | "medium" | "high" | "expert";
  freshnessLevel: "breaking" | "recent" | "current" | "dated" | "archival";
  contentDepth: "shallow" | "moderate" | "deep" | "comprehensive";
  platformScores: Partial<Record<GEOPlatform, GEOScore>>;
  generatedAt: string;
}

// ─── Citation ───────────────────────────────────────────────

export interface Citation {
  id: string;
  title: string;
  url: string;
  type: "article" | "paper" | "official" | "report" | "other";
  relevance: number;
  authority: number;
  accessDate: string;
}

// ─── AI Summary ─────────────────────────────────────────────

export interface AISummary {
  id: string;
  content: string;
  maxLength: number;
  platform: GEOPlatform;
  generatedAt: string | null;
  promptVersion: string | null;
}

// ─── Key Takeaway ───────────────────────────────────────────

export interface KeyTakeaway {
  id: string;
  text: string;
  order: number;
  importance: number;
}

// ─── Related Question ───────────────────────────────────────

export interface RelatedQuestion {
  id: string;
  question: string;
  answer: string | null;
  relevance: number;
  generatedAt: string | null;
}

// ─── Knowledge Signal ───────────────────────────────────────

export interface KnowledgeSignal {
  type: "entity" | "fact" | "statistic" | "definition" | "quote" | "date";
  value: string;
  confidence: number;
  source: string | null;
  position: { start: number; end: number };
}

// ─── GEO Validation ────────────────────────────────────────

export interface GEOValidation {
  valid: boolean;
  score: number;
  issues: GEOIssue[];
  warnings: GEOIssue[];
  passed: string[];
}

export interface GEOIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
  suggestion?: string;
}
