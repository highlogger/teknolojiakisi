/**
 * Orchestrator — Type Definitions
 *
 * Pipeline durumları, Job modeli, AgentResult, Event tipleri.
 */
import type { AgentInput, AgentOutput } from "@/services/agents/base/types";

// ─── Pipeline States ──────────────────────────────────────

export const PIPELINE_STATE = {
  QUEUED: "queued", SCOUT: "scout", RESEARCH: "research",
  VERIFICATION: "verification", WRITER: "writer", SEO: "seo",
  EDITOR: "editor", PUBLISHER: "publisher", COMPLETED: "completed",
  FAILED: "failed", CANCELLED: "cancelled",
} as const;
export type PipelineState = typeof PIPELINE_STATE[keyof typeof PIPELINE_STATE];

// ─── Job Model ────────────────────────────────────────────

export interface PipelineJob {
  id: string;
  state: PipelineState;
  scoutId?: string;
  scout?: Record<string, unknown>;
  article?: { title: string; content: string; excerpt?: string };
  research?: Record<string, unknown>;
  verification?: Record<string, unknown>;
  writer?: Record<string, unknown>;
  seo?: Record<string, unknown>;
  editor?: Record<string, unknown>;
  publisher?: Record<string, unknown>;
  history: PipelineStep[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  retryCount: number;
  maxRetries: number;
  errors: PipelineError[];
}

export interface PipelineStep {
  state: PipelineState;
  agent: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  success: boolean;
  summary?: string;
  error?: string;
}

export interface PipelineError {
  state: PipelineState;
  agent: string;
  message: string;
  timestamp: string;
  retryable: boolean;
}

// ─── Agent Result ─────────────────────────────────────────

export interface AgentResult {
  state: PipelineState;
  agent: string;
  success: boolean;
  duration: number;
  data: Record<string, unknown>;
  warnings: string[];
  errors: string[];
  metadata: { version: string; retryCount: number; timeout: number };
  nextState: PipelineState | null; // null = dur
}

// ─── Orchestrator Config ─────────────────────────────────

export interface OrchestratorConfig {
  maxRetries: number;
  agentTimeoutMs: number;
  dryRun: boolean;
  autoPublish: boolean;
  stopOnFailure: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
}

export const DEFAULT_ORCHESTRATOR_CONFIG: OrchestratorConfig = {
  maxRetries: 3, agentTimeoutMs: 120000, dryRun: true,
  autoPublish: false, stopOnFailure: true, logLevel: "info",
};

// ─── Pipeline Events ─────────────────────────────────────

export type PipelineEventType =
  | "PIPELINE_STARTED" | "PIPELINE_COMPLETED" | "PIPELINE_FAILED"
  | "AGENT_STARTED" | "AGENT_COMPLETED" | "AGENT_FAILED"
  | "JOB_QUEUED" | "JOB_RETRY" | "JOB_RECOVERED" | "JOB_CANCELLED";

export interface PipelineEvent {
  id: string; type: PipelineEventType; jobId: string;
  state: PipelineState; agent?: string;
  timestamp: string; data?: Record<string, unknown>;
}

export type EventHandler = (event: PipelineEvent) => void | Promise<void>;
