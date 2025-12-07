"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthApi } from "@/services/api";
import { GreenButton, BlackButton } from "@/components/custom-elements/Buttons";
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities";
import { WalletTransactionType, TransactionStatus } from "@/types/enums";

interface MockTransaction {
    id: string;
    transactionType: WalletTransactionType;
    amount: number;
    description: string;
    balanceBefore: number;
    balanceAfter: number;
    status: TransactionStatus;
    createdAt: Date;
}

export default function WalletDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const walletId = params.wallet_id as string;
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    
    // Mock wallet data - replace with actual API call
    const mockWallet = {
        id: walletId,
        balance: 15750,
        currency: "BDT",
        walletStatus: "ACTIVE",
        lastActivityAt: new Date()
    };

    // Mock transaction history - replace with actual API call
    const mockTransactions: MockTransaction[] = [
        {
            id: "txn_001",
            transactionType: WalletTransactionType.CREDIT,
            amount: 5000,
            description: "Wallet Recharge",
            balanceBefore: 10750,
            balanceAfter: 15750,
            status: TransactionStatus.COMPLETED,
            createdAt: new Date(2025, 11, 3)
        },
        {
            id: "txn_002",
            transactionType: WalletTransactionType.DEBIT,
            amount: 2300,
            description: "Tour Package Payment - Cox's Bazar",
            balanceBefore: 13050,
            balanceAfter: 10750,
            status: TransactionStatus.COMPLETED,
            createdAt: new Date(2025, 11, 1)
        },
        {
            id: "txn_003",
            transactionType: WalletTransactionType.CREDIT,
            amount: 10000,
            description: "Wallet Recharge",
            balanceBefore: 3050,
            balanceAfter: 13050,
            status: TransactionStatus.COMPLETED,
            createdAt: new Date(2025, 10, 28)
        },
        {
            id: "txn_004",
            transactionType: WalletTransactionType.DEBIT,
            amount: 1500,
            description: "Hotel Booking - Dhaka",
            balanceBefore: 4550,
            balanceAfter: 3050,
            status: TransactionStatus.COMPLETED,
            createdAt: new Date(2025, 10, 25)
        },
        {
            id: "txn_005",
            transactionType: WalletTransactionType.CASHBACK,
            amount: 250,
            description: "Referral Bonus",
            balanceBefore: 4300,
            balanceAfter: 4550,
            status: TransactionStatus.COMPLETED,
            createdAt: new Date(2025, 10, 22)
        }
    ];

    const handleBackClick = () => {
        router.push("/wallet");
    };

    const handleRechargeClick = () => {
        router.push("/wallet/wallet-recharge");
    };

    const getTransactionIcon = (type: WalletTransactionType) => {
        switch (type) {
            case WalletTransactionType.CREDIT:
                return "💰";
            case WalletTransactionType.DEBIT:
                return "💸";
            case WalletTransactionType.CASHBACK:
                return "🎁";
            case WalletTransactionType.REFUND:
                return "↩️";
            default:
                return "💳";
        }
    };

    const getTransactionColor = (type: WalletTransactionType) => {
        switch (type) {
            case WalletTransactionType.CREDIT:
            case WalletTransactionType.CASHBACK:
            case WalletTransactionType.REFUND:
                return "text-green-400";
            case WalletTransactionType.DEBIT:
            case WalletTransactionType.PENALTY:
                return "text-red-400";
            default:
                return "text-yellow-400";
        }
    };

    return (
        <div className="flex flex-col p-6 space-y-6 w-full font-sans bg-gray-800 min-h-screen">
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-4">
                    <BlackButton
                        onClick={handleBackClick}
                        extraStyle="px-4 py-2 rounded-lg border border-gray-600 hover:border-green-500"
                    >
                        ← Back
                    </BlackButton>
                    <div>
                        <h1 className="text-4xl md:text-6xl text-white">Wallet Details</h1>
                        <p className="text-green-200 text-lg md:text-xl">Transaction history and balance</p>
                    </div>
                </div>
            </div>

            <HorizontalDivider className="border-green-500" />

            {/* Current Balance - Large Display */}
            <div className="bg-gray-700 border-2 border-green-500 rounded-lg p-12 shadow-[0_0_20px_#00FF99] mx-auto w-full max-w-4xl">
                <div className="text-center space-y-6">
                    <h2 className="text-3xl md:text-4xl text-white font-semibold">Current Balance</h2>
                    <div className="text-8xl md:text-9xl font-bold text-green-400 tracking-wider">
                        ৳{mockWallet.balance.toLocaleString()}
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8 text-gray-300">
                        <p className="text-lg">Wallet ID: <span className="text-green-400 font-mono">{walletId}</span></p>
                        <p className="text-lg">Status: <span className="text-green-400">{mockWallet.walletStatus}</span></p>
                    </div>
                    
                    <GreenButton
                        onClick={handleRechargeClick}
                        extraStyle="px-8 py-4 text-xl font-semibold rounded-lg border-2 border-green-400 hover:shadow-[0_0_15px_#00FF99] transition-all duration-300"
                    >
                        💳 Recharge Now
                    </GreenButton>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-gray-700 border border-green-500 rounded-lg p-6 shadow-[0_0_10px_#00FF99]">
                <h3 className="text-2xl md:text-3xl text-white font-semibold mb-6 text-center">Transaction History</h3>
                
                <div className="space-y-4">
                    {mockTransactions.map((transaction) => (
                        <div key={transaction.id} className="bg-gray-800 border border-gray-600 hover:border-green-500 rounded-lg p-4 transition-all duration-300">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                                <div className="flex items-center space-x-4">
                                    <span className="text-2xl">{getTransactionIcon(transaction.transactionType)}</span>
                                    <div>
                                        <h4 className="text-lg font-semibold text-white">{transaction.description}</h4>
                                        <p className="text-sm text-gray-400">
                                            {transaction.createdAt.toLocaleDateString()} • 
                                            <span className="uppercase tracking-wide">{transaction.transactionType.replace("_", " ")}</span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col md:items-end space-y-1">
                                    <p className={`text-xl font-bold ${getTransactionColor(transaction.transactionType)}`}>
                                        {transaction.transactionType === WalletTransactionType.DEBIT ? "-" : "+"}৳{transaction.amount.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        Balance: ৳{transaction.balanceAfter.toLocaleString()}
                                    </p>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        transaction.status === TransactionStatus.COMPLETED 
                                            ? "bg-green-600 text-green-200" 
                                            : "bg-yellow-600 text-yellow-200"
                                    }`}>
                                        {transaction.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More Button */}
                <div className="text-center mt-6">
                    <BlackButton
                        onClick={() => {}}
                        extraStyle="px-6 py-3 rounded-lg border border-gray-600 hover:border-green-500"
                    >
                        Load More Transactions
                    </BlackButton>
                </div>
            </div>
        </div>
    );
}