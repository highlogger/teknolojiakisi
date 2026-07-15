"use client";

import { calculateReadingTime, calculateWordCount } from "@/services/content/metadata";

export function AiPanel({ article }: { article: any }) {
  const wordCount = calculateWordCount(article.content || "");
  const readTime = calculateReadingTime(article.content || "");

  const cards = [
    { label: "AI Provider", value: article.aiModel || "—", icon: "🤖" },
    { label: "Word Count", value: wordCount.toLocaleString(), icon: "📝" },
    { label: "Reading Time", value: `${readTime} dk`, icon: "⏱️" },
    { label: "Language", value: article.language?.toUpperCase() || "TR", icon: "🌍" },
    { label: "AI Prompt Tokens", value: article.aiPromptTokens?.toLocaleString() || "—", icon: "⬆️" },
    { label: "AI Completion", value: article.aiCompletionTokens?.toLocaleString() || "—", icon: "⬇️" },
    { label: "Original Source", value: article.source?.name || "—", icon: "📡" },
    { label: "Original URL", value: article.originalUrl ? "✅ Var" : "—", icon: "🔗" },
    { label: "Import Date", value: article.createdAt ? new Date(article.createdAt).toLocaleDateString("tr-TR") : "—", icon: "📅" },
    { label: "AI Version", value: article.aiModel || "deepseek-chat", icon: "🧠" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">🤖 AI Analiz</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="text-lg mb-1">{card.icon}</div>
            <div className="text-xs text-gray-400">{card.label}</div>
            <div className="text-sm font-semibold text-gray-900 mt-0.5">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
