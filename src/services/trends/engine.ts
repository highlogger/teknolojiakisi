/** Trend Intelligence — Engine */

import type { TrendSignal, TrendReport, TrendScore } from "./types";
import { TREND_SOURCE as TS } from "./types";

const signals: TrendSignal[] = [];
const TRENDING_THRESHOLD = 65; const EMERGING_THRESHOLD = 40;

export function addSignal(signal: Omit<TrendSignal, "id" | "score"> & { score?: TrendScore }): TrendSignal {
  const s: TrendSignal = {
    ...signal, id: `trend_${Date.now().toString(36)}`,
    score: signal.score || calcTrendScore({ volume: 50, velocity: 50, acceleration: 50, relevance: 50, authority: 50 }),
  };
  signals.push(s); return s;
}

function calcTrendScore(m: { volume: number; velocity: number; acceleration: number; relevance: number; authority: number }): TrendScore {
  const overall = Math.round(m.volume * 0.3 + m.velocity * 0.25 + m.acceleration * 0.15 + m.relevance * 0.2 + m.authority * 0.1);
  return { ...m, overall };
}

export function getTrendReport(): TrendReport {
  const sorted = [...signals].sort((a, b) => b.score.overall - a.score.overall);
  return {
    generatedAt: new Date().toISOString(),
    trending: sorted.filter((s) => s.score.overall >= TRENDING_THRESHOLD),
    emerging: sorted.filter((s) => s.score.overall >= EMERGING_THRESHOLD && s.score.overall < TRENDING_THRESHOLD),
    declining: sorted.filter((s) => s.score.overall < EMERGING_THRESHOLD),
    topTopics: sorted.slice(0, 10).map((s) => s.topic),
  };
}

export function getTopTrends(limit = 10): TrendSignal[] {
  return [...signals].sort((a, b) => b.score.overall - a.score.overall).slice(0, limit);
}

export { TS as TREND_SOURCE };
