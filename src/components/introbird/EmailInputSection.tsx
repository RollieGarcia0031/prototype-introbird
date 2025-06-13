// src/components/introbird/EmailInputSection.tsx
"use client";

import React, { type FC, useEffect } from 'react';
import { useActionState } from 'react'; // Updated import
import { useFormStatus } from 'react-dom';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Sparkles, MessagesSquare, Briefcase, Send } from "lucide-react";
import { generateRepliesAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type SelectedMode = "reply" | "jobPosting" | "casualMessage" | "applyToJob";

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
}

const modeConfigs: Record<SelectedMode, ModeConfig> = {
  reply: {
    title: "Your Received Email",
    description: "Paste the email you received below to get AI-powered reply suggestions.",
    placeholder: "Paste the full email content here...",
    buttonText: "Generate Replies",
    icon: Sparkles,
  },
  jobPosting: {
    title: "Job Posting Details",
    description: "Provide details about the job (title, responsibilities, qualifications, company info) to draft a posting email for recruiters/hirers.",
    placeholder: "Enter job title, key responsibilities, required qualifications, company overview, benefits, etc.",
    buttonText: "Draft Job Posting Email",
    icon: Briefcase,
  },
  applyToJob: {
    title: "Apply to Job Posting",
    description: "Paste the job posting you want to apply to. AI will help you draft an application email.",
    placeholder: "Paste the full job posting text here...",
    buttonText: "Draft Application Email",
    icon: Send,
  },
  casualMessage: {
    title: "Casual Message Context",
    description: "Describe the situation or topic for your Telegram/Messenger message.",
    placeholder: "E.g., 'Want to ask a friend to hang out this weekend', 'Need to congratulate a colleague on their promotion'",
    buttonText: "Generate Messages",
    icon: MessagesSquare,
  },
};

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

  const handleFormAction = (formData: FormData) => {
    const primaryContent = formData.get("primaryContent") as string;
    setPrimaryInput(primaryContent);
    formData.set("selectedMode", selectedMode);
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
              onValueChange={(value) => setSelectedMode(value as SelectedMode)}
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
            <input type="hidden" name="selectedMode" value={selectedMode} />
          </div>
          {state?.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end">
            <SubmitButton mode={selectedMode} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmailInputSection;
