"use client";

import React, { useState, useMemo } from "react";
import { PaginationControls } from "./PaginationControls";
import { WalletApi } from "@/services/api";
import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WalletTransaction = any;

export type Transaction = {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  status: "completed" | "pending" | "failed";
};

function getStatusStyles(status: Transaction["status"]) {
  if (status === "completed") {
    return {
      backgroundColor: "rgba(34, 197, 94, 0.2)",
      color: "#22C55E",
      label: "✓ Completed",
    };
  }
  if (status === "pending") {
    return {
      backgroundColor: "rgba(234, 179, 8, 0.2)",
      color: "#EAB308",
      label: "⏳ Pending",
    };
  }
  return {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    color: "#EF4444",
    label: "✗ Failed",
  };
}

const emptyStateClass =
  "rounded-sm p-4 text-center theme-text-subtle";

const scrollContainerClass =
  "rounded-sm md:rounded-md overflow-y-auto max-h-[80vh] min-h-[40vh] px-0 py-2 md:p-2 border-0 md:border";

const cardClass =
  "rounded-sm md:rounded p-2 md:p-3 transition-colors overflow-hidden border-0 md:border";

// Transaction History with Pagination
export const TransactionHistorySection: React.FC<{
  transactions?: Transaction[];
  className?: string;
  itemsPerPage?: number;
  showFakeData?: boolean;
}> = ({
  transactions: propTransactions,
  itemsPerPage = 10,
  className,
  showFakeData = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: walletResponse, isLoading } = WalletApi.useGetMyWalletRQ();
  const wallet = walletResponse?.data;

  const transactions = useMemo(() => {
    if (propTransactions && propTransactions.length > 0) {
      return propTransactions;
    }

    if (!wallet?.transactions || wallet.transactions.length === 0) {
      return [];
    }

    return wallet.transactions.map((wt: WalletTransaction): Transaction => ({
      id: wt.id,
      type: wt.transactionType.replace(/_/g, " "),
      amount: wt.amount,
      date: new Date(wt.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      description:
        wt.description || `${wt.transactionType.replace(/_/g, " ")} Transaction`,
      status:
        wt.status === "COMPLETED"
          ? "completed"
          : wt.status === "PENDING"
            ? "pending"
            : "failed",
    }));
  }, [propTransactions, wallet?.transactions]);

  const header = (
    <div
      className="mb-3 md:mb-4 pb-2 md:pb-3 border-b-0 md:border-b"
      style={{ borderColor: "var(--theme-deep-green)" }}
    >
      <h2 className="text-xl sm:text-2xl font-bold theme-text-teal">
        Transaction History
      </h2>
    </div>
  );

  if (isLoading) {
    return (
      <section className={`mb-0 ${className || ""}`}>
        {header}
        <div className={emptyStateClass}>Loading transactions...</div>
      </section>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <section className={`mb-0 ${className || ""}`}>
        {header}
        {showFakeData && (
          <PlaceholderFeatureWarning moduleName="Transaction History Details" />
        )}
        <div className={emptyStateClass}>No transactions found</div>
      </section>
    );
  }

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = transactions.slice(startIdx, startIdx + itemsPerPage);

  return (
    <section className={`mb-0 ${className || ""}`}>
      {header}
      {showFakeData && (
        <PlaceholderFeatureWarning moduleName="Transaction History Details" />
      )}

      <div
        className={scrollContainerClass}
        style={{
          backgroundColor: "var(--theme-card-bg)",
          borderColor: "var(--theme-deep-green)",
        }}
      >
        <div className="space-y-2 px-0 md:hidden">
          {paginatedData.map((transaction) => {
            const statusStyles = getStatusStyles(transaction.status);
            return (
              <div
                key={transaction.id}
                className={cardClass}
                style={{
                  backgroundColor: "var(--theme-bg)",
                  borderColor: "var(--theme-deep-green)",
                }}
              >
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium break-words theme-text">
                      {transaction.type}
                    </p>
                    <p className="text-sm mt-1 theme-text-muted">
                      {transaction.date}
                    </p>
                    <p className="text-xs mt-1 break-words theme-text-subtle">
                      {transaction.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-sm theme-text">
                      ৳ {transaction.amount.toLocaleString()}
                    </p>
                    <span
                      className="shrink-0 px-3 py-1 rounded-sm text-xs font-medium"
                      style={{
                        backgroundColor: statusStyles.backgroundColor,
                        color: statusStyles.color,
                      }}
                    >
                      {statusStyles.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead
              style={{
                backgroundColor: "var(--theme-section-bg)",
                borderBottomColor: "var(--theme-deep-green)",
              }}
              className="border-b sticky top-0"
            >
              <tr>
                {["Date", "Type", "Description", "Amount", "Status"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-2 text-left font-semibold text-sm theme-text"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((transaction) => {
                const statusStyles = getStatusStyles(transaction.status);
                return (
                  <tr
                    key={transaction.id}
                    className="border-b transition-colors"
                    style={{
                      borderBottomColor: "var(--theme-deep-green)",
                      backgroundColor: "var(--theme-bg)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--theme-section-bg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--theme-bg)")
                    }
                  >
                    <td className="px-4 py-2 text-sm theme-text-muted">
                      {transaction.date}
                    </td>
                    <td className="px-4 py-2 font-medium theme-text">
                      {transaction.type}
                    </td>
                    <td className="px-4 py-2 text-sm theme-text-subtle">
                      {transaction.description}
                    </td>
                    <td className="px-4 py-2 font-semibold theme-text">
                      ৳ {transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className="px-3 py-1 rounded-sm text-xs font-medium"
                        style={{
                          backgroundColor: statusStyles.backgroundColor,
                          color: statusStyles.color,
                        }}
                      >
                        {statusStyles.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className={className}
      />
    </section>
  );
};
