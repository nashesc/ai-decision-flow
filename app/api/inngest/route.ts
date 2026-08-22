import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { testFn, executeWorkflowFn } from "@/lib/inngest-functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [testFn, executeWorkflowFn],
});