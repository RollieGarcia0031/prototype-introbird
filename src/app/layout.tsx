// src/app/layout.tsx
"use client";

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import AppHeader from '@/components/introbird/AppHeader';
import { Settings as SettingsIcon, Palette as CustomizationIcon, Loader2, Home } from "lucide-react"; // Renamed Settings to SettingsIcon
import React, { useState } from 'react'; // Added useState
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider'; // Added ThemeProvider
import SettingsDialog from '@/components/settings/SettingsDialog'; // Added SettingsDialog

const RootLayoutInternal = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleMobileLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-2 flex items-center justify-center border-b">
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Application Assistant">
                <Link href="/" onClick={handleMobileLinkClick}>
                  <Home />
                  <span className="group-data-[state=collapsed]:hidden">Application Assistant</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <SidebarMenuButton
                asChild
                tooltip={!user ? "Login to customize" : "Customization"}
                disabled={!user || loading}
                aria-disabled={!user || loading}
              >
                <Link href="/customization" onClick={handleMobileLinkClick}>
                  <CustomizationIcon />
                  <span className="group-data-[state=collapsed]:hidden">Customization</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Settings" 
                onClick={() => setIsSettingsDialogOpen(true)}
                disabled={loading} // Disable if auth is still loading, user might not be available
                aria-disabled={loading}
              >
                <SettingsIcon />
                <span className="group-data-[state=collapsed]:hidden">Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-col min-h-screen flex-1">
        <AppHeader /> 
        <SidebarInset className="flex-1">
          {children}
        </SidebarInset>
      </div>
      {user && <SettingsDialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen} />}
    </>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* suppressHydrationWarning for next-themes */}
      <head>
        <title>IntroBird - AI Email Assistant</title>
        <meta name="description" content="Generate email replies with AI" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SidebarProvider defaultOpen={false}> 
              <RootLayoutInternal>{children}</RootLayoutInternal>
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
