import prisma from "@/lib/db";
import ArticleForm from "../ArticleForm";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Haber Ekle</h1>
      <ArticleForm
        categories={categories}
        authors={authors}
        actionUrl="/api/articles"
      />
    </div>
  );
}
