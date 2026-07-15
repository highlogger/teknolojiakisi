/**
 * Content Engine — Workflow System
 *
 * İçerik akışını merkezi olarak yönetir.
 * Her adım loglanır.
 */

import type { ContentStatus, WorkflowEvent } from "./types";
import { statusLabel } from "./status";

// ─── In-Memory Workflow Store ──────────────────────────────

/**
 * Workflow event'leri hafızada tutar.
 * Production'da veritabanına bağlanacak.
 */
const workflowStore = new Map<string, WorkflowEvent[]>();

// ─── Public API ────────────────────────────────────────────

/**
 * Workflow event'i kaydet
 */
export function logWorkflowEvent(
  articleId: string,
  fromStatus: ContentStatus | null,
  toStatus: ContentStatus,
  actor: string,
  note?: string,
  metadata?: Record<string, unknown>
): WorkflowEvent {
  const event: WorkflowEvent = {
    id: `wf_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`,
    articleId,
    fromStatus,
    toStatus,
    actor,
    timestamp: new Date().toISOString(),
    note: note || defaultNote(fromStatus, toStatus, actor),
    metadata,
  };

  const events = workflowStore.get(articleId) || [];
  events.push(event);
  workflowStore.set(articleId, events);

  return event;
}

/**
 * Makalenin workflow geçmişini getir
 */
export function getWorkflowHistory(articleId: string): WorkflowEvent[] {
  return workflowStore.get(articleId) || [];
}

/**
 * Makalenin son durumunu getir
 */
export function getCurrentStatus(articleId: string): ContentStatus | null {
  const events = workflowStore.get(articleId);
  if (!events || events.length === 0) return null;
  return events[events.length - 1].toStatus;
}

/**
 * Belirli bir statüye kaç kez geçildiğini say
 */
export function countTransitions(
  articleId: string,
  status: ContentStatus
): number {
  const events = workflowStore.get(articleId) || [];
  return events.filter((e) => e.toStatus === status).length;
}

/**
 * Workflow özeti
 */
export function getWorkflowSummary(articleId: string): {
  totalEvents: number;
  firstEvent: WorkflowEvent | null;
  lastEvent: WorkflowEvent | null;
  duration: string | null;
  statusPath: string[];
} {
  const events = workflowStore.get(articleId) || [];
  const firstEvent = events[0] || null;
  const lastEvent = events[events.length - 1] || null;

  let duration: string | null = null;
  if (firstEvent && lastEvent) {
    const diff =
      new Date(lastEvent.timestamp).getTime() -
      new Date(firstEvent.timestamp).getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    duration = `${hours}s ${mins}dk`;
  }

  return {
    totalEvents: events.length,
    firstEvent,
    lastEvent,
    duration,
    statusPath: events.map((e) => e.toStatus),
  };
}

// ─── Helpers ───────────────────────────────────────────────

function defaultNote(
  from: ContentStatus | null,
  to: ContentStatus,
  actor: string
): string {
  const fromLabel = from ? statusLabel(from) : "Başlangıç";
  const toLabel = statusLabel(to);
  return `${actor} tarafından "${fromLabel}" → "${toLabel}"`;
}
