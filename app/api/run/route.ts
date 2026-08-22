import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";
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

   const graphNodes = nodes.map((n) => ({ id: n.id, prompt: n.data.prompt }));
   const graphEdges = edges.map((e) => ({
      source: e.source,
      sourceHandle: e.sourceHandle,
      target: e.target,
   }))

   const { ids } = await inngest.send({
      name: "decision/execute",
      data: { nodes: graphNodes, edges: graphEdges, startNodeId: entryNodes[0].id },
   });

   return NextResponse.json({ eventId: ids[0] });
}