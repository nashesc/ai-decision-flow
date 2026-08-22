import { inngest } from "./inngest";
import { openai } from "./openai";
import { decisionSchema } from "./decision-schema";
import { zodResponseFormat } from "openai/helpers/zod";

export const testFn = inngest.createFunction(
  { 
    id: "test-fn", 
    triggers: [{ event: "test/hello" }] 
  },
  async ({ event, step }: { event: { data: { name: string } }; step: any }) => {
    return { message: `Hello, ${event.data.name}` };
  }
)

type GraphNode = { 
  id: string; 
  prompt: string 
};
type GraphEdge = { 
  source: string; 
  sourceHandle: "yes" | "no"; 
  target: string 
};

export const executeWorkflowFn = inngest.createFunction(
  {
    id: "execute-workflow",
    triggers: [{ event: "decision/execute" }],
  },
  async ({
    event,
    step,
  }: {
    event: { data: { nodes: GraphNode[]; edges: GraphEdge[]; startNodeId: string } };
    step: any;
  }) => {
    const { nodes, edges, startNodeId } = event.data;
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const maxSteps = nodes.length;

    const trace: { nodeId: string; prompt: string; answer: "YES" | "NO" }[] = [];
    let currentId: string | undefined = startNodeId;
    let steps = 0;

    while (currentId) {
      if (steps >= maxSteps) {
        throw new Error(`Stopped after ${maxSteps} steps — possible cycle in graph`);
      }

      const node = nodeMap.get(currentId);
      if (!node) {
        throw new Error(`Edge pointed to missing node id: ${currentId}`);
      }

      const result = await step.run(`call-llm-${node.id}`, async () => {
        const completion = await openai.chat.completions.parse({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: "You are a strict binary classifier. Answer only YES or NO based on the prompt." },
            { role: "user", content: node.prompt },
          ],
          response_format: zodResponseFormat(decisionSchema, "decision"),
        });
        return completion.choices[0].message.parsed;
      });

      trace.push({ nodeId: node.id, prompt: node.prompt, answer: result!.answer });
      steps++;

      const handle = result!.answer.toLowerCase() as "yes" | "no";
      const nextEdge = edges.find((e) => e.source === currentId && e.sourceHandle === handle);
      currentId = nextEdge?.target;
    }

    return { trace };
  }
);