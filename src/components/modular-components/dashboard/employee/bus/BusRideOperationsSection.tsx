"use client";

import React, { useState } from "react";
import type { EmployeeRide } from "./types";

interface BusRideOperationsSectionProps {
  rides: EmployeeRide[];
  id?: string;
  className?: string;
  onViewSeatPlan?: (coachType: EmployeeRide["coachType"]) => void;
}

export const BusRideOperationsSection = ({
  rides,
  id = "bus_employee_rides",
  className = "",
  onViewSeatPlan,
}: BusRideOperationsSectionProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusStyle = (
    status: EmployeeRide["status"]
  ): React.CSSProperties => {
    const base: React.CSSProperties = {
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      paddingTop: "0.25rem",
      paddingBottom: "0.25rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
      border: "1px solid",
      textTransform: "capitalize",
    };

    switch (status) {
      case "boarding":
        return {
          ...base,
          backgroundColor: "rgba(42, 157, 143, 0.15)",
          color: "var(--theme-teal)",
          borderColor: "var(--theme-teal)",
        };
      case "departing-soon":
        return {
          ...base,
          backgroundColor: "rgba(255, 165, 0, 0.15)",
          color: "rgb(200, 120, 0)",
          borderColor: "rgba(255, 165, 0, 0.45)",
        };
      case "departed":
        return {
          ...base,
          backgroundColor: "rgba(0, 123, 255, 0.12)",
          color: "rgb(0, 123, 255)",
          borderColor: "rgba(0, 123, 255, 0.4)",
        };
      case "delayed":
        return {
          ...base,
          backgroundColor: "rgba(220, 53, 69, 0.15)",
          color: "var(--theme-red)",
          borderColor: "var(--theme-red)",
        };
    }
  };

  return (
    <section id={id} className={`mb-0 ${className}`}>
      <div className="mb-5">
        <h3 className="text-xl font-bold theme-text">Today&apos;s Ride Operations</h3>
        <p className="theme-text-muted text-sm mt-1">
          Monitor boarding progress and departure status at the terminal
        </p>
      </div>

      {rides.length === 0 ? (
        <div
          className="rounded-xl p-6 text-center theme-text-subtle"
          style={{
            backgroundColor: "var(--theme-card-bg)",
            border: "1px solid var(--theme-deep-green)",
          }}
        >
          No rides scheduled for today
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => {
            const isExpanded = expandedId === ride.id;
            const boardingPct =
              ride.bookedSeats > 0
                ? (ride.boardedCount / ride.bookedSeats) * 100
                : 0;

            return (
              <div
                key={ride.id}
                className="rounded-xl p-4 sm:p-5 overflow-hidden"
                style={{
                  backgroundColor: "var(--theme-bg)",
                  border: "1px solid var(--theme-deep-green)",
                }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between min-w-0">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="theme-text text-base sm:text-lg font-semibold break-words">
                        {ride.route}
                      </p>
                      <span style={getStatusStyle(ride.status)}>
                        {ride.status.replace("-", " ")}
                      </span>
                    </div>
                    <p className="theme-text-muted text-sm">
                      {ride.busNumber}
                      <span className="theme-text-subtle mx-1.5">·</span>
                      {ride.coachType}
                      <span className="theme-text-subtle mx-1.5">·</span>
                      {ride.gate}
                    </p>
                    <p className="theme-text-subtle text-xs">
                      Departs {ride.departureTime} · {ride.departureDate}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : ride.id)
                    }
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg theme-text text-sm font-medium shrink-0"
                    style={{
                      backgroundColor: "var(--theme-card-bg)",
                      border: "1px solid var(--theme-deep-green)",
                    }}
                  >
                    {isExpanded ? "Hide" : "Details"}
                  </button>
                </div>

                <div
                  className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-lg p-3"
                  style={{ backgroundColor: "var(--theme-card-bg)" }}
                >
                  <div>
                    <p className="theme-text-subtle text-xs uppercase tracking-wide mb-1.5">
                      Boarding
                    </p>
                    <div
                      className="h-2 rounded-full overflow-hidden mb-1.5"
                      style={{ backgroundColor: "var(--theme-section-bg)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${boardingPct}%`,
                          backgroundColor: "var(--theme-teal)",
                        }}
                      />
                    </div>
                    <p className="theme-text-teal text-xs font-medium tabular-nums">
                      {ride.boardedCount}/{ride.bookedSeats} boarded
                    </p>
                  </div>
                  <div>
                    <p className="theme-text-subtle text-xs uppercase tracking-wide mb-1.5">
                      Occupancy
                    </p>
                    <p className="theme-text text-base font-semibold tabular-nums">
                      {ride.bookedSeats}/{ride.totalSeats}
                    </p>
                    <p className="theme-text-subtle text-xs mt-0.5">seats booked</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="theme-text-subtle text-xs uppercase tracking-wide mb-1.5">
                      Pending board
                    </p>
                    <p className="theme-text text-base font-semibold tabular-nums">
                      {Math.max(ride.bookedSeats - ride.boardedCount, 0)}
                    </p>
                    <p className="theme-text-subtle text-xs mt-0.5">passengers</p>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-2.5"
                    style={{ borderColor: "var(--theme-deep-green)" }}
                  >
                    <button
                      type="button"
                      onClick={() => onViewSeatPlan?.(ride.coachType)}
                      className="theme-btn-teal text-white px-4 py-2.5 rounded-lg text-sm font-medium"
                    >
                      View {ride.coachType} Seat Plan
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-lg text-sm font-medium theme-text"
                      style={{
                        backgroundColor: "var(--theme-card-bg)",
                        border: "1px solid var(--theme-deep-green)",
                      }}
                    >
                      Mark Departed
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
