import React from "react";
import { useLocation } from "wouter";
import { AlertTriangle, ArrowRight, CheckCircle2, X } from "lucide-react";
import { useGetKycStatus } from "@workspace/api-client-react";

export function VerificationBanner() {
  const [, setLocation] = useLocation();
  const { data: kyc, isLoading } = useGetKycStatus();
  const [dismissed, setDismissed] = React.useState(false);

  if (isLoading || dismissed) return null;

  const status = kyc?.status;

  if (status === "approved") return null;

  if (status === "pending") {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs">
        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
        </div>
        <span className="text-amber-300 font-medium flex-1">
          Your KYC verification is under review. Trading activities are limited until approved.
        </span>
        <button onClick={() => setDismissed(true)} className="text-amber-400/60 hover:text-amber-400 shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-destructive/10 border-b border-destructive/20 text-xs">
      <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-3 h-3 text-destructive" />
      </div>
      <span className="text-destructive font-medium flex-1">
        Your account is not verified. Complete KYC verification to unlock all trading features.
      </span>
      <button
        onClick={() => setLocation("/kyc")}
        className="flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-lg bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30 transition-colors shrink-0"
      >
        Verify Now <ArrowRight className="w-3 h-3" />
      </button>
      <button onClick={() => setDismissed(true)} className="text-destructive/60 hover:text-destructive shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Hook: check if user is verified before allowing actions ──────────────── */
export function useVerificationGate() {
  const [, setLocation] = useLocation();
  const { data: kyc } = useGetKycStatus();

  const requireVerification = (onAllowed: () => void) => {
    if (kyc?.status === "approved") {
      onAllowed();
    } else {
      setLocation("/kyc");
    }
  };

  const isVerified = kyc?.status === "approved";
  const isPending  = kyc?.status === "pending";

  return { requireVerification, isVerified, isPending };
}
