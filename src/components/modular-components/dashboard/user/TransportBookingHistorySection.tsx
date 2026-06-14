import React, { useState } from "react";
import { TransportBooking } from "./BookedTransportSection";
import { PaginationControls } from "./PaginationControls";
import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";

// Transport Booking History with Pagination
export const TransportBookingHistorySection: React.FC<{
  bookings: TransportBooking[];
  itemsPerPage?: number;
  className?: string;
}> = ({ bookings, itemsPerPage = 5, className }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!bookings || bookings.length === 0) {
    return (
      <section className={`mb-8 ${className || ''}`}>
        <h2 className="text-2xl font-bold theme-text mb-4">
          Transport Booking History
        </h2>
        <div className="theme-card rounded-xl p-6 text-center theme-text-subtle">
          No transport bookings found
        </div>
      </section>
    );
  }

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = bookings.slice(startIdx, startIdx + itemsPerPage);

  return (
    <section className={`mb-8 ${className || ''}`}>
      <h2 className="text-2xl font-bold theme-text mb-4">
        Transport Booking History
      </h2>

      <PlaceholderFeatureWarning moduleName="Transport Booking History Details" />

      <div className="space-y-3">
        {paginatedData.map((booking) => (
          <div
            key={booking.id}
            className="theme-card rounded-lg p-4 transition-colors"
            style={{ borderColor: `var(--theme-deep-green)` }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = `var(--theme-teal)`}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = `var(--theme-deep-green)`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="theme-text font-semibold">{booking.transportType}</p>
                <p className="theme-text-muted text-sm mt-1">
                  {booking.route} • {booking.departureDate}
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-4">
                <div className="text-right">
                  <p className="theme-text font-semibold">৳ {booking.price.toLocaleString()}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${
                      booking.status === "completed"
                        ? "rgba(127, 155, 142, 0.2)"
                        : booking.status === "ongoing"
                        ? "rgba(212, 160, 23, 0.2)"
                        : "rgba(42, 157, 143, 0.2)"
                    }`,
                    color: `${
                      booking.status === "completed"
                        ? "var(--theme-text-muted)"
                        : booking.status === "ongoing"
                        ? "var(--theme-star)"
                        : "var(--theme-teal)"
                    }`,
                  }}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
};
