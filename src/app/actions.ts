// src/app/actions.ts
"use server";

import { generateReplySuggestions } from "@/ai/flows/generate-reply-suggestions";
import { improveReplyDraft } from "@/ai/flows/improve-reply-draft";
import { z } from "zod";

// Schema for received email input
const ReceivedEmailSchema = z.object({
  emailContent: z.string().min(10, "Email content must be at least 10 characters long."),
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
    emailContent: formData.get("emailContent") as string,
  };

  const validatedFields = ReceivedEmailSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Invalid email content. " + (validatedFields.error.issues[0]?.message || ""),
      suggestions: [],
    };
  }

  try {
    const result = await generateReplySuggestions({ emailContent: validatedFields.data.emailContent });
    return { suggestions: result.suggestions, error: null };
  } catch (error) {
    console.error("Error generating reply suggestions:", error);
    return { error: "Failed to generate suggestions. Please try again.", suggestions: [] };
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
    return { error: "Failed to improve draft. Please try again.", refinedDraft: null };
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
    // Placeholder for Firestore saving logic
    console.log("Saving interaction:", validatedFields.data);
    // Simulate successful save
    // To implement actual Firestore saving:
    // 1. Setup Firebase Admin SDK or Firebase client SDK for server-side operations.
    // 2. Initialize Firebase app.
    // 3. Use Firestore API to add a document to a collection (e.g., 'userInteractions').
    // Example (conceptual):
    // import { db } from '@/lib/firebase'; // Assuming db is exported from firebase.ts
    // await db.collection('userInteractions').add({
    //   receivedEmail: data.receivedEmail,
    //   reply: data.reply,
    //   timestamp: new Date(),
    //   // userId: ... // If user authentication is implemented
    // });
    return { success: true, error: null };
  } catch (error) {
    console.error("Error saving interaction:", error);
    return { error: "Failed to save interaction. Please try again.", success: false };
  }
}
