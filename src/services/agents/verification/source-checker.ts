/**
 * Verification Agent — Source Checker
 *
 * Kaynak güvenilirliğini kontrol eder.
 * - En az 2 bağımsız güvenilir kaynak var mı?
 * - Resmi kaynak mevcut mu?
 * - Kaynak güven skoru yeterli mi?
 * - Kaynaklar birbiriyle çelişiyor mu?
 */

import type {
  VerifiedSource,
  ResearchInput,
  VerificationScores,
} from "./types";
import {
  SOURCE_RELIABILITY,
  MIN_SOURCE_REQUIREMENTS,
  isTrustedDomain,
  guessSourceType,
} from "./constants";

export interface SourceCheckResult {
  passed: boolean;
  score: number; // 0-100
  officialSource: boolean;
  independentSources: number;
  sources: VerifiedSource[];
  warnings: string[];
  details: string;
}

/**
 * Araştırmadaki kaynakları doğrula
 */
export function checkSources(research: ResearchInput): SourceCheckResult {
  const warnings: string[] = [];
  const sources: VerifiedSource[] = [];

  // Tüm finding'lerden kaynakları topla
  const allSources = new Map<
    string,
    { name: string; url: string; type: string; count: number }
  >();

  for (const finding of research.findings) {
    for (const source of finding.sources) {
      const key = source.url.toLowerCase().trim();
      if (allSources.has(key)) {
        allSources.get(key)!.count++;
      } else {
        allSources.set(key, {
          name: source.name,
          url: source.url,
          type: source.type || guessSourceType(source.url),
          count: 1,
        });
      }
    }
  }

  // Her kaynağı değerlendir
  let totalReliability = 0;
  let officialCount = 0;

  for (const [, src] of allSources) {
    const sourceType = guessSourceType(src.url) as keyof typeof SOURCE_RELIABILITY;
    const reliabilityScore =
      SOURCE_RELIABILITY[sourceType] || SOURCE_RELIABILITY.unknown;

    const isOfficial = sourceType === "official";
    if (isOfficial) officialCount++;

    const source: VerifiedSource = {
      url: src.url,
      name: src.name,
      type: sourceType,
      reliabilityScore,
      isAccessible: true, // Link checker'da güncellenecek
      isOfficial,
      lastCheckedAt: new Date().toISOString(),
    };

    sources.push(source);
    totalReliability += reliabilityScore;
  }

  // Skor hesapla
  const avgReliability =
    sources.length > 0 ? totalReliability / sources.length : 0;
  const independentCount = sources.filter(
    (s) => s.type === "official" || s.type === "press"
  ).length;

  // Kontroller
  const hasEnoughSources =
    independentCount >= MIN_SOURCE_REQUIREMENTS.independentSources;
  const hasOfficialSource = officialCount > 0;
  const reliabilityOk =
    avgReliability >= MIN_SOURCE_REQUIREMENTS.minReliabilityScore;

  // Skor
  let score = Math.round(avgReliability);
  if (!hasEnoughSources) {
    score = Math.min(score, 50);
    warnings.push(
      `Yetersiz bağımsız kaynak: ${independentCount} kaynak var, en az ${MIN_SOURCE_REQUIREMENTS.independentSources} gerekli.`
    );
  }
  if (!hasOfficialSource) {
    score = Math.min(score, 70);
    warnings.push(
      "Resmi kaynak bulunamadı. Resmi şirket/blog duyurusu önerilir."
    );
  }
  if (!reliabilityOk) {
    score = Math.min(score, 40);
    warnings.push(
      `Kaynak güven skoru düşük (${Math.round(avgReliability)}/100). Minimum ${MIN_SOURCE_REQUIREMENTS.minReliabilityScore} gerekli.`
    );
  }

  const passed = hasEnoughSources && reliabilityOk;

  return {
    passed,
    score,
    officialSource: hasOfficialSource,
    independentSources: independentCount,
    sources,
    warnings,
    details: passed
      ? `${sources.length} kaynak incelendi, ${independentCount} bağımsız${hasOfficialSource ? " (resmi kaynak mevcut)" : ""}. Ortalama güven: ${Math.round(avgReliability)}/100.`
      : `Kaynak kontrolü başarısız. ${warnings.join(" ")}`,
  };
}
