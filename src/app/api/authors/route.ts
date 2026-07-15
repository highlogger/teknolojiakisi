import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import {
  AuthorCreateSchema,
  validateBody,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/validation";

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      orderBy: { name: "asc" },
      include: { articles: { select: { id: true } } },
    });
    const data = authors.map((a) => ({
      ...a,
      articleCount: a.articles.length,
      articles: undefined,
    }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Authors get error:", error);
    return errorResponse("Yazarlar yuklenemedi");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const bodyResult = await validateBody(req, AuthorCreateSchema);
    if (!bodyResult.success) return bodyResult.response;

    const author = await prisma.author.create({
      data: {
        name: bodyResult.data.name,
        slug: slugify(bodyResult.data.name),
        avatar: bodyResult.data.avatar ?? null,
        bio: bodyResult.data.bio ?? null,
        isBot: bodyResult.data.isBot,
        specialty: bodyResult.data.specialty ?? null,
        email: bodyResult.data.email ?? null,
      },
    });

    return NextResponse.json({ data: author }, { status: 201 });
  } catch (error) {
    console.error("Author create error:", error);
    return errorResponse("Yazar olusturulamadi");
  }
}
