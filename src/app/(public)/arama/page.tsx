import Link from "next/link";
import prisma from "@/lib/db";
import { timeAgo } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { Metadata } from "next";
import {
  generateSearchResultsPageLd,
  generateBreadcrumbLd,
  pageMetadata,
  JsonLd,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 300;

async function searchArticles(query: string, page: number) {
  try {
    const skip = (page - 1) * DEFAULT_PAGE_SIZE;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          status: "published",
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
            { excerpt: { contains: query } },
          ],
        },
        include: {
          category: true,
          author: true,
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: DEFAULT_PAGE_SIZE,
      }),
      prisma.article.count({
        where: {
          status: "published",
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
            { excerpt: { contains: query } },
          ],
        },
      }),
    ]);

    return { articles, total };
  } catch {
    return { articles: [], total: 0 };
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  const query = searchParams.q || "";
  if (query) {
    return pageMetadata(
      `"${query}" arama sonuçları`,
      `${query} ile ilgili en güncel teknoloji haberleri ve gelişmeler.`,
      `/arama?q=${encodeURIComponent(query)}`
    );
  }
  return pageMetadata(
    "Arama",
    "TeknolojiAkışı'nda teknoloji haberleri arasında arama yapın.",
    "/arama"
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  const { articles, total } = query
    ? await searchArticles(query, 1)
    : { articles: [], total: 0 };

  return (
    <div className="container-custom py-8">
      {/* JSON-LD Structured Data */}
      {query && (
        <JsonLd data={generateSearchResultsPageLd(query, total) as unknown as Record<string, unknown>} />
      )}
      <JsonLd data={generateBreadcrumbLd([
        { name: "Arama", url: `${SITE_URL}/arama` },
      ]) as unknown as Record<string, unknown>} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Ana Sayfa
        </Link>
        <span>/</span>
        <span className="text-gray-400">Arama</span>
      </nav>

      {/* Arama Başlık */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">
        Arama
      </h1>

      {/* Arama Kutusu */}
      <form action="/arama" method="GET" className="mb-8">
        <div className="relative max-w-2xl">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Haberlerde ara..."
            className="w-full pl-12 pr-4 py-3.5 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ara
          </button>
        </div>
      </form>

      {/* Sonuçlar */}
      {query && (
        <div className="mb-6">
          {total > 0 ? (
            <p className="text-sm text-gray-500">
              <strong className="text-gray-900">{total}</strong> sonuç bulundu{" "}
              <strong className="text-gray-900">&quot;{query}&quot;</strong> için
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              <strong className="text-gray-900">&quot;{query}&quot;</strong> için sonuç bulunamadı
            </p>
          )}
        </div>
      )}

      {/* Arama Yapılmamış */}
      {!query && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ne aramıştınız?
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Yukarıdaki arama kutusuna bir kelime yazarak teknoloji haberleri arasında arama yapabilirsiniz.
          </p>
        </div>
      )}

      {/* Sonuç Yok */}
      {query && total === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sonuç bulunamadı
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Aramanızla eşleşen bir haber bulamadık. Farklı anahtar kelimelerle tekrar deneyebilirsiniz.
          </p>
        </div>
      )}

      {/* Sonuç Listesi */}
      {articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/haber/${article.slug}`}
              className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:border-blue-200"
            >
              {article.featuredImage && (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {article.category && (
                    <span
                      className="inline-block px-2 py-0.5 text-xs font-medium rounded-full text-white"
                      style={{ backgroundColor: article.category.color }}
                    >
                      {article.category.name}
                    </span>
                  )}
                  {article.publishedAt && (
                    <span className="text-xs text-gray-400">
                      {timeAgo(article.publishedAt)}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>
                )}
                {article.author && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">
                        {article.author.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {article.author.name}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
