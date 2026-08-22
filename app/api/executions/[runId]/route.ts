import { NextRequest, NextResponse } from "next/server";
import { getExecution } from "@/lib/execution-store";

export async function GET(req: NextRequest, { params }: { params: Promise<{ runId: string }> }) {
   const { runId } = await params;
   const execution = getExecution(runId);
   if (!execution) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
   }
   return NextResponse.json(execution);
}