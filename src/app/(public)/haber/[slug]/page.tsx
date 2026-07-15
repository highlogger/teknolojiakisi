import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { formatDate, timeAgo } from "@/lib/utils";
import type { Metadata } from "next";
import {
  generateNewsArticleLd,
  generateBreadcrumbLd,
  articleMetadata,
  JsonLd,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 300;

async function getArticle(slug: string) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } },
      },
    });
    return article;
  } catch {
    return null;
  }
}

async function getRelatedArticles(
  categoryId: string | null,
  excludeId: string
) {
  try {
    return await prisma.article.findMany({
      where: {
        status: "published",
        categoryId: categoryId || undefined,
        id: { not: excludeId },
      },
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: "Haber Bulunamadı" };

  return articleMetadata(article);
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const isDraft = article.status !== "published";

  const related = await getRelatedArticles(article.categoryId, article.id);

  // Görüntülenme sayısını artır (fire-and-forget)
  prisma.article
    .update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  return (
    <article className="container-custom py-8">
      {/* JSON-LD Structured Data */}
      <JsonLd data={generateNewsArticleLd(article as any) as unknown as Record<string, unknown>} />
      <JsonLd data={generateBreadcrumbLd([
        ...(article.category ? [{ name: article.category.name, url: `${SITE_URL}/kategori/${article.category.slug}` }] : []),
        { name: article.title, url: `${SITE_URL}/haber/${article.slug}` },
      ]) as unknown as Record<string, unknown>} />
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Ana Sayfa
          </Link>
          <span>/</span>
          {article.category && (
            <>
              <Link
                href={`/kategori/${article.category.slug}`}
                className="hover:text-blue-600 transition-colors"
              >
                {article.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-400 truncate max-w-[200px]">
            {article.title}
          </span>
        </nav>

        {/* Kategori */}
        {article.category && (
          <Link
            href={`/kategori/${article.category.slug}`}
            className="inline-block px-3 py-1 text-sm font-medium rounded-full text-white mb-4"
            style={{ backgroundColor: article.category.color }}
          >
            {article.category.name}
          </Link>
        )}

        {/* Taslak Uyarısı */}
        {isDraft && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            ⚠️ Bu haber <strong>taslak</strong> durumunda. Sadece önizleme amaçlıdır, ziyaretçiler tarafından görüntülenemez.
          </div>
        )}

        {/* Başlık */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
          {article.author && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {article.author.name.charAt(0)}
                </span>
              </div>
              <div>
                <Link
                  href={`/yazar/${article.author.slug}`}
                  className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {article.author.name}
                </Link>
                {article.author.isBot && (
                  <span className="text-xs text-blue-500 ml-1">(Bot)</span>
                )}
              </div>
            </div>
          )}
          <span className="hidden sm:inline">•</span>
          {article.publishedAt && (
            <time dateTime={article.publishedAt.toISOString()}>
              {formatDate(article.publishedAt)}
            </time>
          )}
          {!article.publishedAt && <span>Taslak</span>}
          <span className="hidden sm:inline">•</span>
          <span>{article.viewCount} görüntülenme</span>
          {article.isAiGenerated && article.aiModel && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                AI: {article.aiModel}
              </span>
            </>
          )}
        </div>

        {/* Öne Çıkan Görsel */}
        {article.featuredImage && (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full rounded-xl mb-8 object-cover max-h-[500px]"
          />
        )}

        {/* İçerik */}
        <div
          className="prose-article text-lg"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Etiketler */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
            {article.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/arama?q=${encodeURIComponent(tag.name)}`}
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Paylaş */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
          <span className="text-sm text-gray-500">Paylaş:</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`https://teknolojiakisi.com.tr/haber/${article.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://teknolojiakisi.com.tr/haber/${article.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
        </div>
      </div>

      {/* İlgili Haberler */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-gray-100 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            İlgili Haberler
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/haber/${rel.slug}`}
                className="group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg hover:border-blue-200 transition-all"
              >
                {rel.category && (
                  <span
                    className="inline-block px-2 py-0.5 text-xs font-medium rounded-full text-white mb-2"
                    style={{ backgroundColor: rel.category.color }}
                  >
                    {rel.category.name}
                  </span>
                )}
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {rel.title}
                </h3>
                {rel.publishedAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    {timeAgo(rel.publishedAt)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
