import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runBot } from "@/services/bot/index";
import { unauthorizedResponse, errorResponse } from "@/lib/validation";
import { apiLogger as log } from "@/lib/logger";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    // Bot'u asenkron başlat (uzun surebilir)
    const results = await runBot();

    const totalGenerated = results.reduce((s, r) => s + r.articlesGenerated, 0);
    const totalPublished = results.reduce((s, r) => s + r.articlesPublished, 0);
    const errors = results.filter((r) => r.status === "error");

    return NextResponse.json({
      success: true,
      message: `Bot tamamlandı: ${totalGenerated} haber uretildi, ${totalPublished} yayınlandı`,
      data: {
        totalSources: results.length,
        totalGenerated,
        totalPublished,
        errors: errors.length,
        results,
      },
    });
  } catch (error) {
    log.error("Bot trigger failed", error as Error);
    return errorResponse(
      `Bot calistirma hatası: ${(error as Error).message}`
    );
  }
}
