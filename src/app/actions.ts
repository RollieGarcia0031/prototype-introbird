
// src/app/actions.ts
"use server";

import { generateReplySuggestions } from "@/ai/flows/generate-reply-suggestions";
import { improveReplyDraft } from "@/ai/flows/improve-reply-draft";
import { z } from "zod";

// Schema for received email input / primary content input
const PrimaryContentSchema = z.object({
  primaryContent: z.string().min(10, "Input content must be at least 10 characters long."),
  selectedMode: z.enum(['reply', 'jobPosting', 'casualMessage', 'applyToJob'], {
    errorMap: () => ({ message: "Invalid mode selected." })
  }),
});

// Schema for reply draft input
const ReplyDraftSchema = z.object({
  draft: z.string().min(5, "Draft must be at least 5 characters long."),
});

// Schema for saving interaction
const SaveInteractionSchema = z.object({
  receivedEmail: z.string().min(10), 
  reply: z.string().min(5),
});

export async function generateRepliesAction(prevState: any, formData: FormData) {
  const rawFormData = {
    primaryContent: formData.get("primaryContent") as string,
    selectedMode: formData.get("selectedMode") as "reply" | "jobPosting" | "casualMessage" | "applyToJob",
  };

  const validatedFields = PrimaryContentSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Invalid input. " + (validatedFields.error.issues[0]?.message || ""),
      suggestions: [],
    };
  }

  try {
    const result = await generateReplySuggestions({ 
      emailContent: validatedFields.data.primaryContent, 
      selectedMode: validatedFields.data.selectedMode 
    });
    return { suggestions: result.suggestions, error: null };
  } catch (error) {
    console.error("Error generating suggestions:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Failed to generate suggestions: ${errorMessage}. Please try again.`, suggestions: [] };
  }
}

export async function improveDraftAction(prevState: any, formData: FormData) {
   const rawFormData = {
    draft: formData.get("draft") as string,
  };
  
  const validatedFields = ReplyDraftSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Invalid draft content. " + (validatedFields.error.issues[0]?.message || ""),
      refinedDraft: null,
    };
  }

  try {
    const result = await improveReplyDraft({ draft: validatedFields.data.draft });
    return { refinedDraft: result.refinedDraft, error: null };
  } catch (error) {
    console.error("Error improving draft:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Failed to improve draft: ${errorMessage}. Please try again.`, refinedDraft: null };
  }
}

export async function saveInteractionAction(prevState: any, formData: FormData) {
  const rawFormData = {
    receivedEmail: formData.get("receivedEmail") as string, 
    reply: formData.get("reply") as string,
  };

  const validatedFields = SaveInteractionSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Invalid data for saving. " + (validatedFields.error.issues[0]?.message || ""),
      success: false,
    };
  }
  
  try {
    console.log("Saving interaction:", validatedFields.data);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error saving interaction:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Failed to save interaction: ${errorMessage}. Please try again.`, success: false };
  }
}
