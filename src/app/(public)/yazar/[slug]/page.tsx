import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { timeAgo, getPagination } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { Metadata } from "next";
import {
  generatePersonLd,
  generateBreadcrumbLd,
  pageMetadata,
  JsonLd,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 300;

async function getAuthor(slug: string) {
  try {
    const author = await prisma.author.findUnique({
      where: { slug },
    });
    return author;
  } catch {
    return null;
  }
}

async function getAuthorArticles(authorId: string, page: number) {
  try {
    const { skip, take } = getPagination(page, DEFAULT_PAGE_SIZE);

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          status: "published",
          authorId,
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
          authorId,
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
  const author = await getAuthor(params.slug);
  if (!author) return { title: "Yazar Bulunamadı" };

  return pageMetadata(
    `${author.name} - Yazar`,
    author.bio || `${author.name} yazarının teknoloji haberleri ve yazıları.`,
    `/yazar/${author.slug}`,
    author.avatar || undefined
  );
}

export default async function AuthorPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { sayfa?: string };
}) {
  const author = await getAuthor(params.slug);

  if (!author) {
    notFound();
  }

  const currentPage = Math.max(1, parseInt(searchParams.sayfa || "1", 10) || 1);
  const { articles, total } = await getAuthorArticles(author.id, currentPage);
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  return (
    <div className="container-custom py-8">
      {/* JSON-LD Structured Data */}
      <JsonLd data={generatePersonLd({
        name: author.name,
        slug: author.slug,
        bio: author.bio,
        avatar: author.avatar,
        articleCount: total,
      }) as unknown as Record<string, unknown>} />
      <JsonLd data={generateBreadcrumbLd([
        { name: "Yazarlar", url: `${SITE_URL}/yazarlar` },
        { name: author.name, url: `${SITE_URL}/yazar/${author.slug}` },
      ]) as unknown as Record<string, unknown>} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Ana Sayfa
        </Link>
        <span>/</span>
        <span className="text-gray-400">Yazarlar</span>
        <span>/</span>
        <span className="text-gray-400">{author.name}</span>
      </nav>

      {/* Yazar Profili */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="text-white font-bold text-3xl">
                {author.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Bilgiler */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {author.name}
              </h1>
              {author.isBot && (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full">
                  AI Bot
                </span>
              )}
            </div>

            {author.specialty && (
              <p className="text-sm font-medium text-blue-600 mb-2">
                {author.specialty}
              </p>
            )}

            {author.bio && (
              <p className="text-gray-600 text-sm sm:text-base max-w-xl">
                {author.bio}
              </p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                {total} haber
              </span>
              {author.isBot && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Yapay Zeka Destekli
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Haberler Başlık */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-600 rounded-full" />
        {author.name} tarafından yazılan haberler
      </h2>

      {/* Haber Listesi */}
      {articles.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Henüz haber yok
          </h3>
          <p className="text-gray-500">
            Bu yazara ait henüz yayınlanmış bir haber bulunmuyor.
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
                  href={`/yazar/${author.slug}?sayfa=${currentPage - 1}`}
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
                    href={`/yazar/${author.slug}?sayfa=${pageNum}`}
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
                  href={`/yazar/${author.slug}?sayfa=${currentPage + 1}`}
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
