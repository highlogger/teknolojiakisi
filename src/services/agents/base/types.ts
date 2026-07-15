/**
 * AI Newsroom — Agent Base Interface
 *
 * Tüm agent'lar bu interface'i implemente eder.
 * AI Core Engine ile uyumlu.
 */

// ─── Agent Input ────────────────────────────────────────────

export interface AgentInput {
  /** Önceki agent'ların çıktı dosyalarının path'leri veya içerikleri */
  inputs: Record<string, unknown>;
  /** Agent'a özel konfigürasyon */
  config?: Record<string, unknown>;
}

// ─── Agent Output ───────────────────────────────────────────

export interface AgentOutput {
  /** Agent başarılı mı? */
  success: boolean;
  /** Çıktı dosyalarının path'leri (veya inline data) */
  outputs: Record<string, unknown>;
  /** JSON olarak sonuç (standart alanlar) */
  summary: AgentSummary;
  /** Süre (ms) */
  duration: number;
}

export interface AgentSummary {
  status: string;
  score?: number;
  confidence?: number;
  warnings: string[];
  errors: string[];
}

// ─── Agent Interface ────────────────────────────────────────

export interface AgentInterface {
  readonly name: string;
  readonly version: string;
  execute(input: AgentInput): Promise<AgentOutput>;
  dryRun(input: AgentInput): Promise<AgentOutput>;
}

// ─── Pipeline ───────────────────────────────────────────────

export interface PipelineStage {
  agent: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  input: AgentInput;
  output: AgentOutput | null;
  error?: string;
}

export interface PipelineResult {
  success: boolean;
  stages: PipelineStage[];
  totalDuration: number;
}

// ─── Common Types ───────────────────────────────────────────

export interface SourceInfo {
  name: string;
  url: string;
  type: "rss" | "web" | "api" | "manual";
  language: string;
  reliability?: "official" | "press" | "community" | "unknown";
}

export interface ResearchFinding {
  section: string;
  content: string;
  sources: SourceInfo[];
  confidence: number; // 0-100
}

export interface VerificationCheck {
  name: string;
  passed: boolean;
  score: number; // 0-100
  details: string;
  warnings: string[];
}

export interface EditorialDecision {
  decision: "APPROVED" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECTED";
  confidence: number;
  editorialScore: number;
  priority: "breaking" | "high" | "normal" | "low" | "evergreen";
  summary: string;
  warnings: string[];
  requiredChanges: Array<{
    section: string;
    issue: string;
    priority: "high" | "medium" | "low";
  }>;
}
