import Link from "next/link";
import prisma from "@/lib/db";

export async function Hero() {
  const featured = await prisma.article.findMany({
    where: { status: "published", isFeatured: true },
    select: { id: true, title: true, slug: true, excerpt: true, featuredImage: true, category: { select: { name: true, color: true } } },
    orderBy: { publishedAt: "desc" },
    take: 5,
  });

  if (featured.length === 0) return null;
  const [main, ...sub] = featured;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      {/* Ana haber */}
      <Link href={`/haber/${main.slug}`} className="relative group rounded-2xl overflow-hidden bg-gray-900 min-h-[400px] flex items-end">
        {main.featuredImage && <img src={main.featuredImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity" />}
        <div className="relative p-6 text-white">
          {main.category && <span className="text-xs px-2 py-0.5 rounded-full mb-2 inline-block" style={{ backgroundColor: main.category.color }}>{main.category.name}</span>}
          <h2 className="text-2xl font-bold leading-tight">{main.title}</h2>
          <p className="text-sm text-gray-300 mt-2 line-clamp-2">{main.excerpt}</p>
        </div>
      </Link>

      {/* Yan haberler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sub.map((a) => (
          <Link key={a.id} href={`/haber/${a.slug}`} className="relative group rounded-2xl overflow-hidden bg-gray-800 min-h-[190px] flex items-end">
            {a.featuredImage && <img src={a.featuredImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity" />}
            <div className="relative p-4 text-white">
              {a.category && <span className="text-[10px] px-1.5 py-0.5 rounded-full mb-1 inline-block" style={{ backgroundColor: a.category.color }}>{a.category.name}</span>}
              <h3 className="text-sm font-bold leading-snug line-clamp-2">{a.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
