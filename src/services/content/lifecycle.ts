/**
 * Content Engine — Lifecycle Manager
 *
 * Makale yaşam döngüsünü merkezi olarak yönetir.
 * Status geçişleri, workflow event'leri ve metadata'yı birleştirir.
 */

import type { ContentStatus, ContentType, TransitionResult } from "./types";
import { CONTENT_STATUS } from "./types";
import { transition, canTransition, getAvailableTransitions } from "./status";
import { logWorkflowEvent, getWorkflowHistory, getWorkflowSummary } from "./workflow";
import { buildMetadata, type MetadataInput } from "./metadata";

const S = CONTENT_STATUS;

// ─── Lifecycle Manager ─────────────────────────────────────

export interface LifecycleState {
  articleId: string;
  currentStatus: ContentStatus;
  contentType: ContentType;
  availableTransitions: ContentStatus[];
  workflowHistory: ReturnType<typeof getWorkflowSummary>;
}

/**
 * Bir makalenin yaşam döngüsü durumunu getir
 */
export function getLifecycleState(
  articleId: string,
  currentStatus: ContentStatus,
  contentType: ContentType = "news"
): LifecycleState {
  return {
    articleId,
    currentStatus,
    contentType,
    availableTransitions: getAvailableTransitions(currentStatus),
    workflowHistory: getWorkflowSummary(articleId),
  };
}

/**
 * Durum geçişi yap
 */
export function transitionStatus(
  articleId: string,
  fromStatus: ContentStatus,
  toStatus: ContentStatus,
  userRole: "admin" | "editor" | "system",
  note?: string
): TransitionResult {
  const result = transition(fromStatus, toStatus, userRole);

  if (result.success && result.workflowEvent) {
    // Workflow event'i kaydet
    const event = logWorkflowEvent(
      articleId,
      fromStatus,
      toStatus,
      userRole,
      note
    );
    result.workflowEvent = event;
  }

  return result;
}

/**
 * Yeni makale oluşturulduğunda lifecycle başlat
 */
export function initializeLifecycle(
  articleId: string,
  contentType: ContentType = "news"
): {
  status: ContentStatus;
  workflowEvent: ReturnType<typeof logWorkflowEvent>;
} {
  const initialStatus = S.DRAFT;

  const event = logWorkflowEvent(
    articleId,
    null,
    initialStatus,
    "system",
    `Yeni ${contentType} içeriği oluşturuldu`
  );

  return {
    status: initialStatus,
    workflowEvent: event,
  };
}

/**
 * AI içerik ürettiğinde lifecycle güncelle
 */
export function onAiGenerated(
  articleId: string,
  htmlContent: string,
  metadataInput?: MetadataInput
): {
  status: ContentStatus;
  metadata: ReturnType<typeof buildMetadata>;
  workflowEvent: ReturnType<typeof logWorkflowEvent>;
} {
  const event = logWorkflowEvent(
    articleId,
    S.DRAFT,
    S.AI_GENERATED,
    "ai",
    "AI tarafından içerik üretildi"
  );

  const metadata = buildMetadata(htmlContent, metadataInput);

  return {
    status: S.AI_GENERATED,
    metadata,
    workflowEvent: event,
  };
}

/**
 * Yayına alma
 */
export function publishArticle(
  articleId: string,
  currentStatus: ContentStatus,
  userRole: "admin" | "editor"
): TransitionResult {
  // Editor review kontrolü — Ready olmadan publish edilemez
  const validPublishStatuses: ContentStatus[] = [
    S.READY,
    S.PUBLISHED,
    S.UPDATED,
    S.ARCHIVED,
  ];

  if (!validPublishStatuses.includes(currentStatus)) {
    return {
      success: false,
      fromStatus: currentStatus,
      toStatus: S.PUBLISHED,
      error:
        "Bu makale henüz yayına hazır değil. Önce 'Editor Review' ve 'Ready' aşamalarından geçmeli.",
    };
  }

  return transitionStatus(articleId, currentStatus, S.PUBLISHED, userRole);
}

// ─── Lifecycle Hooks ───────────────────────────────────────

export type LifecycleHook = (
  articleId: string,
  fromStatus: ContentStatus,
  toStatus: ContentStatus
) => void | Promise<void>;

const hooks: Map<string, LifecycleHook[]> = new Map();

/**
 * Belirli bir geçişe hook ekle
 */
export function onTransition(
  fromStatus: ContentStatus,
  toStatus: ContentStatus,
  hook: LifecycleHook
): void {
  const key = `${fromStatus}→${toStatus}`;
  const existing = hooks.get(key) || [];
  existing.push(hook);
  hooks.set(key, existing);
}

/**
 * Geçiş hook'larını tetikle
 */
export async function triggerHooks(
  articleId: string,
  fromStatus: ContentStatus,
  toStatus: ContentStatus
): Promise<void> {
  const key = `${fromStatus}→${toStatus}`;
  const transitionHooks = hooks.get(key) || [];
  for (const hook of transitionHooks) {
    await hook(articleId, fromStatus, toStatus);
  }
}
