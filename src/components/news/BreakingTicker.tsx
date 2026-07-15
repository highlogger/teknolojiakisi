import Link from "next/link";
import prisma from "@/lib/db";

export const revalidate = 120;

async function getLatestNews() {
  try {
    return await prisma.article.findMany({
      where: { status: "published" },
      select: { id: true, title: true, slug: true, category: { select: { name: true, color: true } } },
      orderBy: { publishedAt: "desc" },
      take: 10,
    });
  } catch {
    return [];
  }
}

export default async function BreakingTicker() {
  const news = await getLatestNews();
  if (news.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-b border-gray-700">
      <div className="container-custom flex items-center h-10 gap-3 overflow-hidden">
        {/* Son Dakika Etiketi */}
        <div className="shrink-0 flex items-center gap-1.5 pr-3 border-r border-gray-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
            Son Dakika
          </span>
        </div>

        {/* Kayan Haberler */}
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee flex gap-8 whitespace-nowrap hover:[animation-play-state:paused]">
            {[...news, ...news].map((item, i) => (
              <Link
                key={`${item.id}-${i}`}
                href={`/haber/${item.slug}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
              >
                {item.category && (
                  <span
                    className="px-1.5 py-0.5 text-[10px] rounded font-medium shrink-0"
                    style={{ backgroundColor: item.category.color }}
                  >
                    {item.category.name}
                  </span>
                )}
                <span className="truncate max-w-[400px]">{item.title}</span>
                <span className="text-gray-600 mx-1">|</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
