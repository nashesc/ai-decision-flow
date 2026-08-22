import { inngest } from "./inngest";

export const testFn = inngest.createFunction(
  { id: "test-fn", triggers: [{ event: "test/hello" }] },
  async ({ event, step }: { event: { data: { name: string } }; step: any }) => {
    return { message: `Hello, ${event.data.name}` };
  }
);