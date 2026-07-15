import prisma from "@/lib/db";
import BotTriggerButton from "./BotTriggerButton";

export const dynamic = "force-dynamic";

export default async function BotControlPage() {
  const [sources, lastRun, totalGenerated, todayGenerated, autoPublishSetting] =
    await Promise.all([
      prisma.source.findMany({
        orderBy: { priority: "desc" },
        include: { category: { select: { name: true } } },
      }),
      prisma.botLog.findFirst({ orderBy: { createdAt: "desc" } }),
      prisma.article.count({ where: { isAiGenerated: true } }),
      prisma.article.count({
        where: {
          isAiGenerated: true,
          createdAt: { gte: new Date(Date.now() - 86400000) },
        },
      }),
      prisma.siteSetting.findUnique({ where: { key: "autoPublish" } }),
    ]);

  const autoPublish = autoPublishSetting?.value === "true";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bot Kontrol</h1>

      {/* Bot Durumu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Son Çalışma</p>
          <p className="text-xl font-bold text-gray-900">
            {lastRun
              ? new Date(lastRun.createdAt).toLocaleString("tr-TR")
              : "Henüz çalışmadı"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Toplam AI Haber</p>
          <p className="text-xl font-bold text-gray-900">{totalGenerated}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Bugün Üretilen</p>
          <p className="text-xl font-bold text-gray-900">{todayGenerated}</p>
        </div>
      </div>

      {/* Bot Çalıştırma */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-3">Manuel Çalıştırma</h2>
        <p className="text-sm text-gray-500 mb-4">
          Botu manuel olarak çalıştırır. Tüm aktif kaynaklardan haberleri çeker
          ve AI ile içerik üretir. İşlem birkaç dakika sürebilir.
        </p>
        <div className="flex items-center gap-4">
          <BotTriggerButton />
          <span className="text-sm text-gray-400">
            Auto-publish:{" "}
            <strong className={autoPublish ? "text-green-600" : "text-yellow-600"}>
              {autoPublish ? "AÇIK" : "KAPALI"}
            </strong>
          </span>
        </div>
      </div>

      {/* Kaynaklar Özet */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            Kaynaklar ({sources.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">İsim</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tip</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Dil</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Öncelik</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Son Çekme</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Aktif</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} className="border-t border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                      {s.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.language.toUpperCase()}</td>
                  <td className="px-4 py-3 text-gray-500">{s.priority}/10</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {s.lastFetchedAt
                      ? new Date(s.lastFetchedAt).toLocaleString("tr-TR")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        s.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
