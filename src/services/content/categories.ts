/**
 * Content Engine — Category Engine
 *
 * Gelecekte genişleyebilecek kategori sistemi.
 */

import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { ContentType } from "./types";

// ─── Category Operations ───────────────────────────────────

/**
 * Kategori oluştur
 */
export async function createCategory(params: {
  name: string;
  description?: string;
  color?: string;
  sortOrder?: number;
}): Promise<string> {
  const cat = await prisma.category.create({
    data: {
      name: params.name,
      slug: slugify(params.name),
      description: params.description || null,
      color: params.color || "#3B82F6",
      sortOrder: params.sortOrder || 0,
    },
  });
  return cat.id;
}

/**
 * Kategori slug'ından kategori bul
 */
export async function findCategoryBySlug(
  slug: string
): Promise<{ id: string; name: string; slug: string; color: string } | null> {
  return prisma.category.findUnique({ where: { slug } });
}

/**
 * Kategoriye ait makale sayısı
 */
export async function getCategoryArticleCount(
  categoryId: string,
  contentType?: ContentType
): Promise<number> {
  const where: Record<string, unknown> = { categoryId };
  return prisma.article.count({ where });
}

// ─── Future: Hierarchical Categories ───────────────────────

/**
 * Kategori ağacı (gelecekte parent-child ilişkisi için)
 * Henüz implemente edilmedi — schema'da parentId yok
 */
export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  color: string;
  children: CategoryTree[];
  articleCount: number;
}

/**
 * Düz kategori listesini al (ağaç yapısı henüz yok)
 */
export async function getCategoryList(): Promise<
  { id: string; name: string; slug: string; color: string; articleCount: number }[]
> {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { articles: { select: { id: true } } },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    color: c.color,
    articleCount: c.articles.length,
  }));
}
