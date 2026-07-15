/**
 * Editor-in-Chief Agent — Main Service
 *
 * AI Newsroom'un son karar mercisi.
 * Tüm agent çıktılarını değerlendirir, editoryal karar verir.
 * Hiçbir haber onay almadan yayınlanamaz.
 *
 * Kullanım:
 *   import { review } from "@/services/agents/editor-in-chief";
 *   const result = await review(allAgentOutputs);
 */

import type { AgentInput, AgentOutput } from "@/services/agents/base/types";

export const AGENT_NAME = "Editor-in-Chief Agent";
export const AGENT_VERSION = "1.0.0";

// ─── Types ───────────────────────────────────────────────────

export type EditorialDecision = "APPROVED" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECTED";
export type PublishPriority = "breaking" | "high" | "normal" | "low" | "evergreen";
export type PerformanceLevel = "Düşük" | "Orta" | "Yüksek";

export interface EditorReviewInput {
  article: string;
  seo: { title: string; description: string; primaryKeyword: string; secondaryKeywords: string[]; wordCount: number };
  verification: { status: string; verificationScore: number; confidence: number; independentSources: number; officialSource: boolean; warnings: string[]; missingInformation: string[] };
  research?: { entities?: { people: string[]; companies: string[] }; relatedTopics: string[] };
  publicationReport?: { checks: Record<string, boolean> };
}

export interface EditorReviewResult {
  version: string; generatedAt: string;
  decision: EditorialDecision;
  confidence: number;
  editorialScore: number;
  priority: PublishPriority;
  googleNews: "PASS" | "FAIL" | "WARN";
  discover: "PASS" | "FAIL" | "WARN";
  scores: EditorialScores;
  summary: string;
  warnings: string[];
  requiredChanges: Array<{ section: string; issue: string; priority: "high" | "medium" | "low" }>;
  estimatedPerformance: { ctr: PerformanceLevel; googleNewsPotential: PerformanceLevel; discoverPotential: PerformanceLevel; organicTrafficPotential: PerformanceLevel; evergreenPotential: PerformanceLevel };
}

export interface EditorialScores {
  newsValue: number; originality: number; sourceQuality: number;
  technicalAccuracy: number; readability: number; seoQuality: number;
  discoverPotential: number; googleNewsCompliance: number;
  userValue: number; authority: number; headlineQuality: number; openingQuality: number;
}

// ─── Main API ────────────────────────────────────────────────

