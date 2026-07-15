/**
 * Orchestrator — Pipeline State Machine
 *
 * Pipeline durum geçişlerini yönetir.
 * Geçersiz geçişleri engeller.
 */
import { PIPELINE_STATE } from "./types";
import type { PipelineState } from "./types";

const S = PIPELINE_STATE;

// ─── Valid Transitions ─────────────────────────────────────

const VALID_TRANSITIONS: Record<PipelineState, PipelineState[]> = {
  [S.QUEUED]: [S.SCOUT],
  [S.SCOUT]: [S.RESEARCH, S.FAILED, S.CANCELLED],
  [S.RESEARCH]: [S.VERIFICATION, S.FAILED, S.CANCELLED],
  [S.VERIFICATION]: [S.WRITER, S.FAILED, S.CANCELLED],
  [S.WRITER]: [S.SEO, S.FAILED, S.CANCELLED],
  [S.SEO]: [S.EDITOR, S.FAILED, S.CANCELLED],
  [S.EDITOR]: [S.PUBLISHER, S.FAILED, S.CANCELLED],
  [S.PUBLISHER]: [S.COMPLETED, S.FAILED, S.CANCELLED],
  [S.COMPLETED]: [],
  [S.FAILED]: [S.QUEUED], // Retry: failed → queue
  [S.CANCELLED]: [],
};

// ─── Pipeline Order ───────────────────────────────────────

export const PIPELINE_ORDER: PipelineState[] = [
  S.SCOUT, S.RESEARCH, S.VERIFICATION, S.WRITER, S.SEO, S.EDITOR, S.PUBLISHER,
];

// ─── State Machine API ─────────────────────────────────────

export function canTransition(from: PipelineState, to: PipelineState): boolean {
  return (VALID_TRANSITIONS[from] || []).includes(to);
}

export function getNextState(current: PipelineState): PipelineState | null {
  const idx = PIPELINE_ORDER.indexOf(current);
  if (idx === -1 || idx >= PIPELINE_ORDER.length - 1) return null;
  return PIPELINE_ORDER[idx + 1];
}

export function getAgentForState(state: PipelineState): string {
  const agents: Record<string, string> = {
    [S.SCOUT]: "Scout Agent", [S.RESEARCH]: "Research Agent",
    [S.VERIFICATION]: "Verification Agent", [S.WRITER]: "Writer Agent",
    [S.SEO]: "SEO Agent", [S.EDITOR]: "Editor-in-Chief Agent",
    [S.PUBLISHER]: "Publisher Agent",
  };
  return agents[state] || "Unknown Agent";
}

export function isTerminalState(state: PipelineState): boolean {
  return (["completed", "failed", "cancelled"] as PipelineState[]).includes(state);
}

export function canRetry(state: PipelineState): boolean {
  return state === S.FAILED;
}

export function getStateLabel(state: PipelineState): string {
  const labels: Record<PipelineState, string> = {
    [S.QUEUED]: "Kuyrukta", [S.SCOUT]: "Keşif", [S.RESEARCH]: "Araştırma",
    [S.VERIFICATION]: "Doğrulama", [S.WRITER]: "Yazım", [S.SEO]: "SEO",
    [S.EDITOR]: "Editör", [S.PUBLISHER]: "Yayın",
    [S.COMPLETED]: "Tamamlandı", [S.FAILED]: "Başarısız", [S.CANCELLED]: "İptal",
  };
  return labels[state] || state;
}
