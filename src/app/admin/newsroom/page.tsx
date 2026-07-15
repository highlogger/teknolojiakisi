import { getJobStats, getActiveJobs, getAllJobs } from "@/services/agents/orchestrator/recovery";
import { pipelineEvents } from "@/services/agents/orchestrator/events";
import DashboardClient from "./components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function NewsroomDashboardPage() {
  const stats = getJobStats();
  const activeJobs = getActiveJobs().slice(0, 50);
  const recentJobs = getAllJobs().slice(0, 100);
  const recentEvents = pipelineEvents.getHistory().slice(-50);

  const jobsData = activeJobs.map(j => ({
    id: j.id, state: j.state, title: j.id,
    source: (j.scout as Record<string,unknown>)?.sourceName as string || "-",
    priority: (j.scout as Record<string,unknown>)?.priority as string || "normal",
    steps: j.history.length, duration: j.history.reduce((s,h) => s + (h.duration||0), 0),
    createdAt: j.createdAt, updatedAt: j.updatedAt, retryCount: j.retryCount,
  }));

  return <DashboardClient stats={stats} jobs={jobsData} events={recentEvents} allJobs={recentJobs} />;
}
