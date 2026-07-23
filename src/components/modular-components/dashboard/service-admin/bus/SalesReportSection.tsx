"use client";

import React from "react";
import type { SalesReport } from "./types";

interface SalesReportSectionProps {
  reports: SalesReport[];
  id?: string;
  className?: string;
}

export const SalesReportSection = ({
  reports,
  id,
  className = "",
}: SalesReportSectionProps) => {
  const totalRevenue = reports.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalTickets = reports.reduce((sum, r) => sum + r.totalTicketsSold, 0);
  const avgOccupancy = (
    reports.reduce((sum, r) => sum + r.averageOccupancy, 0) / reports.length
  ).toFixed(1);

  return (
    <section id={id} className={`mb-0 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="theme-card theme-outline-teal border rounded-xl p-4">
          <p className="text-sm theme-text-muted">Total Revenue</p>
          <p className="text-3xl font-bold theme-text-teal mt-2">
            ৳ {(totalRevenue / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="theme-card theme-outline-teal border rounded-xl p-4">
          <p className="text-sm theme-text-muted">Total Tickets Sold</p>
          <p className="text-3xl font-bold theme-text-teal mt-2">{totalTickets}</p>
        </div>
        <div className="theme-card theme-outline-teal border rounded-xl p-4">
          <p className="text-sm theme-text-muted">Avg Occupancy</p>
          <p className="text-3xl font-bold theme-text-teal mt-2">
            {avgOccupancy}%
          </p>
        </div>
      </div>

      <div className="theme-card theme-outline border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className="theme-section border-b"
              style={{ borderColor: "var(--theme-deep-green)" }}
            >
              <tr>
                <th className="px-6 py-3 text-left font-semibold theme-text">
                  Date
                </th>
                <th className="px-6 py-3 text-left font-semibold theme-text">
                  Total Rides
                </th>
                <th className="px-6 py-3 text-left font-semibold theme-text">
                  Completed
                </th>
                <th className="px-6 py-3 text-left font-semibold theme-text">
                  Tickets Sold
                </th>
                <th className="px-6 py-3 text-left font-semibold theme-text">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left font-semibold theme-text">
                  Occupancy
                </th>
                <th className="px-6 py-3 text-left font-semibold theme-text">
                  Cancellations
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, idx) => (
                <tr
                  key={idx}
                  className="border-b"
                  style={{ borderColor: "var(--theme-deep-green)" }}
                >
                  <td className="px-6 py-3 theme-text">{report.date}</td>
                  <td className="px-6 py-3 theme-text-muted">
                    {report.totalRides}
                  </td>
                  <td className="px-6 py-3 theme-text-teal">
                    {report.completedRides}
                  </td>
                  <td className="px-6 py-3 theme-text-teal">
                    {report.totalTicketsSold}
                  </td>
                  <td className="px-6 py-3 font-semibold theme-text">
                    ৳ {report.totalRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 theme-text-teal">
                    {report.averageOccupancy.toFixed(1)}%
                  </td>
                  <td className="px-6 py-3 theme-text-muted">
                    {report.cancellations}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
