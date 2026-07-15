import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unauthorizedResponse, notFoundResponse } from "@/lib/validation";
import { getJob } from "@/services/agents/orchestrator/recovery";
import { pipelineEvents } from "@/services/agents/orchestrator/events";
import { pipelineLogger } from "@/services/agents/orchestrator/logger";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const job = getJob(params.id);
  if (!job) return notFoundResponse("Job bulunamadi");

  const events = pipelineEvents.getHistory(params.id);
  const logs = pipelineLogger.getJobLogs(params.id);

  return NextResponse.json({
    success: true,
    data: { job, events, logs },
  });
}
