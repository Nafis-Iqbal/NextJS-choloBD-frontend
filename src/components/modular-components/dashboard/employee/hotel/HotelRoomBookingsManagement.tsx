import React, { useState } from "react";
import { BookingStatus } from "@/types/enums";

// Room Bookings Component
export const HotelRoomBookingsManagement: React.FC<{ bookings: HotelRoomBooking[], className?: string }> = ({ bookings, className }) => {
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatRoomTypeName = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getRoomTypeColor = (type: string) => {
    const typeMap: Record<string, string> = {
      SINGLE: "bg-blue-600/30 text-blue-300 border border-blue-500",
      DOUBLE: "bg-purple-600/30 text-purple-300 border border-purple-500",
      SUITE: "bg-pink-600/30 text-pink-300 border border-pink-500",
      DELUXE: "bg-green-600/30 text-green-300 border border-green-500",
      ECONOMY: "bg-indigo-600/30 text-indigo-300 border border-indigo-500",
    };

    // Find matching key (check if type starts with any of the keys)
    for (const [key, color] of Object.entries(typeMap)) {
      if (type.includes(key)) return color;
    }
    return "bg-gray-600/30 text-gray-300 border border-gray-500";
  };

  const getRoomTypesSummary = (roomDetails: HotelRoomBookingDetail[] | undefined) => {
    if (!roomDetails || roomDetails.length === 0) {
      return <span className="text-gray-400 text-xs">No rooms booked</span>;
    }

    const roomTypeCounts = roomDetails.reduce(
      (acc, detail) => {
        const roomType = detail.hotelRoom?.roomType || "Unknown";
        acc[roomType] = (acc[roomType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {Object.entries(roomTypeCounts).map(([type, count]) => (
          <span
            key={type}
            className={`px-2 py-1 rounded-md text-xs font-medium ${getRoomTypeColor(type)}`}
          >
            {formatRoomTypeName(type)}{" "}
            <span className="font-bold">×{count}</span>
          </span>
        ))}
      </div>
    );
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return "bg-yellow-600/30 text-yellow-300 border border-yellow-600/50";
      case BookingStatus.CONFIRMED:
        return "bg-blue-600/30 text-blue-300 border border-blue-600/50";
      case BookingStatus.COMPLETED:
        return "bg-green-600/30 text-green-300 border border-green-600/50";
      case BookingStatus.CANCELLED:
        return "bg-red-600/30 text-red-300 border border-red-600/50";
      case BookingStatus.REFUNDED:
        return "bg-purple-600/30 text-purple-300 border border-purple-600/50";
      case BookingStatus.NO_SHOW:
        return "bg-orange-600/30 text-orange-300 border border-orange-600/50";
      default:
        return "bg-gray-600/30 text-gray-300 border border-gray-600/50";
    }
  };

  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-bold text-white mb-4">Room Bookings</h2>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-teal-600 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-white font-semibold">{booking.guestName || "Guest"}</p>
                <p className="text-gray-400 text-sm mt-1">
                  Check-in: {formatDate(booking.checkInDate)} | Check-out: {formatDate(booking.checkOutDate)}
                </p>
                <div className="mt-2">
                  {getRoomTypesSummary(booking.roomDetails)}
                </div>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-semibold">৳ {booking.totalPrice}</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status === BookingStatus.PENDING
                      ? "⏳ Pending"
                      : booking.status === BookingStatus.CONFIRMED
                      ? "📅 Confirmed"
                      : booking.status === BookingStatus.COMPLETED
                      ? "✓ Completed"
                      : booking.status === BookingStatus.CANCELLED
                      ? "❌ Cancelled"
                      : booking.status === BookingStatus.REFUNDED
                      ? "💰 Refunded"
                      : "⚠️ No Show"}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setSelectedBooking(selectedBooking === booking.id ? null : booking.id)
                  }
                  className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
                >
                  {selectedBooking === booking.id ? "Hide" : "Actions"}
                </button>
              </div>
            </div>

            {selectedBooking === booking.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                {/* Room Details Section */}
                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-3">Booked Rooms:</h4>
                  <div className="bg-gray-900 rounded-lg p-3 space-y-2">
                    {booking.roomDetails && booking.roomDetails.length > 0 ? (
                      booking.roomDetails.map((detail) => (
                        <div key={detail.id} className="flex justify-between items-start text-sm">
                          <div>
                            <p className="text-gray-300">
                              <span className="font-medium">Room {detail.hotelRoom?.roomNumber || "N/A"}</span>
                              {" "}
                              <span className="text-gray-400">({detail.hotelRoom?.roomType || "Unknown"})</span>
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              ৳ {detail.pricePerNight.toLocaleString()} per night
                            </p>
                          </div>
                          <p className="text-teal-400 font-medium">৳ {detail.subtotal.toLocaleString()}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No room details available</p>
                    )}
                  </div>
                </div>

                {/* Guest Contact Information */}
                {(booking.guestEmail || booking.guestPhoneNumber) && (
                  <div className="mb-4 text-sm">
                    <h4 className="text-white font-semibold mb-2">Guest Contact:</h4>
                    {booking.guestEmail && <p className="text-gray-300">Email: {booking.guestEmail}</p>}
                    {booking.guestPhoneNumber && <p className="text-gray-300">Phone: {booking.guestPhoneNumber}</p>}
                  </div>
                )}

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="mb-4 text-sm">
                    <h4 className="text-white font-semibold mb-2">Special Requests:</h4>
                    <p className="text-gray-300 bg-gray-900 rounded p-2">{booking.specialRequests}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {booking.status === BookingStatus.CONFIRMED && (
                    <button className="px-4 py-2 rounded-lg bg-green-600/50 hover:bg-green-600/70 text-green-200 font-medium">
                      ✓ Check In
                    </button>
                  )}
                  
                  {booking.status === BookingStatus.COMPLETED && (
                    <button className="px-4 py-2 rounded-lg bg-blue-600/50 hover:bg-blue-600/70 text-blue-200 font-medium">
                      📋 View Details
                    </button>
                  )}
                
                  {booking.status !== BookingStatus.COMPLETED && booking.status !== BookingStatus.CANCELLED && (
                    <button className="px-4 py-2 rounded-lg bg-red-600/50 hover:bg-red-600/70 text-red-200 font-medium">
                      ❌ Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
