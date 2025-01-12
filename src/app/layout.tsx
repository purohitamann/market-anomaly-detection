import type { Metadata } from "next";
import React from "react";
import "./globals.css";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export const metadata: Metadata = {
  title: "Market Anomaly Detection",
  description: "Predicting market anomalies using machine learning",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (

    <html lang="en">

      <body>
        <SidebarProvider>
          <AppSidebar />
          <main>
            <SidebarTrigger />
            <div className="p-6 w-full">

              {children}
            </div>
          </main>
        </SidebarProvider>
      </body>
    </html>

  )
}
