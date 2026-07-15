import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const sources = await prisma.source.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { priority: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Haber Kaynakları</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">İsim</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">URL</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tip</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Dil</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Öncelik</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Aktif</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      {s.url.length > 40 ? s.url.substring(0, 40) + "..." : s.url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100">
                      {s.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">{s.language.toUpperCase()}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.category?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">{s.priority}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
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

      <p className="mt-4 text-sm text-gray-400">
        Kaynak ekleme/düzenleme için veritabanı seed&apos;ini güncelleyin veya
        doğrudan Prisma Studio ile yönetin.
      </p>
    </div>
  );
}
