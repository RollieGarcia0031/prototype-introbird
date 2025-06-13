// src/components/introbird/ResponseSuggestionsSection.tsx
import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Edit3, MessageSquare } from "lucide-react";
import type { SelectedMode } from './EmailInputSection'; // Import the type

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
      return { text: "Use this Draft", Icon: Edit3 };
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
  const titleText = selectedMode === 'jobPosting' && suggestions.length === 1 
    ? "AI Drafted Job Posting" 
    : "AI Suggestions";


  return (
    <div className="space-y-6">
      <h2 className="font-headline text-2xl font-semibold text-center">{titleText}</h2>
      <div className={`grid gap-6 ${suggestions.length === 1 && selectedMode === 'jobPosting' ? 'md:grid-cols-1' : 'md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="shadow-md flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-lg">
                {suggestions.length > 1 ? `Suggestion ${index + 1}` : (selectedMode === 'jobPosting' ? 'Job Posting Draft' : 'Suggestion')}
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
