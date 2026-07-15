"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function createArticle(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  if (!title || !content) return { error: "Başlık ve içerik zorunludur" };

  let slug = slugify(title);
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const tagsStr = (formData.get("tags") as string) || "";
  const tagNames = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);

  await prisma.article.create({
    data: {
      title,
      slug,
      content,
      excerpt: (formData.get("excerpt") as string) || null,
      categoryId: (formData.get("categoryId") as string) || null,
      authorId: (formData.get("authorId") as string) || null,
      status: (formData.get("status") as string) || "draft",
      featuredImage: (formData.get("featuredImage") as string) || null,
      metaTitle: (formData.get("metaTitle") as string) || title,
      metaDescription: (formData.get("metaDescription") as string) || null,
      isFeatured: formData.get("isFeatured") === "on",
      isAiGenerated: false,
      publishedAt: formData.get("status") === "published" ? new Date() : null,
      tags: {
        create: await Promise.all(
          tagNames.map(async (tagName: string) => {
            const tagSlug = slugify(tagName);
            const tag = await prisma.tag.upsert({
              where: { slug: tagSlug },
              update: {},
              create: { name: tagName, slug: tagSlug },
            });
            return { tag: { connect: { id: tag.id } } };
          })
        ),
      },
    },
  });

  revalidatePath("/admin/haberler");
  redirect("/admin/haberler");
}

export async function updateArticle(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  if (!title || !content) return { error: "Başlık ve içerik zorunludur" };

  const status = (formData.get("status") as string) || "draft";
  const tagsStr = (formData.get("tags") as string) || "";
  const tagNames = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);

  await prisma.article.update({
    where: { id },
    data: {
      title,
      content,
      excerpt: (formData.get("excerpt") as string) || null,
      categoryId: (formData.get("categoryId") as string) || null,
      authorId: (formData.get("authorId") as string) || null,
      status,
      featuredImage: (formData.get("featuredImage") as string) || null,
      metaTitle: (formData.get("metaTitle") as string) || title,
      metaDescription: (formData.get("metaDescription") as string) || null,
      isFeatured: formData.get("isFeatured") === "on",
      publishedAt: status === "published" ? new Date() : status === "draft" ? null : undefined,
    },
  });

  // Etiketleri güncelle
  if (tagNames.length > 0) {
    await prisma.articleTag.deleteMany({ where: { articleId: id } });
    for (const tagName of tagNames) {
      const tagSlug = slugify(tagName);
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: { name: tagName, slug: tagSlug },
      });
      await prisma.articleTag.create({
        data: { articleId: id, tagId: tag.id },
      });
    }
  }

  revalidatePath("/admin/haberler");
  redirect("/admin/haberler");
}
