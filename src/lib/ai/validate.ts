import { z } from 'zod'

const LLMOutputSchema = z.object({
  summary: z.string().min(1),
  explanation: z.string().min(1),
  interview_questions: z.array(z.string().min(1)).min(1).max(10),
  email_draft: z.string().min(1),
})

export type LLMOutput = z.infer<typeof LLMOutputSchema>

export function validateLLMOutput(raw: unknown): LLMOutput {
  return LLMOutputSchema.parse(raw)
}
