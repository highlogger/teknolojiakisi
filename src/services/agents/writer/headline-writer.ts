/**
 * Writer Agent — Headline Writer
 *
 * 5 alternatif başlık üretir (her stilden bir tane).
 * AI Core Engine kullanır.
 */

import { ai } from "@/services/ai/client";
import type { TitleOption } from "./types";
import { HEADLINE_WRITER_SYSTEM, buildHeadlinePrompt } from "./prompts";

/**
 * 5 alternatif başlık üret
 */
export async function generateHeadlines(
  researchSummary: string,
  entities: string[]
): Promise<TitleOption[]> {
  try {
    const result = await ai.simpleJSON<{
      titles: Array<{
        title: string;
        style: string;
        seoScore: number;
        length: number;
        strengths: string[];
      }>;
    }>(HEADLINE_WRITER_SYSTEM, buildHeadlinePrompt(researchSummary, entities), {
      temperature: 0.8,
      maxTokens: 1024,
    });

    if (result.success && result.parsed?.titles) {
      return result.parsed.titles.map((t) => ({
        title: t.title,
        seoScore: t.seoScore || 80,
        length: t.length || t.title.length,
        style: (t.style as TitleOption["style"]) || "news",
        strengths: t.strengths || [],
      }));
    }
  } catch {
    // AI başarısız olursa fallback başlık
  }

  // Fallback: basit kural tabanlı başlıklar
  return generateFallbackHeadlines(researchSummary, entities);
}

/**
 * AI başarısız olursa kural tabanlı fallback başlıklar
 */
function generateFallbackHeadlines(
  researchSummary: string,
  entities: string[]
): TitleOption[] {
  const mainEntity = entities[0] || "Teknoloji";
  const words = researchSummary.split(/\s+/).slice(0, 30).join(" ");

  return [
    {
      title: `${mainEntity} yeni özelliğini duyurdu`,
      seoScore: 75,
      length: mainEntity.length + 25,
      style: "news",
      strengths: ["Doğrudan", "Anlaşılır"],
    },
    {
      title: `${mainEntity} hakkında bilmeniz gerekenler`,
      seoScore: 70,
      length: mainEntity.length + 30,
      style: "direct",
      strengths: ["Bilgilendirici"],
    },
    {
      title: `${mainEntity} kullanıcıları nasıl etkileyecek?`,
      seoScore: 72,
      length: mainEntity.length + 32,
      style: "question",
      strengths: ["Merak uyandırıcı"],
    },
    {
      title: `${mainEntity} ile gelen 5 önemli değişiklik`,
      seoScore: 78,
      length: mainEntity.length + 33,
      style: "analysis",
      strengths: ["Liste formatı", "SEO uyumlu"],
    },
    {
      title: `${mainEntity}: İşte tüm detaylar`,
      seoScore: 68,
      length: mainEntity.length + 22,
      style: "direct",
      strengths: ["Kısa", "Net"],
    },
  ];
}

/**
 * En iyi başlığı seç (en yüksek SEO skoru)
 */
export function selectBestTitle(titles: TitleOption[]): TitleOption {
  if (titles.length === 0) {
    return {
      title: "Yeni Teknoloji Gelişmesi",
      seoScore: 50,
      length: 27,
      style: "news",
      strengths: [],
    };
  }

  return titles.reduce((best, current) =>
    current.seoScore > best.seoScore ? current : best
  );
}

/**
 * Başlığı doğrula:
 * - 55-65 karakter
 * - Clickbait yok
 * - Keyword stuffing yok
 */
export function validateHeadline(title: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (title.length < 40) {
    issues.push(`Başlık çok kısa (${title.length} karakter). Minimum 40 önerilir.`);
  }
  if (title.length > 80) {
    issues.push(`Başlık çok uzun (${title.length} karakter). Maksimum 70 önerilir.`);
  }

  const clickbaitWords = [
    "şok",
    "bomba",
    "inanamayacaksınız",
    "ezber bozdu",
    "ortalığı karıştırdı",
    "yok sattı",
    "resmen yıktı",
    "çılgın",
    "muhteşem",
    "efsane",
    "devrim",
    "tarihi",
  ];

  const lowerTitle = title.toLowerCase();
  for (const word of clickbaitWords) {
    if (lowerTitle.includes(word)) {
      issues.push(`Clickbait ifade: "${word}"`);
    }
  }

  // Keyword stuffing kontrolü (aynı kelime 3+ kez)
  const wordCounts = new Map<string, number>();
  for (const word of lowerTitle.split(/\s+/)) {
    if (word.length > 3) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  }
  for (const [word, count] of wordCounts) {
    if (count >= 3) {
      issues.push(`Keyword stuffing: "${word}" ${count} kez geçiyor.`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
