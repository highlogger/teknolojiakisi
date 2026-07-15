/**
 * Google News Sitemap
 * /news-sitemap.xml
 *
 * Sadece son 48 saat içinde yayınlanan haberler.
 */

import prisma from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { PUBLISHER } from "@/services/publisher/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const articles = await prisma.article.findMany({
    where: {
      status: "published",
      publishedAt: { gte: cutoff },
    },
    select: {
      title: true,
      slug: true,
      publishedAt: true,
      language: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 1000,
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles
  .map(
    (a) => `  <url>
    <loc>${SITE_URL}/haber/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${PUBLISHER.name}</news:name>
        <news:language>${a.language || "tr"}</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt?.toISOString() || ""}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=1800",
    },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
