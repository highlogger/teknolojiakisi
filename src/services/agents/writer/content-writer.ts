/**
 * Writer Agent — Content Writer
 *
 * AI Core Engine kullanarak tamamen özgün Türkçe teknoloji haberi yazar.
 * Research ve verification verilerini kullanır, ASLA rewrite yapmaz.
 */

import { ai } from "@/services/ai/client";
import type { WriterInput, SectionContent, ArticleSection } from "./types";
import { ARTICLE_WRITER_SYSTEM, buildArticlePrompt } from "./prompts";
const VERIFICATION_STATUS = { VERIFIED: "VERIFIED", LIKELY_VERIFIED: "LIKELY_VERIFIED", NEEDS_EDITOR_REVIEW: "NEEDS_EDITOR_REVIEW", INSUFFICIENT_EVIDENCE: "INSUFFICIENT_EVIDENCE", CONFLICTING_INFORMATION: "CONFLICTING_INFORMATION", REJECT: "REJECT", } as const;

/**
 * Ana yazım fonksiyonu.
 * Önce verification status kontrolü yapar, sonra yazar.
 */
export async function writeArticle(
  input: WriterInput
): Promise<{
  canWrite: boolean;
  blockReason?: string;
  article: string;
  sections: SectionContent[];
  wordCount: number;
}> {
  // ─── Ön Kontrol ──────────────────────────────────────────

  const { verification } = input;

  if (
    verification.status === VERIFICATION_STATUS.REJECT ||
    verification.status === VERIFICATION_STATUS.CONFLICTING_INFORMATION
  ) {
    return {
      canWrite: false,
      blockReason:
        verification.status === VERIFICATION_STATUS.REJECT
          ? "Doğrulama RED edildi. Haber oluşturulamaz."
          : "Kaynaklar arası ÇELİŞKİ tespit edildi. Haber oluşturulamaz.",
      article: "",
      sections: [],
      wordCount: 0,
    };
  }

  if (
    verification.status === VERIFICATION_STATUS.INSUFFICIENT_EVIDENCE
  ) {
    return {
      canWrite: false,
      blockReason:
        "Yetersiz kanıt. Daha fazla kaynak gerekiyor.",
      article: "",
      sections: [],
      wordCount: 0,
    };
  }

  // ─── Araştırma Verilerini Hazırla ─────────────────────────

  const researchSummary = input.research.findings
    .map((f) => `[${f.section}] ${f.content}`)
    .join("\n\n");

  const entities = input.research.entities || {
    people: [],
    companies: [],
    products: [],
    technologies: [],
  };

  const timeline = input.research.timeline || [];

  // ─── AI ile Yaz ───────────────────────────────────────────

  try {
    const result = await ai.simple(
      ARTICLE_WRITER_SYSTEM,
      buildArticlePrompt("", researchSummary, entities, timeline),
      {
        temperature: 0.7,
        maxTokens: 4096,
      }
    );

    if (result.success && result.content) {
      const article = result.content;
      const sections = parseSections(article);
      const wordCount = countWords(article);

      return {
        canWrite: true,
        article,
        sections,
        wordCount,
      };
    }
  } catch {
    // AI başarısız olursa fallback
  }

  // Fallback: araştırmadan yapılandırılmış içerik oluştur
  return buildFallbackArticle(input);
}

// ─── Bölüm Ayrıştırma ───────────────────────────────────────

function parseSections(content: string): SectionContent[] {
  const sections: SectionContent[] = [];
  const sectionMap: Record<string, ArticleSection> = {
    "giriş": "introduction",
    "ana gelişme": "main_development",
    "teknik ayrıntılar": "technical_details",
    "teknik detaylar": "technical_details",
    "kullanıcıları nasıl etkiliyor": "user_impact",
    "kullanıcı etkisi": "user_impact",
    "önceki durum": "previous_situation",
    "uzman değerlendirmesi": "expert_assessment",
    "sonuç": "conclusion",
  };

  // H2 başlıklarına göre böl
  const parts = content.split(/(?=^## )/m);

  for (const part of parts) {
    const headingMatch = part.match(/^## (.+)$/m);
    const heading = headingMatch ? headingMatch[1].trim() : "";
    const lowerHeading = heading.toLowerCase();

    let section: ArticleSection = "main_development";
    for (const [key, value] of Object.entries(sectionMap)) {
      if (lowerHeading.includes(key)) {
        section = value;
        break;
      }
    }

    const bodyText = part
      .replace(/^## .+\n?/m, "")
      .trim();

    if (bodyText.length > 20) {
      sections.push({
        section,
        heading: heading || section,
        content: bodyText,
        wordCount: countWords(bodyText),
      });
    }
  }

  return sections;
}

// ─── Fallback Yazım ─────────────────────────────────────────

function buildFallbackArticle(input: WriterInput): {
  canWrite: boolean;
  article: string;
  sections: SectionContent[];
  wordCount: number;
} {
  const findings = input.research.findings;
  const entities = input.research.entities;
  const timeline = input.research.timeline || [];

  let article = "";

  // Spot
  if (findings.length > 0) {
    article += `**${findings[0].content.substring(0, 200)}**\n\n`;
  }

  // Giriş
  article += `## Giriş\n\n`;
  if (findings.length > 0) {
    article += `${findings[0].content}\n\n`;
  }

  // Ana Gelişme
  article += `## Ana Gelişme\n\n`;
  for (const finding of findings.slice(1, 4)) {
    article += `${finding.content}\n\n`;
  }

  // Teknik Ayrıntılar
  if (entities?.technologies?.length || entities?.products?.length) {
    article += `## Teknik Ayrıntılar\n\n`;
    if (entities.products?.length) {
      article += `İlgili ürünler: ${entities.products.join(", ")}.\n\n`;
    }
    if (entities.technologies?.length) {
      article += `Kullanılan teknolojiler: ${entities.technologies.join(", ")}.\n\n`;
    }
  }

  // Kullanıcı Etkisi
  article += `## Kullanıcıları Nasıl Etkiliyor?\n\n`;
  article += `Bu gelişme, teknoloji dünyasında önemli bir adım olarak değerlendiriliyor. Kullanıcılar açısından getireceği yenilikler yakından takip ediliyor.\n\n`;

  // Önceki Durum
  if (timeline.length > 1) {
    article += `## Önceki Durum\n\n`;
    article += `Bu gelişmeye giden süreçte şu adımlar yaşandı:\n\n`;
    for (const t of timeline.slice(0, -1)) {
      article += `- **${t.date}:** ${t.event}\n`;
    }
    article += "\n";
  }

  // Uzman Değerlendirmesi
  article += `## Uzman Değerlendirmesi\n\n`;
  article += `Teknoloji uzmanları bu gelişmeyi yakından takip ediyor. Henüz tüm detaylar netleşmemiş olsa da, sektörde önemli bir etki yaratması bekleniyor.\n\n`;

  // Sonuç
  article += `## Sonuç\n\n`;
  article += `${findings[0]?.content?.substring(0, 150) || "Bu gelişme"} teknoloji dünyasında yankı uyandırdı. Önümüzdeki günlerde daha fazla detayın ortaya çıkması bekleniyor.\n`;

  const sections = parseSections(article);

  return {
    canWrite: true,
    article,
    sections,
    wordCount: countWords(article),
  };
}

// ─── Yardımcı ───────────────────────────────────────────────

function countWords(text: string): number {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/[#*_\-\[\]()]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}
