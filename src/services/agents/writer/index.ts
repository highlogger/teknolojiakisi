/**
 * Writer Agent — Main Service
 *
 * AI Newsroom yazar agent'ı.
 * Research + Verification çıktılarını kullanarak özgün Türkçe teknoloji haberi yazar.
 *
 * Kullanım:
 *   import { write } from "@/services/agents/writer";
 *   const result = await write(researchJson, verificationJson);
 *
 * AI Core Engine ile uyumlu.
 * Research Agent ve Verification Agent çıktılarını kullanır.
 * SEO Agent ve Publisher Agent'tan bağımsız.
 */

import type { AgentInput, AgentOutput } from "@/services/agents/base/types";
import type { WriterResult, WriterInput } from "./types";
import {
  generateHeadlines,
  selectBestTitle,
} from "./headline-writer";
import { writeArticle } from "./content-writer";
import { qualityCheck } from "./quality-checker";
import { suggestImages } from "./image-suggester";
import { suggestInternalLinks } from "./link-suggester";

// ─── Agent Metadata ──────────────────────────────────────────

export const AGENT_NAME = "Writer Agent";
export const AGENT_VERSION = "1.0.0";

// ─── Main API ────────────────────────────────────────────────

/**
 * Ana yazım fonksiyonu.
 * Research + Verification verilerini kullanarak haber yazar.
 */
export async function write(
  researchInput: WriterInput["research"],
  verificationInput: WriterInput["verification"]
): Promise<WriterResult> {
  const startTime = Date.now();
  const warnings: string[] = [];

  const input: WriterInput = {
    research: researchInput,
    verification: verificationInput,
  };

  // ─── Araştırma Özeti ─────────────────────────────────────

  const researchSummary = researchInput.findings
    .map((f) => `[${f.section}] ${f.content}`)
    .join("\n\n");

  const allEntities = [
    ...(researchInput.entities?.people || []),
    ...(researchInput.entities?.companies || []),
    ...(researchInput.entities?.products || []),
    ...(researchInput.entities?.technologies || []),
  ];

  // ─── 1. Başlık Üretimi ───────────────────────────────────

  const titleOptions = await generateHeadlines(
    researchSummary,
    allEntities
  );

  const bestTitle = selectBestTitle(titleOptions);

  // ─── 2. Haber Yazımı ─────────────────────────────────────

  const writerResult = await writeArticle(input);

  if (!writerResult.canWrite) {
    return {
      version: AGENT_VERSION,
      generatedAt: new Date().toISOString(),
      canWrite: false,
      blockReason: writerResult.blockReason,
      titleOptions,
      selectedTitle: "",
      excerpt: "",
      summary: "",
      article: "",
      sections: [],
      wordCount: 0,
      readingTime: 0,
      imageSuggestions: [],
      internalLinkCandidates: [],
      qualityCheck: {
        headlineOk: false,
        noRepetition: true,
        noFillerParagraphs: true,
        noTechnicalErrors: true,
        noUnsourcedClaims: true,
        isNeutral: true,
        naturalTurkish: true,
        issues: [writerResult.blockReason || "Yazım engellendi."],
        score: 0,
      },
      warnings,
    };
  }

  // ─── 3. Excerpt ve Summary ───────────────────────────────

  const excerpt = generateExcerpt(writerResult.article, bestTitle.title);
  const summary = generateSummary(writerResult.article);

  // ─── 4. Görsel Önerileri ─────────────────────────────────

  const imageSuggestions = await suggestImages(
    bestTitle.title,
    writerResult.article,
    {
      companies: researchInput.entities?.companies || [],
      products: researchInput.entities?.products || [],
    }
  );

  // ─── 5. İç Link Adayları ─────────────────────────────────

  const internalLinkCandidates = suggestInternalLinks(
    writerResult.article,
    researchInput.entities || {
      people: [],
      companies: [],
      products: [],
      technologies: [],
    }
  );

  // ─── 6. Kalite Kontrolü ─────────────────────────────────

  const qcResult = qualityCheck(
    writerResult.article,
    bestTitle.title,
    excerpt
  );

  if (qcResult.issues.length > 0) {
    warnings.push(...qcResult.issues);
  }

  // ─── 7. Okuma Süresi ────────────────────────────────────

  const readingTime = Math.max(
    1,
    Math.round(writerResult.wordCount / 200)
  ); // 200 kelime/dakika

  // ─── Sonuç ──────────────────────────────────────────────

  return {
    version: AGENT_VERSION,
    generatedAt: new Date().toISOString(),
    canWrite: true,
    titleOptions,
    selectedTitle: bestTitle.title,
    excerpt,
    summary,
    article: writerResult.article,
    sections: writerResult.sections,
    wordCount: writerResult.wordCount,
    readingTime,
    imageSuggestions,
    internalLinkCandidates,
    qualityCheck: qcResult,
    warnings,
  };
}

