import Link from "next/link";
import prisma from "@/lib/db";

export async function LatestNews({ limit = 12 }: { limit?: number }) {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true, category: { select: { name: true, color: true } }, author: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">📰 En Son Haberler</h2>
      <div className="space-y-3">
        {articles.slice(0, 6).map((a, i) => (
          <Link key={a.id} href={`/haber/${a.slug}`} className={`flex gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow ${i === 0 ? "lg:flex" : ""}`}>
            <div className="flex-1 min-w-0">
              {a.category && <span className="text-[10px] px-1.5 py-0.5 rounded-full mb-1 inline-block" style={{ backgroundColor: a.category.color + "20", color: a.category.color }}>{a.category.name}</span>}
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{a.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{a.excerpt}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <span>{a.author?.name}</span>
                <span>·</span>
                <span>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("tr-TR") : ""}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
