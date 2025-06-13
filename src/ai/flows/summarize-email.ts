
'use server';

/**
 * @fileOverview An AI agent that summarizes emails.
 *
 * - summarizeEmail - A function that handles the email summarization process.
 * - SummarizeEmailInput - The input type for the summarizeEmail function.
 * - SummarizeEmailOutput - The return type for the summarizeEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeEmailInputSchema = z.object({
  emailBody: z.string().describe('The body of the email to summarize.'),
});
export type SummarizeEmailInput = z.infer<typeof SummarizeEmailInputSchema>;

const SummarizeEmailOutputSchema = z.object({
  summary: z.string().describe('A summary of the email.'),
});
export type SummarizeEmailOutput = z.infer<typeof SummarizeEmailOutputSchema>;

export async function summarizeEmail(input: SummarizeEmailInput): Promise<SummarizeEmailOutput> {
  return summarizeEmailFlow(input);
}

const summarizeEmailPrompt = ai.definePrompt({
  name: 'summarizeEmailPrompt',
  input: {schema: SummarizeEmailInputSchema},
  output: {schema: SummarizeEmailOutputSchema},
  prompt: `Summarize the following email:

{{{emailBody}}}`,
});

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds

const summarizeEmailFlow = ai.defineFlow(
  {
    name: 'summarizeEmailFlow',
    inputSchema: SummarizeEmailInputSchema,
    outputSchema: SummarizeEmailOutputSchema,
  },
  async input => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const {output} = await summarizeEmailPrompt(input);
        return output!; // Success
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if ((errorMessage.includes('503') || errorMessage.toLowerCase().includes('overload') || errorMessage.toLowerCase().includes('service unavailable')) && attempt < MAX_RETRIES) {
          console.warn(`Attempt ${attempt} failed for summarizeEmailFlow: ${errorMessage}. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        } else {
          console.error(`Final attempt (${attempt}) failed for summarizeEmailFlow or non-retryable error: ${errorMessage}`);
          throw error;
        }
      }
    }
    // This line should ideally not be reached if MAX_RETRIES > 0, but acts as a fallback.
    throw new Error('Failed to summarize email after multiple retries.');
  }
);