// ─── Agent Interface ─────────────────────────────────────────

export async function execute(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now();

  try {
    const researchInput = input.inputs.research as WriterInput["research"];
    const verificationInput = input.inputs
      .verification as WriterInput["verification"];

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

    if (!verificationInput) {
      return {
        success: false,
        outputs: {},
        summary: {
          status: "REJECT",
          score: 0,
          confidence: 0,
          warnings: [],
          errors: ["verification.json input'u bulunamadı."],
        },
        duration: Date.now() - startTime,
      };
    }

    const result = await write(researchInput, verificationInput);

    return {
      success: result.canWrite && result.qualityCheck.score >= 60,
      outputs: {
        article: result.article,
        titleOptions: result.titleOptions,
        excerpt: result.excerpt,
        summary: result.summary,
        imageSuggestions: result.imageSuggestions,
        internalLinkCandidates: result.internalLinkCandidates,
        writerResult: result,
      },
      summary: {
        status: result.canWrite ? "SUCCESS" : "BLOCKED",
        score: result.qualityCheck.score,
        confidence: result.canWrite ? 85 : 0,
        warnings: result.warnings,
        errors: result.canWrite
          ? []
          : [result.blockReason || "Yazım engellendi."],
      },
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      outputs: {},
      summary: {
        status: "ERROR",
        score: 0,
        confidence: 0,
        warnings: [],
        errors: [
          `Yazım hatası: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
        ],
      },
      duration: Date.now() - startTime,
    };
  }
}

export async function dryRun(input: AgentInput): Promise<AgentOutput> {
  const result = await execute(input);
  return {
    ...result,
    summary: {
      ...result.summary,
      status: `DRY_RUN: ${result.summary.status}`,
    },
  };
}

// ─── Yardımcı Fonksiyonlar ──────────────────────────────────

function generateExcerpt(article: string, title: string): string {
  // İlk anlamlı paragrafı excerpt olarak kullan
  const plainText = article
    .replace(/<[^>]*>/g, "")
    .replace(/[#*_>|]/g, "")
    .trim();

  const paragraphs = plainText.split(/\n\n+/).filter((p) => p.length > 50);

  if (paragraphs.length > 0) {
    const excerpt = paragraphs[0].substring(0, 250).trim();
    return excerpt + (paragraphs[0].length > 250 ? "..." : "");
  }

  return title;
}

function generateSummary(article: string): string {
  const plainText = article
    .replace(/<[^>]*>/g, "")
    .replace(/[#*_>|]/g, "")
    .trim();

  // İlk 2 paragrafı birleştir
  const paragraphs = plainText.split(/\n\n+/).filter((p) => p.length > 30);

  return paragraphs.slice(0, 2).join(" ").substring(0, 500).trim();
}

// ─── Agent Metadata ──────────────────────────────────────────

export const writerAgent = {
  name: AGENT_NAME,
  version: AGENT_VERSION,
  execute,
  dryRun,
};

export default writerAgent;
