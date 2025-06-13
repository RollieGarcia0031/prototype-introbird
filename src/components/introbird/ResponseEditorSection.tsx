// src/components/introbird/ResponseEditorSection.tsx
"use client";

import React, { type FC, useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertTriangle, BrainCircuit, Disc, Loader2 } from "lucide-react";
import { improveDraftAction, saveInteractionAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ResponseEditorSectionProps {
  initialReply: string;
  receivedEmail: string; // Needed for saving
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
    <Button type="submit" variant="default" className="w-full sm:w-auto" disabled={pending} aria-label="Save Reply">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Disc className="mr-2 h-4 w-4" />}
      Save Reply
    </Button>
  );
}

const ResponseEditorSection: FC<ResponseEditorSectionProps> = ({ initialReply, receivedEmail }) => {
  const [currentReply, setCurrentReply] = useState(initialReply);
  const { toast } = useToast();

  const improveInitialState = { refinedDraft: null, error: null };
  const [improveState, improveFormAction] = useFormState(improveDraftAction, improveInitialState);
  
  const saveInitialState = { success: false, error: null };
  const [saveState, saveFormAction] = useFormState(saveInteractionAction, saveInitialState);

  useEffect(() => {
    setCurrentReply(initialReply);
  }, [initialReply]);

  useEffect(() => {
    if (improveState?.refinedDraft) {
      setCurrentReply(improveState.refinedDraft);
      toast({ title: "Draft Improved", description: "AI has refined your reply." });
    }
    if (improveState?.error) {
      toast({ variant: "destructive", title: "Error Improving", description: improveState.error });
    }
  }, [improveState, toast]);

  useEffect(() => {
    if (saveState?.success) {
      toast({ title: "Reply Saved", description: "Your email interaction has been saved." });
    }
    if (saveState?.error) {
      toast({ variant: "destructive", title: "Error Saving", description: saveState.error });
    }
  }, [saveState, toast]);

  const handleImproveSubmit = (formData: FormData) => {
    formData.set('draft', currentReply); // Ensure currentReply is sent
    improveFormAction(formData);
  };

  const handleSaveSubmit = (formData: FormData) => {
    formData.set('receivedEmail', receivedEmail);
    formData.set('reply', currentReply);
    saveFormAction(formData);
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Compose Your Reply</CardTitle>
        <CardDescription>Edit the AI-generated reply or write your own. You can also ask AI to improve it.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="replyContent" className="sr-only">Your Reply</Label>
          <Textarea
            id="replyContent"
            name="replyContent" // Not directly used by form actions but good for semantics
            value={currentReply}
            onChange={(e) => setCurrentReply(e.target.value)}
            placeholder="Craft your perfect reply here..."
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
          <input type="hidden" name="receivedEmail" value={receivedEmail} />
          <input type="hidden" name="reply" value={currentReply} />
          <SaveButton />
        </form>
      </CardFooter>
    </Card>
  );
};

export default ResponseEditorSection;
