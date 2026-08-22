import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { inngest } from "@/lib/inngest";
import { createExecution } from "@/lib/execution-store";
import type { Node, Edge } from "reactflow";

export async function POST(req: NextRequest) {
   const { nodes, edges } = (await req.json()) as { nodes: Node[]; edges: Edge[] };

   const incomingTargets = new Set(edges.map((e) => e.target));
   const entryNodes = nodes.filter((n) => !incomingTargets.has(n.id));

   if (entryNodes.length !== 1) {
    return NextResponse.json(
      { error: `Graph needs exactly one entry node (found ${entryNodes.length}). Delete or connect unconnected nodes.` },
      { status: 400 }
    );
  }

   const emptyPromptNode = nodes.find((n) => !n.data.prompt?.trim());
   if (emptyPromptNode) {
      return NextResponse.json(
         { error: `Node ${emptyPromptNode.id} has an empty prompt. Fill in every node before running.` },
         { status: 400 }
      );
   }

   const runId = randomUUID();
   createExecution(runId);

   const graphNodes = nodes.map((n) => ({ id: n.id, prompt: n.data.prompt }));
   const graphEdges = edges.map((e) => ({
      source: e.source,
      sourceHandle: e.sourceHandle as "yes" | "no",
      target: e.target,
   }))

   await inngest.send({
      name: "decision/execute",
      data: { 
         nodes: graphNodes, 
         edges: graphEdges, 
         startNodeId: entryNodes[0].id, 
         runId 
      },
   })

   return NextResponse.json({ runId });
}