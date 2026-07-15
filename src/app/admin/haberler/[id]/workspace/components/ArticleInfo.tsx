"use client";

export function ArticleInfo({ article }: { article: any }) {
  const wordCount = (article.content || "").replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-2">
      <div className="flex items-center gap-6 text-xs text-gray-400">
        <span>📝 {wordCount.toLocaleString()} kelime</span>
        <span>⏱️ ~{readTime} dk okuma</span>
        <span>📅 {new Date(article.createdAt).toLocaleDateString("tr-TR")}</span>
        <span>🔄 {new Date(article.updatedAt).toLocaleDateString("tr-TR")}</span>
        <span>👁️ {article.viewCount || 0} görüntülenme</span>
        <span className="ml-auto">ID: {article.id.slice(-8)}</span>
      </div>
    </div>
  );
}
