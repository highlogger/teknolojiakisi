"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ArticleActionsProps {
  articleId: string;
  status: string;
}

export default function ArticleActions({ articleId, status }: ArticleActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Bu haberi silmek istediğinize emin misiniz?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Silme işlemi başarısız");

      router.refresh();
    } catch (err) {
      alert("Silme işlemi sırasında bir hata oluştu.");
      setDeleting(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = status === "published" ? "draft" : "published";

    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Durum değiştirme başarısız");

      router.refresh();
    } catch (err) {
      alert("Durum değiştirme sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/haberler/${articleId}/duzenle`}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        Düzenle
      </Link>
      <button
        onClick={handleStatusToggle}
        className={`text-sm font-medium ${
          status === "published"
            ? "text-yellow-600 hover:text-yellow-800"
            : "text-green-600 hover:text-green-800"
        }`}
      >
        {status === "published" ? "Taslağa Al" : "Yayınla"}
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
      >
        {deleting ? "Siliniyor..." : "Sil"}
      </button>
    </div>
  );
}
