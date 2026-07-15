/**
 * Writer Agent — Type Definitions
 *
 * AI Newsroom yazar agent'ı için tüm tip tanımları.
 */

export type VerificationStatus = "VERIFIED" | "LIKELY_VERIFIED" | "NEEDS_EDITOR_REVIEW" | "INSUFFICIENT_EVIDENCE" | "CONFLICTING_INFORMATION" | "REJECT";

// ─── Writer Input ───────────────────────────────────────────

export interface WriterInput {
  /** Research Agent çıktısı */
  research: {
    version: string;
    generatedAt: string;
    source: { name: string; url: string; type: string };
    findings: Array<{
      section: string;
      content: string;
      sources: Array<{ url: string; name: string; type: string }>;
      confidence: number;
    }>;
    entities: {
      people: string[];
      companies: string[];
      products: string[];
      technologies: string[];
    };
    timeline: Array<{ date: string; event: string }>;
    relatedTopics: string[];
  };
  /** Verification Agent çıktısı */
  verification: {
    status: VerificationStatus;
    confidence: number;
    verificationScore: number;
    conflicts: unknown[];
    warnings: string[];
    missingInformation: string[];
  };
}

// ─── Title Options ──────────────────────────────────────────

export interface TitleOption {
  title: string;
  seoScore: number; // 0-100
  length: number; // karakter
  style: "direct" | "question" | "howto" | "analysis" | "news";
  strengths: string[];
}

// ─── Article Structure ──────────────────────────────────────

export type ArticleSection =
  | "headline"
  | "spot"
  | "introduction"
  | "main_development"
  | "technical_details"
  | "user_impact"
  | "previous_situation"
  | "expert_assessment"
  | "conclusion";

export interface SectionContent {
  section: ArticleSection;
  heading: string;
  content: string; // Markdown
  wordCount: number;
}

// ─── Image Suggestion ───────────────────────────────────────

export interface ImageSuggestion {
  type: "official_product" | "benchmark_chart" | "event_photo" | "infographic" | "screenshot" | "logo";
  description: string;
  suggestedSource: string;
  priority: "required" | "recommended" | "optional";
  altText: string;
}

// ─── Internal Link Candidate ────────────────────────────────

export interface InternalLinkCandidate {
  anchorText: string;
  suggestedUrl: string;
  topic: string;
  confidence: number; // 0-100
  context: string; // Hangi paragrafta geçiyor?
}

// ─── Quality Check ──────────────────────────────────────────

export interface WriterQualityCheck {
  headlineOk: boolean;
  noRepetition: boolean;
  noFillerParagraphs: boolean;
  noTechnicalErrors: boolean;
  noUnsourcedClaims: boolean;
  isNeutral: boolean;
  naturalTurkish: boolean;
  issues: string[];
  score: number; // 0-100
}

// ─── Full Writer Result ─────────────────────────────────────

export interface WriterResult {
  version: string;
  generatedAt: string;
  /** Ön kontrol: verification status */
  canWrite: boolean;
  blockReason?: string;
  /** 5 başlık alternatifi */
  titleOptions: TitleOption[];
  /** Seçilen başlık */
  selectedTitle: string;
  /** Spot (2-3 cümle) */
  excerpt: string;
  /** 1 paragraflık özet */
  summary: string;
  /** Tam makale (Markdown) */
  article: string;
  /** Bölümler */
  sections: SectionContent[];
  /** Kelime sayısı */
  wordCount: number;
  /** Okuma süresi (dakika) */
  readingTime: number;
  /** Görsel önerileri */
  imageSuggestions: ImageSuggestion[];
  /** İç link adayları */
  internalLinkCandidates: InternalLinkCandidate[];
  /** Kalite kontrolü */
  qualityCheck: WriterQualityCheck;
  /** Uyarılar */
  warnings: string[];
}
