// src/app/page.tsx
"use client";

import React, { useState } from 'react';
import AppHeader from '@/components/introbird/AppHeader';
import EmailInputSection from '@/components/introbird/EmailInputSection';
import ResponseSuggestionsSection from '@/components/introbird/ResponseSuggestionsSection';
import ResponseEditorSection from '@/components/introbird/ResponseEditorSection';
import { Separator } from '@/components/ui/separator';

export default function IntroBirdPage() {
  const [receivedEmail, setReceivedEmail] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentReply, setCurrentReply] = useState<string>("");
  
  const handleSuggestionsGenerated = (newSuggestions: string[]) => {
    setSuggestions(newSuggestions);
    if (newSuggestions.length > 0) {
      setCurrentReply(newSuggestions[0]); // Auto-select the first suggestion
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setCurrentReply(suggestion);
    // Optionally, scroll to the editor section
    document.getElementById('response-editor-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-12">
        <EmailInputSection 
          onSuggestionsGenerated={handleSuggestionsGenerated} 
          setReceivedEmail={setReceivedEmail}
        />

        {suggestions.length > 0 && (
          <>
            <Separator className="my-8" />
            <ResponseSuggestionsSection
              suggestions={suggestions}
              onSelectSuggestion={handleSelectSuggestion}
            />
          </>
        )}
        
        {(suggestions.length > 0 || currentReply) && ( // Show editor if there are suggestions or if a reply is being composed
          <>
            <Separator className="my-8" />
            <div id="response-editor-section">
              <ResponseEditorSection
                initialReply={currentReply}
                receivedEmail={receivedEmail}
              />
            </div>
          </>
        )}
      </main>
      <footer className="py-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} IntroBird. All rights reserved.</p>
        <p className="mt-1">Note: AI model selection (Gemini/GPT) is a planned feature. Currently uses default Genkit AI model.</p>
      </footer>
    </div>
  );
}
