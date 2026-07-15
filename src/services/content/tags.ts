/**
 * Content Engine — Tag Engine
 *
 * Genişletilebilir etiket yönetimi.
 * AI Core ile otomatik etiket üretimi için hazır.
 */

import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { AIChatResponse } from "@/services/ai";

// ─── Tag Operations ────────────────────────────────────────

/**
 * Etiketleri toplu ekle/bağla
 */
export async function attachTags(
  articleId: string,
  tagNames: string[]
): Promise<string[]> {
  if (!tagNames.length) return [];

  // Mevcut etiket bağlantılarını temizle (isteğe bağlı — caller kontrol eder)
  const tagIds: string[] = [];

  for (const name of tagNames) {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 50) continue;

    const tagSlug = slugify(trimmed);
    const tag = await prisma.tag.upsert({
      where: { slug: tagSlug },
      update: {},
      create: { name: trimmed, slug: tagSlug },
    });

    // Bağlantıyı kontrol et, yoksa ekle
    const existing = await prisma.articleTag.findUnique({
      where: { articleId_tagId: { articleId, tagId: tag.id } },
    });

    if (!existing) {
      await prisma.articleTag.create({
        data: { articleId, tagId: tag.id },
      });
    }

    tagIds.push(tag.id);
  }

  return tagIds;
}

/**
 * Etiketleri çıkar
 */
export async function detachTags(
  articleId: string,
  tagIds: string[]
): Promise<void> {
  for (const tagId of tagIds) {
    await prisma.articleTag.deleteMany({
      where: { articleId, tagId },
    });
  }
}

/**
 * Etiketleri tamamen değiştir
 */
export async function replaceTags(
  articleId: string,
  newTagNames: string[]
): Promise<string[]> {
  await prisma.articleTag.deleteMany({ where: { articleId } });
  return attachTags(articleId, newTagNames);
}

/**
 * Etiket öner (AI ile) — altyapı hazır
 */
export interface TagSuggestionInput {
  title: string;
  content: string;
  aiResponse?: AIChatResponse; // AI Core Engine'den gelen yanıt
}

export function suggestTagsFromAI(
  input: TagSuggestionInput
): string[] {
  // AI yanıtı varsa parse et
  if (input.aiResponse?.success) {
    try {
      const parsed = JSON.parse(input.aiResponse.content);
      if (parsed.tags && Array.isArray(parsed.tags)) {
        return parsed.tags.slice(0, 20);
      }
    } catch {
      // parse edilemezse devam
    }
  }
  return [];
}

/**
 * En çok kullanılan etiketler
 */
export async function getPopularTags(limit = 20): Promise<
  { id: string; name: string; slug: string; count: number }[]
> {
  const tags = await prisma.tag.findMany({
    include: { articles: { select: { articleId: true } } },
    orderBy: { articles: { _count: "desc" } },
    take: limit,
  });

  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    count: t.articles.length,
  }));
}
