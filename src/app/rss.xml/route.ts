/**
 * RSS Feed — Google News ve RSS okuyucular için
 * /rss.xml
 */

import prisma from "@/lib/db";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { PUBLISHER } from "@/services/publisher/config";

export const dynamic = "force-dynamic";
export const revalidate = 1800; // 30 dakika

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      featuredImage: true,
      publishedAt: true,
      language: true,
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const items = articles
    .map(
      (a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${SITE_URL}/haber/${a.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/haber/${a.slug}</guid>
      <description>${escapeXml(a.excerpt || "")}</description>
      <pubDate>${a.publishedAt ? new Date(a.publishedAt).toUTCString() : ""}</pubDate>
      <category>${a.category?.name || "Technology"}</category>
      <author>${a.author?.name || PUBLISHER.name}</author>
      <source url="${SITE_URL}">${PUBLISHER.name}</source>
      ${a.featuredImage ? `<enclosure url="${escapeXml(a.featuredImage)}" type="image/jpeg" />` : ""}
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>tr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>TeknolojiAkışı RSS Engine v1</generator>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${PUBLISHER.logo.url}</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=1800",
    },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
