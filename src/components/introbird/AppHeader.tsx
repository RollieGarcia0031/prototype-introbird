// src/components/introbird/AppHeader.tsx
"use client";

import type { FC } from 'react';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User as UserIcon, PanelLeft } from "lucide-react"; // Added PanelLeft for explicit icon if needed
import { useAuth } from '@/contexts/AuthContext';
import AuthDialog from '@/components/auth/AuthDialog';
import Link from 'next/link';
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"; // Import useSidebar

const AppHeader: FC = () => {
  const { user, logOut, loading } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { isMobile } = useSidebar(); // Get isMobile state

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {isMobile && <SidebarTrigger className="h-7 w-7 text-foreground" />} {/* Mobile-only trigger */}
            <Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
              <div>
                <h1 className="font-headline text-xl sm:text-2xl md:text-3xl font-bold text-primary">IntroBird</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  AI-powered email replies, simplified.
                </p>
              </div>
            </Link>
          </div>

          {!loading && (
            user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-2">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground hidden sm:inline">
                    {user.displayName || user.email}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} aria-label="Logout">
                  <LogOut className="h-4 w-4 sm:mr-2" /> 
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsAuthDialogOpen(true)} aria-label="Login or Sign Up">
                <LogIn className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Login / Sign Up</span>
                <span className="sm:hidden">Login</span>
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
