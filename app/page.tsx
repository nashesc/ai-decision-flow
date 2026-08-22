"use client";
import { useCallback, useState } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, addEdge, applyNodeChanges, applyEdgeChanges,
  Node, Edge, Connection, NodeChange, EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { DecisionNode } from "@/components/flow/DecisionNode";

const nodeTypes = { decision: DecisionNode };
let idCounter = 1;

function handleChange(id: string, value: string, setNodes: React.Dispatch<React.SetStateAction<Node[]>>) {
  setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, prompt: value } } : n)));
}

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: "1", 
      type: "decision", 
      position: { x: 250, y: 50 },
      data: { 
        prompt: "Is this a support request?", 
        onChange: (id: string, v: string) => handleChange(id, v, setNodes) 
      } 
    },
  ]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback((c: NodeChange[]) => setNodes((n) => applyNodeChanges(c, n)), []);
  const onEdgesChange = useCallback((c: EdgeChange[]) => setEdges((e) => applyEdgeChanges(c, e)), []);
  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => 
        addEdge({ 
          ...connection, 
          label: connection.sourceHandle === "yes" ? "YES" : "NO", 
          animated: true }, eds
        )),
    []
  );

  const addNode = () => {
    idCounter += 1;
    setNodes((nds) => [
      ...nds,
      { id: String(idCounter), 
        type: "decision", 
        position: { x: 250, y: 50 + idCounter * 120 },
        data: { prompt: "", onChange: (id: string, v: string) => handleChange(id, v, setNodes) } 
      },
    ]);
  };

  return (
    <div className="w-screen h-screen">
      <button onClick={addNode} className="absolute z-10 top-4 left-4 bg-black text-white px-3 py-1 rounded text-sm cursor-pointer">
        + Add Node
      </button>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} nodeTypes={nodeTypes} fitView>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}