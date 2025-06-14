// src/app/customization/page.tsx
"use client";

import React, { useState, useEffect, type FormEvent, useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, UploadCloud, FileText, AlertTriangleIcon, UserCircle2 } from 'lucide-react';
import { getUserCustomization } from '@/lib/firebase'; 
import { saveCustomizationAction, summarizeResumeAction } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending} aria-label="Save Customization">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      Save All Customizations
    </Button>
  );
}

export default function CustomizationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [customizationText, setCustomizationText] = useState('');
  const [resumeSummaryText, setResumeSummaryText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizationError, setSummarizationError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveInitialState = { message: undefined, error: undefined, success: undefined };
  const [saveState, saveFormAction] = useActionState(saveCustomizationAction, saveInitialState);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/'); 
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setIsFetchingData(true);
      getUserCustomization(user.uid)
        .then((data) => {
          if (data) {
            setFirstName(data.firstName || '');
            setLastName(data.lastName || '');
            setEmail(data.email || '');
            setAddress(data.address || '');
            setCustomizationText(data.customizationText || '');
            setResumeSummaryText(data.resumeSummary || '');
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
      setIsFetchingData(false);
    }
  }, [user, toast, authLoading]);

  useEffect(() => {
    if (saveState?.success && saveState.message) {
      toast({
        title: "Success!",
        description: saveState.message,
      });
    }
    if (!saveState?.success && saveState?.error) {
      toast({
        variant: "destructive",
        title: "Save Error",
        description: saveState.error,
      });
    }
  }, [saveState, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === "application/pdf") {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({
                variant: "destructive",
                title: "File too large",
                description: "Please upload a PDF smaller than 5MB.",
            });
            setSelectedFile(null);
            if(fileInputRef.current) fileInputRef.current.value = ""; 
            return;
        }
        setSelectedFile(file);
        setSummarizationError(null);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
        });
        setSelectedFile(null);
        if(fileInputRef.current) fileInputRef.current.value = ""; 
      }
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSummarizeResume = async () => {
    if (!selectedFile || !user) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a PDF resume to summarize.",
      });
      return;
    }

    setIsSummarizing(true);
    setSummarizationError(null);

    try {
      const dataUri = await fileToDataUri(selectedFile);
      const formData = new FormData();
      formData.append('resumePdfDataUri', dataUri);
      formData.append('userId', user.uid); 

      const result = await summarizeResumeAction({}, formData); 

      if (result.summary) {
        setResumeSummaryText(result.summary);
        toast({
          title: "Resume Summarized",
          description: "The AI has generated a summary from your resume.",
        });
      } else if (result.error) {
        setSummarizationError(result.error);
        toast({
          variant: "destructive",
          title: "Summarization Failed",
          description: result.error,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      setSummarizationError(message);
      toast({
        variant: "destructive",
        title: "Summarization Error",
        description: message,
      });
    } finally {
      setIsSummarizing(false);
    }
  };


  if (authLoading || isFetchingData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <Card>
          <CardHeader><CardTitle>Access Denied</CardTitle></CardHeader>
          <CardContent>
            <p>You must be logged in to access this page.</p>
            <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <form action={saveFormAction}>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl sm:text-2xl">Your Customization Hub</CardTitle>
            <CardDescription>
              Manage your personal information, skills summary, and resume details for the AI.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <input type="hidden" name="userId" value={user.uid} />

            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <UserCircle2 className="mr-2 h-5 w-5 text-primary" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g., Jane" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g., Doe" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g., jane.doe@example.com" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Textarea id="address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main St, Anytown, USA" rows={2} className="min-h-[60px]" />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="customizationText" className="text-base font-medium">
                Your Summary / Skills / Bio
              </Label>
              <Textarea
                id="customizationText"
                name="customizationText"
                value={customizationText}
                onChange={(e) => setCustomizationText(e.target.value)}
                placeholder="e.g., Senior software engineer with 10 years of experience..."
                rows={8}
                className="mt-2 min-h-[150px] resize-y"
                aria-describedby="customization-help"
              />
              <p id="customization-help" className="text-sm text-muted-foreground mt-1">
                Provide any details about yourself that you'd like the AI to use.
              </p>
            </div>

            <Separator />

            <div>
              <Label htmlFor="resumeUpload" className="text-base font-medium block mb-2">
                Upload Resume (PDF)
              </Label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Input
                  id="resumeUpload"
                  name="resumeUpload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="flex-grow"
                  aria-describedby="resume-upload-help"
                />
                <Button 
                  type="button" 
                  onClick={handleSummarizeResume} 
                  disabled={!selectedFile || isSummarizing}
                  className="w-full sm:w-auto"
                >
                  {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                  Summarize Resume
                </Button>
              </div>
              <p id="resume-upload-help" className="text-sm text-muted-foreground mt-1">
                Max 5MB. The AI will generate a summary from your resume.
              </p>
            </div>

            {summarizationError && (
              <Alert variant="destructive">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertTitle>Resume Summarization Error</AlertTitle>
                <AlertDescription>{summarizationError}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="resumeSummaryText" className="text-base font-medium flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                AI-Generated Resume Summary (Editable)
              </Label>
              <Textarea
                id="resumeSummaryText"
                name="resumeSummaryText"
                value={resumeSummaryText}
                onChange={(e) => setResumeSummaryText(e.target.value)}
                placeholder="Resume summary will appear here after processing. You can edit it before saving."
                rows={10}
                className="mt-2 min-h-[200px] resize-y bg-muted/30"
                aria-describedby="resume-summary-help"
              />
              <p id="resume-summary-help" className="text-sm text-muted-foreground mt-1">
                This summary is generated by AI from your uploaded resume. You can edit it.
              </p>
            </div>
            
            {saveState?.error && !saveState.success && (
              <Alert variant="destructive">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertTitle>Save Error</AlertTitle>
                <AlertDescription>{saveState.error}</AlertDescription>
              </Alert>
            )}
             {saveState?.success && saveState.message && (
              <Alert variant="default" className="border-green-500 text-green-700 dark:border-green-400 dark:text-green-300">
                <Save className="h-4 w-4 text-green-700 dark:text-green-300" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{saveState.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-end pt-6">
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
    </main>
  );
}
