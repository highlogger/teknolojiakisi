/**
 * Verification Agent — Number Checker
 *
 * Sayısal verilerin doğruluğunu kontrol eder:
 * - Fiyat bilgileri
 * - Yüzde değerleri
 * - Benchmark skorları
 * - Performans metrikleri
 * - İndirim oranları
 * - Kapasite/boyut bilgileri
 */

import type { NumberCheckResult, ResearchInput } from "./types";

// Sayısal ifade kalıpları
const PRICE_PATTERN = /(\$|€|₺|USD|EUR|TRY|TL)\s*(\d+(?:[.,]\d+)?)\s*(bin|milyon|milyar|million|billion|K|M|B|k)?/gi;
const PERCENTAGE_PATTERN = /(\d+(?:[.,]\d+)?)\s*(%|yüzde|percent)/gi;
const CAPACITY_PATTERN = /(\d+(?:[.,]\d+)?)\s*(GB|TB|MB|PB|MHz|GHz|W|Wh|mAh|km|mil|inch|inç|mm|cm|m)/gi;
const PERFORMANCE_PATTERN = /(\d+(?:[.,]\d+)?x?\s*(?:kat|kere|times|fps|ms|sn|saniye|dakika|saat))/gi;

/**
 * Araştırmadaki sayısal verileri tara ve potansiyel sorunları işaretle
 */
export function checkNumbers(research: ResearchInput): NumberCheckResult {
  const checkedNumbers: NumberCheckResult["checkedNumbers"] = [];
  const corrections: string[] = [];
  const warnings: string[] = [];

  const allText = research.findings.map((f) => f.content).join("\n");

  // 1. Fiyatları kontrol et
  const prices = Array.from(allText.matchAll(PRICE_PATTERN));
  for (const match of prices) {
    const full = match[0].trim();
    const currency = match[1];
    const amount = parseFloat(match[2].replace(",", "."));
    const multiplier = match[3] || "";

    let isSuspicious = false;
    let issue: string | undefined;

    // Şüpheli fiyat kontrolleri
    if (amount === 0) {
      isSuspicious = true;
      issue = "Fiyat 0 olarak belirtilmiş — ücretsiz mi yoksa hata mı?";
    }
    if (amount > 1000000 && !multiplier) {
      // Büyük sayı ama birim yok, olabilir
    }
    if (amount > 100 && multiplier === "milyar") {
      isSuspicious = true;
      issue = `${currency}${amount} milyar çok yüksek bir rakam — doğrulanması önerilir.`;
    }

    checkedNumbers.push({
      field: "price",
      claimed: full,
      expected: null,
      isCorrect: !isSuspicious,
      confidence: isSuspicious ? 30 : 70,
      issue,
    });
  }

  // 2. Yüzde değerlerini kontrol et
  const percentages = Array.from(allText.matchAll(PERCENTAGE_PATTERN));
  for (const match of percentages) {
    const value = parseFloat(match[1].replace(",", "."));
    const full = match[0].trim();

    let isSuspicious = false;
    let issue: string | undefined;

    if (value < 0) {
      isSuspicious = true;
      issue = "Negatif yüzde değeri — azalış olabilir ama kontrol edilmeli.";
    }
    if (value > 100 && match[2].includes("%")) {
      isSuspicious = true;
      issue = "%100'ün üzerinde yüzde — artış oranı olabilir ama kontrol edilmeli.";
    }
    if (value > 1000) {
      isSuspicious = true;
      issue = "%1000+ yüzde değeri — muhtemelen hatalı veya abartılı.";
    }

    checkedNumbers.push({
      field: "percentage",
      claimed: full,
      expected: null,
      isCorrect: !isSuspicious,
      confidence: isSuspicious ? 25 : 75,
      issue,
    });
  }

  // 3. Kapasite/boyut bilgilerini kontrol et
  const capacities = Array.from(allText.matchAll(CAPACITY_PATTERN));
  for (const match of capacities) {
    checkedNumbers.push({
      field: "capacity",
      claimed: match[0].trim(),
      expected: null,
      isCorrect: true,
      confidence: 80,
    });
  }

  // 4. Performans metriklerini kontrol et
  const performances = Array.from(allText.matchAll(PERFORMANCE_PATTERN));
  for (const match of performances) {
    checkedNumbers.push({
      field: "performance",
      claimed: match[0].trim(),
      expected: null,
      isCorrect: true,
      confidence: 50, // Performans iddiaları düşük güven
      issue: "Performans metriği — bağımsız test ile doğrulanması önerilir.",
    });
  }

  const invalidCount = checkedNumbers.filter((c) => !c.isCorrect).length;
  const allValid = invalidCount === 0;

  return {
    allNumbersValid: allValid,
    checkedNumbers,
    corrections,
  };
}
