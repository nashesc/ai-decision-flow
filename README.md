# AI Decision Flow

Visual AI workflow builder. Each node is a binary decision step (`YES`/`NO`)
evaluated by an LLM; edges route execution based on the answer. Execution
runs through Inngest; the graph is authored and viewed in React Flow.

## Stack

- Next.js 16 (App Router) + TypeScript
- React Flow — canvas, nodes, edges
- Inngest — workflow execution, step orchestration
- OpenAI SDK — pointed at Groq's OpenAI-compatible endpoint
- Model: `openai/gpt-oss-20b` (via a FlyRank-issued proxy key with a
  restricted model allowlist — only `gpt-oss-20b` / `gpt-oss-120b`
  support structured outputs on this key)
- Zod — constrains LLM output to strict `YES`/`NO`
- Shadcn (Nova preset)

## Setup

```bash
npm install
```

Create `.env.local`:
   GROQ_API_KEY=your_key_here
   INNGEST_DEV=1


## Run

Two terminals, both required:

```bash
npm run dev
```

```bash
npx inngest-cli@latest dev
```

Inngest dashboard: http://localhost:8288
App: http://localhost:3000

## How it works

1. Build a graph on the canvas — each node has a prompt, `YES`/`NO` source handles.
2. Exactly one entry node required (zero incoming edges) — validated before run.
3. All node prompts must be non-empty — validated before run.
4. Hit Run → `/api/run` sends a `decision/execute` event with the full graph.
5. Inngest walks the graph node-by-node (`executeWorkflowFn`), calling the
   LLM per node, following the edge matching the returned answer, until a
   terminal node (no matching outgoing edge) is reached.
6. Frontend polls `/api/executions/[runId]` until the run completes, then
   renders the trace in the logs panel and appends it to run history.

## Known limitations

- Execution records are stored in-process (`lib/execution-store.ts`, an
  in-memory `Map`) — resets on server restart, not durable across
  deployments. Fine for local/demo use; would need Redis or a DB otherwise.
- Cycle guard caps traversal at `nodes.length` steps — prevents infinite
  loops but doesn't detect cycles explicitly.
- Fan-out (two edges off the same `yes`/`no` handle) isn't supported —
  only the first matching edge is followed.

## Status

- Phase 1 (Setup) — done
- Phase 2 (Foundations) — done
- Phase 3 (Core execution) — done
- Phase 4 (Polish) — 3 of 9 picked: error handling, execution logs panel,
  execution history