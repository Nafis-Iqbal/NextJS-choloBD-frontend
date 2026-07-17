"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  BookingStatus,
  ComplaintAddressedTo,
  ComplaintTargetType,
  PaymentStatus,
} from "@/types/enums";

/** Statuses where the guest did not (meaningfully) use the service. */
const INELIGIBLE_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.ACCEPTED,
  BookingStatus.DECLINED,
  BookingStatus.CANCELLED,
  BookingStatus.REFUNDED,
  BookingStatus.NO_SHOW,
];

/**
 * True when check-in / service-start calendar day is today or earlier
 * (guest has at least started the booking).
 */
export function hasBookingServiceStarted(
  startDate: Date | string | null | undefined
): boolean {
  if (!startDate) return false;

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return false;

  const today = new Date();
  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  ).getTime();
  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  return startDay <= todayDay;
}

/** Paid + not cancelled/declined/pending/etc. */
export function isEligibleForReviewOrComplaint(
  status: BookingStatus | string | null | undefined,
  paymentStatus: PaymentStatus | string | null | undefined
): boolean {
  if (!status || !paymentStatus) return false;
  if (paymentStatus !== PaymentStatus.PAID) return false;
  if (INELIGIBLE_BOOKING_STATUSES.includes(status as BookingStatus)) {
    return false;
  }
  return (
    status === BookingStatus.CONFIRMED || status === BookingStatus.COMPLETED
  );
}

export function buildComplaintSubmitHref(
  targetType: ComplaintTargetType,
  serviceEntityId: string
): string {
  const params = new URLSearchParams({
    addressedTo: ComplaintAddressedTo.SERVICE_ADMIN,
    serviceEntityType: targetType,
    serviceEntityId,
  });
  return `/complaint/submit?${params.toString()}`;
}

export function buildPlatformComplaintSubmitHref(): string {
  const params = new URLSearchParams({
    addressedTo: ComplaintAddressedTo.MASTER_ADMIN,
  });
  return `/complaint/submit?${params.toString()}`;
}

interface BookingPostStayActionsProps {
  /** Service has started (check-in / booking date is today or past). */
  hasServiceStarted: boolean;
  /** Paid and status implies a real stay (CONFIRMED / COMPLETED). */
  isEligibleBooking?: boolean;
  reviewHref?: string | null;
  complaintHref?: string | null;
}

export const BookingPostStayActions: React.FC<BookingPostStayActionsProps> = ({
  hasServiceStarted,
  isEligibleBooking = true,
  reviewHref = null,
  complaintHref = null,
}) => {
  const router = useRouter();

  const canAct = hasServiceStarted && isEligibleBooking;
  const canReview = canAct && !!reviewHref;
  const canComplaint = canAct && !!complaintHref;

  const buttonBase =
    "w-full sm:w-auto px-3 py-1.5 md:py-1 text-xs rounded-sm font-medium transition-colors";

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:justify-end">
      <button
        type="button"
        disabled={!canReview}
        onClick={() => {
          if (!canReview || !reviewHref) return;
          router.push(reviewHref);
        }}
        className={buttonBase}
        style={{
          backgroundColor: "var(--theme-card-bg)",
          borderWidth: "1px",
          borderColor: "var(--theme-teal)",
          color: "var(--theme-teal)",
          opacity: canReview ? 1 : 0.45,
          cursor: canReview ? "pointer" : "not-allowed",
        }}
      >
        Review
      </button>

      <button
        type="button"
        disabled={!canComplaint}
        onClick={() => {
          if (!canComplaint || !complaintHref) return;
          router.push(complaintHref);
        }}
        className={buttonBase}
        style={{
          backgroundColor: "var(--theme-red, #dc2626)",
          color: "#ffffff",
          opacity: canComplaint ? 1 : 0.45,
          cursor: canComplaint ? "pointer" : "not-allowed",
        }}
      >
        Submit a Complaint
      </button>
    </div>
  );
};
