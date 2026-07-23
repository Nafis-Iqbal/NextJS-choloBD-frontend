"use client";

import React, { useState } from "react";
import type { BusRide } from "./types";
import { FAKE_BUSES } from "./types";

interface RideManagementSectionProps {
  rides: BusRide[];
  id?: string;
  className?: string;
}

export const RideManagementSection = ({
  rides,
  id,
  className = "",
}: RideManagementSectionProps) => {
  const [expandedRide, setExpandedRide] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<
    Record<string, BusRide["status"]>
  >({});
  const [isAddingRide, setIsAddingRide] = useState(false);

  const getStatusStyle = (status: BusRide["status"]): React.CSSProperties => {
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
      case "scheduled":
        return {
          ...base,
          backgroundColor: "rgba(0, 123, 255, 0.15)",
          color: "rgb(0, 123, 255)",
          borderColor: "rgba(0, 123, 255, 0.45)",
        };
      case "ongoing":
        return {
          ...base,
          backgroundColor: "rgba(255, 165, 0, 0.15)",
          color: "rgb(200, 120, 0)",
          borderColor: "rgba(255, 165, 0, 0.45)",
        };
      case "completed":
        return {
          ...base,
          backgroundColor: "rgba(42, 157, 143, 0.15)",
          color: "var(--theme-teal)",
          borderColor: "var(--theme-teal)",
        };
      case "cancelled":
        return {
          ...base,
          backgroundColor: "rgba(220, 53, 69, 0.15)",
          color: "var(--theme-red)",
          borderColor: "var(--theme-red)",
        };
    }
  };

  const handleStatusUpdate = (rideId: string, status: BusRide["status"]) => {
    setRideStatus((prev) => ({ ...prev, [rideId]: status }));
  };

  return (
    <section id={id} className={`mb-0 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <h3 className="text-xl font-bold theme-text">Scheduled & Active Rides</h3>
        <button
          type="button"
          onClick={() => setIsAddingRide(!isAddingRide)}
          className="theme-btn-teal text-white w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg font-medium shrink-0"
        >
          {isAddingRide ? "Cancel" : "+ Create Ride"}
        </button>
      </div>

      {isAddingRide && (
        <div className="theme-card theme-outline-teal border rounded-xl p-4 sm:p-6 mb-5">
          <h3 className="font-semibold theme-text mb-4">Create New Ride</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <select className="theme-input px-4 py-2.5 rounded-lg">
              <option>Select Bus</option>
              {FAKE_BUSES.map((bus) => (
                <option key={bus.id}>{bus.busNumber}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Route (e.g., Dhaka → Chittagong)"
              className="theme-input px-4 py-2.5 rounded-lg"
            />
            <input
              type="datetime-local"
              placeholder="Departure Time"
              className="theme-input px-4 py-2.5 rounded-lg"
            />
            <input
              type="datetime-local"
              placeholder="Arrival Time"
              className="theme-input px-4 py-2.5 rounded-lg"
            />
            <input
              type="number"
              placeholder="Ticket Price"
              className="theme-input px-4 py-2.5 rounded-lg"
            />
          </div>
          <button
            type="button"
            className="theme-btn-teal text-white mt-4 w-full py-2.5 rounded-lg font-medium"
          >
            Create Ride
          </button>
        </div>
      )}

      <div className="space-y-4">
        {rides.map((ride) => {
          const occupancyPercent = (ride.bookedSeats / ride.totalSeats) * 100;
          const currentStatus = rideStatus[ride.id] || ride.status;
          const isExpanded = expandedRide === ride.id;

          return (
            <div
              key={ride.id}
              className="rounded-xl p-4 sm:p-5 overflow-hidden transition-colors"
              style={{
                backgroundColor: "var(--theme-bg)",
                border: "1px solid var(--theme-deep-green)",
              }}
            >
              <div className="flex flex-col gap-4 min-w-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="theme-text text-base sm:text-lg font-semibold break-words">
                        {ride.route}
                      </p>
                      <span style={getStatusStyle(currentStatus)}>
                        {currentStatus}
                      </span>
                    </div>

                    <p className="theme-text-muted text-sm break-words">
                      {ride.busNumber}
                      <span className="theme-text-subtle mx-1.5">·</span>
                      {ride.departureDate}
                    </p>

                    <p className="theme-text-subtle text-xs">
                      {ride.departureTime} → {ride.arrivalTime}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedRide(isExpanded ? null : ride.id)
                    }
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg theme-text text-sm font-medium shrink-0"
                    style={{
                      backgroundColor: "var(--theme-card-bg)",
                      border: "1px solid var(--theme-deep-green)",
                    }}
                  >
                    {isExpanded ? "Hide" : "Manage"}
                  </button>
                </div>

                <div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-lg p-3"
                  style={{ backgroundColor: "var(--theme-card-bg)" }}
                >
                  <div className="min-w-0">
                    <p className="theme-text-subtle text-xs uppercase tracking-wide mb-1.5">
                      Occupancy
                    </p>
                    <div
                      className="h-2 rounded-full overflow-hidden mb-1.5"
                      style={{ backgroundColor: "var(--theme-section-bg)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: "var(--theme-teal)",
                          width: `${occupancyPercent}%`,
                        }}
                      />
                    </div>
                    <p className="theme-text-teal text-xs font-medium tabular-nums">
                      {ride.bookedSeats}/{ride.totalSeats} (
                      {occupancyPercent.toFixed(0)}%)
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="theme-text-subtle text-xs uppercase tracking-wide mb-1.5">
                      Price
                    </p>
                    <p className="theme-text text-base font-semibold tabular-nums">
                      ৳ {ride.price.toLocaleString()}
                    </p>
                    <p className="theme-text-subtle text-xs mt-0.5">per seat</p>
                  </div>

                  <div className="min-w-0 col-span-2 sm:col-span-1">
                    <p className="theme-text-subtle text-xs uppercase tracking-wide mb-1.5">
                      Operator
                    </p>
                    <p className="theme-text text-sm font-medium break-words">
                      {ride.operatorName}
                    </p>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div
                  className="mt-4 pt-4 border-t space-y-4"
                  style={{ borderColor: "var(--theme-deep-green)" }}
                >
                  <div>
                    <p className="text-sm theme-text-muted mb-2.5">
                      Update Ride Status
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {(
                        [
                          "scheduled",
                          "ongoing",
                          "completed",
                          "cancelled",
                        ] as BusRide["status"][]
                      ).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusUpdate(ride.id, status)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentStatus === status
                              ? "theme-btn-teal text-white"
                              : "theme-text-muted"
                          }`}
                          style={
                            currentStatus === status
                              ? undefined
                              : {
                                  backgroundColor: "var(--theme-card-bg)",
                                  border: "1px solid var(--theme-deep-green)",
                                }
                          }
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-lg text-sm font-medium theme-text-teal"
                      style={{
                        backgroundColor: "var(--theme-card-bg)",
                        border: "1px solid var(--theme-teal)",
                      }}
                    >
                      Edit Ride
                    </button>
                    {currentStatus !== "cancelled" && (
                      <button
                        type="button"
                        className="px-4 py-2.5 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: "var(--theme-card-bg)",
                          border: "1px solid var(--theme-red)",
                          color: "var(--theme-red)",
                        }}
                      >
                        Cancel Ride
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className="theme-btn-teal text-white w-full py-2.5 rounded-lg font-medium"
                  >
                    Save Status Update
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
