import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import ArticleForm from "../../ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const [article, categories, authors] = await Promise.all([
    prisma.article.findUnique({
      where: { id: params.id },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!article) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Haberi Düzenle</h1>
      <ArticleForm
        categories={categories}
        authors={authors}
        actionUrl={`/api/articles/${params.id}`}
        method="PUT"
        submitLabel="Güncelle"
        defaultValues={{
          title: article.title,
          content: article.content,
          excerpt: article.excerpt || "",
          categoryId: article.categoryId || "",
          authorId: article.authorId || "",
          status: article.status,
          featuredImage: article.featuredImage || "",
          metaTitle: article.metaTitle || "",
          metaDescription: article.metaDescription || "",
          isFeatured: article.isFeatured,
          tags: article.tags.map((t) => t.tag.name).join(", "),
        }}
      />
    </div>
  );
}
