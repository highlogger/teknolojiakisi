import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { apiLogger as log } from "@/lib/logger";
import {
  SearchQuerySchema,
  validateQuery,
  paginatedResponse,
  errorResponse,
} from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = validateQuery(searchParams, SearchQuerySchema);
    if (!query.success) return query.response;

    const { q, page, pageSize } = query.data;

    if (!q || q.length < 2) {
      return paginatedResponse([], 0, 1, pageSize);
    }

    const where = {
      status: "published" as const,
      OR: [
        { title: { contains: q } },
        { content: { contains: q } },
        { excerpt: { contains: q } },
      ],
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true, color: true } },
          author: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    return paginatedResponse(articles, total, page, pageSize);
  } catch (error) {
    log.error("Search query failed", error as Error, { query: undefined });
    return errorResponse("Arama yapılamadı");
  }
}
