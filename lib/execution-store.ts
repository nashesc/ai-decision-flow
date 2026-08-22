export type TraceStep = { 
   nodeId: string; 
   prompt: string; 
   answer: "YES" | "NO" 
}
export type ExecutionStatus = "running" | "done" | "error"
export type ExecutionRecord = {
   id: string;
   status: ExecutionStatus;
   startedAt: number;
   finishedAt?: number;
   trace: TraceStep[];
   error?: string;
}

const store = new Map<string, ExecutionRecord>();
export function createExecution(id: string) {
   store.set(id, { 
      id, 
      status: "running", 
      startedAt: Date.now(), 
      trace: [] 
   });
}

export function updateExecution(id: string, patch: Partial<ExecutionRecord>) {
   const existing = store.get(id);
   if (!existing) return;
   store.set(id, { ...existing, ...patch });
}

export function getExecution(id: string) {
   return store.get(id);
}