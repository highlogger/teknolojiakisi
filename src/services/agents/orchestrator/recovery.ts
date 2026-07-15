/**
 * Orchestrator — Pipeline Recovery
 *
 * Yarım kalan Job'ları tespit eder ve kaldığı yerden devam ettirir.
 */
import { PIPELINE_ORDER, isTerminalState, getAgentForState } from "./state-machine";
import { pipelineLogger } from "./logger";
import { pipelineEvents } from "./events";
import type { PipelineJob, PipelineState } from "./types";

// In-memory job store (production'da DB/Redis)
const jobStore = new Map<string, PipelineJob>();

// ─── Job Store ─────────────────────────────────────────────

export function saveJob(job: PipelineJob): void { jobStore.set(job.id, { ...job }); }
export function getJob(jobId: string): PipelineJob | null { return jobStore.get(jobId) || null; }
export function getAllJobs(): PipelineJob[] { return [...jobStore.values()]; }
export function getActiveJobs(): PipelineJob[] { return [...jobStore.values()].filter(j => !isTerminalState(j.state)); }
export function deleteJob(jobId: string): void { jobStore.delete(jobId); }

// ─── Recovery ──────────────────────────────────────────────

export function findStuckJobs(maxAgeMinutes = 60): PipelineJob[] {
  const cutoff = Date.now() - maxAgeMinutes * 60 * 1000;
  return getActiveJobs().filter(j => new Date(j.updatedAt).getTime() < cutoff);
}

export function canResume(job: PipelineJob): boolean {
  if (isTerminalState(job.state)) return false;
  if (job.retryCount >= job.maxRetries) return false;
  return true;
}

export function getResumeState(job: PipelineJob): PipelineState {
  // Son başarılı adımdan sonraki adım
  const lastSuccess = [...job.history].reverse().find(h => h.success);
  if (!lastSuccess) return job.state;

  const idx = PIPELINE_ORDER.indexOf(lastSuccess.state);
  if (idx === -1 || idx >= PIPELINE_ORDER.length - 1) return "completed";
  return PIPELINE_ORDER[idx + 1];
}

export async function recoverJob(jobId: string): Promise<PipelineJob | null> {
  const job = getJob(jobId);
  if (!job || !canResume(job)) return null;

  const resumeState = getResumeState(job);
  pipelineLogger.agentStart(jobId, resumeState, getAgentForState(resumeState));

  const recoveredJob: PipelineJob = {
    ...job, state: resumeState, retryCount: job.retryCount + 1,
    updatedAt: new Date().toISOString(),
  };
  saveJob(recoveredJob);

  await pipelineEvents.emit({
    type: "JOB_RECOVERED", jobId,
    state: resumeState, agent: getAgentForState(resumeState),
    data: { previousState: job.state },
  });

  return recoveredJob;
}

export function getJobStats(): { total: number; active: number; completed: number; failed: number; cancelled: number } {
  const jobs = [...jobStore.values()];
  return {
    total: jobs.length,
    active: jobs.filter(j => !isTerminalState(j.state)).length,
    completed: jobs.filter(j => j.state === "completed").length,
    failed: jobs.filter(j => j.state === "failed").length,
    cancelled: jobs.filter(j => j.state === "cancelled").length,
  };
}
