"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CategoryOption {
  id: string;
  name: string;
  color: string;
}

interface AuthorOption {
  id: string;
  name: string;
}

interface ArticleFormProps {
  mode: "new" | "edit";
  categories: CategoryOption[];
  authors: AuthorOption[];
  initialData?: {
    id?: string;
    title: string;
    excerpt: string;
    content: string;
    categoryId: string;
    authorId: string;
    status: string;
    featuredImage: string;
    metaTitle: string;
    metaDescription: string;
    isFeatured: boolean;
    tags: string;
  };
}

const defaultData = {
  title: "",
  excerpt: "",
  content: "",
  categoryId: "",
  authorId: "",
  status: "draft" as const,
  featuredImage: "",
  metaTitle: "",
  metaDescription: "",
  isFeatured: false,
  tags: "",
};

export default function ArticleForm({ mode, categories, authors, initialData }: ArticleFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [formData, setFormData] = useState(initialData || defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/articles/${initialData?.id}` : "/api/articles";
      const method = isEdit ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        categoryId: formData.categoryId || null,
        authorId: formData.authorId || null,
        status: formData.status,
        featuredImage: formData.featuredImage || null,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
        isFeatured: formData.isFeatured,
        tags: formData.tags
          ? formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : [],
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Bir hata oluştu");
      }

      router.push("/admin/haberler");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Başlık */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Başlık <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Haber başlığı..."
        />
      </div>

      {/* Özet */}
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
          Özet
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          value={formData.excerpt}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
          placeholder="Haber özeti..."
        />
      </div>

      {/* İçerik */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          İçerik <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-2">
          HTML destekli metin girişi. Zengin metin düzenleyici için JavaScript kütüphanesi entegre edilebilir.
        </p>
        <textarea
          id="content"
          name="content"
          rows={15}
          value={formData.content}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
          placeholder="&lt;h2&gt;Haber İçeriği&lt;/h2&gt;&#x0A;&lt;p&gt;İçerik buraya...&lt;/p&gt;"
        />
      </div>

      {/* İkili Sütun */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kategori */}
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Kategori Seçin</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Yazar */}
        <div>
          <label htmlFor="authorId" className="block text-sm font-medium text-gray-700 mb-1">
            Yazar
          </label>
          <select
            id="authorId"
            name="authorId"
            value={formData.authorId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Yazar Seçin</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        {/* Durum */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Durum
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="draft">Taslak</option>
            <option value="published">Yayında</option>
          </select>
        </div>

        {/* Öne Çıkan Görsel */}
        <div>
          <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-1">
            Öne Çıkan Görsel URL
          </label>
          <input
            id="featuredImage"
            name="featuredImage"
            type="url"
            value={formData.featuredImage}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Etiketler */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Etiketler
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="teknoloji, yapay-zeka, mobil (virgülle ayırın)"
        />
        <p className="text-xs text-gray-400 mt-1">Etiketleri virgülle ayırın.</p>
      </div>

      {/* SEO */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Ayarları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Meta Başlık
            </label>
            <input
              id="metaTitle"
              name="metaTitle"
              type="text"
              value={formData.metaTitle}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="SEO başlığı..."
            />
          </div>
          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Meta Açıklama
            </label>
            <input
              id="metaDescription"
              name="metaDescription"
              type="text"
              value={formData.metaDescription}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="SEO açıklaması..."
            />
          </div>
        </div>
      </div>

      {/* Öne Çıkan */}
      <div className="flex items-center gap-2">
        <input
          id="isFeatured"
          name="isFeatured"
          type="checkbox"
          checked={formData.isFeatured}
          onChange={handleCheckbox}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
          Öne Çıkan Haber
        </label>
      </div>

      {/* Butonlar */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Yayınla / Kaydet"}
        </button>
        <Link
          href="/admin/haberler"
          className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          İptal
        </Link>
      </div>
    </form>
  );
}
