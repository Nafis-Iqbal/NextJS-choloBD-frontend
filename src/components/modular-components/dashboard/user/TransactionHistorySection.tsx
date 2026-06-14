"use client";

import React, { useState, useMemo } from "react";
import { PaginationControls } from "./PaginationControls";
import { WalletApi } from "@/services/api";

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

// Transaction History with Pagination
export const TransactionHistorySection: React.FC<{
  transactions?: Transaction[];
  className?: string;
  itemsPerPage?: number;
}> = ({ transactions: propTransactions, itemsPerPage = 10, className }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch wallet data if no transactions provided
  const { data: walletResponse, isLoading } = WalletApi.useGetMyWalletRQ();
  const wallet = walletResponse?.data;
  console.log(walletResponse, "Wallet Response in TransactionHistorySection");

  // Transform wallet transactions to Transaction format
  const transactions = useMemo(() => {
    if (propTransactions && propTransactions.length > 0) {
      return propTransactions;
    }

    if (!wallet?.transactions || wallet.transactions.length === 0) {
      return [];
    }

    return wallet.transactions.map((wt: WalletTransaction) => ({
      id: wt.id,
      type: wt.transactionType.replace(/_/g, " "),
      amount: wt.amount,
      date: new Date(wt.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      description: wt.description || `${wt.transactionType.replace(/_/g, " ")} Transaction`,
      status: wt.status === "COMPLETED" ? "completed" : wt.status === "PENDING" ? "pending" : "failed",
    }));
  }, [propTransactions, wallet?.transactions]);

  if (isLoading) {
    return (
      <section className={`mb-8 ${className || ''}`}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Transaction History</h2>
        <div 
          className="rounded-xl p-6 text-center"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            border: '1px solid var(--theme-deep-green)',
            color: 'var(--theme-text-subtle)',
          }}
        >
          Loading transactions...
        </div>
      </section>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <section className={`mb-8 ${className || ''}`}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Transaction History</h2>
        <div 
          className="rounded-xl p-6 text-center"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            border: '1px solid var(--theme-deep-green)',
            color: 'var(--theme-text-subtle)',
          }}
        >
          No transactions found
        </div>
      </section>
    );
  }

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = transactions.slice(startIdx, startIdx + itemsPerPage);

  return (
    <section className={`mb-8 ${className || ''}`}>
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Transaction History</h2>
      <div 
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-deep-green)',
        }}
      >
        <div className="overflow-x-auto overflow-y-auto max-h-screen md:max-h-[70vh]">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--theme-section-bg)', borderBottomColor: 'var(--theme-deep-green)' }} className="border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold" style={{ color: 'var(--theme-text)' }}>Date</th>
                <th className="px-6 py-3 text-left font-semibold" style={{ color: 'var(--theme-text)' }}>Type</th>
                <th className="px-6 py-3 text-left font-semibold" style={{ color: 'var(--theme-text)' }}>Description</th>
                <th className="px-6 py-3 text-left font-semibold" style={{ color: 'var(--theme-text)' }}>Amount</th>
                <th className="px-6 py-3 text-left font-semibold" style={{ color: 'var(--theme-text)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b transition-colors"
                  style={{ 
                    borderBottomColor: 'var(--theme-deep-green)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-section-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td className="px-6 py-3 text-sm" style={{ color: 'var(--theme-text-muted)' }}>{transaction.date}</td>
                  <td className="px-6 py-3 font-medium" style={{ color: 'var(--theme-text)' }}>{transaction.type}</td>
                  <td className="px-6 py-3 text-sm" style={{ color: 'var(--theme-text-subtle)' }}>{transaction.description}</td>
                  <td className="px-6 py-3 font-semibold" style={{ color: 'var(--theme-text)' }}>
                    ৳ {transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: 
                          transaction.status === "completed"
                            ? 'rgba(34, 197, 94, 0.2)'
                            : transaction.status === "pending"
                            ? 'rgba(234, 179, 8, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        color:
                          transaction.status === "completed"
                            ? '#22C55E'
                            : transaction.status === "pending"
                            ? '#EAB308'
                            : '#EF4444',
                      }}
                    >
                      {transaction.status === "completed"
                        ? "✓ Completed"
                        : transaction.status === "pending"
                        ? "⏳ Pending"
                        : "✗ Failed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className={className}
        />
      </div>
    </section>
  );
};
