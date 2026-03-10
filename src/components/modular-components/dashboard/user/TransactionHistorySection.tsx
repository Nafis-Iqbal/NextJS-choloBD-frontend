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
        <h2 className="text-2xl font-bold text-white mb-4">Transaction History</h2>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
          Loading transactions...
        </div>
      </section>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <section className={`mb-8 ${className || ''}`}>
        <h2 className="text-2xl font-bold text-white mb-4">Transaction History</h2>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
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
      <h2 className="text-2xl font-bold text-white mb-4">Transaction History</h2>
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-screen md:max-h-[70vh]">
          <table className="w-full">
            <thead className="bg-gray-700/70 border-b border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-white font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Type</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Description</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-3 text-gray-300 text-sm">{transaction.date}</td>
                  <td className="px-6 py-3 text-white font-medium">{transaction.type}</td>
                  <td className="px-6 py-3 text-gray-400 text-sm">{transaction.description}</td>
                  <td className="px-6 py-3 text-white font-semibold">
                    ৳ {transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.status === "completed"
                          ? "bg-green-600/30 text-green-300"
                          : transaction.status === "pending"
                          ? "bg-yellow-600/30 text-yellow-300"
                          : "bg-red-600/30 text-red-300"
                      }`}
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
