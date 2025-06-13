
// src/components/introbird/EmailInputSection.tsx
"use client";

import React, { type FC, useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Loader2, Sparkles, MessagesSquare, Briefcase, Send, RefreshCw } from "lucide-react";
import { generateRepliesAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type SelectedMode = "reply" | "jobPosting" | "casualMessage" | "applyToJob" | "rewriteMessage";

interface EmailInputSectionProps {
  selectedMode: SelectedMode;
  setSelectedMode: (mode: SelectedMode) => void;
  onSuggestionsGenerated: (suggestions: string[]) => void;
  setPrimaryInput: (text: string) => void;
}

interface ModeConfig {
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
  icon: React.ElementType;
  hasToneAndLimitOptions: boolean;
}

const modeConfigs: Record<SelectedMode, ModeConfig> = {
  reply: {
    title: "Your Received Email",
    description: "Paste the email you received. Use advanced options for tone and length.",
    placeholder: "Paste the full email content here...",
    buttonText: "Generate Replies",
    icon: Sparkles,
    hasToneAndLimitOptions: true, // Now true for all modes
  },
  jobPosting: {
    title: "Job Posting Details",
    description: "Provide job details. Use advanced options for tone and length.",
    placeholder: "Enter job title, key responsibilities, required qualifications, company overview, benefits, etc.",
    buttonText: "Draft Job Posting Email",
    icon: Briefcase,
    hasToneAndLimitOptions: true,
  },
  applyToJob: {
    title: "Apply to Job Posting",
    description: "Paste the job posting. Use advanced options for tone and length.",
    placeholder: "Paste the full job posting text here...",
    buttonText: "Draft Application Email",
    icon: Send,
    hasToneAndLimitOptions: true, // Now true for all modes
  },
  casualMessage: {
    title: "Casual Message Context",
    description: "Describe the situation. Use advanced options for tone and length.",
    placeholder: "E.g., 'Want to ask a friend to hang out this weekend', 'Need to congratulate a colleague on their promotion'",
    buttonText: "Generate Messages",
    icon: MessagesSquare,
    hasToneAndLimitOptions: true,
  },
  rewriteMessage: {
    title: "Your Text to Rewrite",
    description: "Paste text to rewrite. Use advanced options for tone and length.",
    placeholder: "Paste the text you want to rewrite here...",
    buttonText: "Rewrite Text",
    icon: RefreshCw,
    hasToneAndLimitOptions: true, // Now true for all modes
  }
};

const allToneOptions = [
  { id: "formal", label: "Formal" },
  { id: "casual", label: "Casual" },
  { id: "friendly", label: "Friendly" },
  { id: "professional", label: "Professional" },
  { id: "concise", label: "Concise" },
  { id: "detailed", label: "Detailed" },
  { id: "confident", label: "Confident" },
  { id: "empathetic", label: "Empathetic" },
  { id: "humorous", label: "Humorous" },
  { id: "urgent", label: "Urgent" },
];

function SubmitButton({ mode }: { mode: SelectedMode }) {
  const { pending } = useFormStatus();
  const Icon = modeConfigs[mode].icon;
  return (
    <Button
      type="submit"
      className="w-full sm:w-auto"
      disabled={pending}
      aria-label={modeConfigs[mode].buttonText}
      suppressHydrationWarning={true}
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
      {modeConfigs[mode].buttonText}
    </Button>
  );
}

const EmailInputSection: FC<EmailInputSectionProps> = ({ selectedMode, setSelectedMode, onSuggestionsGenerated, setPrimaryInput }) => {
  const initialState = { suggestions: [], error: null };
  const [state, formAction] = useActionState(generateRepliesAction, initialState);
  const [selectedTones, setSelectedTones] = useState<string[]>([]);

  const handleToneChange = (toneId: string) => {
    setSelectedTones(prev =>
      prev.includes(toneId) ? prev.filter(t => t !== toneId) : [...prev, toneId]
    );
  };

  const handleFormAction = (formData: FormData) => {
    const primaryContent = formData.get("primaryContent") as string;
    setPrimaryInput(primaryContent);
    formData.set("selectedMode", selectedMode); // Ensure selectedMode is part of formData
    
    if (selectedTones.length > 0) {
      formData.set("tone", selectedTones.join(", "));
    }
    // charLimit is directly picked up by name="charLimit" on the Input
    
    formAction(formData);
  };

  useEffect(() => {
    if (state?.suggestions && state.suggestions.length > 0) {
      onSuggestionsGenerated(state.suggestions);
    }
  }, [state, onSuggestionsGenerated]);

  const currentConfig = modeConfigs[selectedMode];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl sm:text-2xl">{currentConfig.title}</CardTitle>
        <CardDescription>{currentConfig.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleFormAction} className="space-y-6">
          <div>
            <Label htmlFor="modeSelection" className="text-base font-medium">Select Mode:</Label>
            <RadioGroup
              id="modeSelection"
              value={selectedMode}
              onValueChange={(value) => {
                setSelectedMode(value as SelectedMode);
                setSelectedTones([]); // Reset tones when mode changes
              }}
              className="flex flex-col sm:flex-row flex-wrap gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reply" id="mode-reply" />
                <Label htmlFor="mode-reply">Reply to Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jobPosting" id="mode-job-posting" />
                <Label htmlFor="mode-job-posting">Draft Job Posting</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="applyToJob" id="mode-apply-job" />
                <Label htmlFor="mode-apply-job">Apply to Job</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="casualMessage" id="mode-casual" />
                <Label htmlFor="mode-casual">Casual Message</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rewriteMessage" id="mode-rewrite" />
                <Label htmlFor="mode-rewrite">Rewrite Text</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="primaryContent" className="sr-only">{currentConfig.title}</Label>
            <Textarea
              id="primaryContent"
              name="primaryContent"
              placeholder={currentConfig.placeholder}
              rows={10}
              className="min-h-[150px] resize-y"
              required
            />
            {/* Hidden input to ensure selectedMode is always part of the form data for the action */}
            <input type="hidden" name="selectedMode" value={selectedMode} />
          </div>
          
          {currentConfig.hasToneAndLimitOptions && ( // This condition will always be true now
            <Accordion type="single" collapsible className="w-full"> {/* Removed defaultValue to make it collapsed by default */}
              <AccordionItem value="advanced-options">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  Advanced Tone & Length Options
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div>
                    <Label className="text-base font-medium">Tone Characteristics (Choose one or more)</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-2">
                      {allToneOptions.map(option => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tone-${option.id}`}
                            checked={selectedTones.includes(option.id)}
                            onCheckedChange={() => handleToneChange(option.id)}
                          />
                          <Label htmlFor={`tone-${option.id}`} className="font-normal text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="charLimit" className="text-base font-medium">Character Limit (Optional)</Label>
                    <Input
                      id="charLimit"
                      name="charLimit"
                      type="number"
                      placeholder="E.g., 150"
                      className="mt-1"
                      min="10"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {state?.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end pt-4">
            <SubmitButton mode={selectedMode} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmailInputSection;
    
