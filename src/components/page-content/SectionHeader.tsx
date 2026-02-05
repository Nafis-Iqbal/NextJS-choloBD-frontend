import React from "react";

export const SectionHeader: React.FC<{ title: string; subtitle?: string; className?: string }> = ({ title, subtitle, className }) => {
  return (
    <div className={`w-full flex flex-col items-center text-center ${className ?? ""}`}>
      <h2 className="text-2xl md:text-3xl font-semibold text-white">{title}</h2>
      {subtitle && <p className="mt-2 text-sm md:text-base text-gray-300 max-w-2xl font-sans">{subtitle}</p>}
    </div>
  );
};
