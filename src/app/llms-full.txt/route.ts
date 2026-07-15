/**
 * llms-full.txt — AI araçları için son 50 haberin tam listesi
 * URL: /llms-full.txt
 */
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      category: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  const lines = [
    `# ${SITE_NAME} — Tam Haber Listesi`,
    "",
    `Son güncelleme: ${new Date().toISOString()}`,
    "",
    "## Son 50 Haber",
    "",
    ...articles.map((a, i) => {
      const date = a.publishedAt
        ? new Date(a.publishedAt).toLocaleDateString("tr-TR")
        : "";
      const cat = a.category ? `[${a.category.name}]` : "";
      return [
        `### ${i + 1}. ${a.title}`,
        `${cat} ${date}`,
        a.excerpt || "",
        `Link: ${SITE_URL}/haber/${a.slug}`,
        "",
      ].join("\n");
    }),
    "",
    `© ${new Date().getFullYear()} ${SITE_NAME}`,
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
