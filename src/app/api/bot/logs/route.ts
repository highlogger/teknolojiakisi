import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  BotLogQuerySchema,
  validateQuery,
  paginatedResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);

    const query = validateQuery(searchParams, BotLogQuerySchema);
    if (!query.success) return query.response;

    const { page, pageSize } = query.data;

    const [logs, total] = await Promise.all([
      prisma.botLog.findMany({
        include: { source: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.botLog.count(),
    ]);

    return paginatedResponse(logs, total, page, pageSize);
  } catch (error) {
    console.error("Bot logs error:", error);
    return errorResponse("Loglar yuklenemedi");
  }
}