export async function review(input: EditorReviewInput): Promise<EditorReviewResult> {
  const warnings: string[] = [];
  const requiredChanges: EditorReviewResult["requiredChanges"] = [];

  const { article, seo, verification } = input;
  const plainText = article.replace(/<[^>]*>/g, "").replace(/[#*_\-\[\]()]/g, " ").trim();
  const firstParagraph = plainText.split(/\n\n+/)[0] || "";
  const title = seo.title;

  // ─── 20 Editoryal Kontrol ───────────────────────────────

  // 1. Haber değeri
  const newsValue = scoreNewsValue(verification, input.research);

  // 2. Özgünlük
  const originality = verification.verificationScore >= 70 ? 85 : verification.verificationScore >= 50 ? 60 : 30;

  // 3. Başlık kalitesi
  const headlineQuality = scoreHeadline(title);

  // 4. İlk paragraf gücü
  const openingQuality = scoreOpening(firstParagraph);

  // 5. Kaynak kalitesi
  const sourceQuality = verification.officialSource ? 90 : verification.independentSources >= 2 ? 70 : 40;
  if (verification.independentSources < 2) {
    requiredChanges.push({ section: "kaynak", issue: `Sadece ${verification.independentSources} bağımsız kaynak var. En az 2 olmalı.`, priority: "high" });
  }

  // 6. Teknik doğruluk
  const technicalAccuracy = verification.verificationScore;

  // 7. Okunabilirlik
  const readability = scoreReadability(plainText);

  // 8. SEO kalitesi
  const seoQuality = scoreSEOQuality(seo);

  // 9. Discover potansiyeli
  const discoverPotential = scoreDiscoverPotential(seo, verification);

  // 10. Google News uyumluluğu
  const googleNewsCompliance = scoreGoogleNewsCompliance(seo, verification);

  // 11. Kullanıcı değeri
  const userValue = scoreUserValue(plainText, verification);

  // 12. Otorite
  const authority = verification.officialSource ? 85 : 60;

  // 13. Clickbait kontrolü
  const clickbaitWords = ["şok", "bomba", "inanamayacaksınız", "ezber bozdu", "ortalığı karıştırdı", "yok sattı", "çılgın", "muhteşem", "efsane", "devrim"];
  for (const word of clickbaitWords) {
    if (title.toLowerCase().includes(word)) {
      warnings.push(`Clickbait ifade: "${word}"`);
      requiredChanges.push({ section: "başlık", issue: `Clickbait ifade: "${word}"`, priority: "high" });
    }
  }

  // 14. Keyword stuffing
  const keywordCount = (title.toLowerCase().match(new RegExp(seo.primaryKeyword.toLowerCase(), "g")) || []).length;
  if (keywordCount > 3) {
    warnings.push("Keyword stuffing tespit edildi.");
    requiredChanges.push({ section: "başlık", issue: "Keyword stuffing — anahtar kelime çok fazla tekrar ediyor.", priority: "medium" });
  }

  // 15. Gereksiz uzatma
  if (seo.wordCount > 2000) {
    warnings.push(`Makale ${seo.wordCount} kelime — biraz uzun olabilir.`);
  }

  // 16. Tekrar eden bölümler
  const paragraphs = plainText.split(/\n\n+/);
  const uniqueParagraphs = new Set(paragraphs.map(p => p.substring(0, 100)));
  if (uniqueParagraphs.size < paragraphs.length * 0.8) {
    warnings.push("Tekrar eden bölümler olabilir.");
    requiredChanges.push({ section: "içerik", issue: "Tekrar eden paragraflar var.", priority: "medium" });
  }

  // 17. Tarafsızlık
  const biasWords = ["inanılmaz", "mükemmel", "kusursuz", "harika", "şahane", "muazzam", "berbat", "rezalet"];
  let biasCount = 0;
  for (const word of biasWords) {
    biasCount += (plainText.toLowerCase().match(new RegExp(word, "g")) || []).length;
  }
  const isNeutral = biasCount <= 1;
  if (!isNeutral) {
    warnings.push(`${biasCount} öznel ifade — daha tarafsız olunmalı.`);
  }

  // 18. Kaynaksız iddia
  const unsourcedPatterns = [/en (iyi|hızlı|büyük|güçlü)/gi, /birinci sırada/gi, /rakipsiz/gi];
  let unsourcedCount = 0;
  for (const pattern of unsourcedPatterns) {
    unsourcedCount += (plainText.match(pattern) || []).length;
  }
  if (unsourcedCount > 2) {
    warnings.push(`${unsourcedCount} kaynaksız iddia — kaynak ekleyin veya yumuşatın.`);
  }

  // 19. Türkiye değeri
  const turkeyMentions = (plainText.toLowerCase().match(/türkiye|türk|ankara|istanbul|türkçe/gi) || []).length;
  const turkeyValue = turkeyMentions > 0 ? 80 : 40;

  // 20. Güncellik
  const isFresh = verification.verificationScore >= 70;

  // ─── Skorları Hesapla ──────────────────────────────────

  const scores: EditorialScores = {
    newsValue, originality, sourceQuality,
    technicalAccuracy, readability, seoQuality,
    discoverPotential, googleNewsCompliance,
    userValue, authority, headlineQuality, openingQuality,
  };

  const editorialScore = Math.round(
    Object.values(scores).reduce((sum, s) => sum + s, 0) / Object.keys(scores).length
  );

  // ─── Karar ─────────────────────────────────────────────

  let decision: EditorialDecision;
  let confidence: number;

  if (editorialScore >= 85 && warnings.length === 0 && requiredChanges.length === 0) {
    decision = "APPROVED";
    confidence = Math.min(98, editorialScore);
  } else if (editorialScore >= 70 && requiredChanges.filter(c => c.priority === "high").length === 0) {
    decision = "MINOR_REVISION";
    confidence = Math.min(85, editorialScore - 5);
  } else if (editorialScore >= 50) {
    decision = "MAJOR_REVISION";
    confidence = Math.min(70, editorialScore - 10);
  } else {
    decision = "REJECTED";
    confidence = editorialScore;
  }

  // ─── Google News / Discover ─────────────────────────────

  const googleNews: "PASS" | "FAIL" | "WARN" =
    googleNewsCompliance >= 80 ? "PASS" : googleNewsCompliance >= 60 ? "WARN" : "FAIL";

  const discover: "PASS" | "FAIL" | "WARN" =
    discoverPotential >= 80 ? "PASS" : discoverPotential >= 60 ? "WARN" : "FAIL";

  // ─── Öncelik ────────────────────────────────────────────

  const priority = determinePriority(verification, seo, input.research);

  // ─── Performans Tahmini ─────────────────────────────────

  const estimatedPerformance = {
    ctr: editorialScore >= 80 ? "Yüksek" as PerformanceLevel : editorialScore >= 60 ? "Orta" as PerformanceLevel : "Düşük" as PerformanceLevel,
    googleNewsPotential: googleNews === "PASS" ? "Yüksek" as PerformanceLevel : googleNews === "WARN" ? "Orta" as PerformanceLevel : "Düşük" as PerformanceLevel,
    discoverPotential: discover === "PASS" ? "Yüksek" as PerformanceLevel : discover === "WARN" ? "Orta" as PerformanceLevel : "Düşük" as PerformanceLevel,
    organicTrafficPotential: seoQuality >= 80 ? "Yüksek" as PerformanceLevel : seoQuality >= 60 ? "Orta" as PerformanceLevel : "Düşük" as PerformanceLevel,
    evergreenPotential: seo.wordCount > 800 ? "Yüksek" as PerformanceLevel : "Orta" as PerformanceLevel,
  };

  // ─── Özet ───────────────────────────────────────────────

  const decisionLabels: Record<EditorialDecision, string> = {
    APPROVED: "Haber tüm editoryal kontrollerden geçti, yayınlanabilir.",
    MINOR_REVISION: "Küçük düzeltmeler gerekiyor. Düzeltmeler sonrası yayınlanabilir.",
    MAJOR_REVISION: "Önemli sorunlar var. Kapsamlı revizyon gerekli.",
    REJECTED: "Haber yayınlanamaz. Yetersiz kaynak, düşük kalite veya tekrar içerik.",
  };

  return {
    version: AGENT_VERSION,
    generatedAt: new Date().toISOString(),
    decision,
    confidence,
    editorialScore,
    priority,
    googleNews,
    discover,
    scores,
    summary: decisionLabels[decision],
    warnings,
    requiredChanges,
    estimatedPerformance,
  };
}

// ─── Skorlama Fonksiyonları ──────────────────────────────────

function scoreNewsValue(verification: EditorReviewInput["verification"], research?: EditorReviewInput["research"]): number {
  let score = 50;
  if (verification.verificationScore >= 85) score += 20;
  if (verification.independentSources >= 3) score += 15;
  if (verification.officialSource) score += 10;
  if (research?.entities?.companies?.length) score += 5;
  return Math.min(100, score);
}

function scoreHeadline(title: string): number {
  let score = 80;
  if (title.length < 40) score -= 20;
  if (title.length > 80) score -= 10;
  if (title.includes("?")) score -= 5;
  if (title.includes("!")) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function scoreOpening(firstParagraph: string): number {
  let score = 70;
  if (firstParagraph.length < 50) score -= 20;
  if (firstParagraph.length > 300) score -= 10;
  // 5N1K kontrolü (basit)
  const hasWho = /[A-ZŞĞÜÇÖİ][a-zşğüçöı]+/.test(firstParagraph);
  const hasWhen = /\d{4}/.test(firstParagraph) || /bugün|dün|hafta|ay|yıl/.test(firstParagraph.toLowerCase());
  if (hasWho) score += 15;
  if (hasWhen) score += 10;
  return Math.min(100, score);
}

function scoreReadability(text: string): number {
  let score = 75;
  const avgWordsPerParagraph = text.split(/\n\n+/).map(p => p.split(/\s+/).length);
  const avg = avgWordsPerParagraph.reduce((a, b) => a + b, 0) / avgWordsPerParagraph.length;
  if (avg > 100) score -= 15;
  if (avg < 20) score -= 10;
  return Math.min(100, score);
}

function scoreSEOQuality(seo: EditorReviewInput["seo"]): number {
  let score = 70;
  if (seo.title.length >= 50 && seo.title.length <= 70) score += 10;
  if (seo.description.length >= 120 && seo.description.length <= 160) score += 10;
  if (seo.secondaryKeywords.length >= 3) score += 5;
  if (seo.primaryKeyword.length > 3) score += 5;
  return Math.min(100, score);
}

function scoreDiscoverPotential(seo: EditorReviewInput["seo"], verification: EditorReviewInput["verification"]): number {
  let score = 60;
  if (seo.wordCount > 500) score += 15;
  if (verification.verificationScore >= 80) score += 15;
  if (seo.title.length <= 65) score += 5;
  return Math.min(100, score);
}

function scoreGoogleNewsCompliance(seo: EditorReviewInput["seo"], verification: EditorReviewInput["verification"]): number {
  let score = 65;
  if (verification.independentSources >= 2) score += 15;
  if (seo.title.length <= 70) score += 10;
  if (verification.officialSource) score += 10;
  return Math.min(100, score);
}

function scoreUserValue(text: string, verification: EditorReviewInput["verification"]): number {
  let score = 60;
  if (text.length > 1500) score += 20;
  if (verification.verificationScore >= 80) score += 10;
  // Türkiye bağlamı
  if (/türkiye|türk|istanbul|ankara/i.test(text)) score += 10;
  return Math.min(100, score);
}

function determinePriority(
  verification: EditorReviewInput["verification"],
  seo: EditorReviewInput["seo"],
  research?: EditorReviewInput["research"]
): PublishPriority {
  if (verification.verificationScore >= 90 && verification.independentSources >= 3) return "breaking";
  if (verification.verificationScore >= 80) return "high";
  if (seo.wordCount > 1000) return "evergreen";
  if (verification.verificationScore >= 50) return "normal";
  return "low";
}

// ─── Agent Interface ─────────────────────────────────────────

export async function execute(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now();
  try {
    const reviewInput = input.inputs as unknown as EditorReviewInput;
    if (!reviewInput?.article) {
      return { success: false, outputs: {}, summary: { status: "REJECTED", score: 0, confidence: 0, warnings: [], errors: ["article.md bulunamadı."] }, duration: Date.now() - startTime };
    }

    const result = await review(reviewInput);

    return {
      success: result.decision !== "REJECTED",
      outputs: { editorReview: result },
      summary: { status: result.decision, score: result.editorialScore, confidence: result.confidence, warnings: result.warnings, errors: result.decision === "REJECTED" ? ["Haber reddedildi."] : [] },
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return { success: false, outputs: {}, summary: { status: "ERROR", score: 0, confidence: 0, warnings: [], errors: [`Editör hatası: ${error instanceof Error ? error.message : "Bilinmeyen"}`] }, duration: Date.now() - startTime };
  }
}

export async function dryRun(input: AgentInput): Promise<AgentOutput> {
  const result = await execute(input);
  return { ...result, summary: { ...result.summary, status: `DRY_RUN: ${result.summary.status}` } };
}

export const editorInChiefAgent = { name: AGENT_NAME, version: AGENT_VERSION, execute, dryRun };
export default editorInChiefAgent;
