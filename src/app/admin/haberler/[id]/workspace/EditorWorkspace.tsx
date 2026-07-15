"use client";

import { useState } from "react";
import Link from "next/link";
import { ArticleEditor } from "./components/ArticleEditor";
import { AiPanel } from "./components/AiPanel";
import { SeoPanel } from "./components/SeoPanel";
import { GeoPanel } from "./components/GeoPanel";
import { EntityPanel } from "./components/EntityPanel";
import { PublishPanel } from "./components/PublishPanel";
import { ArticleInfo } from "./components/ArticleInfo";

type Panel = "editor" | "ai" | "seo" | "geo" | "entity" | "publish";

export function EditorWorkspace({
  article,
  categories,
  authors,
}: {
  article: any;
  categories: any[];
  authors: any[];
}) {
  const [activePanel, setActivePanel] = useState<Panel>("editor");

  const tabs: { id: Panel; label: string; icon: string }[] = [
    { id: "editor", label: "Editör", icon: "✏️" },
    { id: "ai", label: "AI", icon: "🤖" },
    { id: "seo", label: "SEO", icon: "🔍" },
    { id: "geo", label: "GEO", icon: "🌐" },
    { id: "entity", label: "Entity", icon: "🏷️" },
    { id: "publish", label: "Yayın", icon: "🚀" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/admin/haberler"
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                ←
              </Link>
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {article.title}
              </h1>
              <span className="text-xs text-gray-400 shrink-0">
                #{article.id.slice(-6)}
              </span>
            </div>

            {/* Tab Navigation */}
            <nav className="flex gap-0.5" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activePanel === tab.id}
                  onClick={() => setActivePanel(tab.id)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activePanel === tab.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Panel Content */}
      <div className="max-w-full px-4 sm:px-6 py-4">
        {activePanel === "editor" && (
          <ArticleEditor article={article} categories={categories} authors={authors} />
        )}
        {activePanel === "ai" && <AiPanel article={article} />}
        {activePanel === "seo" && <SeoPanel article={article} />}
        {activePanel === "geo" && <GeoPanel article={article} />}
        {activePanel === "entity" && <EntityPanel article={article} />}
        {activePanel === "publish" && <PublishPanel article={article} />}
      </div>

      {/* Bottom Info Bar */}
      <ArticleInfo article={article} />
    </div>
  );
}
