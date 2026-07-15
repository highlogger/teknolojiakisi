"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({
  articleId,
  articleTitle,
}: {
  articleId: string;
  articleTitle: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    try {
      const res = await fetch(`/api/articles/${articleId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Silme başarısız!");
      }
    } catch {
      alert("Bağlantı hatası!");
    }
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 text-xs font-medium"
        >
          Emin misin?
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-gray-400 hover:text-gray-600 text-xs"
        >
          İptal
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-red-500 hover:text-red-700 text-xs"
    >
      Sil
    </button>
  );
}
