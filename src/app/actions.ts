
// src/app/actions.ts
"use server";

import { generateReplySuggestions, type GenerateReplySuggestionsInput } from "@/ai/flows/generate-reply-suggestions";
import { improveReplyDraft } from "@/ai/flows/improve-reply-draft";
import { refineDraftWithInstruction } from "@/ai/flows/refine-draft-with-instruction";
import { z } from "zod";

// Schema for received email input / primary content input
const PrimaryContentSchema = z.object({
  primaryContent: z.string().min(10, "Input content must be at least 10 characters long."),
  selectedMode: z.enum(['reply', 'jobPosting', 'casualMessage', 'applyToJob', 'rewriteMessage'], {
    errorMap: () => ({ message: "Invalid mode selected." })
  }),
  tone: z.string().optional(),
  charLimit: z.coerce.number().positive("Character limit must be a positive number.").optional(),
  selectedModel: z.string().optional(),
  userId: z.string().optional(), // Added userId
});

// Schema for reply draft input (used by general "Improve" action)
const ReplyDraftSchema = z.object({
  draft: z.string().min(5, "Draft must be at least 5 characters long."),
  selectedModel: z.string().optional(),
});

// Schema for refining draft with instruction
const RefineWithInstructionSchema = z.object({
  currentDraft: z.string().min(5, "Current draft must be at least 5 characters long."),
  instruction: z.string().min(3, "Instruction must be at least 3 characters long."),
  selectedModel: z.string().optional(),
});


export async function generateRepliesAction(prevState: any, formData: FormData) {
  const rawFormData = {
    primaryContent: formData.get("primaryContent") as string,
    selectedMode: formData.get("selectedMode") as "reply" | "jobPosting" | "casualMessage" | "applyToJob" | "rewriteMessage",
    tone: formData.get("tone") as string || undefined,
    charLimit: formData.get("charLimit") ? Number(formData.get("charLimit")) : undefined,
    selectedModel: formData.get("selectedModel") as string || undefined,
    userId: formData.get("userId") as string || undefined, // Added userId
  };
  
  const validatedFields = PrimaryContentSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Invalid input. " + (validatedFields.error.issues[0]?.message || ""),
      suggestions: [],
    };
  }
  
  const { primaryContent, selectedMode, tone, charLimit, selectedModel, userId } = validatedFields.data;

  try {
    const flowInput: GenerateReplySuggestionsInput = { 
      emailContent: primaryContent, 
      selectedMode: selectedMode,
      tone: tone,
      charLimit: charLimit,
      selectedModel: selectedModel,
      userId: userId, // Pass userId to the flow
    };
    const result = await generateReplySuggestions(flowInput);
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
    selectedModel: formData.get("selectedModel") as string || undefined,
  };
  
  const validatedFields = ReplyDraftSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Invalid draft content. " + (validatedFields.error.issues[0]?.message || ""),
      refinedDraft: null,
    };
  }
  
  const { draft, selectedModel } = validatedFields.data;

  try {
    const result = await improveReplyDraft({ draft, selectedModel });
    return { refinedDraft: result.refinedDraft, error: null };
  } catch (error) {
    console.error("Error improving draft:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Failed to improve draft: ${errorMessage}. Please try again.`, refinedDraft: null };
  }
}

export async function refineWithInstructionAction(prevState: any, formData: FormData) {
  const rawFormData = {
    currentDraft: formData.get("currentDraft") as string,
    instruction: formData.get("instruction") as string,
    selectedModel: formData.get("selectedModel") as string || undefined,
  };

  const validatedFields = RefineWithInstructionSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Invalid input for refinement. " + (validatedFields.error.issues[0]?.message || ""),
      refinedDraft: null,
    };
  }
  
  const { currentDraft, instruction, selectedModel } = validatedFields.data;

  try {
    const result = await refineDraftWithInstruction({ 
      currentDraft,
      instruction,
      selectedModel, 
    });
    return { refinedDraft: result.refinedDraft, error: null };
  } catch (error) {
    console.error("Error refining draft with instruction:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Failed to refine draft: ${errorMessage}. Please try again.`, refinedDraft: null };
  }
}

