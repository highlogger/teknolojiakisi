import prisma from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalArticles, publishedCount, draftCount, todayCount, recentLogs] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "published" } }),
      prisma.article.count({ where: { status: "draft" } }),
      prisma.article.count({
        where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
      }),
      prisma.botLog.findMany({
        include: { source: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    { label: "Toplam Haber", value: totalArticles, color: "bg-blue-500" },
    {
      label: "Yayında",
      value: publishedCount,
      color: "bg-green-500",
    },
    { label: "Taslak", value: draftCount, color: "bg-yellow-500" },
    {
      label: "Bugün Eklenen",
      value: todayCount,
      color: "bg-purple-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">
                  {stat.value}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hızlı İşlemler */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/admin/haberler/yeni"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Yeni Haber Ekle
        </Link>
        <Link
          href="/admin/bot"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          🤖 Bot Kontrol
        </Link>
        <Link
          href="/admin/haberler"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          Tüm Haberler
        </Link>
      </div>

      {/* Son Bot Logları */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Son Bot Çalışmaları</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Kaynak
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Durum
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  Bulunan
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  Üretilen
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Henüz bot çalışma kaydı bulunmuyor.
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log.id} className="border-t border-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      {log.source?.name || "Manuel"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                          log.status === "success"
                            ? "bg-green-100 text-green-700"
                            : log.status === "error"
                            ? "bg-red-100 text-red-700"
                            : log.status === "no_new"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {log.status === "success"
                          ? "Başarılı"
                          : log.status === "error"
                          ? "Hata"
                          : log.status === "no_new"
                          ? "Yeni Haber Yok"
                          : "Kısmi"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{log.articlesFound}</td>
                    <td className="px-4 py-3 text-center">
                      {log.articlesGenerated}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {new Date(log.createdAt).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
