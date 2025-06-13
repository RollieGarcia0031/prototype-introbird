// src/ai/flows/refine-draft-with-instruction.ts
'use server';
/**
 * @fileOverview AI agent that refines an email draft based on specific user instructions.
 *
 * - refineDraftWithInstruction - A function that refines an email draft.
 * - RefineDraftWithInstructionInput - The input type for the refineDraftWithInstruction function.
 * - RefineDraftWithInstructionOutput - The return type for the refineDraftWithInstruction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineDraftWithInstructionInputSchema = z.object({
  currentDraft: z
    .string()
    .describe('The current email draft to be refined.'),
  instruction: z
    .string()
    .describe('The user_s specific instruction on how to modify the draft.'),
});
export type RefineDraftWithInstructionInput = z.infer<typeof RefineDraftWithInstructionInputSchema>;

const RefineDraftWithInstructionOutputSchema = z.object({
  refinedDraft: z.string().describe('The refined email reply draft based on the instruction.'),
});
export type RefineDraftWithInstructionOutput = z.infer<typeof RefineDraftWithInstructionOutputSchema>;

export async function refineDraftWithInstruction(input: RefineDraftWithInstructionInput): Promise<RefineDraftWithInstructionOutput> {
  return refineDraftWithInstructionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineDraftWithInstructionPrompt',
  input: {schema: RefineDraftWithInstructionInputSchema},
  output: {schema: RefineDraftWithInstructionOutputSchema},
  prompt: `You are an AI assistant specialized in refining email drafts based on specific user instructions.
      You will be given an existing draft and a user's instruction on how to change it.
      Apply the instruction to the draft and return the modified version.
      Ensure the refined draft incorporates the user's instruction effectively while maintaining clarity and professionalism.

      Existing Draft:
      {{{currentDraft}}}

      User's Instruction for Editing:
      {{{instruction}}}

      Refined Draft based on Instruction:`,
});

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds

const refineDraftWithInstructionFlow = ai.defineFlow(
  {
    name: 'refineDraftWithInstructionFlow',
    inputSchema: RefineDraftWithInstructionInputSchema,
    outputSchema: RefineDraftWithInstructionOutputSchema,
  },
  async input => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const {output} = await prompt(input);
        return output!; // Success
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if ((errorMessage.includes('503') || errorMessage.toLowerCase().includes('overload') || errorMessage.toLowerCase().includes('service unavailable')) && attempt < MAX_RETRIES) {
          console.warn(`Attempt ${attempt} failed for refineDraftWithInstructionFlow: ${errorMessage}. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        } else {
          console.error(`Final attempt (${attempt}) failed for refineDraftWithInstructionFlow or non-retryable error: ${errorMessage}`);
          throw error;
        }
      }
    }
    throw new Error('Failed to refine draft with instruction after multiple retries.');
  }
);
