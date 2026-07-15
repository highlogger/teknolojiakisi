import prisma from "@/lib/db";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";

export const dynamic = "force-dynamic";

export default async function EditorialDashboard() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(Date.now() - 7 * 86400000);

  const [total, published, drafts, archived, todayPub, todayViews, totalViews,
    topToday, topWeek, categories, sources, authors, seoIssues] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "published" } }),
    prisma.article.count({ where: { status: "draft" } }),
    prisma.article.count({ where: { status: "archived" } }),
    prisma.article.count({ where: { status: "published", publishedAt: { gte: todayStart } } }),
    prisma.article.aggregate({ where: { publishedAt: { gte: todayStart } }, _sum: { viewCount: true } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.article.findMany({ where: { status: "published" }, orderBy: { viewCount: "desc" }, take: 5, select: { title: true, slug: true, viewCount: true } }),
    prisma.article.findMany({ where: { status: "published", publishedAt: { gte: weekStart } }, orderBy: { viewCount: "desc" }, take: 5, select: { title: true, slug: true, viewCount: true } }),
    prisma.category.findMany({ include: { articles: { select: { id: true, viewCount: true } } }, orderBy: { sortOrder: "asc" } }),
    prisma.source.findMany({ where: { isActive: true }, include: { articles: { select: { id: true } } }, orderBy: { priority: "desc" }, take: 10 }),
    prisma.author.findMany({ include: { articles: { select: { id: true, viewCount: true } } }, orderBy: { name: "asc" } }),
    prisma.article.count({ where: { status: "published", OR: [{ metaTitle: null }, { metaDescription: null }, { featuredImage: null }] } }),
  ]);

  const catStats = categories.map((c) => ({
    name: c.name, color: c.color, total: c.articles.length,
    views: c.articles.reduce((s, a) => s + a.viewCount, 0),
    avgViews: c.articles.length > 0 ? Math.round(c.articles.reduce((s, a) => s + a.viewCount, 0) / c.articles.length) : 0,
  })).sort((a, b) => b.views - a.views);

  const authorStats = authors.map((a) => ({
    name: a.name, total: a.articles.length,
    views: a.articles.reduce((s, art) => s + art.viewCount, 0),
    avgViews: a.articles.length > 0 ? Math.round(a.articles.reduce((s, art) => s + art.viewCount, 0) / a.articles.length) : 0,
  })).sort((a, b) => b.views - a.views);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">📊 Editorial Intelligence Dashboard</h1>

      {/* Genel Kartlar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatsCard label="Toplam Haber" value={total} icon="📰" />
        <StatsCard label="Yayında" value={published} icon="✅" color="green" />
        <StatsCard label="Taslak" value={drafts} icon="📝" color="orange" />
        <StatsCard label="Arşiv" value={archived} icon="📦" color="red" />
        <StatsCard label="Bugün Yayın" value={todayPub} icon="🆕" color="blue" />
        <StatsCard label="Toplam Görüntülenme" value={totalViews._sum.viewCount || 0} icon="👁️" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En Çok Okunan (Bugün) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3">🔥 Bugün En Çok Okunan</h2>
          {topToday.length === 0 ? <p className="text-sm text-gray-400">Bugün veri yok</p> : (
            <div className="space-y-2">
              {topToday.map((a, i) => (
                <div key={a.slug} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400 w-5">#{i + 1}</span>
                  <a href={`/haber/${a.slug}`} className="flex-1 text-gray-700 hover:text-blue-600 truncate">{a.title}</a>
                  <span className="text-gray-400 text-xs">{a.viewCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* En Çok Okunan (Hafta) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3">📈 Bu Hafta En Çok Okunan</h2>
          <div className="space-y-2">
            {topWeek.map((a, i) => (
              <div key={a.slug} className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-5">#{i + 1}</span>
                <a href={`/haber/${a.slug}`} className="flex-1 text-gray-700 hover:text-blue-600 truncate">{a.title}</a>
                <span className="text-gray-400 text-xs">{a.viewCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kategori Performansı */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-3">🏷️ Kategori Performansı</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400"><th>Kategori</th><th>Haber</th><th>Görüntülenme</th><th>Ort. Görüntülenme</th></tr></thead>
            <tbody>
              {catStats.map((c) => (
                <tr key={c.name} className="border-t border-gray-50">
                  <td className="py-2"><span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.name}</span></td>
                  <td className="py-2">{c.total}</td>
                  <td className="py-2">{c.views.toLocaleString()}</td>
                  <td className="py-2">{c.avgViews.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yazar & Kaynak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3">✍️ Yazar Performansı</h2>
          <div className="space-y-2">
            {authorStats.slice(0, 5).map((a) => (
              <div key={a.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{a.name}</span>
                <span className="text-gray-400">{a.total} haber · {a.views.toLocaleString()} görüntülenme</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3">📡 Kaynak Performansı</h2>
          <div className="space-y-2">
            {sources.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{s.name}</span>
                <span className="text-gray-400">{s.articles.length} haber · P:{s.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEO Uyarıları */}
      {seoIssues > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <h2 className="text-sm font-bold text-yellow-800 mb-2">⚠️ SEO Uyarıları</h2>
          <p className="text-sm text-yellow-700">{seoIssues} yayında haberin SEO meta bilgileri eksik (meta title, description veya görsel).</p>
        </div>
      )}
    </div>
  );
}
