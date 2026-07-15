/**
 * Verification Agent — Type Definitions
 *
 * AI Newsroom doğrulama agent'ı için tüm tip tanımları.
 * AI Core Engine ile uyumlu.
 */

// ─── Verification Status ────────────────────────────────────

export const VERIFICATION_STATUS = {
  VERIFIED: "VERIFIED",
  LIKELY_VERIFIED: "LIKELY_VERIFIED",
  NEEDS_EDITOR_REVIEW: "NEEDS_EDITOR_REVIEW",
  INSUFFICIENT_EVIDENCE: "INSUFFICIENT_EVIDENCE",
  CONFLICTING_INFORMATION: "CONFLICTING_INFORMATION",
  REJECT: "REJECT",
} as const;

export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

// ─── Source ─────────────────────────────────────────────────

export interface VerifiedSource {
  url: string;
  name: string;
  type: "official" | "press" | "community" | "social_media" | "unknown";
  reliabilityScore: number; // 0-100
  isAccessible: boolean;
  isOfficial: boolean;
  lastCheckedAt: string;
}

// ─── Date Check ─────────────────────────────────────────────

export interface DateCheckResult {
  isRecent: boolean;
  isStale: boolean; // 7+ gün eski
  isRehashed: boolean; // Eski haber tekrar mı?
  publishedDate: string | null;
  detectedDate: string | null;
  hoursSincePublication: number | null;
  timezoneIssue: boolean;
  details: string;
}

// ─── Entity Check ───────────────────────────────────────────

export interface EntityCheckResult {
  allEntitiesValid: boolean;
  checkedEntities: Array<{
    name: string;
    type: string;
    suggestedName: string | null;
    isCorrect: boolean;
    confidence: number;
    issue?: string;
  }>;
  corrections: string[];
}

// ─── Technical Check ────────────────────────────────────────

export interface TechnicalCheckResult {
  allTechnicalValid: boolean;
  checkedItems: Array<{
    field: string;
    claimed: string;
    actual: string | null;
    isCorrect: boolean;
    confidence: number;
    issue?: string;
  }>;
  corrections: string[];
}

// ─── Number Check ───────────────────────────────────────────

export interface NumberCheckResult {
  allNumbersValid: boolean;
  checkedNumbers: Array<{
    field: string;
    claimed: string;
    expected: string | null;
    isCorrect: boolean;
    confidence: number;
    issue?: string;
  }>;
  corrections: string[];
}

// ─── Link Check ─────────────────────────────────────────────

export interface LinkCheckResult {
  allLinksValid: boolean;
  checkedLinks: Array<{
    url: string;
    statusCode: number | null;
    isAccessible: boolean;
    isRedirected: boolean;
    redirectUrl: string | null;
    canonicalMismatch: boolean;
    error?: string;
  }>;
  brokenLinks: string[];
}

// ─── Duplicate Check ────────────────────────────────────────

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarArticles: Array<{
    id: string;
    title: string;
    slug: string;
    similarityScore: number; // 0-1
    publishedAt: string | null;
  }>;
  isRehashed: boolean;
  details: string;
}

// ─── Conflict Analysis ──────────────────────────────────────

export interface ConflictAnalysis {
  hasConflicts: boolean;
  conflicts: Array<{
    field: string;
    sourceA: string;
    valueA: string;
    sourceB: string;
    valueB: string;
    severity: "minor" | "moderate" | "major";
    resolved: boolean;
    resolvedValue?: string;
    resolution?: string;
  }>;
}

// ─── Verification Scores ────────────────────────────────────

export interface VerificationScores {
  sourceScore: number; // Kaynak güvenilirliği 0-100
  factScore: number; // Olgusal doğruluk 0-100
  consistencyScore: number; // Tutarlılık 0-100
  entityScore: number; // Entity doğruluğu 0-100
  freshnessScore: number; // Güncellik 0-100
  technicalScore: number; // Teknik doğruluk 0-100
}

// ─── Full Verification Result ───────────────────────────────

export interface VerificationResult {
  /** Doğrulama versiyonu */
  version: string;
  /** Oluşturulma zamanı */
  generatedAt: string;
  /** Genel durum */
  status: VerificationStatus;
  /** Genel güven skoru 0-100 */
  confidence: number;
  /** Toplam doğrulama skoru 0-100 */
  verificationScore: number;
  /** Resmi kaynak mevcut mu? */
  officialSource: boolean;
  /** Bağımsız kaynak sayısı */
  independentSources: number;
  /** Çelişkiler */
  conflicts: ConflictAnalysis["conflicts"];
  /** Uyarılar */
  warnings: string[];
  /** Eksik bilgiler */
  missingInformation: string[];
  /** Detaylı kontroller */
  checks: {
    sources: boolean;
    dates: boolean;
    entities: boolean;
    technical: boolean;
    numbers: boolean;
    links: boolean;
    duplicates: boolean;
    consistency: boolean;
  };
  /** Alt skorlar */
  scores: VerificationScores;
  /** Kaynak detayları */
  sources: VerifiedSource[];
  /** Tarih kontrol detayı */
  dateCheck: DateCheckResult;
  /** Entity kontrol detayı */
  entityCheck: EntityCheckResult;
  /** Teknik kontrol detayı */
  technicalCheck: TechnicalCheckResult;
  /** Sayı kontrol detayı */
  numberCheck: NumberCheckResult;
  /** Link kontrol detayı */
  linkCheck: LinkCheckResult;
  /** Duplicate kontrol detayı */
  duplicateCheck: DuplicateCheckResult;
  /** Çelişki analizi detayı */
  conflictAnalysis: ConflictAnalysis;
  /** Başarısız kontrollerin logu */
  failedChecks: Array<{
    check: string;
    reason: string;
    severity: "low" | "medium" | "high";
  }>;
}

// ─── Research Input Format ──────────────────────────────────

export interface ResearchInput {
  version: string;
  generatedAt: string;
  source: {
    name: string;
    url: string;
    type: string;
  };
  findings: Array<{
    section: string;
    content: string;
    sources: Array<{
      url: string;
      name: string;
      type: string;
    }>;
    confidence: number;
  }>;
  entities: {
    people: string[];
    companies: string[];
    products: string[];
    technologies: string[];
  };
  timeline: Array<{
    date: string;
    event: string;
  }>;
  relatedTopics: string[];
}
