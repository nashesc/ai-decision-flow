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

export const decisionNodeFn = inngest.createFunction(
  { 
    id: "decision-node", 
    triggers: [{ event: "decision/execute" }] 
  },

  async ({ event, step }: { event: { data: { prompt: string } }; step: any }) => {
    const result = await step.run("call-llm", async () => {
      const completion = await openai.chat.completions.parse({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: "You are a strict binary classifier. Answer only YES or NO based on the prompt." },
          { role: "user", content: event.data.prompt },
        ],
        response_format: zodResponseFormat(decisionSchema, "decision"),
      });
      return completion.choices[0].message.parsed;
    });

    return result;
  }
);