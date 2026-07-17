"use client";

interface ScrollToTopButtonProps {
    className?: string;
    label?: string;
}

export function ScrollToTopButton({
    className = "",
    label = "Back to top",
}: ScrollToTopButtonProps) {
    return (
        <button
            type="button"
            className={`green-underline-button text-sm self-end ${className}`}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
            {label}
        </button>
    );
}
