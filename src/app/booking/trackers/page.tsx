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
    <div
      className="min-h-screen pt-20 pb-10 font-sans"
      style={{
        backgroundColor: "var(--theme-bg)",
        color: "var(--theme-text)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <h1
          className="text-4xl font-bold mb-2"
          style={{ color: "var(--theme-teal)" }}
        >
          Booking Tracker
        </h1>
        <p className="mb-10" style={{ color: "var(--theme-text-muted)" }}>
          Track your bookings across all services
        </p>

        {/* Hotel Booking Tracker */}
        <section className="mb-12">
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: "var(--theme-card-bg)",
              borderColor: "var(--theme-deep-green)",
              border: "1px solid",
            }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--theme-text)" }}>
              Hotel Booking Tracker
            </h2>

            {isAuthenticated ? (
              <div
                className="rounded-lg p-6"
                style={{
                  backgroundColor: "var(--theme-section-bg)",
                  borderColor: "var(--theme-teal)",
                  border: "1px solid",
                }}
              >
                <p className="mb-4" style={{ color: "var(--theme-text)" }}>
                  You are already logged in! To view your hotel booking details, please visit your dashboard.
                </p>
                <Link
                  href={`/dashboard#booked_hotels_section`}
                  style={{
                    backgroundColor: "var(--theme-teal)",
                    color: "white",
                    borderRadius: "0.5rem",
                  }}
                  className="inline-block px-6 py-2 font-semibold transition-colors hover:opacity-80"
                >
                  Go to Dashboard →
                </Link>
              </div>
            ) : (
              <>
                {/* RESULTS SECTION - ABOVE FORM */}
                {!hasSearched ? (
                  <div
                    className="mb-8 rounded-lg p-6 text-center"
                    style={{
                      backgroundColor: "var(--theme-section-bg)",
                      borderColor: "var(--theme-teal)",
                      border: "1px solid",
                      color: "var(--theme-teal)",
                    }}
                  >
                    <p>
                      Fill in the form below to search for your hotel booking
                    </p>
                  </div>
                ) : isWaitingForResults ? (
                  <div
                    className="mb-8 rounded-lg p-6 text-center"
                    style={{
                      backgroundColor: "var(--theme-section-bg)",
                      borderColor: "var(--theme-deep-green)",
                      border: "1px solid",
                      color: "var(--theme-text-muted)",
                    }}
                  >
                    <p>Searching for your booking...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="mb-8 space-y-4">
                    <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--theme-text)" }}>
                      Booking Details
                    </h3>
                    {searchResults.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-lg p-4"
                        style={{
                          backgroundColor: "var(--theme-section-bg)",
                          borderColor: "var(--theme-deep-green)",
                          border: "1px solid",
                        }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm" style={{ color: "var(--theme-text-subtle)" }}>
                              Confirmation Code
                            </p>
                            <p className="font-semibold" style={{ color: "var(--theme-text)" }}>
                              {booking.confirmationCode}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm" style={{ color: "var(--theme-text-subtle)" }}>
                              Hotel
                            </p>
                            <p className="font-semibold" style={{ color: "var(--theme-text)" }}>
                              {booking.hotel?.name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm" style={{ color: "var(--theme-text-subtle)" }}>
                              Check-in Date
                            </p>
                            <p className="font-semibold" style={{ color: "var(--theme-text)" }}>
                              {new Date(booking.checkInDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm" style={{ color: "var(--theme-text-subtle)" }}>
                              Check-out Date
                            </p>
                            <p className="font-semibold" style={{ color: "var(--theme-text)" }}>
                              {new Date(booking.checkOutDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm" style={{ color: "var(--theme-text-subtle)" }}>
                              Total Price
                            </p>
                            <p className="font-semibold" style={{ color: "var(--theme-star)" }}>
                              ৳ {booking.totalPrice}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm" style={{ color: "var(--theme-text-subtle)" }}>
                              Status
                            </p>
                            <p
                              className="font-semibold"
                              style={{
                                color:
                                  booking.status === "CONFIRMED"
                                    ? "var(--theme-teal)"
                                    : booking.status === "CANCELLED"
                                    ? "var(--theme-red)"
                                    : "var(--theme-star)",
                              }}
                            >
                              {booking.status}
                            </p>
                          </div>
                        </div>
                        
                        {/* Payment Method Selection - Only shown when status is PENDING */}
                        {booking.status === "PENDING" && (
                          <div
                            className="mt-4 pt-4"
                            style={{
                              borderTopColor: "var(--theme-deep-green)",
                              borderTopWidth: "1px",
                            }}
                          >
                            {/* Payment Cost Display */}
                            <div
                              className="rounded-lg p-4 mb-4"
                              style={{
                                backgroundColor: "var(--theme-card-bg)",
                                borderColor: "var(--theme-deep-green)",
                                border: "1px solid",
                              }}
                            >
                              <p className="text-sm mb-2" style={{ color: "var(--theme-text-subtle)" }}>
                                Payment Amount:
                              </p>
                              {(selectedPaymentMethod[booking.id] || "wallet") === "wallet" ? (
                                  <p className="font-semibold text-lg" style={{ color: "var(--theme-teal)" }}>
                                    {(booking.totalPrice * 0.8).toFixed(2)} Credits
                                  </p>
                              ) : (
                                <p className="font-semibold text-lg" style={{ color: "var(--theme-teal)" }}>
                                  ৳ {booking.totalPrice.toLocaleString()}
                                </p>
                              )}
                            </div>

                            <p className="text-sm font-semibold mb-3" style={{ color: "var(--theme-text)" }}>
                              Select Payment Method:
                            </p>
                            <div className="flex gap-4 mb-4 w-fit">
                              <label className="flex items-center gap-2" style={{ cursor: "pointer" }}>
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
                                <span style={{ color: "var(--theme-text)" }}>Wallet</span>
                              </label>
                              <label className="flex items-center gap-2" style={{ cursor: "pointer" }}>
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
                                <span style={{ color: "var(--theme-text)" }}>Card</span>
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
                              style={{
                                backgroundColor: "var(--theme-teal)",
                                color: "white",
                              }}
                              className="w-full px-4 py-2 font-semibold rounded transition-colors hover:opacity-80"
                            >
                              Pay Now
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="mb-8 rounded-lg p-6 text-center"
                    style={{
                      backgroundColor: "var(--theme-section-bg)",
                      borderColor: "var(--theme-red)",
                      border: "1px solid",
                      color: "var(--theme-red)",
                    }}
                  >
                    <p>
                      No booking found matching your details. Please check your information and try again.
                    </p>
                  </div>
                )}

                {/* SEARCH FORM */}
                <form
                  onSubmit={handleHotelSearch}
                  autoComplete="on"
                  className="space-y-4 pt-6"
                  style={{
                    borderTopColor: "var(--theme-deep-green)",
                    borderTopWidth: "1px",
                  }}
                >
                  <CustomTextInput
                    type="text"
                    name="confirmationCode"
                    label="Confirmation Code"
                    placeholderText="Enter your booking confirmation code"
                    value={hotelSearchData.confirmationCode}
                    onChange={handleHotelInputChange}
                    className="w-full"
                  />

                  <div className="text-center font-semibold" style={{ color: "var(--theme-text-muted)" }}>
                    OR
                  </div>

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
                      style={{
                        backgroundColor: "var(--theme-input-bg)",
                        borderColor: "var(--theme-deep-green)",
                        color: "var(--theme-text)",
                      }}
                      className="w-full px-3 py-2 border rounded"
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
                      style={{
                        backgroundColor: "var(--theme-input-bg)",
                        borderColor: "var(--theme-deep-green)",
                        color: "var(--theme-text)",
                      }}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isWaitingForResults}
                    style={{
                      backgroundColor: isWaitingForResults ? "var(--theme-text-subtle)" : "var(--theme-teal)",
                      color: "white",
                    }}
                    className="w-full px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-80 disabled:cursor-not-allowed"
                  >
                    {isWaitingForResults ? "Searching..." : "Search Booking"}
                  </button>

                  {/* How to search - Only shown when validation fails */}
                  {showValidationHint && (
                    <div
                      className="rounded-lg p-4 mt-4"
                      style={{
                        backgroundColor: "var(--theme-section-bg)",
                        borderColor: "var(--theme-star)",
                        border: "1px solid",
                        color: "var(--theme-star)",
                      }}
                    >
                      <p className="font-semibold mb-2">How to search:</p>
                      <ul className="text-sm space-y-1">
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

        {/* Guide Booking Tracker - Under Development */}
        <section className="mb-12">
          <FeatureUnderDevelopment moduleName="Guide Booking Tracker"/>
        </section>
      </div>
    </div>
  );
}
