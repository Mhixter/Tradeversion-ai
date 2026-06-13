import React from "react";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { type CompanyRole } from "@/hooks/useCompanyRole";

const ROLE_LABELS: Record<NonNullable<CompanyRole>, string> = {
  owner: "Owner", admin: "Admin", manager: "Manager", trader: "Trader", viewer: "Viewer",
};

interface RoleGateProps {
  children: React.ReactNode;
  allowed: NonNullable<CompanyRole>[];
  currentRole: CompanyRole;
  isLoading?: boolean;
  pageName?: string;
}

export function RoleGate({ children, allowed, currentRole, isLoading, pageName }: RoleGateProps) {
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentRole || !allowed.includes(currentRole)) {
    const required = allowed.map(r => ROLE_LABELS[r]).join(", ");
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 max-w-sm mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-destructive/60" />
        </div>
        <div>
          <h2 className="text-lg font-bold mb-1">Access Restricted</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {pageName ? `The ${pageName} page` : "This page"} requires{" "}
            <span className="font-semibold text-foreground">{required}</span> access.
            {currentRole
              ? ` Your current role is ${ROLE_LABELS[currentRole]}.`
              : " You haven't been added to a company yet."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="w-3.5 h-3.5 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
