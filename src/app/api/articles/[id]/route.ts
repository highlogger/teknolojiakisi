import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { apiLogger as log } from "@/lib/logger";
import {
  ArticleUpdateSchema,
  validateBody,
  validateParams,
  CuidParamsSchema,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/validation";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const p = validateParams(params, CuidParamsSchema);
    if (!p.success) return p.response;

    const article = await prisma.article.findUnique({
      where: { id: p.data.id },
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } },
        source: true,
      },
    });

    if (!article) return notFoundResponse("Haber");

    return NextResponse.json({ data: article });
  } catch (error) {
    log.error("Article get error:", error);
    return errorResponse("Haber yüklenemedi");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const p = validateParams(params, CuidParamsSchema);
    if (!p.success) return p.response;

    const bodyResult = await validateBody(req, ArticleUpdateSchema);
    if (!bodyResult.success) return bodyResult.response;

    const {
      title, content, excerpt, categoryId, authorId,
      status: articleStatus, featuredImage, metaTitle, metaDescription,
      isFeatured, tags,
    } = bodyResult.data;

    // Önce makale var mı kontrol et
    const existing = await prisma.article.findUnique({ where: { id: p.data.id } });
    if (!existing) return notFoundResponse("Haber");

    const article = await prisma.article.update({
      where: { id: p.data.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(categoryId !== undefined && { categoryId }),
        ...(authorId !== undefined && { authorId }),
        ...(articleStatus !== undefined && { status: articleStatus }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(articleStatus !== undefined && {
          publishedAt:
            articleStatus === "published"
              ? existing.publishedAt || new Date()
              : articleStatus === "draft"
              ? null
              : existing.publishedAt,
        }),
      },
    });

    // Etiketleri güncelle
    if (tags && Array.isArray(tags)) {
      await prisma.articleTag.deleteMany({ where: { articleId: p.data.id } });
      for (const tagName of tags) {
        if (typeof tagName !== "string" || !tagName.trim()) continue;
        const tagSlug = slugify(tagName.trim());
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName.trim(), slug: tagSlug },
        });
        await prisma.articleTag.create({
          data: { articleId: p.data.id, tagId: tag.id },
        });
      }
    }

    return NextResponse.json({ data: article });
  } catch (error) {
    log.error("Article update error:", error);
    return errorResponse("Haber güncellenemedi");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const p = validateParams(params, CuidParamsSchema);
    if (!p.success) return p.response;

    const existing = await prisma.article.findUnique({ where: { id: p.data.id } });
    if (!existing) return notFoundResponse("Haber");

    await prisma.article.delete({ where: { id: p.data.id } });
    return NextResponse.json({ success: true, message: "Haber silindi" });
  } catch (error) {
    log.error("Article delete error:", error);
    return errorResponse("Haber silinemedi");
  }
}
