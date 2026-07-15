/**
 * Verification Agent — Conflict Analyzer
 *
 * Kaynaklar arası çelişki analizi:
 * - Farklı kaynaklar aynı konuda farklı bilgiler mi veriyor?
 * - Çelişkileri listele ve sınıflandır
 */

import type { ConflictAnalysis, ResearchInput } from "./types";

/**
 * Kaynaklar arası çelişkileri analiz et
 */
export function analyzeConflicts(research: ResearchInput): ConflictAnalysis {
  const conflicts: ConflictAnalysis["conflicts"] = [];

  if (research.findings.length < 2) {
    return {
      hasConflicts: false,
      conflicts: [],
    };
  }

  // Her finding'i diğerleriyle karşılaştır
  for (let i = 0; i < research.findings.length; i++) {
    for (let j = i + 1; j < research.findings.length; j++) {
      const findingA = research.findings[i];
      const findingB = research.findings[j];

      // Aynı section'daki finding'ler arası çelişki ara
      if (findingA.section === findingB.section) {
        const sectionConflicts = findConflictsInSection(
          findingA,
          findingB
        );
        conflicts.push(...sectionConflicts);
      }
    }
  }

  // Sayısal çelişkileri tara
  const numberConflicts = findNumberConflicts(research);
  conflicts.push(...numberConflicts);

  // Versiyon/tarih çelişkilerini tara
  const versionConflicts = findVersionConflicts(research);
  conflicts.push(...versionConflicts);

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Aynı bölümdeki iki finding arasındaki çelişkileri bul
 */
function findConflictsInSection(
  a: ResearchInput["findings"][0],
  b: ResearchInput["findings"][0]
): ConflictAnalysis["conflicts"] {
  const conflicts: ConflictAnalysis["conflicts"] = [];

  // Kaynak isimleri
  const sourceAName = a.sources[0]?.name || `Kaynak ${1}`;
  const sourceBName = b.sources[0]?.name || `Kaynak ${2}`;

  // Sayısal değerleri çıkar
  const numbersA = extractNumbers(a.content);
  const numbersB = extractNumbers(b.content);

  // Aynı bağlamdaki sayıları karşılaştır
  for (const numA of numbersA) {
    for (const numB of numbersB) {
      // Aynı birim ve benzer büyüklükte ama farklı değer
      if (numA.unit === numB.unit && numA.unit !== "generic") {
        const diff = Math.abs(numA.value - numB.value);
        const maxVal = Math.max(Math.abs(numA.value), Math.abs(numB.value));

        if (maxVal > 0 && diff / maxVal > 0.2) {
          // %20'den fazla fark
          const severity =
            diff / maxVal > 0.5
              ? "major"
              : diff / maxVal > 0.3
                ? "moderate"
                : "minor";

          conflicts.push({
            field: `${numA.context || "sayısal_veri"} (${numA.unit})`,
            sourceA: sourceAName,
            valueA: `${numA.value}${numA.unit}`,
            sourceB: sourceBName,
            valueB: `${numB.value}${numB.unit}`,
            severity,
            resolved: false,
          });
        }
      }
    }
  }

  // Tutarsız ifadeleri tara
  const inconsistencies = findInconsistencies(a.content, b.content);
  for (const inc of inconsistencies) {
    conflicts.push({
      field: inc.field,
      sourceA: sourceAName,
      valueA: inc.valueA,
      sourceB: sourceBName,
      valueB: inc.valueB,
      severity: inc.severity,
      resolved: false,
    });
  }

  return conflicts;
}

/**
 * Metinden sayısal değerleri çıkar
 */
function extractNumbers(
  text: string
): Array<{ value: number; unit: string; context: string }> {
  const results: Array<{ value: number; unit: string; context: string }> = [];

  // Fiyat
  const priceMatches = text.matchAll(
    /(\$|€|₺|USD|EUR|TRY)?\s*(\d+(?:[.,]\d+)?)\s*(bin|milyon|milyar|million|billion|K|M|B)?/gi
  );
  for (const match of priceMatches) {
    const value = parseFloat(match[2].replace(",", "."));
    const multiplier = match[3] || "";
    let adjustedValue = value;
    if (multiplier.match(/bin|K|k/)) adjustedValue *= 1000;
    if (multiplier.match(/milyon|million|M/)) adjustedValue *= 1000000;
    if (multiplier.match(/milyar|billion|B/)) adjustedValue *= 1000000000;

    results.push({
      value: adjustedValue,
      unit: match[1] || "generic",
      context: "price",
    });
  }

  // Yüzde
  const pctMatches = text.matchAll(/(\d+(?:[.,]\d+)?)\s*%/g);
  for (const match of pctMatches) {
    results.push({
      value: parseFloat(match[1].replace(",", ".")),
      unit: "%",
      context: "percentage",
    });
  }

  // Kapasite
  const capMatches = text.matchAll(/(\d+(?:[.,]\d+)?)\s*(GB|TB|MB|MHz|GHz)/gi);
  for (const match of capMatches) {
    results.push({
      value: parseFloat(match[1].replace(",", ".")),
      unit: match[2].toUpperCase(),
      context: "capacity",
    });
  }

  return results;
}

/**
 * Metinler arası tutarsızlıkları bul
 */
function findInconsistencies(
  textA: string,
  textB: string
): Array<{
  field: string;
  valueA: string;
  valueB: string;
  severity: "minor" | "moderate" | "major";
}> {
  const results: Array<{
    field: string;
    valueA: string;
    valueB: string;
    severity: "minor" | "moderate" | "major";
  }> = [];

  // Sürüm numarası çelişkisi
  const versionA = textA.match(/(\d+\.\d+(?:\.\d+)?)/);
  const versionB = textB.match(/(\d+\.\d+(?:\.\d+)?)/);
  if (
    versionA &&
    versionB &&
    versionA[1] !== versionB[1]
  ) {
    results.push({
      field: "version",
      valueA: versionA[1],
      valueB: versionB[1],
      severity: "major",
    });
  }

  // Tarih çelişkisi (basit: yıl farkı)
  const yearA = textA.match(/\b(20\d{2})\b/);
  const yearB = textB.match(/\b(20\d{2})\b/);
  if (
    yearA &&
    yearB &&
    yearA[1] !== yearB[1]
  ) {
    results.push({
      field: "year",
      valueA: yearA[1],
      valueB: yearB[1],
      severity: "major",
    });
  }

  return results;
}

/**
 * Sayısal çelişkileri tara
 */
function findNumberConflicts(
  research: ResearchInput
): ConflictAnalysis["conflicts"] {
  const conflicts: ConflictAnalysis["conflicts"] = [];

  // Tüm finding'lerdeki sayıları topla
  const allNumbers: Array<{
    value: number;
    unit: string;
    context: string;
    source: string;
  }> = [];

  for (const finding of research.findings) {
    const sourceName = finding.sources[0]?.name || "unknown";
    const numbers = extractNumbers(finding.content);
    for (const num of numbers) {
      allNumbers.push({ ...num, source: sourceName });
    }
  }

  // Aynı birimdeki sayıları karşılaştır
  for (let i = 0; i < allNumbers.length; i++) {
    for (let j = i + 1; j < allNumbers.length; j++) {
      const a = allNumbers[i];
      const b = allNumbers[j];

      if (
        a.unit === b.unit &&
        a.context === b.context &&
        a.source !== b.source &&
        a.value !== b.value
      ) {
        const diff = Math.abs(a.value - b.value);
        const maxVal = Math.max(Math.abs(a.value), Math.abs(b.value));

        if (maxVal > 0 && diff / maxVal > 0.1) {
          // %10+ fark
          conflicts.push({
            field: `${a.context} (${a.unit})`,
            sourceA: a.source,
            valueA: `${a.value}${a.unit}`,
            sourceB: b.source,
            valueB: `${b.value}${b.unit}`,
            severity:
              diff / maxVal > 0.5
                ? "major"
                : diff / maxVal > 0.2
                  ? "moderate"
                  : "minor",
            resolved: false,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Versiyon/tarih çelişkilerini tara
 */
function findVersionConflicts(
  research: ResearchInput
): ConflictAnalysis["conflicts"] {
  // Timeline'daki çelişkiler
  if (research.timeline && research.timeline.length >= 2) {
    // Timeline kronolojik mi kontrol et
    const dates = research.timeline.map((t) => new Date(t.date));
    for (let i = 1; i < dates.length; i++) {
      if (dates[i] < dates[i - 1]) {
        return [
          {
            field: "timeline_order",
            sourceA: research.timeline[i - 1].event,
            valueA: research.timeline[i - 1].date,
            sourceB: research.timeline[i].event,
            valueB: research.timeline[i].date,
            severity: "moderate",
            resolved: false,
            resolution: "Zaman çizelgesi kronolojik sırada değil.",
          },
        ];
      }
    }
  }

  return [];
}
