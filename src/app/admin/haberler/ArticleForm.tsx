"use client";

import { useRouter } from "next/navigation";
import type { Category, Author } from "@prisma/client";

interface ArticleFormProps {
  categories: Pick<Category, "id" | "name">[];
  authors: Pick<Author, "id" | "name">[];
  defaultValues?: {
    title?: string;
    content?: string;
    excerpt?: string;
    categoryId?: string;
    authorId?: string;
    status?: string;
    featuredImage?: string;
    metaTitle?: string;
    metaDescription?: string;
    isFeatured?: boolean;
    tags?: string;
  };
  actionUrl: string;
  method?: "POST" | "PUT";
  submitLabel?: string;
}

export default function ArticleForm({
  categories,
  authors,
  defaultValues = {},
  actionUrl,
  method = "POST",
  submitLabel = "Kaydet",
}: ArticleFormProps) {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    form.forEach((value, key) => {
      if (key === "tags") {
        data[key] = (value as string).split(",").map((t) => t.trim()).filter(Boolean);
      } else if (key === "isFeatured") {
        data[key] = value === "on";
      } else if (key !== "") {
        data[key] = value;
      }
    });

    try {
      const res = await fetch(actionUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push("/admin/haberler");
        router.refresh();
      } else {
        const result = await res.json();
        alert(result.error || "Bir hata oluştu");
      }
    } catch (err) {
      alert("Bağlantı hatası: " + (err as Error).message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Başlık *
          </label>
          <input
            name="title"
            defaultValue={defaultValues.title}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Haber başlığı..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Özet</label>
          <textarea
            name="excerpt"
            defaultValue={defaultValues.excerpt}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Kısa açıklama..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            İçerik (HTML) *
          </label>
          <textarea
            name="content"
            defaultValue={defaultValues.content}
            required
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
            placeholder="<p>Haber içeriği HTML formatında...</p>"
          />
          <p className="mt-1 text-xs text-gray-400">
            HTML etiketleri kullanabilirsiniz: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              name="categoryId"
              defaultValue={defaultValues.categoryId || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Seçiniz...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yazar</label>
            <select
              name="authorId"
              defaultValue={defaultValues.authorId || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Seçiniz...</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
            <select
              name="status"
              defaultValue={defaultValues.status || "draft"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="draft">Taslak</option>
              <option value="published">Yayında</option>
              <option value="archived">Arşiv</option>
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                name="isFeatured"
                type="checkbox"
                defaultChecked={defaultValues.isFeatured}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Öne Çıkan Haber</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Öne Çıkan Görsel URL</label>
          <input
            name="featuredImage"
            defaultValue={defaultValues.featuredImage}
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Etiketler (virgülle ayırın)</label>
          <input
            name="tags"
            defaultValue={defaultValues.tags}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="yapay zeka, openai, chatgpt"
          />
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">SEO Ayarları</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Başlık</label>
              <input
                name="metaTitle"
                defaultValue={defaultValues.metaTitle}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="SEO başlığı (max 60 karakter)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Açıklama</label>
              <textarea
                name="metaDescription"
                defaultValue={defaultValues.metaDescription}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="SEO açıklaması (max 160 karakter)"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          {submitLabel}
        </button>
        <a
          href="/admin/haberler"
          className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm"
        >
          İptal
        </a>
      </div>
    </form>
  );
}
