// src/app/customization/actions.ts
"use server";

import { z } from "zod";
import { saveUserCustomization, type UserCustomizationData } from "@/lib/firebase";
import { summarizeResumeFlow } from "@/ai/flows/summarize-resume-flow"; 

const CustomizationSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  firstName: z.string().max(100, "First name cannot exceed 100 characters.").optional(),
  lastName: z.string().max(100, "Last name cannot exceed 100 characters.").optional(),
  email: z.string().email({ message: "Invalid email address." }).max(200, "Email cannot exceed 200 characters.").optional().or(z.literal('')), // Allow empty string
  address: z.string().max(500, "Address cannot exceed 500 characters.").optional(),
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
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
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

  const { userId, firstName, lastName, email, address, customizationText, resumeSummaryText } = validatedFields.data;

  try {
    if (!userId) {
        throw new Error("User ID was not provided or is invalid.");
    }
    
    const dataToSave: Partial<UserCustomizationData> = {
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      email: email ?? "",
      address: address ?? "",
      customizationText: customizationText ?? "",
      resumeSummary: resumeSummaryText ?? ""
    };
    
    await saveUserCustomization(userId, dataToSave);
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
