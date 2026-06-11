import React from "react";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { TopNavbar } from "./TopNavbar";

export function Layout({ children, title, subtitle }: { children: React.ReactNode, title?: string, subtitle?: string }) {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
        <StatusBar />
      </div>
    </div>
  );
}