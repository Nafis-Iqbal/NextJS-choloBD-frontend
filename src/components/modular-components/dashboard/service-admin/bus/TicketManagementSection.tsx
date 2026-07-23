"use client";

import React, { useState } from "react";
import type { Ticket } from "./types";

interface TicketManagementSectionProps {
  tickets: Ticket[];
  id?: string;
  className?: string;
}

export const TicketManagementSection = ({
  tickets,
  id,
  className = "",
}: TicketManagementSectionProps) => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const confirmedTickets = tickets.filter((t) => t.status === "confirmed");
  const cancelledTickets = tickets.filter((t) => t.status === "cancelled");

  return (
    <section id={id} className={`mb-0 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="theme-card theme-outline-teal border rounded-xl p-4">
          <p className="text-sm theme-text-muted">Total Tickets</p>
          <p className="text-3xl font-bold theme-text-teal mt-2">
            {tickets.length}
          </p>
        </div>
        <div className="theme-card theme-outline-teal border rounded-xl p-4">
          <p className="text-sm theme-text-muted">Confirmed Tickets</p>
          <p className="text-3xl font-bold theme-text-teal mt-2">
            {confirmedTickets.length}
          </p>
        </div>
        <div
          className="theme-card border rounded-xl p-4"
          style={{ borderColor: "var(--theme-red)" }}
        >
          <p className="text-sm theme-text-muted">Cancelled Tickets</p>
          <p
            className="text-3xl font-bold mt-2"
            style={{ color: "var(--theme-red)" }}
          >
            {cancelledTickets.length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="theme-card theme-outline border rounded-lg p-4 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="font-semibold theme-text">{ticket.passengerName}</p>
                <p className="text-sm theme-text-muted mt-1">
                  Seat: {ticket.seatNumber} • Phone: {ticket.phoneNumber}
                </p>
                <p className="text-sm theme-text-teal">
                  ৳ {ticket.price} • Booked: {ticket.bookingDate}
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor:
                      ticket.status === "confirmed"
                        ? "rgba(40, 167, 69, 0.3)"
                        : "rgba(220, 53, 69, 0.3)",
                    color:
                      ticket.status === "confirmed"
                        ? "rgb(40, 167, 69)"
                        : "rgb(220, 53, 69)",
                  }}
                >
                  {ticket.status === "confirmed"
                    ? "✓ Confirmed"
                    : "❌ Cancelled"}
                </span>
                {ticket.status === "confirmed" && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTicket(
                        selectedTicket === ticket.id ? null : ticket.id
                      )
                    }
                    className="theme-section theme-text px-3 py-2 rounded-lg text-sm"
                  >
                    {selectedTicket === ticket.id ? "Hide" : "Actions"}
                  </button>
                )}
              </div>
            </div>

            {selectedTicket === ticket.id && (
              <div
                className="mt-4 pt-4 border-t"
                style={{ borderColor: "var(--theme-deep-green)" }}
              >
                <button
                  type="button"
                  className="w-full px-4 py-2 rounded-lg font-medium theme-text"
                  style={{ backgroundColor: "rgba(220, 53, 69, 0.3)" }}
                >
                  Cancel Ticket & Refund
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
