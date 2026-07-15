/**
 * Orchestrator — Event Bus
 *
 * Pipeline olaylarını yönetir: PIPELINE_STARTED, AGENT_COMPLETED, ...
 * Subscribe/publish pattern.
 */
import type { PipelineEvent, PipelineEventType, EventHandler, PipelineState } from "./types";

class PipelineEventBus {
  private handlers = new Map<PipelineEventType, EventHandler[]>();
  private eventLog: PipelineEvent[] = [];
  private maxLogSize = 1000;

  /** Event dinleyicisi ekle */
  on(type: PipelineEventType, handler: EventHandler): void {
    const existing = this.handlers.get(type) || [];
    existing.push(handler);
    this.handlers.set(type, existing);
  }

  /** Tüm event'leri dinle */
  onAll(handler: EventHandler): void {
    this.on("PIPELINE_STARTED", handler); this.on("PIPELINE_COMPLETED", handler);
    this.on("PIPELINE_FAILED", handler); this.on("AGENT_STARTED", handler);
    this.on("AGENT_COMPLETED", handler); this.on("AGENT_FAILED", handler);
    this.on("JOB_QUEUED", handler); this.on("JOB_RETRY", handler);
    this.on("JOB_RECOVERED", handler); this.on("JOB_CANCELLED", handler);
  }

  /** Event yayınla */
  async emit(event: Omit<PipelineEvent, "id" | "timestamp">): Promise<void> {
    const fullEvent: PipelineEvent = {
      ...event, id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    this.eventLog.push(fullEvent);
    if (this.eventLog.length > this.maxLogSize) this.eventLog = this.eventLog.slice(-this.maxLogSize);

    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map(h => Promise.resolve(h(fullEvent)).catch(() => {})));
  }

  /** Event log'unu getir */
  getHistory(jobId?: string): PipelineEvent[] {
    if (jobId) return this.eventLog.filter(e => e.jobId === jobId);
    return [...this.eventLog];
  }

  /** Event log'unu temizle */
  clear(): void { this.eventLog = []; }
}

export const pipelineEvents = new PipelineEventBus();
