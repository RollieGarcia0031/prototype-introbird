// src/components/introbird/ResponseSuggestionsSection.tsx
import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Edit3, MessageSquare, Send } from "lucide-react"; // Added Send, though Edit3 might be fine
import type { SelectedMode } from './EmailInputSection';

interface ResponseSuggestionsSectionProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
  selectedMode: SelectedMode;
}

const getButtonTextAndIcon = (mode: SelectedMode) => {
  switch (mode) {
    case 'reply':
      return { text: "Use this Reply", Icon: Copy };
    case 'jobPosting':
      return { text: "Use this Posting Draft", Icon: Edit3 };
    case 'applyToJob':
      return { text: "Use this Application Draft", Icon: Edit3 }; // Or Send
    case 'casualMessage':
      return { text: "Use this Message", Icon: MessageSquare };
    default:
      return { text: "Use this Suggestion", Icon: Copy };
  }
};

const ResponseSuggestionsSection: FC<ResponseSuggestionsSectionProps> = ({ suggestions, onSelectSuggestion, selectedMode }) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const { text: buttonText, Icon: ButtonIcon } = getButtonTextAndIcon(selectedMode);
  
  let titleText = "AI Suggestions";
  if (suggestions.length === 1) {
    if (selectedMode === 'jobPosting') {
      titleText = "AI Drafted Job Posting";
    } else if (selectedMode === 'applyToJob') {
      titleText = "AI Drafted Application Email";
    }
  }


  return (
    <div className="space-y-6">
      <h2 className="font-headline text-2xl font-semibold text-center">{titleText}</h2>
      <div className={`grid gap-6 ${suggestions.length === 1 && (selectedMode === 'jobPosting' || selectedMode === 'applyToJob') ? 'md:grid-cols-1' : 'md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="shadow-md flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-lg">
                {suggestions.length > 1 ? `Suggestion ${index + 1}` : 
                  (selectedMode === 'jobPosting' ? 'Job Posting Draft' : 
                  (selectedMode === 'applyToJob' ? 'Application Email Draft' : 'Suggestion'))}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm whitespace-pre-wrap">{suggestion}</p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectSuggestion(suggestion)}
                className="w-full"
                aria-label={`Use suggestion ${index + 1}`}
              >
                <ButtonIcon className="mr-2 h-4 w-4" />
                {buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResponseSuggestionsSection;
