import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { apiLogger as log } from "@/lib/logger";
import {
  ArticleListQuerySchema,
  ArticleCreateSchema,
  validateQuery,
  validateBody,
  paginatedResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Validate query parameters
    const query = validateQuery(searchParams, ArticleListQuerySchema);
    if (!query.success) return query.response;

    const { page, pageSize, status, search, categoryId } = query.data;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true, color: true } },
          author: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    return paginatedResponse(articles, total, page, pageSize);
  } catch (error) {
    log.error("Failed to list articles", error);
    return errorResponse("Haberler yüklenemedi");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    // Validate body
    const bodyResult = await validateBody(req, ArticleCreateSchema);
    if (!bodyResult.success) return bodyResult.response;

    const { title, content, excerpt, categoryId, authorId, status: articleStatus, featuredImage, metaTitle, metaDescription, isFeatured, tags } = bodyResult.data;

    // Slug oluştur
    let slug = slugify(title);
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        categoryId: categoryId || null,
        authorId: authorId || null,
        status: articleStatus,
        featuredImage: featuredImage || null,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || null,
        isFeatured: isFeatured || false,
        isAiGenerated: false,
        publishedAt: articleStatus === "published" ? new Date() : null,
        tags: tags && tags.length > 0
          ? {
              create: await Promise.all(
                tags.map(async (tagName: string) => {
                  const tagSlug = slugify(tagName);
                  const tag = await prisma.tag.upsert({
                    where: { slug: tagSlug },
                    update: {},
                    create: { name: tagName, slug: tagSlug },
                  });
                  return { tag: { connect: { id: tag.id } } };
                })
              ),
            }
          : undefined,
      },
    });

    return NextResponse.json({ data: article }, { status: 201 });
  } catch (error) {
    log.error("Failed to create article", error);
    return errorResponse("Haber oluşturulamadı");
  }
}
