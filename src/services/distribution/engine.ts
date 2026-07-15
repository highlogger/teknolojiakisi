/** Distribution Center — Engine */

import type { DistributionTask, DistributionResult, DistributionLog, ChannelConfig } from "./types";
import { DISTRIBUTION_CHANNEL as DC } from "./types";

export const CHANNEL_CONFIGS: ChannelConfig[] = [
  { channel: DC.X, enabled: false, maxLength: 280, format: "text", retryCount: 2, template: "{{title}} {{url}}" },
  { channel: DC.FACEBOOK, enabled: false, maxLength: 500, format: "text", retryCount: 2, template: "{{title}}\n\n{{excerpt}}\n\n{{url}}" },
  { channel: DC.LINKEDIN, enabled: false, maxLength: 3000, format: "text", retryCount: 1, template: "{{title}}\n\n{{excerpt}}\n\n{{url}}" },
  { channel: DC.TELEGRAM, enabled: false, maxLength: 1000, format: "html", retryCount: 3, template: "<b>{{title}}</b>\n\n{{excerpt}}" },
  { channel: DC.EMAIL, enabled: false, maxLength: 10000, format: "html", retryCount: 2, template: "<h2>{{title}}</h2><p>{{excerpt}}</p><a href='{{url}}'>Devamı</a>" },
  { channel: DC.PUSH, enabled: false, maxLength: 50, format: "text", retryCount: 1, template: "{{title}}" },
  { channel: DC.RSS, enabled: true, maxLength: 0, format: "text", retryCount: 1, template: "" },
  { channel: DC.SITEMAP, enabled: true, maxLength: 0, format: "text", retryCount: 1, template: "" },
  { channel: DC.GOOGLE_NEWS, enabled: true, maxLength: 0, format: "text", retryCount: 1, template: "" },
];

function transformContent(template: string, data: Record<string, string>, maxLen: number): string {
  let result = template;
  for (const [k, v] of Object.entries(data)) result = result.replace(`{{${k}}}`, v || "");
  return maxLen > 0 ? result.substring(0, maxLen) : result;
}

export function createDistributionTasks(article: { id: string; title: string; excerpt?: string | null; slug: string; url: string }): DistributionResult {
  const data = { title: article.title, excerpt: article.excerpt || "", url: article.url, slug: article.slug };
  const enabled = CHANNEL_CONFIGS.filter((c) => c.enabled);

  const tasks: DistributionTask[] = enabled.map((cfg) => ({
    id: `dist_${article.id}_${cfg.channel}`,
    articleId: article.id, channel: cfg.channel,
    status: "queued" as const,
    content: transformContent(cfg.template, data, cfg.maxLength),
    retryCount: 0, maxRetries: cfg.retryCount,
    createdAt: new Date().toISOString(),
  }));

  return { articleId: article.id, tasks, sent: 0, failed: 0, queued: tasks.length, duration: 0 };
}

export function getDistributionLogs(): DistributionLog[] { return []; }

export function getEnabledChannels(): ChannelConfig[] { return CHANNEL_CONFIGS.filter((c) => c.enabled); }
