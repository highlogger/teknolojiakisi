"use client";

import { statusLabel, statusColor } from "@/services/content/status";

export function PublishPanel({ article }: { article: any }) {
  const publishDate = article.publishedAt ? new Date(article.publishedAt) : null;
  const updatedDate = new Date(article.updatedAt);
  const createdDate = new Date(article.createdAt);

  const info = [
    { label: "Status", value: statusLabel(article.status as any), color: statusColor(article.status as any) },
    { label: "Visibility", value: article.status === "published" ? "Public" : "Private", icon: article.status === "published" ? "🌐" : "🔒" },
    { label: "Featured", value: article.isFeatured ? "⭐ Yes" : "—", icon: article.isFeatured ? "⭐" : "" },
    { label: "Created", value: createdDate.toLocaleDateString("tr-TR"), icon: "📅" },
    { label: "Published", value: publishDate ? publishDate.toLocaleDateString("tr-TR") : "—", icon: "📢" },
    { label: "Last Update", value: updatedDate.toLocaleDateString("tr-TR"), icon: "🔄" },
    { label: "View Count", value: article.viewCount?.toLocaleString() || "0", icon: "👁️" },
    { label: "Version", value: "v1.0", icon: "📋" },
  ];

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-lg font-bold text-gray-900">🚀 Yayın Bilgileri</h2>

      {/* Workflow Stage */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Workflow Stage</h3>
        <div className="flex items-center gap-2">
          {["draft", "ai_generated", "editor_review", "seo_optimized", "ready", "published"].map((stage, i) => (
            <div key={stage} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${i <= 2 ? "bg-blue-500" : "bg-gray-200"}`} />
              {i < 5 && <div className="w-4 h-px bg-gray-200" />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
          <span>Taslak</span><span>AI</span><span>Review</span><span>SEO</span><span>Ready</span><span>Yayın</span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {info.map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-400 mb-1">{item.label}</div>
            <div className="text-sm font-semibold" style={item.color ? { color: item.color } : {}}>
              {item.icon && <span className="mr-1">{item.icon}</span>}
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
