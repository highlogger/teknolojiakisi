import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BotLogsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = 20;

  const [logs, total] = await Promise.all([
    prisma.botLog.findMany({
      include: { source: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.botLog.count(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bot Çalışma Logları</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tarih</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kaynak</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Bulunan</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Üretilen</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Yayınlanan</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Süre</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Henüz log kaydı bulunmuyor.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-t border-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(log.createdAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {log.source?.name || "Manuel"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full font-medium ${
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
                          ? "Yeni Yok"
                          : "Kısmi"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{log.articlesFound}</td>
                    <td className="px-4 py-3 text-center">
                      {log.articlesGenerated}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {log.articlesPublished}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {log.durationMs
                        ? `${(log.durationMs / 1000).toFixed(1)}s`
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/bot/loglar?page=${p}`}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm ${
                p === page
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
