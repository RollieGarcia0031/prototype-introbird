// src/components/introbird/ResponseEditorSection.tsx
"use client";

import React, { type FC, useState, useEffect } from 'react';
import { useActionState } from 'react'; // Updated import
import { useFormStatus } from 'react-dom';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertTriangle, BrainCircuit, Loader2, Edit, Copy } from "lucide-react";
import { improveDraftAction, refineWithInstructionAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { SelectedMode } from './EmailInputSection';
import { Separator } from '../ui/separator';

interface ResponseEditorSectionProps {
  initialReply: string;
  selectedMode: SelectedMode;
}

function ImproveButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      className="w-full sm:w-auto"
      disabled={pending}
      aria-label="Improve with AI"
      suppressHydrationWarning={true}
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
      Improve with AI
    </Button>
  );
}

function RefineWithInstructionButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      className="w-full"
      disabled={pending}
      aria-label="Refine with My Instruction"
      suppressHydrationWarning={true}
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
      Refine with My Instruction
    </Button>
  );
}

const ResponseEditorSection: FC<ResponseEditorSectionProps> = ({ initialReply, selectedMode }) => {
  const [currentReply, setCurrentReply] = useState(initialReply);
  const [editInstruction, setEditInstruction] = useState("");
  const { toast } = useToast();

  const improveInitialState = { refinedDraft: null, error: null };
  const [improveState, improveFormAction] = useActionState(improveDraftAction, improveInitialState);
  
  const refineWithInstructionInitialState = { refinedDraft: null, error: null };
  const [refineWithInstructionState, refineWithInstructionFormAction] = useActionState(refineWithInstructionAction, refineWithInstructionInitialState);

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
    if (refineWithInstructionState?.refinedDraft) {
      setCurrentReply(refineWithInstructionState.refinedDraft);
      setEditInstruction(""); // Clear instruction input
      toast({ title: "Draft Refined", description: "AI has refined your response based on your instruction." });
    }
    if (refineWithInstructionState?.error) {
      toast({ variant: "destructive", title: "Error Refining", description: refineWithInstructionState.error });
    }
  }, [refineWithInstructionState, toast]);

  const handleImproveSubmit = (formData: FormData) => {
    formData.set('draft', currentReply);
    improveFormAction(formData);
  };
  
  const handleRefineWithInstructionSubmit = (formData: FormData) => {
    formData.set('currentDraft', currentReply);
    formData.set('instruction', editInstruction);
    refineWithInstructionFormAction(formData);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentReply);
      toast({ title: "Copied to Clipboard", description: "The response has been copied." });
    } catch (err) {
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy text to clipboard." });
      console.error("Failed to copy text: ", err);
    }
  };
  
  let cardTitle = "Compose Your Reply";
  let cardDescription = "Edit the AI-generated reply or write your own. You can also ask AI to improve it or provide specific editing instructions.";

  if (selectedMode === 'jobPosting') {
    cardTitle = "Edit Job Posting Draft";
    cardDescription = "Refine the AI-drafted job posting. Use AI for general improvements or give specific instructions.";
  } else if (selectedMode === 'casualMessage') {
    cardTitle = "Edit Casual Message";
    cardDescription = "Adjust the AI-generated message. Use AI to enhance it or provide specific editing instructions.";
  } else if (selectedMode === 'applyToJob') {
    cardTitle = "Edit Application Email";
    cardDescription = "Refine your AI-drafted application email. Use AI for general improvements or give specific instructions.";
  }

  const instructionPlaceholder = `e.g., 'Make it more ${selectedMode === 'reply' || selectedMode === 'applyToJob' ? 'formal' : (selectedMode === 'jobPosting' ? 'engaging' : 'casual')}', 'Shorten it'`;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl sm:text-2xl">{cardTitle}</CardTitle>
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
         {refineWithInstructionState?.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Refinement Error</AlertTitle>
              <AlertDescription>{refineWithInstructionState.error}</AlertDescription>
            </Alert>
          )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
        <form action={handleImproveSubmit} className="w-full sm:w-auto">
           <input type="hidden" name="draft" value={currentReply} />
           <ImproveButton />
        </form>
        <Button
          variant="default"
          className="w-full sm:w-auto"
          onClick={handleCopyToClipboard}
          aria-label="Copy to Clipboard"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy to Clipboard
        </Button>
      </CardFooter>
      
      <Separator className="my-6" />

      <CardHeader className="pt-0">
        <CardTitle className="font-headline text-lg sm:text-xl">Suggest Specific Edits</CardTitle>
        <CardDescription>
          Provide instructions for the AI to refine the draft above.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={handleRefineWithInstructionSubmit} className="space-y-4">
            <div>
                <Label htmlFor="editInstruction" className="sr-only">Your Editing Suggestion</Label>
                <Textarea
                    id="editInstruction"
                    name="editInstruction"
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    placeholder={instructionPlaceholder}
                    rows={3}
                    className="min-h-[70px] resize-y"
                />
                <input type="hidden" name="currentDraft" value={currentReply} />
            </div>
            <div className="flex justify-end">
                <RefineWithInstructionButton />
            </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResponseEditorSection;
