// src/app/page.tsx
"use client";

import React, { useState } from 'react';
// AppHeader is now in layout.tsx
import EmailInputSection from '@/components/introbird/EmailInputSection';
import ResponseSuggestionsSection from '@/components/introbird/ResponseSuggestionsSection';
import ResponseEditorSection from '@/components/introbird/ResponseEditorSection';
import { Separator } from '@/components/ui/separator';
import type { SelectedMode } from '@/components/introbird/EmailInputSection';
import { AVAILABLE_MODELS } from '@/ai/model-definitions'; 

export default function IntroBirdPage() {
  const [receivedEmail, setReceivedEmail] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentReply, setCurrentReply] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<SelectedMode>("reply");
  const [selectedAiModel, setSelectedAiModel] = useState<string>(AVAILABLE_MODELS.GEMINI_FLASH);


  const handleSuggestionsGenerated = (newSuggestions: string[]) => {
    setSuggestions(newSuggestions);
    if (newSuggestions.length > 0) {
      setCurrentReply(newSuggestions[0]);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setCurrentReply(suggestion);
    document.getElementById('response-editor-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* AppHeader has been moved to src/app/layout.tsx */}
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-12">
        <EmailInputSection
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
          onSuggestionsGenerated={handleSuggestionsGenerated}
          setPrimaryInput={setReceivedEmail}
          selectedAiModel={selectedAiModel}
          setSelectedAiModel={setSelectedAiModel}
        />

        {suggestions.length > 0 && (
          <>
            <Separator className="my-8" />
            <ResponseSuggestionsSection
              suggestions={suggestions}
              onSelectSuggestion={handleSelectSuggestion}
              selectedMode={selectedMode}
            />
          </>
        )}

        {(suggestions.length > 0 || currentReply) && (
          <>
            <Separator className="my-8" />
            <div id="response-editor-section">
              <ResponseEditorSection
                initialReply={currentReply}
                selectedMode={selectedMode}
                selectedAiModel={selectedAiModel}
              />
            </div>
          </>
        )}
      </main>
      <footer className="py-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} IntroBird. All rights reserved.</p>
        <p>OpenAI models are temporarily unavailable due to package installation issues.</p>
      </footer>
    </div>
  );
}
