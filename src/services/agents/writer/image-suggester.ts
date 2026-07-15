/**
 * Writer Agent — Image Suggester
 *
 * Haber için uygun görsel önerileri yapar.
 */

import { ai } from "@/services/ai/client";
import type { ImageSuggestion } from "./types";
import { IMAGE_SUGGESTER_SYSTEM, buildImagePrompt } from "./prompts";

/**
 * Haber için görsel önerileri üret
 */
export async function suggestImages(
  title: string,
  article: string,
  entities: { companies: string[]; products: string[] }
): Promise<ImageSuggestion[]> {
  try {
    const result = await ai.simpleJSON<{
      images: Array<{
        type: string;
        description: string;
        suggestedSource: string;
        priority: string;
        altText: string;
      }>;
    }>(IMAGE_SUGGESTER_SYSTEM, buildImagePrompt(title, article, entities), {
      temperature: 0.5,
      maxTokens: 1024,
    });

    if (result.success && result.parsed?.images) {
      return result.parsed.images.map((img) => ({
        type: img.type as ImageSuggestion["type"],
        description: img.description,
        suggestedSource: img.suggestedSource,
        priority: img.priority as ImageSuggestion["priority"],
        altText: img.altText,
      }));
    }
  } catch {
    // AI başarısız olursa fallback
  }

  // Fallback
  return generateFallbackImages(title, entities);
}

function generateFallbackImages(
  title: string,
  entities: { companies: string[]; products: string[] }
): ImageSuggestion[] {
  const suggestions: ImageSuggestion[] = [];

  const mainCompany = entities.companies[0];
  const mainProduct = entities.products[0];

  if (mainProduct) {
    suggestions.push({
      type: "official_product",
      description: `${mainProduct} resmi ürün görseli`,
      suggestedSource: mainCompany
        ? `${mainCompany} resmi web sitesi veya basın kiti`
        : "Ürünün resmi web sitesi",
      priority: "required",
      altText: `${mainProduct} resmi ürün görseli`,
    });
  }

  if (mainCompany) {
    suggestions.push({
      type: "logo",
      description: `${mainCompany} logosu`,
      suggestedSource: `${mainCompany} resmi web sitesi`,
      priority: "recommended",
      altText: `${mainCompany} logo`,
    });
  }

  suggestions.push({
    type: "infographic",
    description: `${title} hakkında bilgilendirici infografik`,
    suggestedSource: "Canva / Figma ile oluşturulabilir",
    priority: "optional",
    altText: `${title} infografik`,
  });

  return suggestions;
}
