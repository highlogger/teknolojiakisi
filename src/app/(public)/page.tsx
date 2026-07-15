import Link from "next/link";
import prisma from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import AdBanner from "@/components/news/AdBanner";
import { generateBreadcrumbLd, JsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 300;

async function getHomeData() {
  try {
    const [featured, latest, popular] = await Promise.all([
      prisma.article.findMany({
        where: { status: "published", isFeatured: true },
        include: { category: true, author: true },
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),
      prisma.article.findMany({
        where: { status: "published" },
        include: { category: true, author: true },
        orderBy: { publishedAt: "desc" },
        take: 18,
      }),
      prisma.article.findMany({
        where: { status: "published" },
        include: { category: true },
        orderBy: { viewCount: "desc" },
        take: 6,
      }),
    ]);
    return { featured, latest, popular };
  } catch {
    return { featured: [], latest: [], popular: [] };
  }
}

export default async function HomePage() {
  const { featured, latest, popular } = await getHomeData();

  if (latest.length === 0) {
    return (
      <div className="container-custom py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
          <span className="text-white font-bold text-3xl">TA</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
          TeknolojiAkışı&apos;na Hoş Geldiniz
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Güncel teknoloji haberleri, yapay zeka rehberleri ve daha fazlası çok yakında burada.
        </p>
      </div>
    );
  }

  const heroArticle = featured[0] || latest[0];
  const subFeatured = featured.slice(1, 3);

  return (
    <div className="container-custom py-4 sm:py-8">
      {/* JSON-LD Breadcrumb */}
      <JsonLd data={generateBreadcrumbLd([]) as unknown as Record<string, unknown>} />
      {/* === HERO SECTION === */}
      <section className="mb-6 sm:mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Ana Hero */}
          <Link
            href={`/haber/${heroArticle.slug}`}
            className="lg:col-span-2 group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[400px] flex flex-col justify-end p-4 sm:p-8 hover:shadow-2xl transition-all duration-300"
          >
            {heroArticle.featuredImage && (
              <img
                src={heroArticle.featuredImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
            <div className="relative z-10">
              {heroArticle.category && (
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full text-white mb-3" style={{ backgroundColor: heroArticle.category.color }}>
                  {heroArticle.category.name}
                </span>
              )}
              <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-tight mb-2 line-clamp-3">
                {heroArticle.title}
              </h2>
              <p className="text-gray-300 text-sm line-clamp-2 hidden sm:block">
                {heroArticle.excerpt}
              </p>
              <div className="flex items-center gap-3 mt-3 text-gray-400 text-xs sm:text-sm">
                {heroArticle.author && <span>{heroArticle.author.name}</span>}
                {heroArticle.publishedAt && (
                  <>
                    <span>•</span>
                    <span>{timeAgo(heroArticle.publishedAt)}</span>
                  </>
                )}
              </div>
            </div>
          </Link>

          {/* Yan Hero Kartlar */}
          <div className="flex sm:flex-col gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible">
            {subFeatured.map((article) => (
              <Link
                key={article.id}
                href={`/haber/${article.slug}`}
                className="group relative bg-gray-900 rounded-2xl overflow-hidden min-w-[200px] sm:min-w-0 flex-1 sm:h-[194px] flex flex-col justify-end p-4 hover:shadow-xl transition-all"
              >
                {article.featuredImage && (
                  <img src={article.featuredImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-gray-900/30" />
                <div className="relative z-10">
                  {article.category && (
                    <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full text-white mb-2" style={{ backgroundColor: article.category.color }}>
                      {article.category.name}
                    </span>
                  )}
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-3">
                    {article.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === ANA İÇERİK === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Haber Grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full" />
              Son Haberler
            </h2>
            <Link href="/kategori/genel" className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium">
              Tümünü Gör →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {latest.slice(0, 12).map((article, i) => (
              <Link
                key={article.id}
                href={`/haber/${article.slug}`}
                className={`group bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 animate-fade-in ${
                  i === 0 ? "col-span-2 xl:col-span-3" : ""
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`${i === 0 ? "flex flex-col sm:flex-row" : ""}`}>
                  {i === 0 && article.featuredImage && (
                    <div className="sm:w-2/5 shrink-0">
                      <img src={article.featuredImage} alt={article.title} className="w-full h-48 sm:h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  {i !== 0 && article.featuredImage && (
                    <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                      <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className={`p-3 sm:p-5 ${i === 0 ? "sm:flex-1" : ""}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {article.category && (
                        <span className="px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full text-white" style={{ backgroundColor: article.category.color }}>
                          {article.category.name}
                        </span>
                      )}
                      <span className="text-[10px] sm:text-xs text-gray-400">{article.publishedAt && timeAgo(article.publishedAt)}</span>
                    </div>
                    <h3 className={`font-semibold sm:font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 sm:line-clamp-3 ${i === 0 ? "text-base sm:text-xl" : "text-sm sm:text-base"}`}>
                      {article.title}
                    </h3>
                    {i === 0 && article.excerpt && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2 hidden sm:block">{article.excerpt}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Daha Fazla Yükle */}
          {latest.length > 12 && (
            <div className="text-center mt-8">
              <Link
                href="/kategori/genel"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors"
              >
                Daha Fazla Haber Yükle
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* === SIDEBAR === */}
        <aside className="space-y-4 sm:space-y-6">
          {/* Reklam */}
          <div className="hidden lg:block">
            <AdBanner position="sidebar" />
          </div>

          {/* Popüler Haberler */}
          <div className="bg-gray-50/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Popüler
            </h3>
            <div className="space-y-3">
              {popular.map((article, index) => (
                <Link key={article.id} href={`/haber/${article.slug}`} className="flex gap-3 group">
                  <span className="text-xl sm:text-2xl font-extrabold text-gray-200 group-hover:text-blue-400 transition-colors leading-none shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {article.category && (
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: article.category.color }} />
                      )}
                      <span className="text-[11px] text-gray-400">{article.publishedAt && timeAgo(article.publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Son Haberler */}
          <div className="bg-gray-50/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Son Dakika
            </h3>
            <div className="space-y-2.5">
              {latest.slice(0, 8).map((article) => (
                <Link key={article.id} href={`/haber/${article.slug}`} className="flex gap-2 group">
                  <span className="text-[10px] sm:text-xs text-gray-400 mt-0.5 shrink-0 tabular-nums">
                    {article.publishedAt && new Date(article.publishedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobil Reklam */}
          <div className="lg:hidden">
            <AdBanner position="sidebar" />
          </div>

          {/* Kategoriler */}
          <div className="bg-gray-50/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">Kategoriler</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {latest.map((a) => a.category).filter((c, i, arr) => c && arr.findIndex((x) => x?.id === c.id) === i).slice(0, 12).map((cat) =>
                cat ? (
                  <Link key={cat.id} href={`/kategori/${cat.slug}`}
                    className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-full text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: cat.color }}>
                    {cat.name}
                  </Link>
                ) : null
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
