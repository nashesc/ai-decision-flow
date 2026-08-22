"use client";
import { useCallback, useState } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, addEdge, applyNodeChanges, applyEdgeChanges,
  Node, Edge, Connection, NodeChange, EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { DecisionNode } from "@/components/flow/DecisionNode";
import { FlowContext } from "@/lib/flow-context";import { LogsPanel } from "@/components/flow/LogsPanel";
import { HistoryPanel } from "@/components/flow/HistoryPanel";
import type { ExecutionRecord, TraceStep } from "@/lib/execution-store";

const nodeTypes = { decision: DecisionNode };
let idCounter = 1;

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: "1", type: "decision", position: { x: 250, y: 50 }, data: { prompt: "Is this a support request?" } },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTrace, setCurrentTrace] = useState<TraceStep[]>([]);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [history, setHistory] = useState<ExecutionRecord[]>([]);

  const updateNodeData = useCallback((id: string, value: string) => {
    setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, prompt: value } } : n)));
  }, []);

  const onNodesChange = useCallback((c: NodeChange[]) => setNodes((n) => applyNodeChanges(c, n)), []);
  const onEdgesChange = useCallback((c: EdgeChange[]) => setEdges((e) => applyEdgeChanges(c, e)), []);
  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, label: connection.sourceHandle === "yes" ? "YES" : "NO", animated: true }, eds)),
    []
  );

  const addNode = () => {
    idCounter += 1;
    setNodes((nds) => [
      ...nds,
      { id: String(idCounter), type: "decision", position: { x: 250, y: 50 + idCounter * 120 }, data: { prompt: "" } },
    ]);
  };

  const pollExecution = (runId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/executions/${runId}`);
      if (!res.ok) {
        clearInterval(interval);
        setIsRunning(false);
        setCurrentError("Lost track of run status.");
        return;
      }
      
      const rec: ExecutionRecord = await res.json();
      if (rec.status === "running") return;
      clearInterval(interval);
      setIsRunning(false);
      setCurrentTrace(rec.trace);
      setCurrentError(rec.error ?? null);
      setHistory((h) => [rec, ...h]);
    }, 1000);
  };

  const runWorkflow = async () => {
    setIsRunning(true);
    setCurrentError(null);
    setCurrentTrace([]);
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes, edges }),
    });
    const data = await res.json();
    if (!res.ok) {
      setIsRunning(false);
      setCurrentError(data.error);
      return;
    }
    pollExecution(data.runId);
  };

  return (
    <FlowContext.Provider value={{ updateNodeData }}>
      <div className="w-screen h-screen">
        <button onClick={addNode} className="absolute z-10 top-4 left-4 bg-black text-white px-3 py-1 rounded text-sm">
          + Add Node
        </button>

        <button
          onClick={runWorkflow}
          disabled={isRunning}
          className="absolute z-10 top-4 left-32 bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
        >
          {isRunning ? "Running…" : "▶ Run"}
        </button>

        <LogsPanel 
          isRunning={isRunning} 
          trace={currentTrace} 
          error={currentError} 
        />
        
        <HistoryPanel 
          history={history} 
          onSelect={(rec) => { 
            setCurrentTrace(rec.trace); 
            setCurrentError(rec.error ?? null); 
          }} 
        />

        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange}
          onConnect={onConnect} 
          nodeTypes={nodeTypes} 
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </FlowContext.Provider>
  );
}