import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { TopNavbar } from "./TopNavbar";
import { MarketTickerBar } from "./MarketTickerBar";
import { VerificationBanner } from "@/components/VerificationBanner";

export function Layout({ children, title, subtitle }: { children: React.ReactNode, title?: string, subtitle?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div className={`
        fixed inset-y-0 left-0 z-40 lg:relative lg:z-auto
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <MarketTickerBar />
        <TopNavbar title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <VerificationBanner />
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
        <StatusBar />
      </div>
    </div>
  );
}
