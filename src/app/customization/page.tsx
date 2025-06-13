// src/app/customization/page.tsx
"use client";

import React, { useState, useEffect, type FormEvent } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { getUserCustomization } from '@/lib/firebase'; // Direct client-side fetch for initial load
import { saveCustomizationAction } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending} aria-label="Save Customization">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      Save Customization
    </Button>
  );
}

export default function CustomizationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [customizationText, setCustomizationText] = useState('');
  const [isFetchingData, setIsFetchingData] = useState(true);

  const initialState = { message: undefined, error: undefined, success: undefined };
  const [state, formAction] = useActionState(saveCustomizationAction, initialState);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/'); // Redirect to home if not logged in
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setIsFetchingData(true);
      getUserCustomization(user.uid)
        .then((data) => {
          if (data !== null) {
            setCustomizationText(data);
          }
        })
        .catch((error) => {
          console.error("Error fetching customization data:", error);
          toast({
            variant: "destructive",
            title: "Error fetching data",
            description: "Could not load your saved customization.",
          });
        })
        .finally(() => {
          setIsFetchingData(false);
        });
    } else if (!authLoading) {
      // If there's no user and auth is not loading, stop fetching attempt.
      setIsFetchingData(false);
    }
  }, [user, toast, authLoading]);

  useEffect(() => {
    if (state?.success && state.message) {
      toast({
        title: "Success!",
        description: state.message,
      });
    }
    if (!state?.success && state?.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
  }, [state, toast]);

  if (authLoading || isFetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the redirect, but as a fallback:
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You must be logged in to access this page.</p>
            <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl sm:text-2xl">Your Customization</CardTitle>
          <CardDescription>
            Save your skills summary, personal bio, or any other information you want the AI to consider when drafting content for you. This data will be stored securely.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <input type="hidden" name="userId" value={user.uid} />
            <div>
              <Label htmlFor="customizationText" className="text-base font-medium">
                Your Summary / Skills / Data
              </Label>
              <Textarea
                id="customizationText"
                name="customizationText"
                value={customizationText}
                onChange={(e) => setCustomizationText(e.target.value)}
                placeholder="e.g., Senior software engineer with 10 years of experience in full-stack development, specializing in React, Node.js, and cloud platforms like AWS. Proven ability to lead teams and deliver complex projects..."
                rows={15}
                className="mt-2 min-h-[250px] resize-y"
                aria-describedby="customization-help"
              />
              <p id="customization-help" className="text-sm text-muted-foreground mt-1">
                Provide any details about yourself that you'd like the AI to use.
              </p>
            </div>
            {state?.error && !state.success && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Save Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
             {state?.success && state.message && (
              <Alert variant="default" className="border-green-500 text-green-700 dark:border-green-400 dark:text-green-300">
                <Save className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
