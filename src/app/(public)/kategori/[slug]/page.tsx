import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { timeAgo, getPagination } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { Metadata } from "next";
import {
  generateCollectionPageLd,
  generateBreadcrumbLd,
  pageMetadata,
  JsonLd,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 300;

async function getCategory(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
    });
    return category;
  } catch {
    return null;
  }
}

async function getArticles(categoryId: string, page: number) {
  try {
    const { skip, take } = getPagination(page, DEFAULT_PAGE_SIZE);

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          status: "published",
          categoryId,
        },
        include: {
          category: true,
          author: true,
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take,
      }),
      prisma.article.count({
        where: {
          status: "published",
          categoryId,
        },
      }),
    ]);

    return { articles, total };
  } catch {
    return { articles: [], total: 0 };
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategory(params.slug);
  if (!category) return { title: "Kategori Bulunamadı" };

  return pageMetadata(
    `${category.name} Haberleri`,
    category.description || `${category.name} kategorisindeki en güncel teknoloji haberleri ve gelişmeler.`,
    `/kategori/${category.slug}`
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { sayfa?: string };
}) {
  const category = await getCategory(params.slug);

  if (!category) {
    notFound();
  }

  const currentPage = Math.max(1, parseInt(searchParams.sayfa || "1", 10) || 1);
  const { articles, total } = await getArticles(category.id, currentPage);
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  return (
    <div className="container-custom py-8">
      {/* JSON-LD Structured Data */}
      <JsonLd data={generateCollectionPageLd({
        name: `${category.name} Haberleri`,
        url: `${SITE_URL}/kategori/${category.slug}`,
        description: category.description || `${category.name} kategorisindeki en güncel teknoloji haberleri`,
        itemCount: total,
      }) as unknown as Record<string, unknown>} />
      <JsonLd data={generateBreadcrumbLd([
        { name: category.name, url: `${SITE_URL}/kategori/${category.slug}` },
      ]) as unknown as Record<string, unknown>} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Ana Sayfa
        </Link>
        <span>/</span>
        <span className="text-gray-400">{category.name}</span>
      </nav>

      {/* Kategori Başlık */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: category.color }}
          />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            {category.name}
          </h1>
        </div>
        {category.description && (
          <p className="text-gray-600 mt-2 max-w-2xl">{category.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          {total} haber bulundu
        </p>
      </div>

      {/* Haber Listesi */}
      {articles.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bu kategoride henüz haber yok
          </h2>
          <p className="text-gray-500">
            Henüz bu kategoriye ait haber bulunmuyor. Kısa süre içinde haberler eklenecektir.
          </p>
        </div>
      ) : (
        <>
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

          {/* Sayfalama */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Sayfalama">
              {currentPage > 1 && (
                <Link
                  href={`/kategori/${category.slug}?sayfa=${currentPage - 1}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Önceki
                  </span>
                </Link>
              )}

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <Link
                    key={pageNum}
                    href={`/kategori/${category.slug}?sayfa=${pageNum}`}
                    className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-blue-300"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              {currentPage < totalPages && (
                <Link
                  href={`/kategori/${category.slug}?sayfa=${currentPage + 1}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    Sonraki
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
