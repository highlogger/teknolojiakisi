/**
 * AI Newsroom Orchestrator — Merkezi Pipeline Yöneticisi
 *
 * Tüm AI Newsroom pipeline'ını yönetir.
 * Scout → Research → Verification → Writer → SEO → Editor → Publisher → Completed
 *
 * KULLANIM:
 *   import { orchestrator } from "@/services/agents/orchestrator";
 *   const result = await orchestrator.run(job);
 */

import type { AgentInput } from "@/services/agents/base/types";
import type { PipelineJob, PipelineState, AgentResult, OrchestratorConfig, PipelineEvent } from "./types";
import { PIPELINE_STATE, DEFAULT_ORCHESTRATOR_CONFIG } from "./types";
import { canTransition, getNextState, getAgentForState, isTerminalState, PIPELINE_ORDER } from "./state-machine";
import { runAgent, registerAgent, getAgent } from "./runner";
import { saveJob, getJob, canResume, getResumeState } from "./recovery";
import { pipelineEvents } from "./events";
import { pipelineLogger } from "./logger";

// ─── Orchestrator ───────────────────────────────────────────

class PipelineOrchestrator {
  private config: OrchestratorConfig;

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = { ...DEFAULT_ORCHESTRATOR_CONFIG, ...config };
  }

  /** Ana pipeline çalıştırma */
  async run(job: PipelineJob): Promise<PipelineJob> {
    pipelineLogger.pipelineStart(job);
    await pipelineEvents.emit({ type: "PIPELINE_STARTED", jobId: job.id, state: job.state });

    let currentJob = { ...job, history: [...(job.history || [])], errors: [...(job.errors || [])], retryCount: job.retryCount || 0, maxRetries: job.maxRetries || this.config.maxRetries };
    saveJob(currentJob);

    // Pipeline'ı adım adım ilerlet
    while (!isTerminalState(currentJob.state)) {
      const state = currentJob.state;

      if (!PIPELINE_ORDER.includes(state)) {
        pipelineLogger.agentWarn(job.id, state, `Bilinmeyen state: ${state}, atlaniyor.`);
        const next = getNextState(state);
        if (!next) break;
        currentJob = { ...currentJob, state: next, updatedAt: new Date().toISOString() };
        saveJob(currentJob);
        continue;
      }

      // Agent'ı çalıştır
      const inputs = this.buildInputs(currentJob);
      const result = await runAgent(state, job.id, inputs, this.config);

      // History'ye ekle
      currentJob.history.push({
        state, agent: result.agent,
        startedAt: new Date(Date.now() - result.duration).toISOString(),
        completedAt: new Date().toISOString(),
        duration: result.duration,
        success: result.success,
        summary: result.success ? "OK" : result.errors[0],
        error: result.errors[0],
      });

      // Veriyi sakla
      (currentJob as Record<string, unknown>)[state] = result.data;

      if (!result.success) {
        currentJob.errors.push({
          state, agent: result.agent,
          message: result.errors[0] || "Bilinmeyen",
          timestamp: new Date().toISOString(),
          retryable: currentJob.retryCount < currentJob.maxRetries,
        });

        if (this.config.stopOnFailure) {
          currentJob = { ...currentJob, state: "failed", updatedAt: new Date().toISOString(), retryCount: currentJob.retryCount + 1 };
          saveJob(currentJob);
          pipelineLogger.pipelineFail(currentJob, result.errors[0] || "Bilinmeyen");
          await pipelineEvents.emit({ type: "PIPELINE_FAILED", jobId: job.id, state: "failed" });
          return currentJob;
        }
      }

      // Sonraki state'e geç
      const nextState = result.nextState;
      if (!nextState || isTerminalState(nextState as PipelineState)) {
        currentJob = { ...currentJob, state: (nextState as PipelineState) || "completed", updatedAt: new Date().toISOString(), completedAt: new Date().toISOString() };
        saveJob(currentJob);
        break;
      }

      if (!canTransition(currentJob.state, nextState as PipelineState)) {
        pipelineLogger.agentWarn(job.id, state, `Geçersiz geçiş: ${state} → ${nextState}, duruluyor.`);
        break;
      }

      currentJob = { ...currentJob, state: nextState as PipelineState, updatedAt: new Date().toISOString() };
      saveJob(currentJob);
    }

    // Pipeline tamamlandı
    if (currentJob.state === "completed") {
      pipelineLogger.pipelineComplete(currentJob);
      await pipelineEvents.emit({ type: "PIPELINE_COMPLETED", jobId: job.id, state: "completed" });
    }

    return currentJob;
  }

  /** Recovery: kaldığı yerden devam */
  async resume(jobId: string): Promise<PipelineJob | null> {
    const job = getJob(jobId);
    if (!job || !canResume(job)) return null;

    const resumeState = getResumeState(job);
    const resumedJob: PipelineJob = {
      ...job, state: resumeState,
      retryCount: job.retryCount + 1,
      updatedAt: new Date().toISOString(),
    };

    pipelineLogger.agentStart(jobId, resumeState, getAgentForState(resumeState));
    await pipelineEvents.emit({ type: "JOB_RECOVERED", jobId, state: resumeState });

    return this.run(resumedJob);
  }

  /** Dry run - yayın yapmadan test */
  async dryRun(job: PipelineJob): Promise<PipelineJob> {
    const dryConfig = { ...this.config, dryRun: true, autoPublish: false };
    const dryOrchestrator = new PipelineOrchestrator(dryConfig);
    const result = await dryOrchestrator.run(job);
    pipelineLogger.agentWarn(job.id, "completed", "DRY RUN — gerçek yayın yapılmadı.");
    return result;
  }

  /** Agent kaydı */
  register(name: string, executor: (input: AgentInput) => Promise<{ success: boolean; outputs: Record<string, unknown>; summary: { status: string; score?: number; confidence?: number; warnings: string[]; errors: string[] }; duration: number }>): void {
    registerAgent(name, executor);
  }

  /** Pipeline durumu */
  getStatus(jobId: string): { job: PipelineJob | null; history: PipelineEvent[] } {
    return { job: getJob(jobId), history: pipelineEvents.getHistory(jobId) };
  }

  /** Event dinleyici */
  on(event: PipelineEvent["type"], handler: (event: PipelineEvent) => void | Promise<void>): void {
    pipelineEvents.on(event, handler);
  }

  /** Config güncelle */
  configure(config: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private buildInputs(job: PipelineJob): Record<string, unknown> {
    return {
      scout: job.scout || {},
      research: job.research || {},
      verification: job.verification || {},
      writer: job.writer || {},
      seo: job.seo || {},
      editor: job.editor || {},
      publisher: job.publisher || {},
      article: job.article || {},
      source: job.scout ? (job.scout as Record<string, unknown>).source : {},
    };
  }
}

