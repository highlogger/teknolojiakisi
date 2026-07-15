import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { JsonLd } from "@/lib/seo";
import Link from "next/link";
import type { Metadata } from "next";
import { getTopic, getTopicStats, generateTopicMetadata } from "@/services/topics";
import { generateAllTopicSchemas } from "@/services/topics";

export const revalidate = 3600; // ISR: 1 saat

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = getTopic(params.slug);
  if (!topic) return { title: "Konu bulunamadı" };

  let articleCount = 0;
  try {
    articleCount = await prisma.article.count({ where: { status: "published", title: { contains: topic.name } } });
  } catch {}

  return generateTopicMetadata(topic, articleCount);
}

export default async function TopicPage({ params }: Props) {
  const topic = getTopic(params.slug);
  if (!topic) notFound();

  const stats = await getTopicStats(params.slug);
  const topicArticleCount = stats?.articleCount || 0;

  const articles = await prisma.article.findMany({
    where: { status: "published", title: { contains: topic.name } },
    select: { id: true, title: true, slug: true, excerpt: true, featuredImage: true, publishedAt: true, category: { select: { name: true, color: true } } },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const latest = articles.slice(0, 10);
  const popular = [...articles].sort(() => Math.random() - 0.5).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <JsonLd data={
        generateAllTopicSchemas(topic, topicArticleCount, articles.map(a => ({ title: a.title, slug: a.slug, publishedAt: a.publishedAt?.toISOString() || new Date().toISOString() }))).collectionPage
      } />
      <JsonLd data={
        generateAllTopicSchemas(topic, topicArticleCount, []).breadcrumbList
      } />
      <JsonLd data={
        generateAllTopicSchemas(topic, topicArticleCount, []).organization
      } />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {topic.icon} {topic.name}
        </h1>
        <p className="text-gray-500">
          Bu konuda {stats?.articleCount || topicArticleCount} içerik bulunuyor.
          {stats?.relatedTopics && stats.relatedTopics.length > 0 && (
            <span className="ml-2">· İlgili: {stats.relatedTopics.slice(0, 3).map(t => t.name).join(", ")}</span>
          )}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {topic.keywords.map(k => (
            <span key={k} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{k}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* En Güncel */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">📰 En Güncel Haberler</h2>
            <div className="space-y-3">
              {latest.map((a) => (
                <Link key={a.id} href={`/haber/${a.slug}`} className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    {a.featuredImage && <img src={a.featuredImage} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />}
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{a.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {a.category && <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: a.category.color + "20", color: a.category.color }}>{a.category.name}</span>}
                        <span className="text-xs text-gray-400">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("tr-TR") : ""}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">🔥 Popüler</h3>
            <div className="space-y-2">
              {popular.map((a) => (
                <Link key={a.id} href={`/haber/${a.slug}`} className="block text-sm text-gray-600 hover:text-blue-600 transition-colors line-clamp-2">
                  {a.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3">🏷️ İlgili Konular</h3>
            <div className="flex flex-wrap gap-1.5">
              {stats?.relatedTopics && stats.relatedTopics.length > 0
                ? stats.relatedTopics.map((rt) => (
                    <Link key={rt.slug} href={`/topics/${rt.slug}`} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-blue-100 hover:text-blue-600 transition-colors">
                      {rt.name}
                    </Link>
                  ))
                : ["ai", "yapay-zeka", "teknoloji", "mobil", "yazilim"].map((t) => (
                    <Link key={t} href={`/topics/${t}`} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 transition-colors">{t}</Link>
                  ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
