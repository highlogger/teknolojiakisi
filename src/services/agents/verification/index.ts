/**
 * Verification Agent — Main Service
 *
 * AI Newsroom doğrulama agent'ı.
 * Research Agent çıktısını alır, kapsamlı doğrulama yapar,
 * verification.json üretir.
 *
 * Kullanım:
 *   import { verify } from "@/services/agents/verification";
 *   const result = await verify(researchJson);
 *
 * AI Core Engine ile uyumlu.
 * Writer Agent ve Publisher Agent'tan bağımsız.
 */

import type { AgentInput, AgentOutput } from "@/services/agents/base/types";
import type {
  VerificationResult,
  ResearchInput,
} from "./types";
import { checkSources } from "./source-checker";
import { checkDates } from "./date-checker";
import { checkEntities } from "./entity-checker";
import { checkTechnicalAccuracy } from "./technical-checker";
import { checkNumbers } from "./number-checker";
import { checkLinks } from "./link-checker";
import { checkDuplicates } from "./duplicate-checker";
import { analyzeConflicts } from "./conflict-analyzer";
import { calculateScores } from "./scorer";

// ─── Agent Metadata ──────────────────────────────────────────

export const AGENT_NAME = "Verification Agent";
export const AGENT_VERSION = "1.0.0";

// ─── Main API ────────────────────────────────────────────────

/**
 * Ana doğrulama fonksiyonu.
 * Research Agent çıktısını alır, verification.json üretir.
 */
export async function verify(
  researchInput: ResearchInput
): Promise<VerificationResult> {
  const startTime = Date.now();
  const warnings: string[] = [];
  const missingInformation: string[] = [];
  const failedChecks: VerificationResult["failedChecks"] = [];

  // 1. Kaynak kontrolü
  const sourceCheck = checkSources(researchInput);

  // 2. Tarih kontrolü
  const dateCheck = checkDates(researchInput);

  // 3. Entity kontrolü
  const entityCheck = checkEntities(researchInput);

  // 4. Teknik doğruluk
  const technicalCheck = checkTechnicalAccuracy(researchInput);

  // 5. Sayısal veri kontrolü
  const numberCheck = checkNumbers(researchInput);

  // 6. Link kontrolü (async)
  const linkCheck = await checkLinks(researchInput);

  // 7. Duplicate kontrolü (async — DB sorgusu)
  const duplicateCheck = await checkDuplicates(researchInput);

  // 8. Çelişki analizi
  const conflictAnalysis = analyzeConflicts(researchInput);

  // ─── Skorlama ───────────────────────────────────────────

  const scoring = calculateScores({
    sourceCheck,
    dateCheck,
    entityCheck,
    technicalCheck,
    numberCheck,
    linkCheck,
    duplicateCheck,
    conflictAnalysis,
  });

  // ─── Warning'leri topla ─────────────────────────────────

  warnings.push(...sourceCheck.warnings);

  if (!dateCheck.isRecent) {
    warnings.push(
      `Haber güncel değil (${dateCheck.hoursSincePublication} saat önce).`
    );
  }
  if (dateCheck.isRehashed) {
    warnings.push("Eski haber tekrar dolaşıma girmiş olabilir.");
  }

  if (!entityCheck.allEntitiesValid) {
    warnings.push(
      `${entityCheck.corrections.length} entity düzeltmesi gerekli.`
    );
  }

  if (!technicalCheck.allTechnicalValid) {
    warnings.push(
      `${technicalCheck.corrections.length} teknik terim düzeltmesi gerekli.`
    );
  }

  if (!numberCheck.allNumbersValid) {
    const invalidCount = numberCheck.checkedNumbers.filter(
      (n) => !n.isCorrect
    ).length;
    warnings.push(
      `${invalidCount} sayısal veri şüpheli — doğrulanması önerilir.`
    );
  }

  if (!linkCheck.allLinksValid) {
    warnings.push(
      `${linkCheck.brokenLinks.length} link çalışmıyor.`
    );
  }

  if (conflictAnalysis.hasConflicts) {
    warnings.push(
      `${conflictAnalysis.conflicts.length} kaynak çelişkisi tespit edildi.`
    );
  }

  // ─── Eksik bilgileri belirle ────────────────────────────

  if (!researchInput.entities?.people?.length) {
    missingInformation.push("Kişi isimleri belirtilmemiş.");
  }
  if (!researchInput.entities?.companies?.length) {
    missingInformation.push("Şirket isimleri belirtilmemiş.");
  }
  if (!researchInput.timeline?.length) {
    missingInformation.push("Zaman çizelgesi (timeline) eksik.");
  }
  if (researchInput.findings.length < 2) {
    missingInformation.push(
      "Yetersiz araştırma bulgusu — en az 2 section beklenir."
    );
  }

  // ─── Başarısız kontrolleri logla ────────────────────────

  for (const check of [
    {
      name: "sources",
      passed: sourceCheck.passed,
      reason: sourceCheck.details,
    },
    {
      name: "dates",
      passed: dateCheck.isRecent && !dateCheck.isRehashed,
      reason: dateCheck.details,
    },
    {
      name: "entities",
      passed: entityCheck.allEntitiesValid,
      reason: entityCheck.allEntitiesValid
        ? "Tüm entity'ler doğru."
        : `${entityCheck.corrections.length} entity düzeltmesi gerekli.`,
    },
    {
      name: "technical",
      passed: technicalCheck.allTechnicalValid,
      reason: technicalCheck.allTechnicalValid
        ? "Teknik terimler doğru."
        : `${technicalCheck.corrections.length} teknik düzeltme gerekli.`,
    },
    {
      name: "numbers",
      passed: numberCheck.allNumbersValid,
      reason: numberCheck.allNumbersValid
        ? "Sayısal veriler doğru."
        : "Şüpheli sayısal veriler mevcut.",
    },
    {
      name: "links",
      passed: linkCheck.allLinksValid,
      reason: linkCheck.allLinksValid
        ? "Tüm linkler çalışıyor."
        : `${linkCheck.brokenLinks.length} link hatalı.`,
    },
    {
      name: "duplicates",
      passed: !duplicateCheck.isDuplicate,
      reason: duplicateCheck.details,
    },
    {
      name: "consistency",
      passed: !conflictAnalysis.hasConflicts,
      reason: conflictAnalysis.hasConflicts
        ? `${conflictAnalysis.conflicts.length} çelişki var.`
        : "Kaynaklar arası çelişki yok.",
    },
  ]) {
    if (!check.passed) {
      const severity = check.name === "sources" || check.name === "dates"
        ? "high"
        : check.name === "duplicates" || check.name === "consistency"
          ? "high"
          : "medium";

      failedChecks.push({
        check: check.name,
        reason: check.reason,
        severity: severity as "low" | "medium" | "high",
      });
    }
  }

  // ─── Sonuç ──────────────────────────────────────────────

  const verificationResult: VerificationResult = {
    version: AGENT_VERSION,
    generatedAt: new Date().toISOString(),
    status: scoring.status,
    confidence: scoring.confidence,
    verificationScore: scoring.verificationScore,
    officialSource: sourceCheck.officialSource,
    independentSources: sourceCheck.independentSources,
    conflicts: conflictAnalysis.conflicts,
    warnings,
    missingInformation,
    checks: {
      sources: sourceCheck.passed,
      dates: dateCheck.isRecent && !dateCheck.isRehashed,
      entities: entityCheck.allEntitiesValid,
      technical: technicalCheck.allTechnicalValid,
      numbers: numberCheck.allNumbersValid,
      links: linkCheck.allLinksValid,
      duplicates: !duplicateCheck.isDuplicate,
      consistency: !conflictAnalysis.hasConflicts,
    },
    scores: scoring.scores,
    sources: sourceCheck.sources,
    dateCheck,
    entityCheck,
    technicalCheck,
    numberCheck,
    linkCheck,
    duplicateCheck,
    conflictAnalysis,
    failedChecks,
  };

  return verificationResult;
}

