// src/components/introbird/ResponseSuggestionsSection.tsx
import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";

interface ResponseSuggestionsSectionProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

const ResponseSuggestionsSection: FC<ResponseSuggestionsSectionProps> = ({ suggestions, onSelectSuggestion }) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="font-headline text-2xl font-semibold text-center">AI Reply Suggestions</h2>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="shadow-md flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-lg">Suggestion {index + 1}</CardTitle>
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
                <Copy className="mr-2 h-4 w-4" />
                Use this Reply
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResponseSuggestionsSection;
