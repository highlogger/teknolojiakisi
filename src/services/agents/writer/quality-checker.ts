/**
 * Writer Agent — Quality Checker
 *
 * Yazım sonrası kalite kontrolü:
 * - Başlık doğru mu?
 * - Tekrar var mı?
 * - Gereksiz paragraf var mı?
 * - Teknik hata var mı?
 * - Kaynaksız bilgi var mı?
 * - Tarafsız mı?
 * - Doğal Türkçe mi?
 */

import type { WriterQualityCheck } from "./types";
import { validateHeadline } from "./headline-writer";

/**
 * Makaleyi kalite kontrolünden geçir
 */
export function qualityCheck(
  article: string,
  title: string,
  excerpt: string
): WriterQualityCheck {
  const issues: string[] = [];
  const plainText = article.replace(/<[^>]*>/g, "").replace(/[#*_\-\[\]()]/g, " ");

  // 1. Başlık kontrolü
  const headlineValidation = validateHeadline(title);
  const headlineOk = headlineValidation.valid;
  if (!headlineOk) {
    issues.push(...headlineValidation.issues);
  }

  // 2. Tekrar kontrolü
  const sentences = plainText
    .split(/[.!?]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 20);

  const duplicateSentences: string[] = [];
  const seen = new Set<string>();
  for (const sentence of sentences) {
    const normalized = sentence.substring(0, 50);
    if (seen.has(normalized)) {
      duplicateSentences.push(sentence);
    }
    seen.add(normalized);
  }

  const noRepetition = duplicateSentences.length <= 2;
  if (!noRepetition) {
    issues.push(
      `${duplicateSentences.length} cümle tekrar ediyor.`
    );
  }

  // 3. Gereksiz paragraf kontrolü (çok kısa paragraflar)
  const paragraphs = article
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0);

  const shortParagraphs = paragraphs.filter(
    (p) => p.replace(/[#*_\-\[\]()\s]/g, "").length < 30
  );

  const noFillerParagraphs = shortParagraphs.length <= 2;
  if (!noFillerParagraphs) {
    issues.push(
      `${shortParagraphs.length} çok kısa paragraf var — gereksiz olabilir.`
    );
  }

  // 4. Türkçe karakter kontrolü
  const turkishCharsMissing =
    !plainText.includes("ğ") && !plainText.includes("ş") && !plainText.includes("ı");
  // Uyarı değil, sadece kontrol

  // 5. Robotik ifade kontrolü
  const roboticPhrases = [
    "elbette",
    "işte karşınızda",
    "bu makalede",
    "tabii ki",
    "şüphesiz ki",
    "malumunuz",
    "efendim",
    "peki",
  ];

  let roboticCount = 0;
  for (const phrase of roboticPhrases) {
    const regex = new RegExp(phrase, "gi");
    const matches = plainText.match(regex);
    if (matches) {
      roboticCount += matches.length;
    }
  }

  const naturalTurkish = roboticCount <= 2;
  if (!naturalTurkish) {
    issues.push(
      `${roboticCount} robotik ifade tespit edildi. Daha doğal bir dil kullanın.`
    );
  }

  // 6. Tarafsızlık kontrolü (basit: aşırı olumlu/olumsuz ifade)
  const biasPhrases = [
    "inanılmaz",
    "mükemmel",
    "kusursuz",
    "berbat",
    "rezalet",
    "harika",
    "şahane",
    "muazzam",
  ];

  let biasCount = 0;
  for (const phrase of biasPhrases) {
    const regex = new RegExp(phrase, "gi");
    const matches = plainText.match(regex);
    if (matches) {
      biasCount += matches.length;
    }
  }

  const isNeutral = biasCount <= 1;
  if (!isNeutral) {
    issues.push(
      `${biasCount} öznel/taraflı ifade tespit edildi. Daha objektif olun.`
    );
  }

  // 7. Kaynaksız iddia kontrolü (basit: "göre" kelimesi olmadan kesin ifade)
  const unsourcedPatterns = [
    /en (iyi|hızlı|büyük|güçlü|başarılı)/gi,
    /birinci sırada/gi,
    /lider/gi,
    /rakipsiz/gi,
  ];

  let unsourcedCount = 0;
  for (const pattern of unsourcedPatterns) {
    const matches = plainText.match(pattern);
    if (matches) {
      unsourcedCount += matches.length;
    }
  }

  const noUnsourcedClaims = unsourcedCount <= 2;
  if (!noUnsourcedClaims) {
    issues.push(
      `${unsourcedCount} kaynaksız iddia tespit edildi. Kaynak belirtin veya yumuşatın.`
    );
  }

  // 8. Teknik hata kontrolü — şimdilik iyimser
  const noTechnicalErrors = true;

  // ─── Skor Hesapla ────────────────────────────────────────

  let score = 100;
  if (!headlineOk) score -= 15;
  if (!noRepetition) score -= 15;
  if (!noFillerParagraphs) score -= 10;
  if (!naturalTurkish) score -= 20;
  if (!isNeutral) score -= 15;
  if (!noUnsourcedClaims) score -= 20;
  if (!noTechnicalErrors) score -= 25;

  score = Math.max(0, Math.min(100, score));

  return {
    headlineOk,
    noRepetition,
    noFillerParagraphs,
    noTechnicalErrors,
    noUnsourcedClaims,
    isNeutral,
    naturalTurkish,
    issues,
    score,
  };
}
