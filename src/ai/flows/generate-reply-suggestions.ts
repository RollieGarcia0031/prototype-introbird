
'use server';

/**
 * @fileOverview AI agent for generating text based on selected mode (email reply, job posting, casual message, apply to job, rewrite message).
 *
 * - generateReplySuggestions - A function that handles the generation of text suggestions.
 * - GenerateReplySuggestionsInput - The input type for the generateReplySuggestions function.
 * - GenerateReplySuggestionsOutput - The return type for the generateReplySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getUserCustomization, type UserCustomizationData } from '@/lib/firebase'; // Added

// Schema for the overall flow input
const GenerateReplySuggestionsInputSchema = z.object({
  emailContent: z.string().describe('The content of the email to reply to, job description details, casual message context, job posting to apply to, or text to rewrite.'),
  selectedMode: z.enum(['reply', 'jobPosting', 'casualMessage', 'applyToJob', 'rewriteMessage']).describe('The selected mode for generation.'),
  tone: z.string().optional().describe('The desired tone or style for the message (e.g., formal, casual).'),
  charLimit: z.number().optional().describe('An approximate character limit for the generated message.'),
  selectedModel: z.string().optional().describe('The AI model to use for generation.'),
  userId: z.string().optional().describe('The ID of the logged-in user to fetch customization data.'), // Added userId
});
export type GenerateReplySuggestionsInput = z.infer<typeof GenerateReplySuggestionsInputSchema>;

// Schema for the prompt's specific input payload
const GenerateReplySuggestionsPromptPayloadSchema = z.object({
  emailContent: z.string().describe('The primary text content provided by the user.'),
  isReplyMode: z.boolean().describe('True if the mode is to reply to an email.'),
  isJobPostingMode: z.boolean().describe('True if the mode is to draft a job posting email (for recruiters).'),
  isApplyToJobMode: z.boolean().describe('True if the mode is to draft an application email for a job posting (for applicants).'),
  isCasualMessageMode: z.boolean().describe('True if the mode is to write a casual message.'),
  isRewriteMessageMode: z.boolean().describe('True if the mode is to rewrite the provided text.'),
  selectedMode: z.enum(['reply', 'jobPosting', 'casualMessage', 'applyToJob', 'rewriteMessage']).describe('The selected mode for generation.'),
  tone: z.string().optional().describe('The desired tone for the output.'),
  charLimit: z.number().optional().describe('The approximate character limit for the output.'),
  // User customization fields (all optional)
  userName: z.string().optional().describe("The user's full name (first and last)."),
  userEmail: z.string().optional().describe("The user's email address."),
  userAddress: z.string().optional().describe("The user's physical address."),
  userSummary: z.string().optional().describe("The user's personal summary, bio, or skills overview."),
  userResumeSummary: z.string().optional().describe("The AI-generated or user-edited summary of the user's resume."),
});
type GenerateReplySuggestionsPromptPayload = z.infer<typeof GenerateReplySuggestionsPromptPayloadSchema>;


const GenerateReplySuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested replies, a job posting draft, an application email draft, casual message options, or a rewritten text, tailored to the input and mode.'),
});
export type GenerateReplySuggestionsOutput = z.infer<typeof GenerateReplySuggestionsOutputSchema>;

export async function generateReplySuggestions(
  input: GenerateReplySuggestionsInput
): Promise<GenerateReplySuggestionsOutput> {
  return generateReplySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReplySuggestionsPrompt',
  input: {schema: GenerateReplySuggestionsPromptPayloadSchema},
  output: {schema: GenerateReplySuggestionsOutputSchema},
  prompt: `You are an AI assistant tasked with writing professional, well-structured emails. Always match the tone to the context (e.g., formal for business, friendly but polite for internal messages). Strive for sincerity in your responses. Start with an appropriate greeting, clearly state the purpose, provide necessary details in a logical flow, and end with a courteous closing. Keep the language concise, respectful, and free of grammatical errors. Use bullet points or paragraphs when needed for clarity.

{{#if userName}}
You are assisting {{{userName}}}. Here is some information about them:
{{#if userEmail}}Email: {{{userEmail}}}{{/if}}
{{#if userAddress}}Address: {{{userAddress}}}{{/if}}
{{#if userSummary}}Personal Summary/Bio:
{{{userSummary}}}
{{/if}}
{{#if userResumeSummary}}Resume Summary:
{{{userResumeSummary}}}
{{/if}}
Please use this information to personalize the response and align it with their details where appropriate (e.g., using their name in signatures or greetings, referencing their skills or experience). Ensure the generated content reflects these personal details naturally and effectively.
{{/if}}

{{#if isReplyMode}}
Your specific task now is to generate email reply suggestions.
Based on the content of the received email, provide three different reply suggestions.
Each suggestion should be concise and tailored to the email's content.
The suggestions should vary in approach to provide the user with multiple options.
{{#if tone}}Please adopt the following tone characteristics: {{{tone}}}.{{else}}Ensure your suggestions are professional, polite, and sincere.{{/if}}
{{#if charLimit}}Please try to keep each suggestion to approximately {{{charLimit}}} characters.{{/if}}

Email Content: {{{emailContent}}}

Reply Suggestions:
{{else if isJobPostingMode}}
Your specific task now is to craft compelling job posting emails for recruiters or hiring managers.
Based on the provided job description details, generate a complete draft for a job posting email.
The email should be engaging and clearly outline the role, responsibilities, qualifications, and company culture (if provided).
Include a clear call to action for interested candidates. If details are sparse, create a plausible and comprehensive job posting.
{{#if tone}}Please adopt the following tone characteristics: {{{tone}}}.{{else}}Ensure the draft is professional, polite, and sincere.{{/if}}
{{#if charLimit}}Please try to keep the email to approximately {{{charLimit}}} characters.{{/if}}

Job Description Details: {{{emailContent}}}

Job Posting Email Draft (provide as a single suggestion in the array):
{{else if isApplyToJobMode}}
Your specific task now is to help users draft compelling application emails for job postings.
The user will provide a job posting. Your task is to generate a complete, professional, and tailored application email based on this job posting.
The output should be a full email message, starting with an appropriate email subject line (e.g., "Subject: Application for [Job Title] - {{#if userName}}{{{userName}}}{{else}}[Your Name]{{/if}}"), followed by a professional greeting (e.g., "Dear [Hiring Manager Name, if known, otherwise 'Hiring Team'],"), the body of the email, and a professional closing (e.g., "Sincerely,\n{{#if userName}}{{{userName}}}{{else}}[Your Name]{{/if}}{{#if userEmail}}\n{{{userEmail}}}{{else}}\n[Your Email]{{/if}}{{#if userAddress}}\n{{{userAddress}}}{{else}}\n[Your Address/Phone]{{/if}}").
The email body should highlight how a candidate might present themselves as suitable for the role, focusing on common desirable traits and skills. If user-specific details like userSummary or userResumeSummary are available, leverage them to make the application more compelling and personalized.
Include placeholders like "[Hiring Manager Name, if known, otherwise 'Hiring Team']", "[Company Name]", and "[Job Title mentioned in Posting]" where appropriate if not inferable from context or user data.
The goal is to create a strong, complete email template that the user can then personalize.
{{#if tone}}Please adopt the following tone characteristics: {{{tone}}}.{{else}}Ensure the draft is professional, polite, sincere, and enthusiastic.{{/if}}
{{#if charLimit}}Please try to keep the email to approximately {{{charLimit}}} characters.{{/if}}

Job Posting Content (provided by user): {{{emailContent}}}

Application Email Draft (provide as a single suggestion in the array, including subject, greeting, body, and closing):
{{else if isCasualMessageMode}}
Your specific task now is to draft casual networking messages or inquiries for job applicants.
The user is an applicant and will provide a job description.
Based on this job description, generate three distinct casual message options that an applicant could use to reach out to someone at the company, inquire about the role, or express interest.
The messages should be friendly, concise, and suitable for platforms like LinkedIn or a less formal email. Vary the approach for each option.
Include placeholders like "[Their Name]", "[Company Name]", "[Job Title]" where appropriate. If user data (like userName) is available, incorporate it naturally.
{{#if tone}}Please adopt the following tone characteristics: {{{tone}}}.{{else}}Ensure your messages are friendly, polite, and sincere.{{/if}}
{{#if charLimit}}Please try to keep each message option to approximately {{{charLimit}}} characters.{{/if}}

Job Description (provided by user): {{{emailContent}}}

Casual Inquiry/Networking Message Options:
{{else if isRewriteMessageMode}}
Your specific task now is to rewrite and rephrase text.
The user will provide a piece of text. Your task is to rewrite it. You can aim to improve clarity, adjust the tone, make it more concise, or enhance its overall style.
Provide one rewritten version of the text.
{{#if tone}}Please adopt the following tone characteristics: {{{tone}}}.{{else}}Ensure the rewritten text is professional, polite, and sincere, unless the nature of the rewrite implies otherwise (e.g., making it more casual).{{/if}}
{{#if charLimit}}Please try to keep the rewritten text to approximately {{{charLimit}}} characters.{{/if}}

Original Text: {{{emailContent}}}

Rewritten Text (provide as a single suggestion in the array):
{{else}}
Please process the following input: {{{emailContent}}} for mode {{{selectedMode}}}.
{{#if tone}}Please adopt the following tone characteristics: {{{tone}}}.{{else}}Ensure the output is professional, polite, and sincere.{{/if}}
{{#if charLimit}}Please try to keep the output to approximately {{{charLimit}}} characters.{{/if}}
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

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds

const generateReplySuggestionsFlow = ai.defineFlow(
  {
    name: 'generateReplySuggestionsFlow',
    inputSchema: GenerateReplySuggestionsInputSchema,
    outputSchema: GenerateReplySuggestionsOutputSchema,
  },
  async (flowInput: GenerateReplySuggestionsInput): Promise<GenerateReplySuggestionsOutput> => {
    let userCustomData: UserCustomizationData | null = null;
    if (flowInput.userId) {
      try {
        userCustomData = await getUserCustomization(flowInput.userId);
      } catch (error) {
        console.warn(`Failed to fetch user customization data for userId ${flowInput.userId}:`, error);
        // Proceed without customization data if fetching fails
      }
    }
    
    let userName;
    if (userCustomData?.firstName || userCustomData?.lastName) {
        userName = `${userCustomData.firstName || ''} ${userCustomData.lastName || ''}`.trim();
    }


    const promptPayload: GenerateReplySuggestionsPromptPayload = {
      emailContent: flowInput.emailContent,
      selectedMode: flowInput.selectedMode,
      isReplyMode: flowInput.selectedMode === 'reply',
      isJobPostingMode: flowInput.selectedMode === 'jobPosting',
      isApplyToJobMode: flowInput.selectedMode === 'applyToJob',
      isCasualMessageMode: flowInput.selectedMode === 'casualMessage',
      isRewriteMessageMode: flowInput.selectedMode === 'rewriteMessage',
      tone: flowInput.tone,
      charLimit: flowInput.charLimit,
      userName: userName,
      userEmail: userCustomData?.email || undefined,
      userAddress: userCustomData?.address || undefined,
      userSummary: userCustomData?.customizationText || undefined,
      userResumeSummary: userCustomData?.resumeSummary || undefined,
    };

    const promptOptions = flowInput.selectedModel ? { model: flowInput.selectedModel } : {};

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const {output} = await prompt(promptPayload, promptOptions);
        if ((flowInput.selectedMode === 'jobPosting' || flowInput.selectedMode === 'applyToJob' || flowInput.selectedMode === 'rewriteMessage') && output && output.suggestions.length > 0 && typeof output.suggestions[0] === 'string') {
            // The prompt now explicitly asks for it to be a single suggestion in the array for these modes.
        }
        return output!; // Success
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if ((errorMessage.includes('503') || errorMessage.toLowerCase().includes('overload') || errorMessage.toLowerCase().includes('service unavailable')) && attempt < MAX_RETRIES) {
          console.warn(`Attempt ${attempt} failed for generateReplySuggestionsFlow: ${errorMessage}. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        } else {
          console.error(`Final attempt (${attempt}) failed for generateReplySuggestionsFlow or non-retryable error: ${errorMessage}`);
          throw error;
        }
      }
    }
    throw new Error('Failed to generate reply suggestions after multiple retries.');
  }
);

