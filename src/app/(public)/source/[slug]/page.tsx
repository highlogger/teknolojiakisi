import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import { JsonLd } from "@/lib/seo";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const source = await getSource(params.slug);
  if (!source) return { title: "Kaynak bulunamadı" };
  return {
    title: `${source.name} — Haber Kaynağı | ${SITE_NAME}`,
    description: `${source.name} kaynağından en güncel teknoloji haberleri. Toplam ${source.articleCount} haber.`,
    alternates: { canonical: `${SITE_URL}/source/${params.slug}` },
  };
}

async function getSource(slug: string) {
  const source = await prisma.source.findFirst({
    where: { OR: [{ name: { contains: slug } }, { feedUrl: { contains: slug } }] },
    include: { category: { select: { name: true, color: true } }, articles: { select: { id: true }, where: { status: "published" } } },
  });
  if (!source) return null;
  return { ...source, articleCount: source.articles.length };
}

export default async function SourcePage({ params }: Props) {
  const source = await getSource(params.slug);
  if (!source) notFound();

  const articles = await prisma.article.findMany({
    where: { sourceId: source.id, status: "published" },
    select: { id: true, title: true, slug: true, excerpt: true, featuredImage: true, publishedAt: true, isAiGenerated: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const score = calculateSourceScore(source, articles.length);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: source.name, url: source.url, description: `${source.name} — ${SITE_NAME} haber kaynağı` }} />

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
            {source.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{source.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
              <span>🌐 <a href={source.url} target="_blank" rel="noopener" className="text-blue-600 hover:underline">{source.url}</a></span>
              {source.feedUrl && <span>📡 RSS mevcut</span>}
              <span>🌍 {source.language?.toUpperCase()}</span>
              <span>⏱️ {source.fetchIntervalMin}dk aralık</span>
            </div>
            {source.category && <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: source.category.color + "20", color: source.category.color }}>{source.category.name}</span>}
          </div>
          <div className="text-center shrink-0">
            <div className="text-3xl font-bold text-blue-600">{score.total}</div>
            <div className="text-xs text-gray-400">Güven Skoru</div>
          </div>
        </div>

        {/* Skor detay */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-4 border-t border-gray-100">
          {Object.entries(score).filter(([k]) => k !== "total").map(([key, val]) => (
            <div key={key} className="text-center">
              <div className="text-lg font-bold text-gray-700">{Math.round(val as number)}</div>
              <div className="text-[10px] text-gray-400">{key}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Haberler */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">📰 Son Haberler ({source.articleCount} toplam)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {articles.map((a) => (
            <Link key={a.id} href={`/haber/${a.slug}`} className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex gap-3">
                {a.featuredImage && <img src={a.featuredImage} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />}
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{a.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {a.isAiGenerated && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">AI</span>}
                    <span className="text-xs text-gray-400">{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("tr-TR") : ""}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function calculateSourceScore(source: any, articleCount: number) {
  const reliability = source.isActive ? 80 : 30;
  const authority = Math.min(100, source.priority * 10 + 20);
  const freshness = source.lastFetchedAt ? Math.max(0, 100 - (Date.now() - new Date(source.lastFetchedAt).getTime()) / (86400000 * 7) * 100) : 50;
  const frequency = Math.min(100, Math.round((articleCount / 30) * 100));
  const duplicate = 85;
  const trust = Math.round((reliability + authority + freshness + frequency + duplicate) / 5);
  return { reliability, authority, freshness, frequency, duplicate, total: trust };
}
