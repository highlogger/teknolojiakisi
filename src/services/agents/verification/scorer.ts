/**
 * Verification Agent — Scorer
 *
 * Tüm kontrollerin sonuçlarını birleştirerek:
 * - Source Score
 * - Fact Score
 * - Consistency Score
 * - Entity Score
 * - Freshness Score
 * - Technical Score
 * - Toplam Verification Score hesaplar
 *
 * Ve nihai VERIFICATION STATUS belirler.
 */

import type {
  VerificationStatus,
  VerificationScores,
} from "./types";
import {
  VERIFICATION_STATUS,
} from "./types";
import { SCORE_WEIGHTS, STATUS_THRESHOLDS } from "./constants";
import type { SourceCheckResult } from "./source-checker";
import type { DateCheckResult } from "./date-checker";
import type { EntityCheckResult } from "./entity-checker";
import type { TechnicalCheckResult } from "./technical-checker";
import type { NumberCheckResult } from "./number-checker";
import type { LinkCheckResult } from "./link-checker";
import type { DuplicateCheckResult } from "./duplicate-checker";
import type { ConflictAnalysis } from "./conflict-analyzer";

export interface ScorerInput {
  sourceCheck: SourceCheckResult;
  dateCheck: DateCheckResult;
  entityCheck: EntityCheckResult;
  technicalCheck: TechnicalCheckResult;
  numberCheck: NumberCheckResult;
  linkCheck: LinkCheckResult;
  duplicateCheck: DuplicateCheckResult;
  conflictAnalysis: ConflictAnalysis;
}

export interface ScoringResult {
  scores: VerificationScores;
  verificationScore: number;
  status: VerificationStatus;
  confidence: number;
}

/**
 * Tüm kontrolleri değerlendir, skorları hesapla, durumu belirle
 */
export function calculateScores(input: ScorerInput): ScoringResult {
  // 1. Kaynak skoru (0-100)
  const sourceScore = input.sourceCheck.score;

  // 2. Olgusal doğruluk skoru — teknik + entity + sayısal kontrollerin ortalaması
  const entityScore = calculateEntityScore(input.entityCheck);
  const technicalScore = calculateTechnicalScore(input.technicalCheck);
  const numberScore = calculateNumberScore(input.numberCheck);

  const factScore = Math.round(
    (entityScore * 0.4 + technicalScore * 0.35 + numberScore * 0.25)
  );

  // 3. Tutarlılık skoru — çelişki analizi
  const consistencyScore = calculateConsistencyScore(input.conflictAnalysis);

  // 4. Güncellik skoru
  const freshnessScore = calculateFreshnessScore(input.dateCheck);

  // 5. Link skoru
  const linkScore = calculateLinkScore(input.linkCheck);

  // Skorları birleştir
  const scores: VerificationScores = {
    sourceScore,
    factScore,
    consistencyScore,
    entityScore,
    freshnessScore,
    technicalScore: Math.round((technicalScore + numberScore + linkScore) / 3),
  };

  // Ağırlıklı toplam
  const verificationScore = Math.round(
    sourceScore * SCORE_WEIGHTS.source +
      factScore * SCORE_WEIGHTS.fact +
      consistencyScore * SCORE_WEIGHTS.consistency +
      entityScore * SCORE_WEIGHTS.entity +
      freshnessScore * SCORE_WEIGHTS.freshness +
      scores.technicalScore * SCORE_WEIGHTS.technical
  );

  // Duplicate cezası
  const adjustedScore = input.duplicateCheck.isDuplicate
    ? Math.min(verificationScore, 40)
    : verificationScore;

  // Durum belirle
  let status: VerificationStatus;
  if (input.duplicateCheck.isDuplicate) {
    status = VERIFICATION_STATUS.REJECT;
  } else if (input.conflictAnalysis.hasConflicts) {
    const majorConflicts = input.conflictAnalysis.conflicts.filter(
      (c) => c.severity === "major"
    );
    status =
      majorConflicts.length > 0
        ? VERIFICATION_STATUS.CONFLICTING_INFORMATION
        : VERIFICATION_STATUS.NEEDS_EDITOR_REVIEW;
  } else {
    // Skora göre durum belirle
    status = determineStatus(adjustedScore);
  }

  // Confidence hesapla (skorun güvenilirliği)
  const confidence = calculateConfidence(input);

  return {
    scores,
    verificationScore: adjustedScore,
    status,
    confidence,
  };
}

// ─── Alt Skor Hesaplamaları ─────────────────────────────────

function calculateEntityScore(entityCheck: EntityCheckResult): number {
  if (entityCheck.checkedEntities.length === 0) return 100;
  const correctCount = entityCheck.checkedEntities.filter(
    (e) => e.isCorrect
  ).length;
  return Math.round(
    (correctCount / entityCheck.checkedEntities.length) * 100
  );
}

