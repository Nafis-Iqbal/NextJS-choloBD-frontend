"use client";

import React, { useMemo, useState } from "react";
import type { BoardingTicket } from "./types";

interface BusTicketCheckinSectionProps {
  tickets: BoardingTicket[];
  id?: string;
  className?: string;
}

export const BusTicketCheckinSection = ({
  tickets,
  id = "bus_employee_checkin",
  className = "",
}: BusTicketCheckinSectionProps) => {
  const [statuses, setStatuses] = useState<
    Record<string, BoardingTicket["status"]>
  >({});
  const [query, setQuery] = useState("");

  const resolvedTickets = useMemo(
    () =>
      tickets.map((t) => ({
        ...t,
        status: statuses[t.id] || t.status,
      })),
    [tickets, statuses]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resolvedTickets;
    return resolvedTickets.filter(
      (t) =>
        t.passengerName.toLowerCase().includes(q) ||
        t.seatNumber.toLowerCase().includes(q) ||
        t.phoneNumber.includes(q) ||
        t.route.toLowerCase().includes(q)
    );
  }, [resolvedTickets, query]);

  const pendingCount = resolvedTickets.filter((t) => t.status === "pending").length;
  const boardedCount = resolvedTickets.filter((t) => t.status === "boarded").length;

  const setStatus = (ticketId: string, status: BoardingTicket["status"]) => {
    setStatuses((prev) => ({ ...prev, [ticketId]: status }));
  };

  const statusBadge = (status: BoardingTicket["status"]): React.CSSProperties => {
    const base: React.CSSProperties = {
      paddingLeft: "0.75rem",
      paddingRight: "0.75rem",
      paddingTop: "0.25rem",
      paddingBottom: "0.25rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: 600,
      border: "1px solid",
      textTransform: "capitalize",
    };
    switch (status) {
      case "pending":
        return {
          ...base,
          backgroundColor: "rgba(255, 165, 0, 0.15)",
          color: "rgb(200, 120, 0)",
          borderColor: "rgba(255, 165, 0, 0.45)",
        };
      case "boarded":
        return {
          ...base,
          backgroundColor: "rgba(42, 157, 143, 0.15)",
          color: "var(--theme-teal)",
          borderColor: "var(--theme-teal)",
        };
      case "no-show":
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
        <h3 className="text-xl font-bold theme-text">Ticket Check-in</h3>
        <p className="theme-text-muted text-sm mt-1">
          Verify passengers at the gate and mark boarding status
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5">
        <div
          className="rounded-xl p-3 sm:p-4"
          style={{
            backgroundColor: "var(--theme-bg)",
            border: "1px solid var(--theme-deep-green)",
          }}
        >
          <p className="theme-text-subtle text-xs">Total</p>
          <p className="theme-text text-2xl font-bold mt-1 tabular-nums">
            {resolvedTickets.length}
          </p>
        </div>
        <div
          className="rounded-xl p-3 sm:p-4"
          style={{
            backgroundColor: "var(--theme-bg)",
            border: "1px solid var(--theme-deep-green)",
          }}
        >
          <p className="theme-text-subtle text-xs">Pending</p>
          <p className="text-2xl font-bold mt-1 tabular-nums" style={{ color: "rgb(200, 120, 0)" }}>
            {pendingCount}
          </p>
        </div>
        <div
          className="rounded-xl p-3 sm:p-4"
          style={{
            backgroundColor: "var(--theme-bg)",
            border: "1px solid var(--theme-deep-green)",
          }}
        >
          <p className="theme-text-subtle text-xs">Boarded</p>
          <p className="theme-text-teal text-2xl font-bold mt-1 tabular-nums">
            {boardedCount}
          </p>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, seat, phone, or route..."
        className="theme-input w-full px-4 py-2.5 rounded-lg mb-4"
      />

      <div className="space-y-3">
        {filtered.map((ticket) => (
          <div
            key={ticket.id}
            className="rounded-xl p-4 overflow-hidden"
            style={{
              backgroundColor: "var(--theme-bg)",
              border: "1px solid var(--theme-deep-green)",
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="theme-text font-semibold break-words">
                    {ticket.passengerName}
                  </p>
                  <span style={statusBadge(ticket.status)}>{ticket.status}</span>
                </div>
                <p className="theme-text-muted text-sm">
                  Seat {ticket.seatNumber}
                  <span className="theme-text-subtle mx-1.5">·</span>
                  {ticket.phoneNumber}
                </p>
                <p className="theme-text-subtle text-xs">
                  {ticket.route} · {ticket.departureTime}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                {ticket.status !== "boarded" && (
                  <button
                    type="button"
                    onClick={() => setStatus(ticket.id, "boarded")}
                    className="theme-btn-teal text-white px-3 py-2 rounded-lg text-xs font-medium"
                  >
                    Board
                  </button>
                )}
                {ticket.status !== "no-show" && ticket.status !== "boarded" && (
                  <button
                    type="button"
                    onClick={() => setStatus(ticket.id, "no-show")}
                    className="px-3 py-2 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: "var(--theme-card-bg)",
                      border: "1px solid var(--theme-red)",
                      color: "var(--theme-red)",
                    }}
                  >
                    No-show
                  </button>
                )}
                {ticket.status !== "pending" && (
                  <button
                    type="button"
                    onClick={() => setStatus(ticket.id, "pending")}
                    className="px-3 py-2 rounded-lg text-xs font-medium theme-text-muted"
                    style={{
                      backgroundColor: "var(--theme-card-bg)",
                      border: "1px solid var(--theme-deep-green)",
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div
            className="rounded-xl p-6 text-center theme-text-subtle"
            style={{
              backgroundColor: "var(--theme-card-bg)",
              border: "1px solid var(--theme-deep-green)",
            }}
          >
            No tickets match your search
          </div>
        )}
      </div>
    </section>
  );
};
