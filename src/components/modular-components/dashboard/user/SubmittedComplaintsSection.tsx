"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ComplaintApi } from "@/services/api";
import {
  ComplaintAddressedTo,
  ComplaintStatus,
  ComplaintTargetType,
} from "@/types/enums";
import { PaginationControls } from "./PaginationControls";

const PAGE_SIZE = 10;

const listContainerClass =
  "rounded-sm md:rounded-md overflow-y-auto max-h-[80vh] min-h-[40vh] px-0 py-2 md:p-2 border-0 md:border";

function formatEnumValue(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadgeStyle(status: ComplaintStatus): React.CSSProperties {
  switch (status) {
    case ComplaintStatus.OPEN:
      return {
        backgroundColor: "var(--theme-teal)",
        color: "#ffffff",
      };
    case ComplaintStatus.UNSOLVED:
      return {
        backgroundColor: "var(--theme-red, #DC2626)",
        color: "#ffffff",
      };
    case ComplaintStatus.CLOSED:
      return {
        backgroundColor: "var(--theme-deep-green)",
        color: "#ffffff",
      };
    default:
      return {
        backgroundColor: "var(--theme-card-bg)",
        color: "var(--theme-text)",
      };
  }
}

function getTargetLabel(complaint: Complaint): string {
  if (complaint.addressedTo === ComplaintAddressedTo.MASTER_ADMIN) {
    if (complaint.targetEntityName) {
      return `Platform · ${complaint.targetEntityName}`;
    }
    return "CholoBD Support";
  }

  if (complaint.targetEntityName) {
    return complaint.targetEntityName;
  }

  if (complaint.targetType) {
    return formatEnumValue(complaint.targetType);
  }

  return "Service";
}

function getTargetTypeLabel(targetType?: ComplaintTargetType | null): string | null {
  if (!targetType) return null;
  return formatEnumValue(targetType);
}

export const SubmittedComplaintsSection: React.FC<{
  className?: string;
}> = ({ className }) => {
  const [page, setPage] = useState(1);

  const { data: complaintsResponse, isLoading, isError } =
    ComplaintApi.useGetMyComplaintsRQ({
      page,
      limit: PAGE_SIZE,
    });

  const complaints = complaintsResponse?.data?.results ?? [];
  const total = complaintsResponse?.data?.total ?? 0;
  const limit = complaintsResponse?.data?.limit ?? PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section
      className={`mt-8 ${className || ""}`}
      id="submitted_complaints_section"
    >
      <div
        className="mb-3 md:mb-4 pb-2 md:pb-3 border-b-0 md:border-b"
        style={{ borderColor: "var(--theme-deep-green)" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold theme-text-teal">
          Submitted Complaints
        </h2>
        <p className="theme-text-muted text-sm mt-1">
          Complaints you have filed
        </p>
      </div>

      <div
        className={listContainerClass}
        style={{
          backgroundColor: "var(--theme-card-bg)",
          borderColor: "var(--theme-deep-green)",
        }}
      >
        {isLoading ? (
          <div className="rounded-sm p-4 text-center theme-text-subtle">
            Loading complaints…
          </div>
        ) : isError ? (
          <div className="rounded-sm p-4 text-center theme-text-subtle">
            Couldn&apos;t load your complaints. Try again later.
          </div>
        ) : complaints.length === 0 ? (
          <div className="rounded-sm p-4 text-center theme-text-subtle">
            No complaints submitted yet
          </div>
        ) : (
          <div className="space-y-2">
            {complaints.map((complaint) => {
              const targetTypeLabel = getTargetTypeLabel(complaint.targetType);

              return (
                <Link
                  key={complaint.id}
                  href={`/complaint/${complaint.id}`}
                  className="block w-full shrink-0 rounded-sm md:rounded-md p-4 md:p-5 border-0 md:border transition-opacity hover:opacity-95"
                  style={{
                    backgroundColor: "var(--theme-bg)",
                    borderColor: "var(--theme-deep-green)",
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h3 className="text-base md:text-lg font-semibold theme-text break-words min-w-0 flex-1">
                      {complaint.title}
                    </h3>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold shrink-0"
                      style={statusBadgeStyle(complaint.status)}
                    >
                      {formatEnumValue(complaint.status)}
                    </span>
                  </div>

                  <p className="text-sm theme-text-muted line-clamp-2 mb-3">
                    {complaint.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 items-center text-xs">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-sm"
                      style={{
                        backgroundColor: "var(--theme-section-bg)",
                        color: "var(--theme-text-muted)",
                      }}
                    >
                      <span className="theme-text-subtle mr-1">To:</span>
                      <span className="theme-text">{getTargetLabel(complaint)}</span>
                    </span>
                    {targetTypeLabel && (
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-sm theme-text"
                        style={{
                          backgroundColor: "var(--theme-section-bg)",
                        }}
                      >
                        {targetTypeLabel}
                      </span>
                    )}
                    <span className="theme-text-subtle ml-auto">
                      Submitted {formatDate(complaint.createdAt)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </section>
  );
};