function calculateTechnicalScore(
  technicalCheck: TechnicalCheckResult
): number {
  if (technicalCheck.checkedItems.length === 0) return 100;
  const correctCount = technicalCheck.checkedItems.filter(
    (c) => c.isCorrect
  ).length;
  const avgConfidence =
    technicalCheck.checkedItems.reduce(
      (sum, c) => sum + c.confidence,
      0
    ) / technicalCheck.checkedItems.length;

  return Math.round(
    (correctCount / technicalCheck.checkedItems.length) * 0.6 * 100 +
      (avgConfidence / 100) * 0.4 * 100
  );
}

function calculateNumberScore(numberCheck: NumberCheckResult): number {
  if (numberCheck.checkedNumbers.length === 0) return 100;
  const correctCount = numberCheck.checkedNumbers.filter(
    (n) => n.isCorrect
  ).length;
  return Math.round(
    (correctCount / numberCheck.checkedNumbers.length) * 100
  );
}

function calculateConsistencyScore(
  conflictAnalysis: ConflictAnalysis
): number {
  if (!conflictAnalysis.hasConflicts) return 100;

  const majorCount = conflictAnalysis.conflicts.filter(
    (c) => c.severity === "major"
  ).length;
  const moderateCount = conflictAnalysis.conflicts.filter(
    (c) => c.severity === "moderate"
  ).length;
  const minorCount = conflictAnalysis.conflicts.filter(
    (c) => c.severity === "minor"
  ).length;

  let score = 100;
  score -= majorCount * 30;
  score -= moderateCount * 15;
  score -= minorCount * 5;

  return Math.max(0, score);
}

function calculateFreshnessScore(dateCheck: DateCheckResult): number {
  if (!dateCheck.publishedDate) return 0;
  if (dateCheck.isRehashed) return 10;
  if (dateCheck.isStale) return 20;
  if (!dateCheck.isRecent) return 50;
  if (dateCheck.timezoneIssue) return Math.min(90, 100);

  // Saate göre skor
  if (
    dateCheck.hoursSincePublication !== null &&
    dateCheck.hoursSincePublication <= 24
  ) {
    return 100;
  }
  if (
    dateCheck.hoursSincePublication !== null &&
    dateCheck.hoursSincePublication <= 48
  ) {
    return 90;
  }
  return 80;
}

function calculateLinkScore(linkCheck: LinkCheckResult): number {
  if (linkCheck.checkedLinks.length === 0) return 100;

  const accessibleCount = linkCheck.checkedLinks.filter(
    (l) => l.isAccessible
  ).length;
  return Math.round(
    (accessibleCount / linkCheck.checkedLinks.length) * 100
  );
}

// ─── Durum Belirleme ─────────────────────────────────────────

function determineStatus(score: number): VerificationStatus {
  if (score >= STATUS_THRESHOLDS.VERIFIED) {
    return VERIFICATION_STATUS.VERIFIED;
  }
  if (score >= STATUS_THRESHOLDS.LIKELY_VERIFIED) {
    return VERIFICATION_STATUS.LIKELY_VERIFIED;
  }
  if (score >= STATUS_THRESHOLDS.NEEDS_EDITOR_REVIEW) {
    return VERIFICATION_STATUS.NEEDS_EDITOR_REVIEW;
  }
  if (score >= STATUS_THRESHOLDS.INSUFFICIENT_EVIDENCE) {
    return VERIFICATION_STATUS.INSUFFICIENT_EVIDENCE;
  }
  return VERIFICATION_STATUS.REJECT;
}

// ─── Confidence Hesaplama ────────────────────────────────────

function calculateConfidence(input: ScorerInput): number {
  // Confidence: kontrollerin ne kadar güvenilir olduğu
  // (çok fazla bilinmeyen varsa düşük confidence)

  let confidenceFactors = 0;
  let totalFactors = 0;

  // Kaynak sayısı
  if (input.sourceCheck.independentSources >= 2) {
    confidenceFactors += 1;
  }
  totalFactors++;

  // Resmi kaynak
  if (input.sourceCheck.officialSource) {
    confidenceFactors += 1;
  }
  totalFactors++;

  // Tarih bilgisi
  if (input.dateCheck.publishedDate) {
    confidenceFactors += 1;
  }
  totalFactors++;

  // Çelişki yok
  if (!input.conflictAnalysis.hasConflicts) {
    confidenceFactors += 1;
  }
  totalFactors++;

  // Entity kontrol sayısı
  if (input.entityCheck.checkedEntities.length > 0) {
    confidenceFactors += 0.5;
  }
  totalFactors += 0.5;

  // Link erişilebilirliği
  if (input.linkCheck.checkedLinks.length > 0 && input.linkCheck.allLinksValid) {
    confidenceFactors += 0.5;
  }
  totalFactors += 0.5;

  return Math.round((confidenceFactors / totalFactors) * 100);
}
