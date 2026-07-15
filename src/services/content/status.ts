/**
 * Content Engine — Status Transition System
 *
 * Makale durum geçişlerini yönetir.
 * Her geçiş için kurallar tanımlanmıştır.
 * Editor Review olmadan yayınlanamaz.
 */

import type { ContentStatus, StatusTransition, TransitionResult, WorkflowEvent } from "./types";
import { CONTENT_STATUS } from "./types";

const S = CONTENT_STATUS;

// ─── Transition Rules ──────────────────────────────────────

export const STATUS_TRANSITIONS: StatusTransition[] = [
  // Draft → herhangi bir aşamaya geçebilir (editör başlatır)
  { from: S.DRAFT, to: S.AI_GENERATED, allowed: true, requiresRole: "editor" },
  { from: S.DRAFT, to: S.EDITOR_REVIEW, allowed: true, requiresRole: "editor" },
  { from: S.DRAFT, to: S.DELETED, allowed: true, requiresRole: "admin" },

  // AI Generated → editör incelemesine
  { from: S.AI_GENERATED, to: S.EDITOR_REVIEW, allowed: true, requiresRole: "editor" },
  { from: S.AI_GENERATED, to: S.DRAFT, allowed: true, requiresRole: "editor" },
  { from: S.AI_GENERATED, to: S.DELETED, allowed: true, requiresRole: "admin" },

  // Editor Review → SEO veya Fact Check'e
  { from: S.EDITOR_REVIEW, to: S.SEO_OPTIMIZED, allowed: true, requiresRole: "editor" },
  { from: S.EDITOR_REVIEW, to: S.FACT_CHECKED, allowed: true, requiresRole: "editor" },
  { from: S.EDITOR_REVIEW, to: S.DRAFT, allowed: true, requiresRole: "editor" },
  { from: S.EDITOR_REVIEW, to: S.DELETED, allowed: true, requiresRole: "admin" },

  // SEO Optimized → Fact Check veya Ready
  { from: S.SEO_OPTIMIZED, to: S.FACT_CHECKED, allowed: true, requiresRole: "editor" },
  { from: S.SEO_OPTIMIZED, to: S.READY, allowed: true, requiresRole: "editor" },
  { from: S.SEO_OPTIMIZED, to: S.DRAFT, allowed: true, requiresRole: "editor" },
  { from: S.SEO_OPTIMIZED, to: S.EDITOR_REVIEW, allowed: true, requiresRole: "editor" },

  // Fact Checked → Ready
  { from: S.FACT_CHECKED, to: S.READY, allowed: true, requiresRole: "editor" },
  { from: S.FACT_CHECKED, to: S.SEO_OPTIMIZED, allowed: true, requiresRole: "editor" },
  { from: S.FACT_CHECKED, to: S.DRAFT, allowed: true, requiresRole: "editor" },

  // Ready → Published (SON NOKTA: Editor onayı şart)
  { from: S.READY, to: S.PUBLISHED, allowed: true, requiresRole: "admin" },
  { from: S.READY, to: S.DRAFT, allowed: true, requiresRole: "admin" },

  // Published → Updated veya Archived
  { from: S.PUBLISHED, to: S.UPDATED, allowed: true, requiresRole: "editor" },
  { from: S.PUBLISHED, to: S.ARCHIVED, allowed: true, requiresRole: "admin" },
  { from: S.PUBLISHED, to: S.DRAFT, allowed: true, requiresRole: "admin" },

  // Updated → Published (güncelleme sonrası yayına geri)
  { from: S.UPDATED, to: S.PUBLISHED, allowed: true, requiresRole: "editor" },
  { from: S.UPDATED, to: S.ARCHIVED, allowed: true, requiresRole: "admin" },

  // Archived → Published (yeniden yayın) veya Deleted
  { from: S.ARCHIVED, to: S.PUBLISHED, allowed: true, requiresRole: "admin" },
  { from: S.ARCHIVED, to: S.DELETED, allowed: true, requiresRole: "admin" },

  // Deleted → son durum, geri dönüş yok
];

