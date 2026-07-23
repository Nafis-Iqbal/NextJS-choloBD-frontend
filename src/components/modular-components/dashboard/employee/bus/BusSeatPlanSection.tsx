"use client";

import React, { useMemo, useState } from "react";
import type { CoachType, SeatCell, SeatStatus } from "./types";
import {
  COACH_TYPE_OPTIONS,
  SEAT_PLAN_LAYOUTS,
} from "./types";

const STATUS_STYLES: Record<
  SeatStatus,
  { bg: string; border: string; color: string; label: string }
> = {
  open: {
    bg: "rgba(42, 157, 143, 0.18)",
    border: "var(--theme-teal)",
    color: "var(--theme-teal)",
    label: "Open",
  },
  booked: {
    bg: "rgba(220, 53, 69, 0.18)",
    border: "var(--theme-red)",
    color: "var(--theme-red)",
    label: "Booked",
  },
  blocked: {
    bg: "var(--theme-section-bg)",
    border: "var(--theme-text-muted)",
    color: "var(--theme-text-muted)",
    label: "Blocked",
  },
};

function SeatButton({ cell }: { cell: Extract<SeatCell, { kind: "seat" }> }) {
  const style = STATUS_STYLES[cell.status];

  return (
    <button
      type="button"
      title={`${cell.label} — ${style.label}`}
      className="w-9 h-9 sm:w-11 sm:h-11 rounded-md text-[10px] sm:text-xs font-bold tabular-nums transition-transform hover:scale-105"
      style={{
        backgroundColor: style.bg,
        border: `1.5px solid ${style.border}`,
        color: style.color,
      }}
    >
      {cell.label}
    </button>
  );
}

function SeatRow({ cells }: { cells: SeatCell[] }) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {cells.map((cell, idx) => {
        if (cell.kind === "aisle") {
          return (
            <div
              key={`aisle-${idx}`}
              className="w-5 sm:w-8 shrink-0"
              aria-hidden
            />
          );
        }
        if (cell.kind === "empty") {
          return <div key={`empty-${idx}`} className="w-9 h-9 sm:w-11 sm:h-11" />;
        }
        return <SeatButton key={cell.id} cell={cell} />;
      })}
    </div>
  );
}

interface BusSeatPlanSectionProps {
  id?: string;
  className?: string;
  initialCoachType?: CoachType;
}

export const BusSeatPlanSection = ({
  id = "bus_employee_seat_plan",
  className = "",
  initialCoachType = "AC",
}: BusSeatPlanSectionProps) => {
  const [coachType, setCoachType] = useState<CoachType>(initialCoachType);

  const layout = SEAT_PLAN_LAYOUTS[coachType];

  const counts = useMemo(() => {
    let open = 0;
    let booked = 0;
    let blocked = 0;
    for (const row of layout.rows) {
      for (const cell of row) {
        if (cell.kind !== "seat") continue;
        if (cell.status === "open") open++;
        else if (cell.status === "booked") booked++;
        else blocked++;
      }
    }
    return { open, booked, blocked };
  }, [layout]);

  return (
    <section id={id} className={`mb-0 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold theme-text">Seat Plan</h3>
          <p className="theme-text-muted text-sm mt-1">
            Switch coach type to load the matching seat layout
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {COACH_TYPE_OPTIONS.map((type) => {
          const selected = coachType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setCoachType(type)}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={
                selected
                  ? {
                      backgroundColor: "var(--theme-teal)",
                      color: "#ffffff",
                      boxShadow: "0 0 0 1px var(--theme-teal)",
                    }
                  : {
                      backgroundColor: "var(--theme-card-bg)",
                      color: "var(--theme-text-muted)",
                      border: "1px solid var(--theme-deep-green)",
                    }
              }
            >
              {type}
            </button>
          );
        })}
      </div>

      <div
        className="rounded-xl p-4 sm:p-6 overflow-hidden"
        style={{
          backgroundColor: "var(--theme-bg)",
          border: "1px solid var(--theme-deep-green)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <p className="theme-text font-semibold text-lg">{layout.label}</p>
            <p className="theme-text-subtle text-sm mt-0.5">
              {layout.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
            <span className="theme-text-teal font-medium tabular-nums">
              {counts.open} open
            </span>
            <span className="theme-text-subtle">·</span>
            <span
              className="font-medium tabular-nums"
              style={{ color: "var(--theme-red)" }}
            >
              {counts.booked} booked
            </span>
            <span className="theme-text-subtle">·</span>
            <span className="theme-text-muted font-medium tabular-nums">
              {counts.blocked} blocked
            </span>
            <span className="theme-text-subtle">·</span>
            <span className="theme-text font-medium tabular-nums">
              {layout.totalSeats} total
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5">
          {(Object.keys(STATUS_STYLES) as SeatStatus[]).map((status) => {
            const s = STATUS_STYLES[status];
            return (
              <div key={status} className="flex items-center gap-2 text-xs sm:text-sm">
                <span
                  className="w-4 h-4 rounded-sm shrink-0"
                  style={{
                    backgroundColor: s.bg,
                    border: `1.5px solid ${s.border}`,
                  }}
                />
                <span className="theme-text-muted">{s.label}</span>
              </div>
            );
          })}
        </div>

        <div
          className="mx-auto max-w-md mb-4 py-2 px-4 rounded-t-2xl text-center text-xs font-semibold tracking-wide"
          style={{
            backgroundColor: "var(--theme-card-bg)",
            border: "1px solid var(--theme-deep-green)",
            color: "var(--theme-text-muted)",
          }}
        >
          FRONT · DRIVER
        </div>

        <div
          className="mx-auto max-w-md rounded-xl p-3 sm:p-5 space-y-2 sm:space-y-2.5 overflow-x-auto"
          style={{
            backgroundColor: "var(--theme-card-bg)",
            border: "1px solid var(--theme-deep-green)",
          }}
        >
          {layout.rows.map((row, rowIdx) => (
            <SeatRow key={`${coachType}-row-${rowIdx}`} cells={row} />
          ))}
        </div>

        <div
          className="mx-auto max-w-md mt-3 py-1.5 px-4 rounded-b-xl text-center text-[10px] sm:text-xs"
          style={{
            backgroundColor: "var(--theme-card-bg)",
            border: "1px solid var(--theme-deep-green)",
            color: "var(--theme-text-subtle)",
          }}
        >
          REAR EXIT
        </div>
      </div>
    </section>
  );
};
