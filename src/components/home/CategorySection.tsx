import Link from "next/link";
import prisma from "@/lib/db";

export async function CategorySection({ categorySlug, title, limit = 6 }: { categorySlug: string; title: string; limit?: number }) {
  const articles = await prisma.article.findMany({
    where: { status: "published", category: { slug: categorySlug } },
    select: { id: true, title: true, slug: true, featuredImage: true, publishedAt: true, category: { select: { name: true, color: true } } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  if (articles.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <Link href={`/kategori/${categorySlug}`} className="text-sm text-blue-600 hover:underline">Tümü →</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((a) => (
          <Link key={a.id} href={`/haber/${a.slug}`} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {a.featuredImage && <img src={a.featuredImage} alt="" className="w-full h-40 object-cover" loading="lazy" />}
            <div className="p-4">
              {a.category && <span className="text-[10px] px-1.5 py-0.5 rounded-full mb-1 inline-block" style={{ backgroundColor: a.category.color + "20", color: a.category.color }}>{a.category.name}</span>}
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mt-1">{a.title}</h3>
              <span className="text-xs text-gray-400 mt-2 block">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("tr-TR") : ""}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