// ─── Transition Map (O(1) lookup) ──────────────────────────

const transitionMap = new Map<string, StatusTransition>();
for (const t of STATUS_TRANSITIONS) {
  transitionMap.set(`${t.from}→${t.to}`, t);
}

// ─── Public API ────────────────────────────────────────────

/**
 * Bir geçişin izin verilip verilmediğini kontrol et
 */
export function canTransition(
  from: ContentStatus,
  to: ContentStatus
): StatusTransition | null {
  return transitionMap.get(`${from}→${to}`) || null;
}

/**
 * Bir statüden gidilebilecek tüm hedefleri listele
 */
export function getAvailableTransitions(from: ContentStatus): ContentStatus[] {
  return STATUS_TRANSITIONS.filter((t) => t.from === from && t.allowed).map(
    (t) => t.to
  );
}

/**
 * Geçiş yapmayı dene
 */
export function transition(
  fromStatus: ContentStatus,
  toStatus: ContentStatus,
  userRole: "admin" | "editor" | "system"
): TransitionResult {
  const rule = canTransition(fromStatus, toStatus);

  if (!rule) {
    return {
      success: false,
      fromStatus,
      toStatus,
      error: `Geçersiz durum geçişi: ${fromStatus} → ${toStatus}`,
    };
  }

  if (rule.requiresRole) {
    const roleHierarchy = { system: 3, admin: 2, editor: 1 };
    if (roleHierarchy[userRole] < roleHierarchy[rule.requiresRole]) {
      return {
        success: false,
        fromStatus,
        toStatus,
        error: `Bu geçiş için "${rule.requiresRole}" rolü gerekli. Sizin rolünüz: "${userRole}"`,
      };
    }
  }

  const workflowEvent: WorkflowEvent = {
    id: generateWorkflowId(),
    articleId: "", // caller tarafından doldurulacak
    fromStatus,
    toStatus,
    actor: userRole,
    timestamp: new Date().toISOString(),
  };

  return {
    success: true,
    fromStatus,
    toStatus,
    workflowEvent,
  };
}

// ─── Direct Publish Check ──────────────────────────────────

/**
 * Direkt yayına alma kontrolü — Editor Review şart
 * Draft → Published direkt yapılamaz
 */
export const DIRECT_PUBLISH_BLOCKED: [ContentStatus, ContentStatus][] = [
  [S.DRAFT, S.PUBLISHED],
  [S.AI_GENERATED, S.PUBLISHED],
  [S.EDITOR_REVIEW, S.PUBLISHED],
  [S.SEO_OPTIMIZED, S.PUBLISHED],
  [S.FACT_CHECKED, S.PUBLISHED],
];

/**
 * Editor review olmadan publish engeli
 */
export function requiresEditorReview(status: ContentStatus): boolean {
  return DIRECT_PUBLISH_BLOCKED.some(([from]) => from === status);
}

// ─── Helpers ───────────────────────────────────────────────

function generateWorkflowId(): string {
  return `wf_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/** Status etiketini Türkçe okunabilir hale getir */
export function statusLabel(status: ContentStatus): string {
  const labels: Record<ContentStatus, string> = {
    draft: "Taslak",
    ai_generated: "AI Üretildi",
    editor_review: "Editör İncelemesinde",
    seo_optimized: "SEO Optimize Edildi",
    fact_checked: "Doğruluk Kontrolü Yapıldı",
    ready: "Yayına Hazır",
    published: "Yayında",
    updated: "Güncellendi",
    archived: "Arşivlendi",
    deleted: "Silindi",
  };
  return labels[status] || status;
}

/** Status renkleri */
export function statusColor(status: ContentStatus): string {
  const colors: Record<ContentStatus, string> = {
    draft: "#6B7280",
    ai_generated: "#8B5CF6",
    editor_review: "#F59E0B",
    seo_optimized: "#3B82F6",
    fact_checked: "#06B6D4",
    ready: "#10B981",
    published: "#22C55E",
    updated: "#6366F1",
    archived: "#9CA3AF",
    deleted: "#EF4444",
  };
  return colors[status] || "#6B7280";
}
