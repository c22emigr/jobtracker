"use client";
import clsx from "clsx";
import React from "react";

type Variant = 
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "destructive"
    | "outline"
    | "ghost";

type Size = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    asChild?: boolean;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
}

export function Button({
    children,
    className,
    variant = "default",
    size = "md",
    iconLeft,
    iconRight,
    ...props
}: ButtonProps) {
    const base =
    "inline-flex items-center gap-2 rounded-md font-medium transition-colors focus:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none ring-offset-black";
    const sizes: Record<Size, string> = {
        sm: "text-xs px-2.5 py-1.5",
        md: "text-sm px-3 py-2",
    };

const variants: Record<Variant, string> = {
    default: "bg-zinc-800 text-white hover:bg-zinc-700",
    primary: "bg-blue-600 text-white hover:bg-blue-500",
    success: "bg-emerald-600 text-white hover:bg-emerald-500",
    warning: "bg-amber-500 text-black hover:bg-amber-400",
    destructive: "bg-red-600 text-white hover:bg-red-500",
    outline: "border border-zinc-600 text-zinc-100 hover:bg-zinc-800/60",
    ghost: "text-zinc-200 hover:bg-zinc-800/60",
};

return (
    <button
      className={clsx(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>    
);
}