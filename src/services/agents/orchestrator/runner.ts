/**
 * Orchestrator — Agent Runner
 *
 * Agent'ları timeout, retry ve hata yönetimiyle çalıştırır.
 * Hiçbir agent birbirini çağırmaz — sadece Runner çalıştırır.
 */
import type { AgentInput } from "@/services/agents/base/types";
import type { AgentResult, OrchestratorConfig, PipelineState } from "./types";
import { DEFAULT_ORCHESTRATOR_CONFIG } from "./types";
import { pipelineEvents } from "./events";
import { getAgentForState } from "./state-machine";
import { pipelineLogger } from "./logger";

// ─── Agent Registry ────────────────────────────────────────

const agentRegistry = new Map<string, (input: AgentInput) => Promise<{ success: boolean; outputs: Record<string, unknown>; summary: { status: string; score?: number; confidence?: number; warnings: string[]; errors: string[] }; duration: number }>>();

export function registerAgent(name: string, executor: (input: AgentInput) => Promise<{ success: boolean; outputs: Record<string, unknown>; summary: { status: string; score?: number; confidence?: number; warnings: string[]; errors: string[] }; duration: number }>): void {
  agentRegistry.set(name, executor);
}

export function getAgent(name: string) {
  return agentRegistry.get(name) || null;
}

// ─── Agent Runner ──────────────────────────────────────────

export async function runAgent(
  state: PipelineState,
  jobId: string,
  inputs: Record<string, unknown>,
  config: OrchestratorConfig = DEFAULT_ORCHESTRATOR_CONFIG
): Promise<AgentResult> {
  const agentName = getAgentForState(state);
  const startTime = Date.now();

  pipelineLogger.agentStart(jobId, state, agentName);

  // Agent yoksa simüle et (Research, Verification henuz yok)
  const executor = getAgent(agentName);
  if (!executor) {
    pipelineLogger.agentWarn(jobId, state, `${agentName} henuz implemente edilmedi, atlaniyor.`);
    const result: AgentResult = {
      state, agent: agentName, success: true,
      duration: Date.now() - startTime,
      data: { skipped: true, reason: "Agent not implemented" },
      warnings: [`${agentName} henuz implemente edilmedi — atlandi.`],
      errors: [],
      metadata: { version: "0.0.0", retryCount: 0, timeout: 0 },
      nextState: state === "publisher" ? "completed" : getNextPipelineState(state),
    };
    await pipelineEvents.emit({ type: "AGENT_COMPLETED", jobId, state, agent: agentName });
    return result;
  }

  // Timeout + retry ile calistir
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout: ${agentName} ${config.agentTimeoutMs}ms'i asti`)), config.agentTimeoutMs)
      );

      const agentInput: AgentInput = { inputs, config: { dryRun: config.dryRun } };
      const result = await Promise.race([executor(agentInput), timeoutPromise]);

      const duration = Date.now() - startTime;
      pipelineLogger.agentComplete(jobId, state, agentName, duration, result.success);

      const nextState = result.success ? getNextPipelineState(state) : "failed";

      await pipelineEvents.emit({
        type: result.success ? "AGENT_COMPLETED" : "AGENT_FAILED",
        jobId, state, agent: agentName,
        data: { duration, summary: result.summary },
      });

      return {
        state, agent: agentName, success: result.success, duration,
        data: result.outputs,
        warnings: result.summary.warnings || [],
        errors: result.summary.errors || [],
        metadata: { version: "1.0.0", retryCount: attempt, timeout: config.agentTimeoutMs },
        nextState: nextState as PipelineState | null,
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      pipelineLogger.agentError(jobId, state, agentName, lastError.message, attempt);

      if (attempt < config.maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        await new Promise(r => setTimeout(r, delay));
        pipelineLogger.agentRetry(jobId, state, agentName, attempt + 1);
      }
    }
  }

  // Tum retry'ler basarisiz
  const duration = Date.now() - startTime;
  pipelineLogger.agentFail(jobId, state, agentName, lastError?.message || "Bilinmeyen");

  await pipelineEvents.emit({ type: "AGENT_FAILED", jobId, state, agent: agentName, data: { error: lastError?.message } });

  return {
    state, agent: agentName, success: false, duration,
    data: {},
    warnings: [], errors: [lastError?.message || "Tum retry'ler basarisiz"],
    metadata: { version: "1.0.0", retryCount: config.maxRetries, timeout: config.agentTimeoutMs },
    nextState: config.stopOnFailure ? "failed" : getNextPipelineState(state),
  };
}

function getNextPipelineState(current: PipelineState): PipelineState | null {
  const order: PipelineState[] = ["scout", "research", "verification", "writer", "seo", "editor", "publisher"];
  const idx = order.indexOf(current);
  if (idx === -1 || idx >= order.length - 1) return "completed";
  return order[idx + 1];
}
