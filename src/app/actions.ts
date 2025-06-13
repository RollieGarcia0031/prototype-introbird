
// src/app/actions.ts
"use server";

import { generateReplySuggestions } from "@/ai/flows/generate-reply-suggestions";
import { improveReplyDraft } from "@/ai/flows/improve-reply-draft";
import { z } from "zod";

// Schema for received email input / primary content input
const PrimaryContentSchema = z.object({
  primaryContent: z.string().min(10, "Input content must be at least 10 characters long."),
  selectedMode: z.enum(['reply', 'jobPosting', 'casualMessage'], {
    errorMap: () => ({ message: "Invalid mode selected." })
  }),
});

// Schema for reply draft input
const ReplyDraftSchema = z.object({
  draft: z.string().min(5, "Draft must be at least 5 characters long."),
});

// Schema for saving interaction
const SaveInteractionSchema = z.object({
  receivedEmail: z.string().min(10), // This might need to be more generic if saving non-email interactions
  reply: z.string().min(5),
  // selectedMode: z.enum(['reply', 'jobPosting', 'casualMessage']).optional(), // If you want to save the mode
});

export async function generateRepliesAction(prevState: any, formData: FormData) {
  const rawFormData = {
    primaryContent: formData.get("primaryContent") as string,
    selectedMode: formData.get("selectedMode") as "reply" | "jobPosting" | "casualMessage",
  };

  const validatedFields = PrimaryContentSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Invalid input. " + (validatedFields.error.issues[0]?.message || ""),
      suggestions: [],
    };
  }

  try {
    // Map primaryContent to emailContent for the AI flow for now
    const result = await generateReplySuggestions({ 
      emailContent: validatedFields.data.primaryContent, // Flow expects emailContent
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
    // Note: improveReplyDraft might also need to be mode-aware in the future
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
    receivedEmail: formData.get("receivedEmail") as string, // Stays as receivedEmail for now
    reply: formData.get("reply") as string,
    // selectedMode: formData.get("selectedMode") as "reply" | "jobPosting" | "casualMessage" | undefined,
  };

  const validatedFields = SaveInteractionSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Invalid data for saving. " + (validatedFields.error.issues[0]?.message || ""),
      success: false,
    };
  }
  
  try {
    // Placeholder for Firestore saving logic
    console.log("Saving interaction:", validatedFields.data);
    // To implement actual Firestore saving:
    // 1. Setup Firebase Admin SDK or Firebase client SDK for server-side operations.
    // 2. Initialize Firebase app.
    // 3. Use Firestore API to add a document to a collection (e.g., 'userInteractions').
    // Example (conceptual):
    // import { db } from '@/lib/firebase'; // Assuming db is exported from firebase.ts
    // await db.collection('userInteractions').add({
    //   primaryInput: data.receivedEmail, // or a more generic field name
    //   response: data.reply,
    //   mode: data.selectedMode, // if saving mode
    //   timestamp: new Date(),
    // });
    return { success: true, error: null };
  } catch (error) {
    console.error("Error saving interaction:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Failed to save interaction: ${errorMessage}. Please try again.`, success: false };
  }
}

