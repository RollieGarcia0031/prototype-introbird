
'use server';

/**
 * @fileOverview AI agent for generating text based on selected mode (email reply, job posting, casual message).
 *
 * - generateReplySuggestions - A function that handles the generation of text suggestions.
 * - GenerateReplySuggestionsInput - The input type for the generateReplySuggestions function.
 * - GenerateReplySuggestionsOutput - The return type for the generateReplySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema for the overall flow input
const GenerateReplySuggestionsInputSchema = z.object({
  emailContent: z.string().describe('The content of the email to reply to, job description details, or casual message context.'),
  selectedMode: z.enum(['reply', 'jobPosting', 'casualMessage']).describe('The selected mode for generation.'),
});
export type GenerateReplySuggestionsInput = z.infer<typeof GenerateReplySuggestionsInputSchema>;

// Schema for the prompt's specific input payload
const GenerateReplySuggestionsPromptPayloadSchema = z.object({
  emailContent: z.string().describe('The primary text content provided by the user.'),
  isReplyMode: z.boolean().describe('True if the mode is to reply to an email.'),
  isJobPostingMode: z.boolean().describe('True if the mode is to draft a job posting.'),
  isCasualMessageMode: z.boolean().describe('True if the mode is to write a casual message.'),
  // We can still pass selectedMode if the prompt text needs the raw value for some reason,
  // but the primary conditional logic will use the booleans.
  selectedMode: z.enum(['reply', 'jobPosting', 'casualMessage']).describe('The selected mode for generation.')
});
type GenerateReplySuggestionsPromptPayload = z.infer<typeof GenerateReplySuggestionsPromptPayloadSchema>;


const GenerateReplySuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested replies, a job posting draft, or casual message options, tailored to the input and mode.'),
});
export type GenerateReplySuggestionsOutput = z.infer<typeof GenerateReplySuggestionsOutputSchema>;

export async function generateReplySuggestions(
  input: GenerateReplySuggestionsInput
): Promise<GenerateReplySuggestionsOutput> {
  return generateReplySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReplySuggestionsPrompt',
  input: {schema: GenerateReplySuggestionsPromptPayloadSchema}, // Use the new payload schema
  output: {schema: GenerateReplySuggestionsOutputSchema},
  prompt: `{{#if isReplyMode}}
You are an AI assistant specialized in generating email reply suggestions.
Based on the content of the received email, provide three different reply suggestions.
Each suggestion should be concise and tailored to the email's content.
The suggestions should vary in tone and approach to provide the user with multiple options.

Email Content: {{{emailContent}}}

Reply Suggestions:
{{else if isJobPostingMode}}
You are an AI assistant specialized in crafting compelling job posting emails.
Based on the provided job description details, generate a complete draft for a job posting email.
The email should be professional, engaging, and clearly outline the role, responsibilities, qualifications, and company culture (if provided).
Include a clear call to action for interested candidates. If details are sparse, create a plausible and comprehensive job posting.

Job Description Details: {{{emailContent}}}

Job Posting Email Draft (provide as a single suggestion in the array):
{{else if isCasualMessageMode}}
You are an AI assistant skilled at writing casual and semi-formal messages for platforms like Telegram or Messenger.
Based on the user's input about the message context, generate three distinct message options.
The messages should be friendly, concise, and appropriate for the described situation. Vary the tone slightly for each option.

Message Context: {{{emailContent}}}

Message Options:
{{else}}
You are a helpful AI assistant. Please process the following input: {{{emailContent}}} for mode {{{selectedMode}}}.
{{/if}}
  `, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  }
});

const generateReplySuggestionsFlow = ai.defineFlow(
  {
    name: 'generateReplySuggestionsFlow',
    inputSchema: GenerateReplySuggestionsInputSchema, // Flow input remains the original schema
    outputSchema: GenerateReplySuggestionsOutputSchema,
  },
  async (flowInput: GenerateReplySuggestionsInput): Promise<GenerateReplySuggestionsOutput> => {
    // Transform the flow input to the prompt's expected payload
    const promptPayload: GenerateReplySuggestionsPromptPayload = {
      emailContent: flowInput.emailContent,
      selectedMode: flowInput.selectedMode,
      isReplyMode: flowInput.selectedMode === 'reply',
      isJobPostingMode: flowInput.selectedMode === 'jobPosting',
      isCasualMessageMode: flowInput.selectedMode === 'casualMessage',
    };

    const {output} = await prompt(promptPayload);

    // For job posting, if the AI provides one long string, ensure it's still in an array.
    // The schema expects an array of strings.
    if (flowInput.selectedMode === 'jobPosting' && output && output.suggestions.length > 0 && typeof output.suggestions[0] === 'string') {
        // If it's already an array (e.g. AI followed "provide as a single suggestion in the array"), this is fine.
        // If it's a single string that's not in an array yet, this is handled by Zod parsing.
        // The prompt now explicitly asks for it to be a single suggestion in the array.
    }
    return output!;
  }
);

