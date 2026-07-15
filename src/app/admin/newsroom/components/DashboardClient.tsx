"use client";

import { useState } from "react";
import { getStateLabel } from "@/services/agents/orchestrator/state-machine";
import { PIPELINE_STATE } from "@/services/agents/orchestrator/types";
import type { PipelineState, PipelineJob, PipelineEvent } from "@/services/agents/orchestrator/types";

interface Props {
  stats: { total: number; active: number; completed: number; failed: number; cancelled: number };
  jobs: Array<{ id: string; state: string; title: string; source: string; priority: string; steps: number; duration: number; createdAt: string; updatedAt: string; retryCount: number }>;
  events: PipelineEvent[];
  allJobs: PipelineJob[];
}

// ─── Stats Card ────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

// ─── Pipeline Steps ────────────────────────────────────────

const PIPELINE_STEPS: PipelineState[] = ["scout", "research", "verification", "writer", "seo", "editor", "publisher"];

// ─── Main Component ────────────────────────────────────────

export default function DashboardClient({ stats, jobs, events, allJobs }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<PipelineJob | null>(null);

  const filtered = jobs.filter(j => {
    if (filter !== "all" && j.state !== filter) return false;
    if (search && !j.id.includes(search) && !j.source?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stateCounts: Record<string, number> = {};
  jobs.forEach(j => { stateCounts[j.state] = (stateCounts[j.state] || 0) + 1; });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🤖 AI Newsroom Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Pipeline kontrol merkezi</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Toplam Job" value={stats.total} color="#6B7280" />
        <StatCard label="Aktif" value={stats.active} color="#3B82F6" />
        <StatCard label="Tamamlanan" value={stats.completed} color="#22C55E" />
        <StatCard label="Başarısız" value={stats.failed} color="#EF4444" />
        <StatCard label="İptal" value={stats.cancelled} color="#9CA3AF" />
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap gap-3 items-center">
        {["all", "scout", "writer", "seo", "editor", "publisher", "completed", "failed"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s === "all" ? "Tümü" : getStateLabel(s as PipelineState)}
          </button>
        ))}
        <input type="text" placeholder="Job ID veya kaynak ara..." value={search} onChange={e => setSearch(e.target.value)}
          className="ml-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-700">📋 Job Listesi ({filtered.length})</h2>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Job ID</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Kaynak</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Durum</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Adım</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Süre</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.slice(0, 50).map(j => (
                  <tr key={j.id} onClick={() => setSelectedJob(allJobs.find(a => a.id === j.id) || null)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2 font-mono text-xs">{j.id.substring(0, 12)}...</td>
                    <td className="px-4 py-2">{j.source}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        j.state === "completed" ? "bg-green-100 text-green-700" :
                        j.state === "failed" ? "bg-red-100 text-red-700" :
                        j.state === "cancelled" ? "bg-gray-100 text-gray-600" :
                        "bg-blue-100 text-blue-700"}`}>
                        {getStateLabel(j.state as PipelineState)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">{j.steps} adım</td>
                    <td className="px-4 py-2 text-xs text-gray-500">{(j.duration / 1000).toFixed(1)}s</td>
                    <td className="px-4 py-2 text-xs text-gray-400">{new Date(j.createdAt).toLocaleTimeString("tr-TR")}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Henüz job bulunmuyor.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Pipeline Viz + Agent Status */}
        <div className="space-y-4">
          {/* Pipeline Visualization */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">🔀 Pipeline</h3>
            <div className="space-y-1">
              {PIPELINE_STEPS.map((step, i) => {
                const count = stateCounts[step] || 0;
                const isActive = count > 0;
                return (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isActive ? "bg-blue-500" : "bg-gray-200"}`} />
                    <span className="text-xs text-gray-600 flex-1">{getStateLabel(step)}</span>
                    <span className="text-[10px] text-gray-400">{count}</span>
                    {i < PIPELINE_STEPS.length - 1 && <div className="w-px h-3 bg-gray-200 ml-1" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">📊 Durum Dağılımı</h3>
            <div className="space-y-2">
              {Object.entries(stateCounts).map(([state, count]) => (
                <div key={state} className="flex items-center gap-2">
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (count / Math.max(1, jobs.length)) * 100)}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right">{getStateLabel(state as PipelineState)}</span>
                  <span className="text-xs font-bold text-gray-700 w-6">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">📡 Son Olaylar</h3>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {events.slice(-15).reverse().map(e => (
                <div key={e.id} className="text-[10px] text-gray-500 flex items-center gap-1.5">
                  <span className={e.type.includes("FAILED") ? "text-red-500" : e.type.includes("COMPLETED") ? "text-green-500" : "text-blue-500"}>
                    {e.type.includes("FAILED") ? "❌" : e.type.includes("COMPLETED") ? "✅" : "🔵"}
                  </span>
                  <span className="font-mono">{e.jobId.substring(0, 8)}</span>
                  <span>{e.type.replace("PIPELINE_", "").replace("AGENT_", "")}</span>
                  <span className="text-gray-300 ml-auto">{new Date(e.timestamp).toLocaleTimeString("tr-TR")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">📋 Job Detayı</h3>
              <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Job ID:</span> <span className="font-mono">{selectedJob.id}</span></div>
              <div><span className="text-gray-500">Durum:</span> <span className="font-bold">{getStateLabel(selectedJob.state)}</span></div>
              <div><span className="text-gray-500">Retry:</span> {selectedJob.retryCount}/{selectedJob.maxRetries}</div>
              <div><span className="text-gray-500">Oluşturma:</span> {new Date(selectedJob.createdAt).toLocaleString("tr-TR")}</div>
              <div className="border-t pt-3"><h4 className="font-bold text-gray-700 mb-2">Pipeline Adımları</h4>
                {selectedJob.history.length === 0 ? <p className="text-gray-400">Henüz adım kaydı yok.</p> : (
                  <div className="space-y-2">
                    {selectedJob.history.map((h, i) => (
                      <div key={i} className={`flex items-center gap-3 p-2 rounded-lg text-xs ${h.success ? "bg-green-50" : "bg-red-50"}`}>
                        <span className="font-medium w-20">{getStateLabel(h.state)}</span>
                        <span className={h.success ? "text-green-600" : "text-red-600"}>
                          {h.success ? "✅" : "❌"} {h.summary || h.error}
                        </span>
                        <span className="text-gray-400 ml-auto">{h.duration ? `${(h.duration / 1000).toFixed(1)}s` : ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
