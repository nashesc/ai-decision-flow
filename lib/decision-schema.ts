import { z } from "zod";

export const decisionSchema = z.object({
  answer: z.enum(["YES", "NO"]),
});