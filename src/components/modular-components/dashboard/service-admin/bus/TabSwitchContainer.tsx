"use client";

import React from "react";

export interface BusAdminTab {
  id: string;
  label: string;
  description: string;
  hash?: string;
}

interface TabSwitchContainerProps {
  title: string;
  tabs: BusAdminTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const TabSwitchContainer = ({
  title,
  tabs,
  activeTab,
  onTabChange,
  children,
  className = "",
}: TabSwitchContainerProps) => {
  const currentTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div
      className={`w-full theme-text rounded-xl theme-outline bg-section overflow-hidden min-h-screen ${className}`}
    >
      <div
        className="flex flex-wrap md:flex-nowrap gap-1 p-2 md:p-3 border-b"
        style={{
          borderColor: "var(--theme-deep-green)",
          backgroundColor: "var(--theme-sub-section-bg, var(--theme-card-bg))",
        }}
        role="tablist"
        aria-label={title}
      >
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 min-w-[140px] px-3 py-2.5 md:px-4 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-all"
              style={
                isSelected
                  ? {
                      backgroundColor: "var(--theme-teal)",
                      color: "#ffffff",
                      boxShadow: "0 0 0 1px var(--theme-teal)",
                    }
                  : {
                      backgroundColor: "transparent",
                      color: "var(--theme-text-muted)",
                    }
              }
              onMouseEnter={(e) => {
                if (isSelected) return;
                e.currentTarget.style.backgroundColor = "var(--theme-card-bg)";
                e.currentTarget.style.color = "var(--theme-text)";
              }}
              onMouseLeave={(e) => {
                if (isSelected) return;
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--theme-text-muted)";
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="py-4 px-2 md:p-6" role="tabpanel">
        <div
          className="mb-5 pb-4 border-b"
          style={{ borderColor: "var(--theme-deep-green)" }}
        >
          <h2 className="text-2xl font-bold theme-text-teal">{currentTab.label}</h2>
          <p className="theme-text-muted text-sm mt-1">{currentTab.description}</p>
        </div>

        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );
};
