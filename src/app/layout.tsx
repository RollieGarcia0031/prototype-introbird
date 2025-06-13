
"use client"; // Add "use client" because we're introducing useState

import type { Metadata } from 'next'; // Keep as type import
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
} from "@/components/ui/sidebar";
import AppHeader from '@/components/introbird/AppHeader';
import { Settings, Palette as CustomizationIcon } from "lucide-react";
import React, { useState } from 'react'; // Import useState

// Metadata can still be defined in client components, but Next.js recommends it at the page/layout level for server components.
// For simplicity in this prototype phase, we'll keep it here.
// export const metadata: Metadata = { // This might cause issues with "use client", Next.js prefers metadata in Server Components
//   title: 'IntroBird - AI Email Assistant',
//   description: 'Generate email replies with AI',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock login state, default to false

  // A simple function to toggle login state for demonstration purposes.
  // This would be replaced by actual authentication logic.
  const toggleLogin = () => setIsLoggedIn(!isLoggedIn);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Title and meta description are good candidates to move to a Server Component or page.tsx if "use client" here is an issue */}
        <title>IntroBird - AI Email Assistant</title>
        <meta name="description" content="Generate email replies with AI" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider defaultOpen={false}>
          <Sidebar collapsible="icon">
            <SidebarHeader className="p-2 flex items-center justify-center border-b">
               <span className="font-bold text-lg text-sidebar-primary group-data-[state=collapsed]:hidden">Menu</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-sidebar-primary group-data-[state=expanded]:hidden"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings">
                    <Settings />
                    <span className="group-data-[state=collapsed]:hidden">Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip={!isLoggedIn ? "Login to customize" : "Customization"} disabled={!isLoggedIn}>
                    <CustomizationIcon />
                    <span className="group-data-[state=collapsed]:hidden">Customization</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <div className="flex flex-col min-h-screen flex-1">
            {/* Pass toggleLogin and isLoggedIn to AppHeader if you want the login button there to affect this state */}
            <AppHeader isLoggedIn={isLoggedIn} onLoginToggle={toggleLogin} />
            <SidebarInset className="flex-1">
              {children}
            </SidebarInset>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
