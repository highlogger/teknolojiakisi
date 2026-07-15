"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ArticleEditor({ article, categories, authors }: { article: any; categories: any[]; authors: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          categoryId: data.categoryId || null,
          authorId: data.authorId || null,
          status: data.status,
          featuredImage: data.featuredImage || null,
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
          isFeatured: data.isFeatured === "on",
          tags: data.tags ? String(data.tags).split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        }),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); router.refresh(); }
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Ana içerik */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <input name="title" defaultValue={article.title} className="w-full text-xl font-bold border-0 outline-none focus:ring-0 p-0" placeholder="Başlık" required />
          <div className="flex gap-2 text-xs text-gray-400">
            <span>Slug: {article.slug}</span>
          </div>
          <textarea name="excerpt" defaultValue={article.excerpt || ""} rows={2} className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none" placeholder="Özet..." />
          <textarea name="content" defaultValue={article.content} rows={20} className="w-full text-sm border border-gray-200 rounded-lg p-3 font-mono resize-y" placeholder="HTML içerik..." required />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Durum + Kaydet */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <select name="status" defaultValue={article.status} className="w-full text-sm border border-gray-200 rounded-lg p-2">
            <option value="draft">Taslak</option>
            <option value="published">Yayında</option>
            <option value="archived">Arşiv</option>
          </select>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Kaydediliyor..." : saved ? "✅ Kaydedildi" : "Kaydet"}
          </button>
        </div>

        {/* Kategori & Yazar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <select name="categoryId" defaultValue={article.categoryId || ""} className="w-full text-sm border border-gray-200 rounded-lg p-2">
            <option value="">Kategori Seç</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select name="authorId" defaultValue={article.authorId || ""} className="w-full text-sm border border-gray-200 rounded-lg p-2">
            <option value="">Yazar Seç</option>
            {authors.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        {/* Görsel + Etiket */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <input name="featuredImage" defaultValue={article.featuredImage || ""} className="w-full text-sm border border-gray-200 rounded-lg p-2" placeholder="Kapak Görseli URL" />
          <input name="tags" defaultValue={article.tags?.map((t: any) => t.tag.name).join(", ") || ""} className="w-full text-sm border border-gray-200 rounded-lg p-2" placeholder="Etiketler (virgülle)" />
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" name="isFeatured" defaultChecked={article.isFeatured} className="rounded" />
            Öne Çıkan
          </label>
        </div>

        {/* SEO mini */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">SEO</h3>
          <input name="metaTitle" defaultValue={article.metaTitle || ""} className="w-full text-xs border border-gray-200 rounded-lg p-2" placeholder="Meta Title (60 karakter)" maxLength={70} />
          <textarea name="metaDescription" defaultValue={article.metaDescription || ""} rows={2} className="w-full text-xs border border-gray-200 rounded-lg p-2 resize-none" placeholder="Meta Description (160 karakter)" maxLength={160} />
        </div>
      </div>
    </form>
  );
}
