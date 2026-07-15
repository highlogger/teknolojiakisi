import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import {
  CategoryCreateSchema,
  validateBody,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/validation";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("Categories get error:", error);
    return errorResponse("Kategoriler yuklenemedi");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const bodyResult = await validateBody(req, CategoryCreateSchema);
    if (!bodyResult.success) return bodyResult.response;

    const category = await prisma.category.create({
      data: {
        name: bodyResult.data.name,
        slug: slugify(bodyResult.data.name),
        description: bodyResult.data.description ?? null,
        color: bodyResult.data.color,
        sortOrder: bodyResult.data.sortOrder,
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("Category create error:", error);
    return errorResponse("Kategori olusturulamadi");
  }
}