/**
 * Agent interface'i ile uyumlu execute fonksiyonu
 */
export async function execute(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now();

  try {
    const researchInput = input.inputs.research as ResearchInput;

    if (!researchInput) {
      return {
        success: false,
        outputs: {},
        summary: {
          status: "REJECT",
          score: 0,
          confidence: 0,
          warnings: [],
          errors: ["research.json input'u bulunamadı."],
        },
        duration: Date.now() - startTime,
      };
    }

    const result = await verify(researchInput);

    return {
      success: result.status !== "REJECT",
      outputs: {
        verification: result,
      },
      summary: {
        status: result.status,
        score: result.verificationScore,
        confidence: result.confidence,
        warnings: result.warnings,
        errors: result.failedChecks.map((f) => f.reason),
      },
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      outputs: {},
      summary: {
        status: "REJECT",
        score: 0,
        confidence: 0,
        warnings: [],
        errors: [
          `Doğrulama hatası: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
        ],
      },
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Dry run — gerçek veritabanı değişikliği yapmadan çalışır
 */
export async function dryRun(input: AgentInput): Promise<AgentOutput> {
  // Dry run, normal execute ile aynı (zaten read-only)
  const result = await execute(input);
  return {
    ...result,
    summary: {
      ...result.summary,
      status: `DRY_RUN: ${result.summary.status}`,
    },
  };
}

// ─── Agent Metadata ──────────────────────────────────────────

export const verificationAgent = {
  name: AGENT_NAME,
  version: AGENT_VERSION,
  execute,
  dryRun,
};

export default verificationAgent;
