import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import {
  TagCreateSchema,
  validateBody,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/validation";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { articles: { select: { articleId: true } } },
    });
    const data = tags.map((t) => ({
      ...t,
      articleCount: t.articles.length,
      articles: undefined,
    }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Tags get error:", error);
    return errorResponse("Etiketler yuklenemedi");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const bodyResult = await validateBody(req, TagCreateSchema);
    if (!bodyResult.success) return bodyResult.response;

    const tag = await prisma.tag.create({
      data: { name: bodyResult.data.name, slug: slugify(bodyResult.data.name) },
    });
    return NextResponse.json({ data: tag }, { status: 201 });
  } catch (error) {
    console.error("Tag create error:", error);
    return errorResponse("Etiket olusturulamadi");
  }
}
