"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthApi, HotelBookingApi } from "@/services/api";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { CustomTextInput } from "@/components/custom-elements/CustomInputElements";
import { FeatureUnderDevelopment } from "@/components/placeholder-components/FeatureUnderDevelopment";

export default function TrackersPage() {
  const router = useRouter();
  const { openNotificationPopUpMessage } = useGlobalUI();

  const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
  const isAuthenticated = authResponse?.data?.isAuthenticated || false;
  const currentUserId = authResponse?.data?.userId;

  const [hotelSearchData, setHotelSearchData] = useState({
    guestName: "",
    guestPhoneNumber: "",
    confirmationCode: "",
  });

  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isWaitingForResults, setIsWaitingForResults] = useState(false);
  const [showValidationHint, setShowValidationHint] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<Record<string, "wallet" | "card">>(
    {}
  );

  const { data: bookingsData, isLoading: apiLoading } = HotelBookingApi.useGetBookingsRQ(
    searchQuery || undefined
  );

  const searchResults = useMemo(() => {
    const payload = bookingsData?.data;
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    return payload.data || [];
  }, [bookingsData]);

  // When API finishes loading, update waiting state
  useEffect(() => {
    if (hasSearched && !apiLoading) {
      setIsWaitingForResults(false);
    }
  }, [apiLoading, hasSearched]);

  const handleHotelInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setHotelSearchData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setShowValidationHint(false);
  };

  const handleHotelSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const hasConfirmationCode = hotelSearchData.confirmationCode.trim().length > 0;
    const hasNameAndPhone =
      hotelSearchData.guestName.trim().length > 0 &&
      hotelSearchData.guestPhoneNumber.trim().length > 0;

    // Validate: either confirmation code OR (name AND phone)
    if (!hasConfirmationCode && !hasNameAndPhone) {
      setShowValidationHint(true);
      openNotificationPopUpMessage(
        "Please provide either a Confirmation Code OR both Guest Name and Phone Number"
      );
      return;
    }

    // If using name and phone, validate phone format
    if (hasNameAndPhone && !/^\d{10,20}$/.test(hotelSearchData.guestPhoneNumber)) {
      setShowValidationHint(true);
      openNotificationPopUpMessage("Phone number must be 10-20 digits");
      return;
    }

    const queryParams: Record<string, string> = {};
    if (hasConfirmationCode) {
      queryParams.confirmationCode = hotelSearchData.confirmationCode;
    }
    if (hasNameAndPhone) {
      queryParams.guestName = hotelSearchData.guestName;
      queryParams.guestPhoneNumber = hotelSearchData.guestPhoneNumber;
    }

    const queryString = new URLSearchParams(queryParams).toString();
    setHasSearched(true);
    setIsWaitingForResults(true);
    setSearchQuery(queryString);
    setShowValidationHint(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20 pb-10 font-sans">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-green-400">Booking Tracker</h1>
        <p className="text-gray-400 mb-10">Track your bookings across all services</p>

        {/* Hotel Booking Tracker */}
        <section className="mb-12">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Hotel Booking Tracker</h2>

            {isAuthenticated ? (
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
                <p className="text-gray-200 mb-4">
                  You are already logged in! To view your hotel booking details, please visit your dashboard.
                </p>
                <Link
                  href={`/dashboard#booked_hotels_section`}
                  className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                >
                  Go to Dashboard →
                </Link>
              </div>
            ) : (
              <>
                {/* RESULTS SECTION - ABOVE FORM */}
                {!hasSearched ? (
                  <div className="mb-8 bg-blue-900/20 border border-blue-700 rounded-lg p-6 text-center">
                    <p className="text-blue-300">
                      Fill in the form below to search for your hotel booking
                    </p>
                  </div>
                ) : isWaitingForResults ? (
                  <div className="mb-8 bg-gray-700/30 border border-gray-600 rounded-lg p-6 text-center">
                    <p className="text-gray-300">Searching for your booking...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="mb-8 space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Booking Details</h3>
                    {searchResults.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-gray-700/50 border border-gray-600 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm">Confirmation Code</p>
                            <p className="text-white font-semibold">{booking.confirmationCode}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Hotel</p>
                            <p className="text-white font-semibold">{booking.hotel?.name || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Check-in Date</p>
                            <p className="text-white font-semibold">
                              {new Date(booking.checkInDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Check-out Date</p>
                            <p className="text-white font-semibold">
                              {new Date(booking.checkOutDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Total Price</p>
                            <p className="text-yellow-400 font-semibold">৳ {booking.totalPrice}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Status</p>
                            <p
                              className={`font-semibold ${
                                booking.status === "CONFIRMED"
                                  ? "text-green-400"
                                  : booking.status === "CANCELLED"
                                  ? "text-red-400"
                                  : "text-yellow-400"
                              }`}
                            >
                              {booking.status}
                            </p>
                          </div>
                        </div>
                        
                        {/* Payment Method Selection - Only shown when status is PENDING */}
                        {booking.status === "PENDING" && (
                          <div className="mt-4 pt-4 border-t border-gray-600">
                            {/* Payment Cost Display */}
                            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
                              <p className="text-gray-400 text-sm mb-2">Payment Amount:</p>
                              {(selectedPaymentMethod[booking.id] || "wallet") === "wallet" ? (
                                  <p className="text-green-400 font-semibold text-lg">
                                    {(booking.totalPrice * 0.8).toFixed(2)} Credits
                                  </p>
                              ) : (
                                <p className="text-green-400 font-semibold text-lg">
                                  ৳ {booking.totalPrice.toLocaleString()}
                                </p>
                              )}
                            </div>

                            <p className="text-gray-300 text-sm font-semibold mb-3">Select Payment Method:</p>
                            <div className="flex gap-4 mb-4 w-fit">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`payment-method-${booking.id}`}
                                  value="wallet"
                                  checked={(selectedPaymentMethod[booking.id] || "wallet") === "wallet"}
                                  onChange={() =>
                                    setSelectedPaymentMethod((prev) => ({
                                      ...prev,
                                      [booking.id]: "wallet",
                                    }))
                                  }
                                  className="w-4 h-4"
                                />
                                <span className="text-gray-300">Wallet</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`payment-method-${booking.id}`}
                                  value="card"
                                  checked={(selectedPaymentMethod[booking.id] || "wallet") === "card"}
                                  onChange={() =>
                                    setSelectedPaymentMethod((prev) => ({
                                      ...prev,
                                      [booking.id]: "card",
                                    }))
                                  }
                                  className="w-4 h-4"
                                />
                                <span className="text-gray-300">Card</span>
                              </label>
                            </div>

                            <button
                              onClick={() => {
                                const method = selectedPaymentMethod[booking.id] || "wallet";
                                openNotificationPopUpMessage(
                                  `Redirecting to payment via ${method === "wallet" ? "Wallet" : "Card"}...`
                                );
                                // TODO: Implement payment redirect logic based on method
                              }}
                              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition-colors"
                            >
                              Pay Now
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-8 bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
                    <p className="text-red-300">
                      No booking found matching your details. Please check your information and try again.
                    </p>
                  </div>
                )}

                {/* SEARCH FORM */}
                <form
                  onSubmit={handleHotelSearch}
                  autoComplete="on"
                  className="space-y-4 border-t border-gray-700 pt-6"
                >
                  <CustomTextInput
                    type="text"
                    name="confirmationCode"
                    label="Confirmation Code"
                    placeholderText="Enter your booking confirmation code"
                    value={hotelSearchData.confirmationCode}
                    onChange={handleHotelInputChange}
                    className="w-full"
                    labelStyle="text-gray-300"
                  />

                  <div className="text-center text-gray-400 font-semibold">OR</div>

                  <div className="w-full">
                    <input
                      type="text"
                      name="guestName"
                      autoComplete="name"
                      placeholder="Full Name"
                      value={hotelSearchData.guestName}
                      onChange={(e) => {
                        setHotelSearchData((prev) => ({
                          ...prev,
                          guestName: e.target.value,
                        }));
                        setShowValidationHint(false);
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded placeholder-gray-400 focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div className="w-full">
                    <input
                      type="tel"
                      name="guestPhoneNumber"
                      autoComplete="tel-national"
                      inputMode="numeric"
                      placeholder="Phone Number"
                      value={hotelSearchData.guestPhoneNumber}
                      onChange={(e) => {
                        setHotelSearchData((prev) => ({
                          ...prev,
                          guestPhoneNumber: e.target.value,
                        }));
                        setShowValidationHint(false);
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded placeholder-gray-400 focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isWaitingForResults}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    {isWaitingForResults ? "Searching..." : "Search Booking"}
                  </button>

                  {/* How to search - Only shown when validation fails */}
                  {showValidationHint && (
                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mt-4">
                      <p className="text-yellow-300 font-semibold mb-2">How to search:</p>
                      <ul className="text-yellow-200 text-sm space-y-1">
                        <li>
                          • <span className="font-semibold">Option 1:</span> Enter your{" "}
                          <strong>Confirmation Code</strong> only
                        </li>
                        <li>
                          • <span className="font-semibold">Option 2:</span> Enter both{" "}
                          <strong>Guest Name</strong> AND <strong>Phone Number</strong>
                        </li>
                      </ul>
                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </section>

        {/* Transport Booking Tracker - Under Development */}
        <section className="mb-12">
          <FeatureUnderDevelopment moduleName="Transport Booking Tracker"/>
        </section>

        {/* Activity Booking Tracker - Under Development */}
        <section className="mb-12">
          <FeatureUnderDevelopment moduleName="Activity Booking Tracker"/>
        </section>
      </div>
    </div>
  );
}
