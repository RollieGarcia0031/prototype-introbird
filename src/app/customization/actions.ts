// src/app/customization/actions.ts
"use server";

import { z } from "zod";
import { saveUserCustomization } from "@/lib/firebase";
import { summarizeResumeFlow } from "@/ai/flows/summarize-resume-flow"; // Will be created

const CustomizationSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  customizationText: z.string().max(5000, "Customization text cannot exceed 5000 characters.").optional(),
  resumeSummaryText: z.string().max(10000, "Resume summary cannot exceed 10000 characters.").optional(),
});

interface SaveCustomizationState {
  message?: string;
  error?: string;
  success?: boolean;
}

export async function saveCustomizationAction(prevState: SaveCustomizationState, formData: FormData): Promise<SaveCustomizationState> {
  const rawFormData = {
    userId: formData.get("userId") as string,
    customizationText: formData.get("customizationText") as string,
    resumeSummaryText: formData.get("resumeSummaryText") as string,
  };

  const validatedFields = CustomizationSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Invalid input: " + (validatedFields.error.issues[0]?.message || "Validation failed."),
      success: false,
    };
  }

  const { userId, customizationText, resumeSummaryText } = validatedFields.data;

  try {
    if (!userId) {
        throw new Error("User ID was not provided or is invalid.");
    }
    await saveUserCustomization(userId, customizationText ?? "", resumeSummaryText ?? "");
    return { message: "Your customization data has been saved successfully!", success: true };
  } catch (error) {
    console.error("Error saving customization data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { error: `Failed to save data: ${errorMessage}`, success: false };
  }
}

const SummarizeResumeSchema = z.object({
  resumePdfDataUri: z.string()
    .startsWith('data:application/pdf;base64,', { message: "Invalid PDF data URI format." })
    .describe("The PDF resume encoded as a Base64 data URI."),
  // userId is not strictly needed by the flow but good for validation/logging if ever
  userId: z.string().min(1, "User ID is required for resume processing."),
});

interface SummarizeResumeState {
  summary?: string;
  error?: string;
}

export async function summarizeResumeAction(prevState: SummarizeResumeState, formData: FormData): Promise<SummarizeResumeState> {
  const rawFormData = {
    resumePdfDataUri: formData.get("resumePdfDataUri") as string,
    userId: formData.get("userId") as string,
  };

  const validatedFields = SummarizeResumeSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Invalid PDF data: " + (validatedFields.error.issues[0]?.message || "Validation failed."),
    };
  }

  const { resumePdfDataUri } = validatedFields.data;

  try {
    const result = await summarizeResumeFlow({ resumePdfDataUri });
    return { summary: result.summary };
  } catch (error) {
    console.error("Error summarizing resume:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during summarization.";
    return { error: `Failed to summarize resume: ${errorMessage}` };
  }
}
