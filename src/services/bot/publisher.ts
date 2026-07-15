import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { GeneratedArticle, FetchedArticle } from "@/types";

/**
 * Üretilen makaleyi veritabanına kaydeder
 */
export async function publishArticle(
  generated: GeneratedArticle,
  fetched: FetchedArticle,
  options: {
    categoryId?: string;
    authorId?: string;
    sourceId: string;
    aiModel: string;
    promptTokens: number;
    completionTokens: number;
    autoPublish: boolean;
    featuredImage?: string;
  }
): Promise<{ id: string; status: string }> {
  // Benzersiz slug oluştur
  let slug = generated.slug;
  const existingSlug = await prisma.article.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  // Etiketleri bul veya oluştur
  const tagIds: string[] = [];
  for (const tagName of generated.tags) {
    const tagSlug = slugify(tagName);
    const tag = await prisma.tag.upsert({
      where: { slug: tagSlug },
      update: {},
      create: { name: tagName, slug: tagSlug },
    });
    tagIds.push(tag.id);
  }

  const article = await prisma.article.create({
    data: {
      title: generated.title,
      slug,
      excerpt: generated.excerpt,
      content: generated.content,
      featuredImage: options.featuredImage || fetched.imageUrl,
      categoryId: options.categoryId,
      authorId: options.authorId,
      sourceId: options.sourceId,
      originalUrl: fetched.url,
      originalTitle: fetched.title,
      language: "tr",
      status: options.autoPublish ? "published" : "draft",
      isAiGenerated: true,
      aiModel: options.aiModel,
      aiPromptTokens: options.promptTokens,
      aiCompletionTokens: options.completionTokens,
      metaTitle: generated.metaTitle,
      metaDescription: generated.metaDescription,
      publishedAt: options.autoPublish ? (fetched.publishedAt || new Date()) : null,
      tags: {
        create: tagIds.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      },
    },
  });

  return { id: article.id, status: article.status };
}

/**
 * Ana makale içeriğini günceller
 */
export async function updateArticleContent(
  articleId: string,
  content: string,
  promptTokens: number,
  completionTokens: number
): Promise<void> {
  await prisma.article.update({
    where: { id: articleId },
    data: {
      content,
      aiPromptTokens: { increment: promptTokens },
      aiCompletionTokens: { increment: completionTokens },
    },
  });
}

/**
 * Bot çalışma log'unu kaydeder
 */
export async function createBotLog(params: {
  sourceId?: string;
  status: string;
  articlesFound: number;
  articlesGenerated: number;
  articlesPublished: number;
  errorMessage?: string;
  durationMs: number;
  details?: string;
}): Promise<void> {
  await prisma.botLog.create({
    data: {
      sourceId: params.sourceId || null,
      status: params.status,
      articlesFound: params.articlesFound,
      articlesGenerated: params.articlesGenerated,
      articlesPublished: params.articlesPublished,
      errorMessage: params.errorMessage || null,
      durationMs: params.durationMs,
      details: params.details || null,
    },
  });
}

/**
 * Kaynağın son çekilme zamanını günceller
 */
export async function updateSourceFetchTime(sourceId: string): Promise<void> {
  await prisma.source.update({
    where: { id: sourceId },
    data: { lastFetchedAt: new Date() },
  });
}

/**
 * Auto-publish ayarını okur
 */
export async function getAutoPublishSetting(): Promise<boolean> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "autoPublish" },
    });
    return setting?.value === "true";
  } catch {
    return false;
  }
}

/**
 * Kategori ID'sini slug'dan bulur
 */
export async function findCategoryBySlug(
  slug: string
): Promise<string | undefined> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
    });
    return category?.id;
  } catch {
    return undefined;
  }
}

/**
 * Rastgele bir bot yazar seçer
 */
export async function getDefaultBotAuthor(): Promise<string | undefined> {
  try {
    const authors = await prisma.author.findMany({
      where: { isBot: true },
      take: 1,
    });
    if (authors.length > 0) return authors[0].id;

    // Bot yazar yoksa ilk yazarı döndür
    const any = await prisma.author.findFirst();
    return any?.id;
  } catch {
    return undefined;
  }
}
