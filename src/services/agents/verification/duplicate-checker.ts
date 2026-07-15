/**
 * Verification Agent — Duplicate Checker
 *
 * İçerik benzerliği kontrolü:
 * - Bu olay daha önce işlendi mi?
 * - Sitede benzer haber var mı?
 * - Başka URL altında aynı haber var mı?
 * - Eski haber tekrar mı yayınlanıyor?
 */

import prisma from "@/lib/db";
import type { DuplicateCheckResult, ResearchInput } from "./types";
import { DUPLICATE_THRESHOLDS } from "./constants";

/**
 * Araştırma konusunun daha önce işlenip işlenmediğini kontrol et
 */
export async function checkDuplicates(
  research: ResearchInput
): Promise<DuplicateCheckResult> {
  const warnings: string[] = [];
  const similarArticles: DuplicateCheckResult["similarArticles"] = [];

  // Araştırmadaki anahtar kelimeleri çıkar
  const keywords = extractKeywords(research);

  if (keywords.length === 0) {
    return {
      isDuplicate: false,
      similarArticles: [],
      isRehashed: false,
      details: "Karşılaştırma için yeterli anahtar kelime bulunamadı.",
    };
  }

  // Veritabanında benzer makaleleri ara
  try {
    for (const keyword of keywords.slice(0, 5)) {
      const existing = await prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: keyword } },
            { excerpt: { contains: keyword } },
            { originalTitle: { contains: keyword } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          publishedAt: true,
        },
        take: DUPLICATE_THRESHOLDS.maxSimilarArticlesToCheck,
        orderBy: { publishedAt: "desc" },
      });

      for (const article of existing) {
        // Zaten eklenmemişse ekle
        if (!similarArticles.find((a) => a.id === article.id)) {
          // Basit benzerlik skoru (title overlap)
          const similarityScore = calculateSimpleSimilarity(
            research.findings.map((f) => f.content).join(" "),
            article.title
          );

          if (
            similarityScore >= DUPLICATE_THRESHOLDS.mediumSimilarity
          ) {
            similarArticles.push({
              id: article.id,
              title: article.title,
              slug: article.slug,
              similarityScore,
              publishedAt: article.publishedAt?.toISOString() || null,
            });
          }
        }
      }
    }
  } catch (error) {
    // Prisma hatası — veritabanı yoksa bile çalışır
    warnings.push(
      `Veritabanı sorgusu başarısız: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`
    );
  }

  // Benzerlik skoruna göre sırala
  similarArticles.sort(
    (a, b) => b.similarityScore - a.similarityScore
  );

  const hasHighSimilarity = similarArticles.some(
    (a) => a.similarityScore >= DUPLICATE_THRESHOLDS.highSimilarity
  );

  const isDuplicate = hasHighSimilarity;
  const isRehashed = similarArticles.length > 0 && !hasHighSimilarity;

  if (isDuplicate) {
    const top = similarArticles[0];
    warnings.push(
      `Bu haber daha önce işlenmiş olabilir: "${top.title}" (benzerlik: ${Math.round(top.similarityScore * 100)}%).`
    );
  }

  return {
    isDuplicate,
    similarArticles: similarArticles.slice(0, 5),
    isRehashed,
    details: isDuplicate
      ? `Yüksek benzerlik tespit edildi (${Math.round(similarArticles[0].similarityScore * 100)}%). Bu içerik zaten mevcut.`
      : isRehashed
        ? `${similarArticles.length} benzer makale bulundu, ancak yüksek eşleşme yok.`
        : "Duplicate tespit edilmedi.",
  };
}

/**
 * Araştırma metninden anahtar kelimeler çıkar
 */
function extractKeywords(research: ResearchInput): string[] {
  const keywords: string[] = [];

  // Entity'lerden
  if (research.entities) {
    keywords.push(
      ...(research.entities.companies || []).slice(0, 3),
      ...(research.entities.products || []).slice(0, 3),
      ...(research.entities.technologies || []).slice(0, 3)
    );
  }

  // İlk finding'ten önemli kelimeler
  if (research.findings.length > 0) {
    const firstContent = research.findings[0].content;
    // 4+ karakterli kelimeleri al
    const words = firstContent
      .replace(/<[^>]*>/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 5);
    keywords.push(...words);
  }

  // Kaynak başlığından
  if (research.source?.name) {
    keywords.push(research.source.name);
  }

  return [...new Set(keywords.filter(Boolean))];
}

/**
 * Basit Jaccard benzerliği (kelime bazlı)
 */
function calculateSimpleSimilarity(text: string, title: string): number {
  const textWords = new Set(
    text
      .toLowerCase()
      .replace(/<[^>]*>/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
  const titleWords = new Set(
    title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

  if (titleWords.size === 0) return 0;

  let intersection = 0;
  for (const word of titleWords) {
    if (textWords.has(word)) intersection++;
  }

  return intersection / titleWords.size;
}
