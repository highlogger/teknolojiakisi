/**
 * Source Intelligence — Validator
 */
import prisma from "@/lib/db";
import type { SourceValidation, SourceValidationError } from "./types";

export function validateSource(params: {
  name?: string; slug?: string; website?: string; rssUrl?: string | null;
}): SourceValidation {
  const errors: SourceValidationError[] = [];
  const warnings: string[] = [];

  if (!params.name || params.name.trim().length < 2)
    errors.push({ field: "name", message: "Kaynak adı en az 2 karakter olmalı.", severity: "error" });
  if (!params.website)
    errors.push({ field: "website", message: "Website URL'si zorunlu.", severity: "error" });
  else if (!/^https?:\/\/.+/.test(params.website))
    errors.push({ field: "website", message: "Geçersiz website URL formatı.", severity: "error" });
  if (params.rssUrl && !/^https?:\/\/.+/.test(params.rssUrl))
    errors.push({ field: "rssUrl", message: "Geçersiz RSS URL formatı.", severity: "error" });
  if (!params.rssUrl)
    warnings.push("RSS feed URL'si yok. Otomatik haber çekimi yapılamaz.");
  if (!params.slug || params.slug.trim().length < 2)
    warnings.push("Slug otomatik oluşturulacak.");

  return { valid: errors.length === 0, errors, warnings };
}

export async function checkDuplicateSourceSlug(slug: string): Promise<boolean> {
  try {
    const exists = await prisma.source.findFirst({ where: { name: { contains: slug } } });
    return !!exists;
  } catch { return false; }
}

export function checkBrokenUrl(url: string): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return { valid: false, reason: `Geçersiz protokol: ${parsed.protocol}` };
    return { valid: true };
  } catch { return { valid: false, reason: "URL parse edilemedi." }; }
}

export function validateSourceForGoogleNews(source: {
  active: boolean; articleCount: number; rssUrl: string | null; lastFetchedAt: string | null;
}): { compliant: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!source.active) issues.push("Kaynak aktif değil.");
  if (source.articleCount < 3) issues.push("En az 3 haber yayınlanmış olmalı.");
  if (!source.rssUrl) issues.push("RSS feed yok.");
  if (!source.lastFetchedAt) issues.push("Henüz hiç crawl yapılmamış.");
  return { compliant: issues.length === 0, issues };
}
