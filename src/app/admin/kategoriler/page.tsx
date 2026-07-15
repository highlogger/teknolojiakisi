import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { articles: { select: { id: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kategoriler</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Renk</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">İsim</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Sıra</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Haber Sayısı</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t border-gray-50">
                  <td className="px-4 py-3">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: cat.color }}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {cat.sortOrder}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {cat.articles.length}
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
