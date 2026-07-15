import prisma from "@/lib/db";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function HaberlerPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string; search?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const pageSize = 20;
  const status = searchParams.status;
  const search = searchParams.search;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, color: true } },
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Haberler</h1>
        <Link
          href="/admin/haberler/yeni"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Yeni Haber
        </Link>
      </div>

      {/* Filtreler */}
      <form className="flex flex-wrap gap-3 mb-6">
        <input
          name="search"
          defaultValue={search || ""}
          placeholder="Haber ara..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[200px]"
        />
        <select
          name="status"
          defaultValue={status || ""}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Tüm Durumlar</option>
          <option value="published">Yayında</option>
          <option value="draft">Taslak</option>
          <option value="archived">Arşiv</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
        >
          Filtrele
        </button>
      </form>

      {/* Tablo */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Başlık</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Yazar</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tarih</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Henüz haber bulunmuyor.
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-gray-900 truncate">{article.title}</p>
                      {article.isAiGenerated && (
                        <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">
                          AI
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {article.category ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: article.category.color }}
                          />
                          {article.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{article.author?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          article.status === "published"
                            ? "bg-green-100 text-green-700"
                            : article.status === "draft"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {article.status === "published"
                          ? "Yayında"
                          : article.status === "draft"
                          ? "Taslak"
                          : "Arşiv"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-sm">
                      {timeAgo(article.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/haber/${article.slug}`}
                          target="_blank"
                          className="text-gray-500 hover:text-gray-700 text-xs"
                        >
                          Görüntüle
                        </Link>
                        <Link
                          href={`/admin/haberler/${article.id}/duzenle`}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Düzenle
                        </Link>
                        <DeleteButton articleId={article.id} articleTitle={article.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/haberler?page=${p}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm ${
                p === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
