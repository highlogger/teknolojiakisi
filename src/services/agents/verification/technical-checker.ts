/**
 * Verification Agent — Technical Checker
 *
 * Teknik doğruluk kontrolü:
 * - API isimleri doğru mu?
 * - Framework isimleri doğru mu?
 * - Programlama dili isimleri doğru mu?
 * - Benchmark değerleri tutarlı mı?
 * - Sürüm numaraları doğru mu?
 */

import type { TechnicalCheckResult, ResearchInput } from "./types";
import { KNOWN_TECHNICAL_TERMS } from "./constants";

// Sürüm numarası regex'i
const VERSION_PATTERN = /\b(\d+\.\d+(?:\.\d+)?(?:\s*(?:Beta|Alpha|RC|Preview)\s*\d*)?)\b/g;
const API_PATTERN = /\b([A-Z][a-z]*\s*API)\b/g;
const BENCHMARK_PATTERN = /\b(\d+(?:\.\d+)?%?\s*(?:daha\s*)?(?:hızlı|yavaş|iyi|kötü|faster|slower|better|worse))\b/gi;

/**
 * Teknik terimleri referans listeleriyle karşılaştırarak doğrula
 */
export function checkTechnicalAccuracy(research: ResearchInput): TechnicalCheckResult {
  const checkedItems: TechnicalCheckResult["checkedItems"] = [];
  const corrections: string[] = [];

  // Tüm bulgulardaki metni birleştir
  const allText = research.findings.map((f) => f.content).join("\n");

  // Referans seti oluştur
  const allKnown = new Set<string>();
  for (const [, terms] of Object.entries(KNOWN_TECHNICAL_TERMS)) {
    for (const term of terms) {
      allKnown.add(term.toLowerCase());
    }
  }

  // 1. Sürüm numaralarını kontrol et
  const versions = allText.match(VERSION_PATTERN) || [];
  for (const version of versions) {
    const clean = version.trim();
    // Sürüm numarası format kontrolü
    if (/^\d+\.\d+(?:\.\d+)?/.test(clean)) {
      checkedItems.push({
        field: "version",
        claimed: clean,
        actual: null,
        isCorrect: true,
        confidence: 85,
      });
    }
  }

  // 2. API isimlerini kontrol et
  const apis = allText.match(API_PATTERN) || [];
  for (const api of apis) {
    const clean = api.trim();
    checkedItems.push({
      field: "api",
      claimed: clean,
      actual: null,
      isCorrect: true,
      confidence: 70,
    });
  }

  // 3. Bulgularda geçen teknik terimleri kontrol et
  for (const finding of research.findings) {
    const words = finding.content.split(/\s+/);
    for (const word of words) {
      const clean = word.replace(/[.,;:!?()\[\]{}"'«»]/g, "").trim();
      if (clean.length < 3) continue;

      // Büyük harfle başlayan terimler (potansiyel teknik terim)
      if (/^[A-Z]/.test(clean) && !allKnown.has(clean.toLowerCase())) {
        // Bilinmeyen terim — her zaman hata değil
        const lower = clean.toLowerCase();
        const fuzzy = findInKnown(lower, allKnown);
        if (fuzzy) {
          checkedItems.push({
            field: "technical_term",
            claimed: clean,
            actual: fuzzy,
            isCorrect: false,
            confidence: 60,
            issue: `"${clean}" bilinmeyen terim, "${fuzzy}" olabilir.`,
          });
          corrections.push(`"${clean}" → "${fuzzy}" (teknik terim)`);
        }
      }
    }
  }

  // 4. Benchmark iddialarını işaretle (doğrulanması zor)
  const benchmarks = allText.match(BENCHMARK_PATTERN) || [];
  for (const bench of benchmarks) {
    checkedItems.push({
      field: "benchmark",
      claimed: bench.trim(),
      actual: null,
      isCorrect: true, // Doğrudan yanlış diyemeyiz
      confidence: 40, // Ama düşük güven
      issue: "Benchmark iddiası — bağımsız doğrulama önerilir.",
    });
  }

  const invalidCount = checkedItems.filter((c) => !c.isCorrect).length;
  const allValid = invalidCount === 0;

  return {
    allTechnicalValid: allValid,
    checkedItems,
    corrections,
  };
}

function findInKnown(term: string, known: Set<string>): string | null {
  // Prefix match
  for (const k of known) {
    if (k.length >= 4 && (k.startsWith(term.substring(0, 4)) || term.startsWith(k.substring(0, 4)))) {
      if (Math.abs(k.length - term.length) <= 3) {
        return k;
      }
    }
  }
  return null;
}
