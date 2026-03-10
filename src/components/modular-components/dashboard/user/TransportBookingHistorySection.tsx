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
        <h2 className="text-2xl font-bold text-white mb-4">
          Transport Booking History
        </h2>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
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
      <h2 className="text-2xl font-bold text-white mb-4">
        Transport Booking History
      </h2>

      <PlaceholderFeatureWarning moduleName="Transport Booking History Details" />

      <div className="space-y-3">
        {paginatedData.map((booking) => (
          <div
            key={booking.id}
            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-white font-semibold">{booking.transportType}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {booking.route} • {booking.departureDate}
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-semibold">৳ {booking.price.toLocaleString()}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === "completed"
                      ? "bg-gray-600/30 text-gray-300"
                      : booking.status === "ongoing"
                      ? "bg-orange-600/30 text-orange-300"
                      : "bg-blue-600/30 text-blue-300"
                  }`}
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
