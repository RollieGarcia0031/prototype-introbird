// src/components/settings/SettingsDialog.tsx
"use client";

import React, { useState, useEffect, type FC } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Sun, Moon, Laptop, User, Loader2, Save } from 'lucide-react';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog: FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  const { theme, setTheme, systemTheme } = useTheme();
  const { user, updateUserDisplayName, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setCurrentUsername(user.displayName || user.email || '');
      setNewUsername(user.displayName || '');
    }
  }, [user]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };
  
  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Username",
        description: "Username cannot be empty.",
      });
      return;
    }
    if (newUsername.trim() === (user?.displayName || '')) {
       toast({
        title: "No Change",
        description: "The new username is the same as the current one.",
      });
      return;
    }

    setIsSavingUsername(true);
    try {
      await updateUserDisplayName(newUsername.trim());
      toast({
        title: "Username Updated",
        description: `Your username has been changed to ${newUsername.trim()}.`,
      });
      onOpenChange(false); // Close dialog on success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error Updating Username",
        description: errorMessage,
      });
    } finally {
      setIsSavingUsername(false);
    }
  };

  if (!mounted || authLoading) {
    // Avoid rendering dialog content until client is mounted and auth state is clear
    // to prevent hydration mismatches with theme and user data.
    return null; 
  }

  const effectiveTheme = theme === "system" ? systemTheme : theme;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Settings</DialogTitle>
          <DialogDescription>
            Manage your application preferences and account details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Settings */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Theme</Label>
            <RadioGroup 
                defaultValue={theme} 
                onValueChange={handleThemeChange}
                className="flex space-x-2"
            >
                <div className="flex items-center space-x-2">
                    <Button 
                        variant={effectiveTheme === 'light' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => handleThemeChange('light')}
                        className="w-full justify-start"
                    >
                        <Sun className="mr-2 h-4 w-4" /> Light
                    </Button>
                </div>
                <div className="flex items-center space-x-2">
                     <Button 
                        variant={effectiveTheme === 'dark' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => handleThemeChange('dark')}
                        className="w-full justify-start"
                    >
                        <Moon className="mr-2 h-4 w-4" /> Dark
                    </Button>
                </div>
                 <div className="flex items-center space-x-2">
                     <Button 
                        variant={theme === 'system' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => handleThemeChange('system')}
                        className="w-full justify-start"
                    >
                        <Laptop className="mr-2 h-4 w-4" /> System
                    </Button>
                </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Current: {effectiveTheme === 'light' ? 'Light Mode' : effectiveTheme === 'dark' ? 'Dark Mode' : 'System Default'}
            </p>
          </div>

          <Separator />

          {/* Username Settings */}
          {user && (
            <div className="space-y-3">
              <Label htmlFor="username" className="text-base font-medium flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" /> Change Display Name
              </Label>
              <p className="text-xs text-muted-foreground">
                Current display name: <strong>{currentUsername}</strong>
              </p>
              <div className="flex items-center space-x-2">
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new display name"
                  disabled={isSavingUsername}
                />
                <Button onClick={handleSaveUsername} disabled={isSavingUsername || !newUsername.trim() || newUsername.trim() === (user?.displayName || '')}>
                  {isSavingUsername ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
