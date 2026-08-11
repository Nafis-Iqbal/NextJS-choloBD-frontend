import React from "react";

export const SectionHeader: React.FC<{ title?: string; subtitle?: string; className?: string }> = ({ title, subtitle, className }) => {
  return (
    <div className={`w-full flex flex-col items-center text-center ${className ?? ""}`}>
      {title ? <h2 className="text-2xl md:text-4xl font-semibold theme-text">{title}</h2> : null}
      {subtitle && (
        <p className={`${title ? "mt-2" : ""} text-sm md:text-base theme-text-muted max-w-2xl font-sans`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
