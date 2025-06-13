// src/components/introbird/AppHeader.tsx
"use client";

import type { FC } from 'react';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';

const AppHeader: FC = () => {
  const { user, logOut, loading } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally, show a toast notification for logout failure
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="font-headline text-3xl font-bold text-primary">IntroBird</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                AI-powered email replies, simplified.
              </p>
            </div>
          </div>
          {!loading && (
            user ? (
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsAuthDialogOpen(true)}>
                <LogIn className="mr-2 h-4 w-4" />
                Login / Sign Up
              </Button>
            )
          )}
        </div>
      </header>
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
};

export default AppHeader;
