// src/components/introbird/EmailInputSection.tsx
"use client";

import React, { type FC, useActionState } from 'react'; // Added useActionState
import { useFormStatus } from 'react-dom'; // Removed useFormState
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { generateRepliesAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EmailInputSectionProps {
  onSuggestionsGenerated: (suggestions: string[]) => void;
  setReceivedEmail: (email: string) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending} aria-label="Generate Replies">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
      Generate Replies
    </Button>
  );
}

const EmailInputSection: FC<EmailInputSectionProps> = ({ onSuggestionsGenerated, setReceivedEmail }) => {
  const initialState = { suggestions: [], error: null };
  const [state, formAction] = useActionState(generateRepliesAction, initialState); // Changed to useActionState

  const handleFormAction = (formData: FormData) => {
    const emailContent = formData.get("emailContent") as string;
    setReceivedEmail(emailContent); // Store the email content locally for saving later
    formAction(formData);
  };
  
  React.useEffect(() => {
    if (state?.suggestions && state.suggestions.length > 0) {
      onSuggestionsGenerated(state.suggestions);
    }
  }, [state, onSuggestionsGenerated]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Your Received Email</CardTitle>
        <CardDescription>Paste the email you received below to get AI-powered reply suggestions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleFormAction} className="space-y-4">
          <div>
            <Label htmlFor="emailContent" className="sr-only">Received Email Content</Label>
            <Textarea
              id="emailContent"
              name="emailContent"
              placeholder="Paste the full email content here..."
              rows={10}
              className="min-h-[150px] resize-y"
              required
            />
          </div>
          {state?.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmailInputSection;
