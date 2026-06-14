import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 28, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TradeVision AI logo"
    >
      <rect width="180" height="180" rx="42" fill="#0d0d12" />
      <defs>
        <linearGradient id="pulseGrad" x1="16" y1="90" x2="164" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4d7a00" />
          <stop offset="100%" stopColor="#a3d420" />
        </linearGradient>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a3d420" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a3d420" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="155" cy="72" r="22" fill="url(#glowGrad)" />
      <path
        d="M16 105 L46 105 L62 50 L80 128 L100 68 L118 88 L155 72"
        stroke="url(#pulseGrad)"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="155" cy="72" r="10" fill="#a3d420" />
      <circle cx="155" cy="72" r="5" fill="white" />
    </svg>
  );
}

interface LogoWordmarkProps {
  iconSize?: number;
  className?: string;
  textClassName?: string;
  showAI?: boolean;
}

export function LogoWordmark({
  iconSize = 28,
  className = "",
  textClassName = "",
  showAI = true,
}: LogoWordmarkProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={iconSize} />
      <span className={`font-black tracking-tight ${textClassName}`}>
        TradeVision{showAI ? <span className="text-primary"> AI</span> : ""}
      </span>
    </div>
  );
}
