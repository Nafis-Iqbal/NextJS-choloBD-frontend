"use client";

import { useMemo } from "react";
import { HotelBookingApi } from "@/services/api";
import { BookingStatus, PaymentStatus } from "@/types/enums";

// Earnings Summary Section
export const EarningsSummarySection = ({hotelId, className} : {hotelId: string; className?: string}) => {

  const { data: bookingsResponse, isLoading } = HotelBookingApi.useGetBookingsRQ(`hotelId=${hotelId}`);
  
  const bookings = useMemo(() => {
    const data = bookingsResponse?.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data?.data || [];
  }, [bookingsResponse]);

  const { totalEarnings, pendingEarnings } = useMemo(() => {
    const completed = bookings
      .filter((b: HotelRoomBooking) => b.paymentStatus === PaymentStatus.PAID)
      .reduce((sum: number, b: HotelRoomBooking) => sum + b.totalPrice, 0);
    
    const pending = bookings
      .filter((b: HotelRoomBooking) => b.paymentStatus === PaymentStatus.UNPAID)
      .reduce((sum: number, b: HotelRoomBooking) => sum + b.totalPrice, 0);

    return { totalEarnings: completed, pendingEarnings: pending };
  }, [bookings]);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "bg-green-600/30 text-green-300";
      case BookingStatus.PENDING:
        return "bg-yellow-600/30 text-yellow-300";
      case BookingStatus.CANCELLED:
        return "bg-red-600/30 text-red-300";
      default:
        return "bg-gray-600/30 text-gray-300";
    }
  };

  const calculateNights = (checkIn: Date, checkOut: Date) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Earnings Summary</h2>
        <p className="text-gray-400">Loading bookings...</p>
      </section>
    );
  }

  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-bold text-white mb-6">Earnings Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-linear-to-br from-green-900/40 to-green-700/20 border border-green-600/50 rounded-xl p-4">
          <p className="text-gray-300 text-sm">Total Completed</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            ৳ {totalEarnings.toLocaleString()}
          </p>
        </div>
        <div className="bg-linear-to-br from-yellow-900/40 to-yellow-700/20 border border-yellow-600/50 rounded-xl p-4">
          <p className="text-gray-300 text-sm">Pending Amount</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            ৳ {pendingEarnings.toLocaleString()}
          </p>
        </div>
        <div className="bg-linear-to-br from-blue-900/40 to-blue-700/20 border border-blue-600/50 rounded-xl p-4">
          <p className="text-gray-300 text-sm">Total Bookings</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{bookings.length}</p>
        </div>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/70 border-b border-gray-600">
              <tr className="">
                <th className="px-6 py-3 text-white font-semibold">Guest Name</th>
                <th className="px-6 py-3 text-white font-semibold">Check-in</th>
                <th className="px-6 py-3 text-white font-semibold">Check-out</th>
                <th className="px-6 py-3 text-white font-semibold">Nights</th>
                <th className="px-6 py-3 text-white font-semibold">Amount</th>
                <th className="px-6 py-3 text-white font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking: HotelRoomBooking) => {
                  const nights = calculateNights(new Date(booking.checkInDate), new Date(booking.checkOutDate));
                  const checkInDate = new Date(booking.checkInDate).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: '2-digit' });
                  const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: '2-digit' });
                  
                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors text-center"
                    >
                      <td className="px-6 py-3 text-white">{booking.user?.firstName || booking.guestName}</td>
                      <td className="px-6 py-3 text-gray-300 text-sm">{checkInDate}</td>
                      <td className="px-6 py-3 text-gray-300 text-sm">{checkOutDate}</td>
                      <td className="px-6 py-3 text-gray-300">{nights}</td>
                      <td className="px-6 py-3 text-white font-semibold">
                        ৳ {booking.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                        >
                          {booking.status === BookingStatus.CONFIRMED
                            ? "✓ Confirmed"
                            : booking.status === BookingStatus.PENDING
                            ? "⏳ Pending"
                            : "✕ Cancelled"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};