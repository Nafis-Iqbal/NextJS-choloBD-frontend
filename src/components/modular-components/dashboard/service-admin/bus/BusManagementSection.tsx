"use client";

import React, { useState } from "react";
import type { Bus } from "./types";

interface BusManagementSectionProps {
  buses: Bus[];
  id?: string;
  className?: string;
}

export const BusManagementSection = ({
  buses,
  id,
  className = "",
}: BusManagementSectionProps) => {
  const [expandedBus, setExpandedBus] = useState<string | null>(null);
  const [isAddingBus, setIsAddingBus] = useState(false);

  return (
    <section id={id} className={`mb-0 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <h3 className="text-xl font-bold theme-text">Fleet Inventory</h3>
        <button
          type="button"
          onClick={() => setIsAddingBus(!isAddingBus)}
          className="theme-btn-teal text-white w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg font-medium shrink-0"
        >
          {isAddingBus ? "Cancel" : "+ Add Bus"}
        </button>
      </div>

      {isAddingBus && (
        <div className="theme-card theme-outline-teal border rounded-xl p-4 sm:p-6 mb-5">
          <h3 className="font-semibold theme-text mb-4">Add New Bus</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Bus Number (e.g., BD-02-1006)"
              className="theme-input px-4 py-2.5 rounded-lg"
            />
            <select className="theme-input px-4 py-2.5 rounded-lg">
              <option>Select Bus Type</option>
              <option>AC</option>
              <option>Non-AC</option>
              <option>Sleeper</option>
              <option>Semi-Sleeper</option>
              <option>Deluxe</option>
            </select>
            <input
              type="number"
              placeholder="Total Seats"
              className="theme-input px-4 py-2.5 rounded-lg"
            />
            <input
              type="text"
              placeholder="Operator Name"
              className="theme-input px-4 py-2.5 rounded-lg"
            />
            <input
              type="text"
              placeholder="Registration Number"
              className="theme-input px-4 py-2.5 rounded-lg"
            />
          </div>
          <button
            type="button"
            className="theme-btn-teal text-white mt-4 w-full py-2.5 rounded-lg font-medium"
          >
            Add Bus
          </button>
        </div>
      )}

      <div className="space-y-4">
        {buses.map((bus) => {
          const isExpanded = expandedBus === bus.id;

          return (
            <div
              key={bus.id}
              className="rounded-xl p-4 sm:p-5 overflow-hidden transition-colors"
              style={{
                backgroundColor: "var(--theme-bg)",
                border: "1px solid var(--theme-deep-green)",
              }}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between min-w-0">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="theme-text text-base sm:text-lg font-semibold break-words">
                      {bus.busNumber}
                    </h3>
                    <span className="theme-badge px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {bus.busType}
                    </span>
                  </div>

                  <p className="theme-text-muted text-sm break-words">
                    {bus.operatorName}
                    <span className="theme-text-subtle mx-1.5">·</span>
                    {bus.totalSeats} seats
                  </p>

                  <p className="theme-text-subtle text-xs">
                    Reg: {bus.registrationNumber}
                  </p>
                </div>

                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 shrink-0">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={
                      bus.isActive
                        ? {
                            backgroundColor: "rgba(42, 157, 143, 0.2)",
                            color: "var(--theme-teal)",
                            border: "1px solid var(--theme-teal)",
                          }
                        : {
                            backgroundColor: "rgba(220, 53, 69, 0.2)",
                            color: "var(--theme-red)",
                            border: "1px solid var(--theme-red)",
                          }
                    }
                  >
                    {bus.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedBus(isExpanded ? null : bus.id)
                    }
                    className="px-3.5 py-2 rounded-lg theme-text text-sm font-medium shrink-0"
                    style={{
                      backgroundColor: "var(--theme-card-bg)",
                      border: "1px solid var(--theme-deep-green)",
                    }}
                  >
                    {isExpanded ? "Hide" : "Manage"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div
                  className="mt-4 pt-4 border-t"
                  style={{ borderColor: "var(--theme-deep-green)" }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-lg text-sm font-medium theme-text-teal"
                      style={{
                        backgroundColor: "var(--theme-card-bg)",
                        border: "1px solid var(--theme-teal)",
                      }}
                    >
                      Edit Details
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-lg text-sm font-medium theme-text"
                      style={{
                        backgroundColor: "var(--theme-card-bg)",
                        border: bus.isActive
                          ? "1px solid var(--theme-red)"
                          : "1px solid var(--theme-teal)",
                        color: bus.isActive
                          ? "var(--theme-red)"
                          : "var(--theme-teal)",
                      }}
                    >
                      {bus.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