// ─── Auto-register existing agents ──────────────────────────

async function autoRegisterAgents(orchestrator: PipelineOrchestrator) {
  // Writer Agent
  try {
    const { execute: writerExecute } = await import("@/services/agents/writer");
    orchestrator.register("Writer Agent", writerExecute);
  } catch { /* Writer agent bulunamadi */ }

  // SEO Agent
  try {
    const { execute: seoExecute } = await import("@/services/agents/seo");
    orchestrator.register("SEO Agent", seoExecute);
  } catch { /* SEO agent bulunamadi */ }

  // Publisher Agent
  try {
    const { execute: pubExecute } = await import("@/services/agents/publisher");
    orchestrator.register("Publisher Agent", pubExecute);
  } catch { /* Publisher bulunamadi */ }

  // Editor-in-Chief Agent
  try {
    const { execute: editorExecute } = await import("@/services/agents/editor-in-chief");
    orchestrator.register("Editor-in-Chief Agent", editorExecute);
  } catch { /* Editor bulunamadi */ }

  // Scout Agent
  try {
    const { execute: scoutExecute } = await import("@/services/agents/scout");
    orchestrator.register("Scout Agent", scoutExecute);
  } catch { /* Scout bulunamadi */ }
}

// ─── Singleton ──────────────────────────────────────────────

export const orchestrator = new PipelineOrchestrator();
autoRegisterAgents(orchestrator);

// ─── Re-export ──────────────────────────────────────────────

export { PipelineOrchestrator };
export { registerAgent, getAgent } from "./runner";
export { saveJob, getJob, getAllJobs, getActiveJobs, getJobStats } from "./recovery";
export { pipelineEvents } from "./events";
export { pipelineLogger } from "./logger";
export { canTransition, getNextState, PIPELINE_ORDER, isTerminalState } from "./state-machine";
export type { PipelineJob, PipelineState, AgentResult, OrchestratorConfig, PipelineEvent } from "./types";
export { PIPELINE_STATE, DEFAULT_ORCHESTRATOR_CONFIG } from "./types";

export default orchestrator;
