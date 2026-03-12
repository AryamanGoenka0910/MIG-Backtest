"use client";

import { useState } from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
  lockedLabel?: string;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  children: (activeTab: string) => React.ReactNode;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, children, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? "");

  return (
    <div className={className}>
      <div className="flex items-center gap-1 border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            title={tab.disabled && tab.lockedLabel ? tab.lockedLabel : undefined}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-150 border-b-2 -mb-px cursor-pointer
              ${tab.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              ${activeTab === tab.id
                ? "text-emerald-400 border-emerald-500"
                : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-slate-800 text-slate-500"
              }`}>
                {tab.count}
              </span>
            )}
            {tab.disabled && (
              <span className="text-xs">🔒</span>
            )}
          </button>
        ))}
      </div>
      <div className="pt-6">{children(activeTab)}</div>
    </div>
  );
}
