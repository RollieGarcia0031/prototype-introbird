// src/ai/flows/summarize-resume-flow.ts
'use server';
/**
 * @fileOverview AI agent for summarizing PDF resumes.
 *
 * - summarizeResumeFlow - A function that handles the resume summarization process.
 * - SummarizeResumeInput - The input type for the summarizeResumeFlow function.
 * - SummarizeResumeOutput - The return type for the summarizeResumeFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeResumeInputSchema = z.object({
  resumePdfDataUri: z
    .string()
    .describe(
      "A PDF resume, as a data URI that must include a MIME type (application/pdf) and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type SummarizeResumeInput = z.infer<typeof SummarizeResumeInputSchema>;

const SummarizeResumeOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key skills, experiences, and qualifications extracted from the resume.'),
});
export type SummarizeResumeOutput = z.infer<typeof SummarizeResumeOutputSchema>;

// Exported wrapper function
export async function summarizeResumeFlow(input: SummarizeResumeInput): Promise<SummarizeResumeOutput> {
  return resummarizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeResumePrompt',
  input: {schema: SummarizeResumeInputSchema},
  output: {schema: SummarizeResumeOutputSchema},
  prompt: `You are an expert HR assistant specialized in extracting key information from resumes.
Analyze the provided resume (in PDF format).
Generate a concise, bullet-point summary highlighting the candidate's key skills, main experiences (job titles, companies, key responsibilities/achievements), and notable qualifications or education.
Focus on quantifiable achievements and specific technologies or methodologies mentioned if possible.
The summary should be easy to read and quickly provide an overview of the candidate's profile.

Resume Content:
{{media url=resumePdfDataUri}}

Resume Summary:
`,
  config: { // Added default safety settings
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  }
});

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds

const resummarizerFlow = ai.defineFlow(
  {
    name: 'resummarizerFlowInternal', // Internal flow name
    inputSchema: SummarizeResumeInputSchema,
    outputSchema: SummarizeResumeOutputSchema,
  },
  async (input: SummarizeResumeInput): Promise<SummarizeResumeOutput> => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const {output} = await prompt(input);
        return output!; // Success
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if ((errorMessage.includes('503') || errorMessage.toLowerCase().includes('overload') || errorMessage.toLowerCase().includes('service unavailable')) && attempt < MAX_RETRIES) {
          console.warn(`Attempt ${attempt} failed for resummarizerFlow: ${errorMessage}. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        } else {
          console.error(`Final attempt (${attempt}) failed for resummarizerFlow or non-retryable error: ${errorMessage}`);
          // Consider re-throwing a more user-friendly error or specific error type
          throw new Error(`Failed to summarize resume: ${errorMessage}`);
        }
      }
    }
    // This line should ideally not be reached if MAX_RETRIES > 0.
    throw new Error('Failed to summarize resume after multiple retries.');
  }
);
