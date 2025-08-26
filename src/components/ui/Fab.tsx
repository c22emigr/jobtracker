"use client";
import { Plus } from "lucide-react";
import React from "react";
import { clsx } from "clsx";

type FabProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Fab({className, ...props}: FabProps) {
    return (
        <button
            aria-label="Add job"
            title="Add job"
            className={clsx(
                "fixed bottom-6 right-6 h-12 w-12 rounded-full",
                "bg-blue-600 text-white shadow-lg",
                "flex items-center justify-center",
                "hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-black",
                className
            )}
            {...props}        
        >
            <Plus className="h-6 w-6" strokeWidth={2.5}></Plus>
        </button>
    );
}