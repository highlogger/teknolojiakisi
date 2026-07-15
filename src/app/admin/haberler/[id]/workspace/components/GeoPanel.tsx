"use client";

import { analyzeContent } from "@/services/geo/analysis";
import { calculateGEOScore } from "@/services/geo/scoring/calculator";

export function GeoPanel({ article }: { article: any }) {
  const analysis = analyzeContent(article.content || "", {
    authorBio: article.author?.bio,
    originalUrl: article.originalUrl,
  });
  const score = calculateGEOScore(analysis);

  const metrics = [
    { label: "Entity", value: Math.round(score.entity * 100), color: "bg-blue-500" },
    { label: "Authority", value: Math.round(score.authority * 100), color: "bg-purple-500" },
    { label: "Freshness", value: Math.round(score.freshness * 100), color: "bg-green-500" },
    { label: "Citation", value: Math.round(score.citation * 100), color: "bg-orange-500" },
    { label: "Semantic", value: Math.round(score.semantic * 100), color: "bg-pink-500" },
    { label: "Answer", value: Math.round(score.answer * 100), color: "bg-teal-500" },
    { label: "Trust", value: Math.round(score.trust * 100), color: "bg-indigo-500" },
    { label: "AI Readability", value: Math.round(score.aiReadability * 100), color: "bg-cyan-500" },
  ];

  const signals = [
    { label: "Content Clarity", value: Math.round(analysis.contentClarity * 100) },
    { label: "Entity Coverage", value: Math.round(analysis.entityCoverage * 100) },
    { label: "Authority Signals", value: Math.round(analysis.authoritySignals.total * 100) },
    { label: "Structure", value: Math.round(analysis.structure * 100) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">🌐 GEO Analiz</h2>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${score.overall >= 0.7 ? "bg-green-100 text-green-700" : score.overall >= 0.4 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
          GEO Score: {Math.round(score.overall * 100)}/100
        </div>
      </div>

      {/* Score bars */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-24 shrink-0">{m.label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full">
              <div className={`h-2 rounded-full ${m.color}`} style={{ width: `${m.value}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-700 w-10 text-right">{m.value}%</span>
          </div>
        ))}
      </div>

      {/* GEO Signals */}
      <div className="grid grid-cols-2 gap-3">
        {signals.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-400 mb-1">{s.label}</div>
            <div className="text-lg font-bold text-gray-900">{s.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
