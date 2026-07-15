import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scout } from "@/services/agents/scout";
import { unauthorizedResponse, errorResponse } from "@/lib/validation";
import { apiLogger as log } from "@/lib/logger";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const result = await scout();

    return NextResponse.json({
      success: true,
      message: `Scout tamamlandi: ${result.articlesFound} bulundu, ${result.articlesQueued} queue'ya eklendi`,
      data: {
        sourcesChecked: result.sourcesChecked,
        articlesFound: result.articlesFound,
        articlesQueued: result.articlesQueued,
        skipped: result.articlesSkipped,
        queue: result.queue.slice(0, 10),
        errors: result.errors,
      },
    });
  } catch (error) {
    log.error("Scout trigger failed", error as Error);
    return errorResponse(`Scout hatasi: ${(error as Error).message}`);
  }
}
