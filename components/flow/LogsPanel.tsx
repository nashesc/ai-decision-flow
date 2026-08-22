"use client";
import type { TraceStep } from "@/lib/execution-store";

type Props = { 
   isRunning: boolean; 
   trace: TraceStep[]; 
   error?: string | null 
}

export function LogsPanel({ isRunning, trace, error }: Props) {
   return (
      <div className="absolute z-10 top-4 right-4 w-80 max-h-[70vh] overflow-y-auto bg-white border rounded-md shadow-sm p-3 text-sm">
         <div className="font-semibold mb-2">Execution Log</div>

         {isRunning && <div className="text-gray-500">
            Running…
         </div>}

         {!isRunning && trace.length === 0 && !error && <div className="text-gray-400">
            No run yet.
         </div>}

         {trace.map((step, i) => (
            <div key={i} className="mb-2 border-b pb-1">
               <div className="text-xs text-gray-500">
                  Node {step.nodeId}
               </div>

               <div className="truncate">
                  {step.prompt}
               </div>

               <div className={step.answer === "YES" ? "text-green-600" : "text-red-600"}>
                  {step.answer
               }</div>
            </div>
         ))}

         {error && <div className="text-red-600 mt-2">
            Error: {error}
         </div>}
    </div>
   )
}