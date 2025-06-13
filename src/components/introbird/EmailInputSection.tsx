
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
import { AlertTriangle, Loader2, Sparkles, Briefcase, Send, RefreshCw, Search } from "lucide-react"; 
import { generateRepliesAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AVAILABLE_MODELS } from '@/ai/model-definitions';

export type SelectedMode = "reply" | "jobPosting" | "casualMessage" | "applyToJob" | "rewriteMessage";

interface EmailInputSectionProps {
  selectedMode: SelectedMode;
  setSelectedMode: (mode: SelectedMode) => void;
  onSuggestionsGenerated: (suggestions: string[]) => void;
  setPrimaryInput: (text: string) => void;
  selectedAiModel: string;
  setSelectedAiModel: (model: string) => void;
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
    hasToneAndLimitOptions: true,
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
    hasToneAndLimitOptions: true,
  },
  casualMessage: {
    title: "Casual Job Inquiry",
    description: "You are an applicant. Paste a job description to draft a casual networking message or inquiry.",
    placeholder: "Paste the full job description here to draft a casual inquiry or networking message...",
    buttonText: "Draft Casual Inquiry",
    icon: Search, 
    hasToneAndLimitOptions: true,
  },
  rewriteMessage: {
    title: "Your Text to Rewrite",
    description: "Paste text to rewrite. Use advanced options for tone and length.",
    placeholder: "Paste the text you want to rewrite here...",
    buttonText: "Rewrite Text",
    icon: RefreshCw,
    hasToneAndLimitOptions: true,
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

const EmailInputSection: FC<EmailInputSectionProps> = ({ 
  selectedMode, 
  setSelectedMode, 
  onSuggestionsGenerated, 
  setPrimaryInput,
  selectedAiModel,
  setSelectedAiModel 
}) => {
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
    formData.set("selectedMode", selectedMode);
    formData.set("selectedModel", selectedAiModel);
    
    if (selectedTones.length > 0) {
      formData.set("tone", selectedTones.join(", "));
    }
    
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modeSelection" className="text-base font-medium">Select Mode:</Label>
              <RadioGroup
                id="modeSelection"
                value={selectedMode}
                onValueChange={(value) => {
                  setSelectedMode(value as SelectedMode);
                  setSelectedTones([]); 
                }}
                className="flex flex-col sm:flex-row flex-wrap gap-x-4 gap-y-2 mt-2"
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
                  <Label htmlFor="mode-casual">Casual Job Inquiry</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rewriteMessage" id="mode-rewrite" />
                  <Label htmlFor="mode-rewrite">Rewrite Text</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="aiModelSelection" className="text-base font-medium">Select AI Model:</Label>
              <Select value={selectedAiModel} onValueChange={setSelectedAiModel}>
                <SelectTrigger id="aiModelSelection" className="mt-2">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AVAILABLE_MODELS.GEMINI_FLASH}>Gemini Flash (Default)</SelectItem>
                  {/* <SelectItem value={AVAILABLE_MODELS.OPENAI_GPT_4O_MINI}>OpenAI GPT-4o Mini</SelectItem> */}
                  {/* <SelectItem value={AVAILABLE_MODELS.OPENAI_GPT_3_5_TURBO}>OpenAI GPT-3.5 Turbo</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
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
            <input type="hidden" name="selectedModel" value={selectedAiModel} />
          </div>
          
          {currentConfig.hasToneAndLimitOptions && (
             <Accordion type="single" collapsible className="w-full">
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
