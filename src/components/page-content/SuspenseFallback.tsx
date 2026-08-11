"use client";

import { FaSpinner } from "react-icons/fa";

interface SuspenseFallbackProps {
    loadingText?: string;
}

export default function SuspenseFallback({ loadingText = "content" }: SuspenseFallbackProps) {
    return (
        <div
            className="flex flex-1 flex-col items-center justify-center gap-3 min-h-[12rem] w-full p-6 font-sans"
            role="status"
            aria-live="polite"
            aria-label={`Loading ${loadingText}`}
        >
            <FaSpinner
                className="text-3xl md:text-4xl theme-text-teal animate-spin"
                aria-hidden
            />
            <p className="text-sm md:text-base theme-text-muted">
                Loading {loadingText}…
            </p>
        </div>
    );
}
