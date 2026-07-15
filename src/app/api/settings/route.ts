import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  SettingsUpdateSchema,
  validateBody,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/validation";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    return NextResponse.json({ data: settingsMap });
  } catch (error) {
    console.error("Settings get error:", error);
    return errorResponse("Ayarlar yüklenemedi");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse();

    const bodyResult = await validateBody(req, SettingsUpdateSchema);
    if (!bodyResult.success) return bodyResult.response;

    const updates: Promise<unknown>[] = [];
    for (const [key, value] of Object.entries(bodyResult.data)) {
      updates.push(
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: "Ayarlar güncellendi" });
  } catch (error) {
    console.error("Settings update error:", error);
    return errorResponse("Ayarlar güncellenemedi");
  }
}
