import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { EditorWorkspace } from "./EditorWorkspace";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({ params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      author: true,
      tags: { include: { tag: true } },
      source: true,
    },
  });

  if (!article) notFound();

  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <EditorWorkspace
      article={article as any}
      categories={categories}
      authors={authors}
    />
  );
}
