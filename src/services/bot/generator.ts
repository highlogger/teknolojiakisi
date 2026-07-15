import { chat, chatJSON } from "@/lib/deepseek";
import { botLogger as log } from "@/lib/logger";
import {
  TRANSLATE_AND_REWRITE_SYSTEM,
  buildTranslatePrompt,
  SEO_OPTIMIZATION_SYSTEM,
  buildSEOPrompt,
  QUALITY_CHECK_SYSTEM,
  buildQualityCheckPrompt,
  CATEGORY_CLASSIFIER_SYSTEM,
  buildCategoryPrompt,
} from "./prompts";
import { slugify } from "@/lib/utils";
import type { FetchedArticle, GeneratedArticle } from "@/types";

/**
 * Bir makaleyi AI ile Türkçe'ye çevirip yeniden yazar
 */
export async function translateAndRewrite(
  article: FetchedArticle
): Promise<{
  content: string;
  promptTokens: number;
  completionTokens: number;
}> {
  const result = await chat({
    systemPrompt: TRANSLATE_AND_REWRITE_SYSTEM,
    userPrompt: buildTranslatePrompt(
      article.title,
      article.content || article.excerpt || article.title,
      article.sourceName
    ),
    temperature: 0.7,
    maxTokens: 4096,
  });

  return {
    content: result.content,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
  };
}

/**
 * SEO optimizasyonu yapar
 */
export async function optimizeSEO(
  title: string,
  content: string
): Promise<{
  seoTitle: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  promptTokens: number;
  completionTokens: number;
}> {
  const result = await chatJSON<{
    title: string;
    slug: string;
    metaTitle: string;
    metaDescription: string;
    tags: string[];
  }>({
    systemPrompt: SEO_OPTIMIZATION_SYSTEM,
    userPrompt: buildSEOPrompt(title, content),
  });

  return {
    seoTitle: result.data.title || title,
    slug: result.data.slug || slugify(title),
    metaTitle: result.data.metaTitle || title.substring(0, 60),
    metaDescription:
      result.data.metaDescription || content.replace(/<[^>]*>/g, "").substring(0, 160),
    tags: result.data.tags || [],
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
  };
}

/**
 * Türkçe kalite kontrolü yapar
 */
export async function qualityCheck(
  content: string
): Promise<{
  cleanedContent: string;
  promptTokens: number;
  completionTokens: number;
}> {
  const result = await chat({
    systemPrompt: QUALITY_CHECK_SYSTEM,
    userPrompt: buildQualityCheckPrompt(content),
    temperature: 0.3,
    maxTokens: 4096,
  });

  return {
    cleanedContent: result.content || content,
    promptTokens: result.promptTokens,
    completionTokens: result.completionTokens,
  };
}

/**
 * Kategori tahmini yapar
 */
export async function classifyCategory(
  title: string,
  content: string
): Promise<string> {
  const result = await chat({
    systemPrompt: CATEGORY_CLASSIFIER_SYSTEM,
    userPrompt: buildCategoryPrompt(title, content),
    temperature: 0.2,
    maxTokens: 50,
  });

  return result.content.trim().toLowerCase();
}

/**
 * Ana üretim pipeline'ı: çeviri -> SEO -> kalite kontrol -> kategori
 */
export async function generateArticle(
  fetchedArticle: FetchedArticle
): Promise<{
  generated: GeneratedArticle;
  totalPromptTokens: number;
  totalCompletionTokens: number;
}> {
  let totalPrompt = 0;
  let totalCompletion = 0;

  // Adım 1: Çeviri ve yeniden yazım
  console.log(`  [1/3] Çeviri: ${fetchedArticle.title.substring(0, 60)}...`);
  const translation = await translateAndRewrite(fetchedArticle);
  totalPrompt += translation.promptTokens;
  totalCompletion += translation.completionTokens;

  // Adım 2: Kalite kontrol
  console.log(`  [2/3] Kalite kontrolü...`);
  const quality = await qualityCheck(translation.content);
  totalPrompt += quality.promptTokens;
  totalCompletion += quality.completionTokens;

  const finalContent = quality.cleanedContent;

  // Başlığı içerikten çıkar (ilk <h2> veya ilk satır)
  let suggestedTitle = fetchedArticle.title;
  const h2Match = finalContent.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  if (h2Match) {
    suggestedTitle = h2Match[1].trim();
  }

  // Adım 3: SEO optimizasyonu
  console.log(`  [3/3] SEO optimizasyonu...`);
  const seo = await optimizeSEO(suggestedTitle, finalContent);
  totalPrompt += seo.promptTokens;
  totalCompletion += seo.completionTokens;

  // Özet çıkarımı (HTML'den ilk paragraf)
  const excerpt = finalContent
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 250);

  const generated: GeneratedArticle = {
    title: seo.seoTitle,
    slug: ensureUniqueSlug(seo.slug),
    excerpt: excerpt + "...",
    content: finalContent,
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    tags: seo.tags,
  };

  return {
    generated,
    totalPromptTokens: totalPrompt,
    totalCompletionTokens: totalCompletion,
  };
}

/**
 * Benzersiz slug oluştur (timestamp ekleyerek)
 */
function ensureUniqueSlug(slug: string): string {
  const timestamp = Date.now().toString(36);
  if (slug.length > 50) {
    slug = slug.substring(0, 50);
  }
  return `${slug}-${timestamp}`;
}
