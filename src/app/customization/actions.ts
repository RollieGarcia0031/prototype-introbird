// src/app/customization/actions.ts
"use server";

import { z } from "zod";
import { saveUserCustomization } from "@/lib/firebase";
import { getAuth } from "firebase/auth"; // For server-side auth (if needed, but usually client provides UID)
// For this specific action, we'll assume the client (logged-in user) provides their UID.
// If we needed to verify server-side, we'd use Firebase Admin SDK.

const CustomizationSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  customizationText: z.string().max(5000, "Customization text cannot exceed 5000 characters.").optional(), // Optional to allow clearing
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
  };

  const validatedFields = CustomizationSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      error: "Invalid input: " + (validatedFields.error.issues[0]?.message || "Validation failed."),
      success: false,
    };
  }

  const { userId, customizationText } = validatedFields.data;

  try {
    // Ensure userId is not null or undefined, although schema should catch empty string
    if (!userId) {
        throw new Error("User ID was not provided or is invalid.");
    }
    await saveUserCustomization(userId, customizationText ?? ""); // Pass empty string if undefined
    return { message: "Your customization data has been saved successfully!", success: true };
  } catch (error) {
    console.error("Error saving customization data:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { error: `Failed to save data: ${errorMessage}`, success: false };
  }
}
