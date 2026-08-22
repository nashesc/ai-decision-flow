"use client";
import type { ExecutionRecord } from "@/lib/execution-store";

type Props = { 
   history: ExecutionRecord[]; 
   onSelect: (record: ExecutionRecord) => void 
};

export function HistoryPanel({ history, onSelect }: Props) {
   return (
      <div className="absolute z-10 bottom-4 right-4 w-80 max-h-[30vh] overflow-y-auto bg-white border rounded-md shadow-sm p-3 text-sm">
         <div className="font-semibold mb-2">
            History
         </div>

         {history.length === 0 && <div className="text-gray-400">
            No runs yet.
         </div>}

         {history.map((rec) => (
            <button
               key={rec.id}
               onClick={() => onSelect(rec)}
               className="w-full text-left mb-1 px-2 py-1 rounded hover:bg-gray-100 flex justify-between"
            >
               <span>
                  {new Date(rec.startedAt).toLocaleTimeString()}
               </span>

               <span className={rec.status === "error" ? "text-red-600" : "text-green-600"}>
                  {rec.status}
               </span>
            </button>
         ))}
    </div>
   )
}