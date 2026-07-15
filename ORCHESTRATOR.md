# AI Newsroom Orchestrator

## Mimarisi

```
┌──────────────────────────────────────────────────────────┐
│                 PIPELINE ORCHESTRATOR                     │
│              (Merkezi Kontrol Birimi)                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Job Queue ──→ Orchestrator ──→ Pipeline                 │
│                                                           │
│  Scout → Research → Verification → Writer                │
│    ↓        ↓           ↓           ↓                    │
│    ✅       ❌          ❌           ✅                   │
│                                                           │
│  SEO → Editor → Publisher → Completed                    │
│   ↓      ↓         ↓          ↓                          │
│   ✅     ✅        ✅         ✅                          │
│                                                           │
│  Her adım:                                                │
│  ┌─────────────────────────────────────┐                 │
│  │ AgentRunner                         │                 │
│  │ ├── Timeout kontrolü                │                 │
│  │ ├── Retry (exponential backoff)     │                 │
│  │ ├── Error handling                  │                 │
│  │ └── Event yayınlama                 │                 │
│  └─────────────────────────────────────┘                 │
│                                                           │
│  PipelineEvents (Event Bus)                              │
│  PipelineLogger (Yapılandırılmış log)                    │
│  PipelineRecovery (Kaldığı yerden devam)                 │
└──────────────────────────────────────────────────────────┘
```

## Kullanım

```typescript
import { orchestrator } from "@/services/agents/orchestrator";

const result = await orchestrator.run({
  id: "job_001",
  state: "scout",
  history: [], errors: [],
  retryCount: 0, maxRetries: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Dry run
const dry = await orchestrator.dryRun(job);

// Recovery
const resumed = await orchestrator.resume("job_001");

// Status
const { job, history } = orchestrator.getStatus("job_001");
```

## Dosyalar

| Dosya | Görev |
|-------|-------|
| `types.ts` | PipelineState, PipelineJob, AgentResult, Event tipleri |
| `state-machine.ts` | State geçiş kuralları, pipeline sırası |
| `runner.ts` | Agent çalıştırma (timeout, retry, registry) |
| `events.ts` | Event Bus (subscribe/publish) |
| `logger.ts` | Pipeline loglama |
| `recovery.ts` | Job recovery, stuck job tespiti |
| `index.ts` | Orchestrator singleton |
