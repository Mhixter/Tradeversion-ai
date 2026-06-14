import React, { useState } from "react";
import { Link } from "wouter";
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, KeyRound, AlertCircle } from "lucide-react";
import { LogoIcon } from "@/components/Logo";

type State = "form" | "sent" | "resent";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [state, setState]     = useState<State>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) { setError("Please enter a valid email address."); return; }
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setState("sent");
  };

  const handleResend = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setState("resent");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/40">
        <Link href="/landing">
          <div className="flex items-center gap-2 cursor-pointer">
            <LogoIcon size={28} />
            <span className="text-sm font-bold">TradeVision AI</span>
          </div>
        </Link>
        <Link href="/">
          <span className="text-xs text-primary font-semibold hover:underline cursor-pointer">Back to Sign In</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* ── Form state ── */}
          {state === "form" && (
            <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <KeyRound className="w-7 h-7 text-primary" />
                </div>
              </div>

              <div className="text-center mb-7">
                <h1 className="text-2xl font-black mb-2">Forgot your password?</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No worries. Enter the email address linked to your account and we'll send you a secure reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      className={`w-full bg-accent border rounded-xl pl-10 pr-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${
                        error ? "border-destructive" : "border-border"
                      }`}
                      autoFocus
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <p className="text-xs text-destructive">{error}</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Sending…</>
                  ) : (
                    <><Mail className="w-4 h-4" /> Send Reset Link</>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-1.5 text-sm">
                <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
                <Link href="/">
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    Back to sign in
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* ── Sent confirmation ── */}
          {(state === "sent" || state === "resent") && (
            <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xl text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-success/15 border-2 border-success/30 flex items-center justify-center shadow-xl shadow-success/10">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
              </div>

              <h1 className="text-2xl font-black mb-2">Check your email</h1>
              <p className="text-sm text-muted-foreground leading-relaxed mb-1">
                We sent a password reset link to
              </p>
              <p className="text-sm font-bold text-foreground mb-6">{email}</p>

              <div className="bg-accent/40 border border-border/40 rounded-xl p-4 mb-6 text-left space-y-2">
                <p className="text-xs font-semibold text-foreground">What to do next:</p>
                {[
                  "Open the email from TradeVision AI",
                  "Click the reset link — it's valid for 30 minutes",
                  "Choose a strong new password",
                  "Sign in with your new password",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <span className="w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Didn't receive the email? Check your spam folder or{" "}
              </p>

              {state === "resent" ? (
                <div className="flex items-center justify-center gap-1.5 text-xs text-success">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Email resent successfully
                </div>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-primary text-sm font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 mx-auto"
                >
                  {loading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Resending…</> : "Resend email"}
                </button>
              )}

              <div className="mt-8 pt-6 border-t border-border/40">
                <Link href="/">
                  <button className="w-full bg-accent hover:bg-accent/80 text-foreground font-semibold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Help note */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Still need help?{" "}
            <Link href="/contact">
              <span className="text-primary hover:underline cursor-pointer">Contact support</span>
            </Link>
          </p>
        </div>
      </div>

      <footer className="py-6 text-center border-t border-border/30">
        <p className="text-xs text-muted-foreground">
          © 2026 TradeVision AI ·{" "}
          <Link href="/terms"><span className="hover:text-foreground cursor-pointer">Terms</span></Link>
          {" "}·{" "}
          <Link href="/privacy"><span className="hover:text-foreground cursor-pointer">Privacy</span></Link>
        </p>
      </footer>
    </div>
  );
}
