import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[#10b981] text-slate-950 hover:bg-emerald-400 font-semibold shadow-sm",
  secondary:
    "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700",
  ghost:
    "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50",
  danger:
    "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs rounded-md gap-1.5",
  md: "px-4 py-2 text-sm rounded-lg gap-2",
  lg: "px-6 py-2.5 text-base rounded-lg gap-2",
};

export default function Button({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
