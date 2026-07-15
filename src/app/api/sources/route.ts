import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  SourceCreateSchema,
  validateBody,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/validation";

export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: { priority: "desc" },
    });
    return NextResponse.json({ data: sources });
  } catch (error) {
    console.error("Sources get error:", error);
    return errorResponse("Kaynaklar yuklenemedi");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const bodyResult = await validateBody(req, SourceCreateSchema);
    if (!bodyResult.success) return bodyResult.response;

    const source = await prisma.source.create({
      data: {
        name: bodyResult.data.name,
        url: bodyResult.data.url,
        type: bodyResult.data.type,
        feedUrl: bodyResult.data.feedUrl ?? null,
        language: bodyResult.data.language,
        categoryId: bodyResult.data.categoryId ?? null,
        isActive: bodyResult.data.isActive,
        priority: bodyResult.data.priority,
        fetchIntervalMin: bodyResult.data.fetchIntervalMin,
        selectorTitle: bodyResult.data.selectorTitle ?? null,
        selectorContent: bodyResult.data.selectorContent ?? null,
        selectorImage: bodyResult.data.selectorImage ?? null,
        selectorLink: bodyResult.data.selectorLink ?? null,
      },
    });

    return NextResponse.json({ data: source }, { status: 201 });
  } catch (error) {
    console.error("Source create error:", error);
    return errorResponse("Kaynak olusturulamadi");
  }
}
