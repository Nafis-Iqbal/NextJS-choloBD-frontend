import React, { useState } from "react";
import { TransportBooking } from "./BookedTransportSection";
import { PaginationControls } from "./PaginationControls";
import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";
import {
  BookingPostStayActions,
  buildPlatformComplaintSubmitHref,
  hasBookingServiceStarted,
} from "./BookingPostStayActions";

const emptyStateClass = "rounded-sm p-4 text-center theme-text-subtle";

const scrollContainerClass =
  "rounded-sm md:rounded-md overflow-y-auto max-h-[80vh] min-h-[40vh] px-0 py-2 md:p-2 border-0 md:border";

const cardClass =
  "rounded-sm md:rounded p-2 md:p-3 transition-colors overflow-hidden border-0 md:border";

// Transport Booking History with Pagination
export const TransportBookingHistorySection: React.FC<{
  bookings: TransportBooking[];
  itemsPerPage?: number;
  className?: string;
  showFakeData?: boolean;
}> = ({ bookings, itemsPerPage = 5, className, showFakeData = false }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const header = (
    <div
      className="mb-3 md:mb-4 pb-2 md:pb-3 border-b-0 md:border-b"
      style={{ borderColor: "var(--theme-deep-green)" }}
    >
      <h2 className="text-xl sm:text-2xl font-bold theme-text-teal">
        Transport Booking History
      </h2>
    </div>
  );

  if (!bookings || bookings.length === 0) {
    return (
      <section className={`mb-0 ${className || ""}`}>
        {header}
        {showFakeData && (
          <PlaceholderFeatureWarning moduleName="Transport Booking History Details" />
        )}
        <div className={emptyStateClass}>No transport bookings found</div>
      </section>
    );
  }

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = bookings.slice(startIdx, startIdx + itemsPerPage);

  return (
    <section className={`mb-0 ${className || ""}`}>
      {header}

      {showFakeData && (
        <PlaceholderFeatureWarning moduleName="Transport Booking History Details" />
      )}

      <div
        className={scrollContainerClass}
        style={{
          backgroundColor: "var(--theme-card-bg)",
          borderColor: "var(--theme-deep-green)",
        }}
      >
        <div className="space-y-2">
          {paginatedData.map((booking) => (
            <div
              key={booking.id}
              className={cardClass}
              style={{
                backgroundColor: "var(--theme-bg)",
                borderColor: "var(--theme-deep-green)",
              }}
            >
              <div className="flex flex-col gap-2 md:gap-3 md:flex-row md:items-start md:justify-between min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="theme-text font-semibold break-words">
                    {booking.transportType}
                  </p>
                  <div className="theme-text-muted text-sm mt-1 flex flex-col gap-0.5 sm:block">
                    <span className="break-words">{booking.route}</span>
                    <span className="hidden sm:inline"> • </span>
                    <span>{booking.departureDate}</span>
                  </div>
                </div>
                <div className="w-full md:w-auto flex flex-col gap-2 min-w-0 shrink-0">
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <p className="theme-text font-semibold text-sm sm:text-base">
                      ৳ {booking.price.toLocaleString()}
                    </p>
                    <span
                      className="shrink-0 px-3 py-1 rounded-sm text-xs font-medium"
                      style={{
                        backgroundColor:
                          booking.status === "completed"
                            ? "rgba(127, 155, 142, 0.2)"
                            : booking.status === "ongoing"
                              ? "rgba(212, 160, 23, 0.2)"
                              : "rgba(42, 157, 143, 0.2)",
                        color:
                          booking.status === "completed"
                            ? "var(--theme-text-muted)"
                            : booking.status === "ongoing"
                              ? "var(--theme-star)"
                              : "var(--theme-teal)",
                      }}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <BookingPostStayActions
                    hasServiceStarted={hasBookingServiceStarted(
                      booking.departureDate.split(" - ")[0]
                    )}
                    isEligibleBooking={booking.status === "completed" || booking.status === "ongoing"}
                    reviewHref={null}
                    complaintHref={buildPlatformComplaintSubmitHref()}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
};
