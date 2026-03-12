"use client";

import { useState, useEffect } from "react";

interface MarketUpdateBannerProps {
  message: string;
  type?: "info" | "warning";
  dismissKey?: string;
}

export default function MarketUpdateBanner({
  message,
  type = "info",
  dismissKey = "banner-default",
}: MarketUpdateBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(dismissKey);
    if (!dismissed) setVisible(true);
  }, [dismissKey]);

  const dismiss = () => {
    localStorage.setItem(dismissKey, "1");
    setVisible(false);
  };

  if (!visible) return null;

  const colors =
    type === "warning"
      ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
      : "bg-sky-500/10 border-sky-500/20 text-sky-300";

  const dotColor = type === "warning" ? "text-amber-400" : "text-sky-400";

  return (
    <div className={`relative border-b px-4 py-2.5 flex items-center justify-center gap-2 text-sm ${colors}`}>
      <span className={`${dotColor} animate-pulse text-xs`}>●</span>
      <span>{message}</span>
      <button
        onClick={dismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-current opacity-60 hover:opacity-100 transition-opacity p-1 rounded cursor-pointer"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
