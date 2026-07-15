import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorizedResponse } from "@/lib/validation";
import { getAllJobs, getActiveJobs, getJobStats } from "@/services/agents/orchestrator/recovery";
import { pipelineEvents } from "@/services/agents/orchestrator/events";
import { pipelineLogger } from "@/services/agents/orchestrator/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const stats = getJobStats();
  const activeJobs = getActiveJobs().slice(0, 50);
  const allJobs = getAllJobs().slice(0, 100);

  return NextResponse.json({
    success: true,
    data: {
      stats,
      activeJobs: activeJobs.map(j => ({
        id: j.id, state: j.state, title: (j.article as Record<string,unknown>)?.title || j.id,
        source: (j.scout as Record<string,unknown>)?.sourceName || "Bilinmiyor",
        priority: (j.scout as Record<string,unknown>)?.priority || "normal",
        steps: j.history.length,
        duration: j.history.reduce((s, h) => s + (h.duration || 0), 0),
        createdAt: j.createdAt, updatedAt: j.updatedAt,
        retryCount: j.retryCount,
      })),
      recentJobs: allJobs.slice(0, 20),
      events: pipelineEvents.getHistory().slice(-50),
    },
  });
}
