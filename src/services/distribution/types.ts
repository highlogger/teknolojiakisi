/** Distribution Center — Types */

export const DISTRIBUTION_CHANNEL = {
  GOOGLE_NEWS: "google_news", RSS: "rss", SITEMAP: "sitemap",
  X: "x", FACEBOOK: "facebook", LINKEDIN: "linkedin",
  TELEGRAM: "telegram", DISCORD: "discord", WHATSAPP: "whatsapp",
  PUSH: "push", EMAIL: "email", WEBSUB: "websub", INDEXNOW: "indexnow",
} as const;
export type DistributionChannel = (typeof DISTRIBUTION_CHANNEL)[keyof typeof DISTRIBUTION_CHANNEL];

export interface DistributionTask {
  id: string; articleId: string; channel: DistributionChannel;
  status: "queued" | "processing" | "sent" | "failed";
  content: string; retryCount: number; maxRetries: number;
  createdAt: string; sentAt?: string; error?: string; duration?: number;
}

export interface ChannelConfig {
  channel: DistributionChannel; enabled: boolean;
  maxLength: number; format: "text" | "html" | "markdown";
  retryCount: number; template: string;
}

export interface DistributionLog {
  taskId: string; channel: DistributionChannel;
  status: "success" | "failed" | "retry";
  duration: number; error?: string; timestamp: string;
}

export interface DistributionResult {
  articleId: string; tasks: DistributionTask[];
  sent: number; failed: number; queued: number; duration: number;
}
