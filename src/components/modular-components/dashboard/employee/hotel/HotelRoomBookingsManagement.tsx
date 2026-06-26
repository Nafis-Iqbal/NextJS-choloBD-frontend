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
      SINGLE: "bg-blue-600/30 text-blue-800 border border-blue-500",
      DOUBLE: "bg-purple-600/30 text-purple-800 border border-purple-500",
      SUITE: "bg-pink-600/30 text-pink-800 border border-pink-500",
      DELUXE: "bg-green-600/30 text-green-800 border border-green-500",
      ECONOMY: "bg-indigo-600/30 text-indigo-800 border border-indigo-500",
    };

    // Find matching key (check if type starts with any of the keys)
    for (const [key, color] of Object.entries(typeMap)) {
      if (type.includes(key)) return color;
    }
    return "bg-gray-600/30 text-gray-300 border border-gray-500";
  };

  const getRoomTypesSummary = (roomDetails: HotelRoomBookingDetail[] | undefined) => {
    if (!roomDetails || roomDetails.length === 0) {
      return <span className="text-xs" style={{color: 'var(--theme-text-subtle)'}}>No rooms booked</span>;
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
        return "bg-yellow-600/30 text-yellow-800 border border-yellow-600/50";
      case BookingStatus.CONFIRMED:
        return "bg-blue-600/30 text-blue-800 border border-blue-600/50";
      case BookingStatus.COMPLETED:
        return "bg-green-600/30 text-green-800 border border-green-600/50";
      case BookingStatus.CANCELLED:
        return "bg-red-600/30 text-red-800 border border-red-600/50";
      case BookingStatus.REFUNDED:
        return "bg-purple-600/30 text-purple-800 border border-purple-600/50";
      case BookingStatus.NO_SHOW:
        return "bg-orange-600/30 text-orange-800 border border-orange-600/50";
      default:
        return "bg-gray-600/30 text-gray-800 border border-gray-600/50";
    }
  };

  const getStatusCounts = () => {
    const counts = {
      total: bookings.length,
      [BookingStatus.PENDING]: 0,
      [BookingStatus.CONFIRMED]: 0,
      [BookingStatus.COMPLETED]: 0,
      [BookingStatus.CANCELLED]: 0,
      [BookingStatus.REFUNDED]: 0,
      [BookingStatus.NO_SHOW]: 0,
    };

    bookings.forEach((booking) => {
      counts[booking.status]++;
    });

    return counts;
  };

  const getStatusColorVar = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.PENDING:
        return "var(--theme-yellow, rgb(234, 179, 8))";
      case BookingStatus.CONFIRMED:
        return "var(--theme-blue, rgb(59, 130, 246))";
      case BookingStatus.COMPLETED:
        return "var(--theme-green, rgb(34, 197, 94))";
      case BookingStatus.CANCELLED:
        return "var(--theme-red, rgb(220, 53, 69))";
      case BookingStatus.REFUNDED:
        return "var(--theme-purple, rgb(147, 51, 234))";
      case BookingStatus.NO_SHOW:
        return "var(--theme-orange, rgb(239, 68, 68))";
      default:
        return "var(--theme-text-muted)";
    }
  };

  const statusCounts = getStatusCounts();

  return (
    <section className={`mb-8 ${className}`}>
      <div className="mb-4">
        <div className="flex flex-wrap items-baseline gap-4">
          <h2 className="text-2xl font-bold" style={{color: 'var(--theme-text)'}}>Room Bookings</h2>
          <span className="text-xl" style={{color: 'var(--theme-text-muted)'}}>
            Total: <span className="font-semibold" style={{color: 'var(--theme-teal)'}}>{statusCounts.total}</span>
            {statusCounts[BookingStatus.PENDING] > 0 && (
              <>
                {' · '}Pending: <span className="font-semibold" style={{color: getStatusColorVar(BookingStatus.PENDING)}}>{statusCounts[BookingStatus.PENDING]}</span></>
            )}
            {statusCounts[BookingStatus.CONFIRMED] > 0 && (
              <>
                {' · '}Confirmed: <span className="font-semibold" style={{color: getStatusColorVar(BookingStatus.CONFIRMED)}}>{statusCounts[BookingStatus.CONFIRMED]}</span></>
            )}
            {statusCounts[BookingStatus.COMPLETED] > 0 && (
              <>
                {' · '}Completed: <span className="font-semibold" style={{color: getStatusColorVar(BookingStatus.COMPLETED)}}>{statusCounts[BookingStatus.COMPLETED]}</span></>
            )}
            {statusCounts[BookingStatus.CANCELLED] > 0 && (
              <>
                {' · '}Cancelled: <span className="font-semibold" style={{color: getStatusColorVar(BookingStatus.CANCELLED)}}>{statusCounts[BookingStatus.CANCELLED]}</span></>
            )}
            {statusCounts[BookingStatus.REFUNDED] > 0 && (
              <>
                {' · '}Refunded: <span className="font-semibold" style={{color: getStatusColorVar(BookingStatus.REFUNDED)}}>{statusCounts[BookingStatus.REFUNDED]}</span></>
            )}
            {statusCounts[BookingStatus.NO_SHOW] > 0 && (
              <>
                {' · '}No Show: <span className="font-semibold" style={{color: getStatusColorVar(BookingStatus.NO_SHOW)}}>{statusCounts[BookingStatus.NO_SHOW]}</span></>
            )}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-lg p-4 transition-colors"
            style={{backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-deep-green)', borderWidth: '1px'}}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="font-semibold" style={{color: 'var(--theme-text)'}}>{booking.guestName || "Guest"}</p>
                <p className="text-sm mt-1" style={{color: 'var(--theme-text-muted)'}}>​
                  Check-in: {formatDate(booking.checkInDate)} | Check-out: {formatDate(booking.checkOutDate)}
                </p>
                <div className="mt-2">
                  {getRoomTypesSummary(booking.roomDetails)}
                </div>
              </div>
              <div className="mt-3 md:mt-0 flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold" style={{color: 'var(--theme-text)'}}>৳ {booking.totalPrice}</p>
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
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{backgroundColor: 'var(--theme-section-bg)', color: 'var(--theme-text)'}}
                >
                  {selectedBooking === booking.id ? "Hide" : "Actions"}
                </button>
              </div>
            </div>

            {selectedBooking === booking.id && (
              <div className="mt-4 pt-4" style={{borderTopColor: 'var(--theme-deep-green)', borderTopWidth: '1px'}}>
                {/* Room Details Section */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-3" style={{color: 'var(--theme-text)'}}>Booked Rooms:</h4>
                  <div className="rounded-lg p-3 space-y-2" style={{backgroundColor: 'var(--theme-section-bg)'}}>
                    {booking.roomDetails && booking.roomDetails.length > 0 ? (
                      booking.roomDetails.map((detail) => (
                        <div key={detail.id} className="flex justify-between items-start text-sm">
                          <div>
                            <p style={{color: 'var(--theme-text)'}}>​
                              <span className="font-medium">Room {detail.hotelRoom?.roomNumber || "N/A"}</span>
                              {" "}
                              <span style={{color: 'var(--theme-text-muted)'}}>({detail.hotelRoom?.roomType || "Unknown"})</span>
                            </p>
                            <p className="text-xs mt-1" style={{color: 'var(--theme-text-subtle)'}}>
                              ৳ {detail.pricePerNight.toLocaleString()} per night
                            </p>
                          </div>
                          <p className="font-medium" style={{color: 'var(--theme-teal)'}}>৳ {detail.subtotal.toLocaleString()}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm" style={{color: 'var(--theme-text-muted)'}}>No room details available</p>
                    )}
                  </div>
                </div>

                {/* Guest Contact Information */}
                {(booking.guestEmail || booking.guestPhoneNumber) && (
                  <div className="mb-4 text-sm">
                    <h4 className="font-semibold mb-2" style={{color: 'var(--theme-text)'}}>Guest Contact:</h4>
                    {booking.guestEmail && <p style={{color: 'var(--theme-text)'}}>Email: {booking.guestEmail}</p>}
                    {booking.guestPhoneNumber && <p style={{color: 'var(--theme-text)'}}>Phone: {booking.guestPhoneNumber}</p>}
                  </div>
                )}

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="mb-4 text-sm">
                    <h4 className="font-semibold mb-2" style={{color: 'var(--theme-text)'}}>Special Requests:</h4>
                    <p className="rounded p-2" style={{color: 'var(--theme-text)', backgroundColor: 'var(--theme-section-bg)'}}>{booking.specialRequests}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {booking.status === BookingStatus.CONFIRMED && (
                    <button className="px-4 py-2 rounded-lg font-medium" style={{backgroundColor: 'var(--theme-teal)', color: 'white'}}>
                      ✓ Check In
                    </button>
                  )}
                  
                  {booking.status === BookingStatus.COMPLETED && (
                    <button className="px-4 py-2 rounded-lg font-medium" style={{backgroundColor: 'var(--theme-section-bg)', color: 'var(--theme-text)'}}>
                      📋 View Details
                    </button>
                  )}
                
                  {booking.status !== BookingStatus.COMPLETED && booking.status !== BookingStatus.CANCELLED && (
                    <button className="px-4 py-2 rounded-lg font-medium" style={{backgroundColor: 'rgba(220, 53, 69, 0.3)', color: 'rgb(220, 53, 69)'}}>
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
