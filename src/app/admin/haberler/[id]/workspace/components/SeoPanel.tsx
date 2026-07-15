"use client";

export function SeoPanel({ article }: { article: any }) {
  const checks = [
    { label: "Meta Title", value: article.metaTitle || article.title, max: 60, icon: "📝" },
    { label: "Meta Description", value: article.metaDescription || article.excerpt || "", max: 160, icon: "📄" },
    { label: "Canonical URL", value: `/haber/${article.slug}`, icon: "🔗" },
    { label: "Slug", value: article.slug, icon: "🏷️" },
    { label: "OpenGraph Image", value: article.featuredImage ? "✅ Var" : "❌ Yok", icon: "🖼️" },
    { label: "Twitter Card", value: "summary_large_image", icon: "🐦" },
    { label: "isFeatured", value: article.isFeatured ? "⭐ Öne Çıkan" : "—", icon: "⭐" },
    { label: "Status", value: article.status === "published" ? "✅ Yayında" : "📝 Taslak", icon: "📢" },
  ];

  const metaTitleLen = (article.metaTitle || article.title || "").length;
  const metaDescLen = (article.metaDescription || "").length;
  const seoScore = Math.min(100, Math.round(
    (metaTitleLen > 0 && metaTitleLen <= 60 ? 25 : metaTitleLen > 0 ? 15 : 0) +
    (metaDescLen > 0 && metaDescLen <= 160 ? 25 : metaDescLen > 0 ? 15 : 0) +
    (article.featuredImage ? 20 : 0) +
    (article.slug ? 15 : 0) +
    (article.isFeatured ? 15 : 0)
  ));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">🔍 SEO Analiz</h2>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${seoScore >= 70 ? "bg-green-100 text-green-700" : seoScore >= 40 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
          SEO Score: {seoScore}/100
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {checks.map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">{item.label}</span>
              <span className="text-xs">{item.icon}</span>
            </div>
            <div className="text-sm text-gray-900 truncate">{item.value}</div>
            {item.max && (
              <div className="mt-2 h-1 bg-gray-100 rounded-full">
                <div className={`h-1 rounded-full ${String(item.value).length <= item.max ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${Math.min(100, (String(item.value).length / item.max) * 100)}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
