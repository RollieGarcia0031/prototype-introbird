
// src/components/introbird/AppHeader.tsx
"use client";

import type { FC } from 'react';
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogIn, LogOut } from "lucide-react"; // Import LogOut

interface AppHeaderProps {
  isLoggedIn: boolean;
  onLoginToggle: () => void;
}

const AppHeader: FC<AppHeaderProps> = ({ isLoggedIn, onLoginToggle }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-8 w-8" />
          <div>
            <h1 className="font-headline text-3xl font-bold text-primary">IntroBird</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              AI-powered email replies, simplified.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onLoginToggle}>
          {isLoggedIn ? (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </>
          )}
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;
