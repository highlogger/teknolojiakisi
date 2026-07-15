"use client";

import { ENTITY_TYPE_LABELS } from "@/services/entity/config";

export function EntityPanel({ article }: { article: any }) {
  const categories = [
    { type: "person", icon: "👤", entities: [] as string[] },
    { type: "company", icon: "🏢", entities: [] as string[] },
    { type: "product", icon: "📱", entities: [] as string[] },
    { type: "software", icon: "💻", entities: [] as string[] },
    { type: "technology", icon: "⚙️", entities: [] as string[] },
    { type: "ai_model", icon: "🧠", entities: [] as string[] },
    { type: "ai_company", icon: "🤖", entities: [] as string[] },
    { type: "country", icon: "🌍", entities: [] as string[] },
    { type: "event", icon: "📅", entities: [] as string[] },
  ];

  const totalEntities = categories.reduce((s, c) => s + c.entities.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">🏷️ Entity Analiz</h2>
        <span className="text-sm text-gray-500">{totalEntities} entity tespit edildi</span>
      </div>

      {totalEntities === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm text-gray-500">
            Entity çıkarımı için AI analizi gerekiyor.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            "AI ile Analiz Et" butonu ile entity'ler otomatik tespit edilecek.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.filter((c) => c.entities.length > 0).map((cat) => (
            <div key={cat.type} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{cat.icon}</span>
                <span className="text-xs font-semibold text-gray-700">
                  {ENTITY_TYPE_LABELS[cat.type as keyof typeof ENTITY_TYPE_LABELS] || cat.type}
                </span>
                <span className="text-xs text-gray-400 ml-auto">{cat.entities.length}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {cat.entities.map((e, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
