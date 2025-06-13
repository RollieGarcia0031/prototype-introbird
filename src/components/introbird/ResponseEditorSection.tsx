// src/components/introbird/ResponseEditorSection.tsx
"use client";

import React, { type FC, useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertTriangle, BrainCircuit, Disc, Loader2 } from "lucide-react";
import { improveDraftAction, saveInteractionAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { SelectedMode } from './EmailInputSection'; // Import the type

interface ResponseEditorSectionProps {
  initialReply: string;
  primaryInput: string; // Renamed from receivedEmail
  selectedMode: SelectedMode;
}

function ImproveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" className="w-full sm:w-auto" disabled={pending} aria-label="Improve with AI">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
      Improve with AI
    </Button>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="default" className="w-full sm:w-auto" disabled={pending} aria-label="Save Interaction">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Disc className="mr-2 h-4 w-4" />}
      Save Interaction
    </Button>
  );
}

const ResponseEditorSection: FC<ResponseEditorSectionProps> = ({ initialReply, primaryInput, selectedMode }) => {
  const [currentReply, setCurrentReply] = useState(initialReply);
  const { toast } = useToast();

  const improveInitialState = { refinedDraft: null, error: null };
  const [improveState, improveFormAction] = useActionState(improveDraftAction, improveInitialState);
  
  const saveInitialState = { success: false, error: null };
  const [saveState, saveFormAction] = useActionState(saveInteractionAction, saveInitialState);

  useEffect(() => {
    setCurrentReply(initialReply);
  }, [initialReply]);

  useEffect(() => {
    if (improveState?.refinedDraft) {
      setCurrentReply(improveState.refinedDraft);
      toast({ title: "Draft Improved", description: "AI has refined your response." });
    }
    if (improveState?.error) {
      toast({ variant: "destructive", title: "Error Improving", description: improveState.error });
    }
  }, [improveState, toast]);

  useEffect(() => {
    if (saveState?.success) {
      toast({ title: "Interaction Saved", description: "Your interaction has been saved." });
    }
    if (saveState?.error) {
      toast({ variant: "destructive", title: "Error Saving", description: saveState.error });
    }
  }, [saveState, toast]);

  const handleImproveSubmit = (formData: FormData) => {
    formData.set('draft', currentReply);
    improveFormAction(formData);
  };

  const handleSaveSubmit = (formData: FormData) => {
    formData.set('receivedEmail', primaryInput); // Keep as receivedEmail for backend compatibility for now
    formData.set('reply', currentReply);
    // Potentially add selectedMode to save action if backend needs it
    saveFormAction(formData);
  };
  
  const cardTitle = selectedMode === 'jobPosting' ? "Edit Job Posting Draft" : (selectedMode === 'casualMessage' ? "Edit Casual Message" : "Compose Your Reply");
  const cardDescription = selectedMode === 'jobPosting' 
    ? "Refine the AI-drafted job posting or write your own. You can ask AI to improve it."
    : (selectedMode === 'casualMessage' 
        ? "Adjust the AI-generated message or write your own. Use AI to enhance it."
        : "Edit the AI-generated reply or write your own. You can also ask AI to improve it.");


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="replyContent" className="sr-only">Your Response</Label>
          <Textarea
            id="replyContent"
            name="replyContent" 
            value={currentReply}
            onChange={(e) => setCurrentReply(e.target.value)}
            placeholder="Craft your perfect response here..."
            rows={12}
            className="min-h-[200px] resize-y"
          />
        </div>
        {improveState?.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Improve Error</AlertTitle>
              <AlertDescription>{improveState.error}</AlertDescription>
            </Alert>
          )}
        {saveState?.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Save Error</AlertTitle>
              <AlertDescription>{saveState.error}</AlertDescription>
            </Alert>
          )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
        <form action={handleImproveSubmit} className="w-full sm:w-auto">
           <input type="hidden" name="draft" value={currentReply} />
           <ImproveButton />
        </form>
        <form action={handleSaveSubmit} className="w-full sm:w-auto">
          <input type="hidden" name="receivedEmail" value={primaryInput} />
          <input type="hidden" name="reply" value={currentReply} />
          <SaveButton />
        </form>
      </CardFooter>
    </Card>
  );
};

export default ResponseEditorSection;
