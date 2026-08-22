"use client";
import { Handle, Position, NodeProps } from "reactflow";

export function DecisionNode({ data, id }: NodeProps) {
  return (
    <div className="rounded-md border bg-white shadow-sm p-3 w-56">
      <Handle type="target" position={Position.Top} />
      <textarea
        className="w-full text-sm border rounded p-1 resize-none"
        rows={3}
        value={data.prompt}
        onChange={(e) => data.onChange(id, e.target.value)}
        placeholder="Enter decision prompt..."
      />
      <div className="flex justify-between mt-2 text-xs">
        <span className="text-red-600">NO</span>
        <span className="text-green-600">YES</span>
      </div>
      <Handle 
         type="source" 
         position={Position.Bottom} 
         id="no" 
         style={{ 
            left: "25%", 
            background: "#dc2626" 
         }} 
      />
      <Handle 
         type="source" 
         position={Position.Bottom} 
         id="yes" 
         style={{ 
            left: "75%", 
            background: "#16a34a" 
         }} 
      />
    </div>
  );
}