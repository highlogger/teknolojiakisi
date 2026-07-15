/**
 * Orchestrator — Pipeline Logger
 *
 * Her agent başlangıç/bitiş/süre/sonuç log'lar.
 */
import type { PipelineState, PipelineJob } from "./types";

interface LogEntry {
  ts: string; level: string; jobId: string; state: PipelineState;
  agent?: string; message: string; duration?: number; data?: Record<string, unknown>;
}

class PipelineLogger {
  private logs: LogEntry[] = [];
  private maxSize = 5000;

  agentStart(jobId: string, state: PipelineState, agent: string): void {
    this.log("info", jobId, state, agent, `[${agent}] Başlatılıyor...`);
  }

  agentComplete(jobId: string, state: PipelineState, agent: string, duration: number, success: boolean): void {
    this.log(success ? "info" : "warn", jobId, state, agent, `[${agent}] Tamamlandı (${(duration / 1000).toFixed(1)}s)`, duration);
  }

  agentError(jobId: string, state: PipelineState, agent: string, error: string, attempt: number): void {
    this.log("error", jobId, state, agent, `[${agent}] Hata (deneme ${attempt + 1}): ${error}`);
  }

  agentRetry(jobId: string, state: PipelineState, agent: string, attempt: number): void {
    this.log("warn", jobId, state, agent, `[${agent}] Retry #${attempt}...`);
  }

  agentFail(jobId: string, state: PipelineState, agent: string, error: string): void {
    this.log("error", jobId, state, agent, `[${agent}] BAŞARISIZ: ${error}`);
  }

  agentWarn(jobId: string, state: PipelineState, message: string): void {
    this.log("warn", jobId, state, undefined, message);
  }

  pipelineStart(job: PipelineJob): void {
    this.log("info", job.id, job.state, undefined, `Pipeline başlatıldı: ${job.id}`);
  }

  pipelineComplete(job: PipelineJob): void {
    this.log("info", job.id, "completed", undefined, `Pipeline tamamlandı: ${job.id}`);
  }

  pipelineFail(job: PipelineJob, error: string): void {
    this.log("error", job.id, "failed", undefined, `Pipeline başarısız: ${error}`);
  }

  private log(level: string, jobId: string, state: PipelineState, agent: string | undefined, message: string, duration?: number): void {
    const entry: LogEntry = { ts: new Date().toISOString(), level, jobId, state, agent, message, duration };
    this.logs.push(entry);
    if (this.logs.length > this.maxSize) this.logs = this.logs.slice(-this.maxSize);

    const prefix = level === "error" ? "❌" : level === "warn" ? "⚠️" : "📋";
    console.log(`${prefix} [${entry.ts.split("T")[1].split(".")[0]}] ${message}`);
  }

  getJobLogs(jobId: string): LogEntry[] { return this.logs.filter(l => l.jobId === jobId); }
  getAllLogs(): LogEntry[] { return [...this.logs]; }
}

export const pipelineLogger = new PipelineLogger();
