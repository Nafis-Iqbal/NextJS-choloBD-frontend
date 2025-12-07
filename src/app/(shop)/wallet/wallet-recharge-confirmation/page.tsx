"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthApi } from "@/services/api";
import { GreenButton, BlackButton } from "@/components/custom-elements/Buttons";
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities";

export default function WalletRechargeConfirmationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const amount = parseInt(searchParams.get("amount") || "0");
    
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    
    // Calculate bonus based on amount
    const getBonus = (rechargeAmount: number) => {
        if (rechargeAmount >= 20000) return 500;
        if (rechargeAmount >= 10000) return 250;
        if (rechargeAmount >= 5000) return 100;
        return 0;
    };

    const bonus = getBonus(amount);
    const finalWalletAmount = amount + bonus;

    useEffect(() => {
        if (!amount || amount <= 0) {
            router.push("/wallet/wallet-recharge");
        }
    }, [amount, router]);

    const handleBackClick = () => {
        router.push("/wallet/wallet-recharge");
    };

    const handleConfirmRecharge = () => {
        // Here you would typically call an API to process the recharge
        // For now, just redirect back to wallet
        router.push("/wallet");
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
                        <h1 className="text-4xl md:text-6xl text-white">Recharge Confirmation</h1>
                        <p className="text-green-200 text-lg md:text-xl">Confirm your wallet recharge details</p>
                    </div>
                </div>
            </div>

            <HorizontalDivider className="border-green-500" />

            <div className="max-w-2xl mx-auto w-full">
                {/* Confirmation Details */}
                <div className="bg-gray-700 border-2 border-green-500 rounded-lg p-8 shadow-[0_0_20px_#00FF99]">
                    <h2 className="text-3xl font-semibold text-white mb-6 text-center">Recharge Summary</h2>
                    
                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between text-xl">
                            <span className="text-gray-300">Recharge Amount:</span>
                            <span className="text-white font-semibold">৳{amount.toLocaleString()}</span>
                        </div>
                        
                        {bonus > 0 && (
                            <div className="flex justify-between text-xl">
                                <span className="text-gray-300">Bonus:</span>
                                <span className="text-green-400 font-semibold">+৳{bonus.toLocaleString()}</span>
                            </div>
                        )}
                        
                        <HorizontalDivider className="border-gray-600" />
                        
                        <div className="flex justify-between text-2xl font-bold">
                            <span className="text-white">Total Wallet Credit:</span>
                            <span className="text-green-400">৳{finalWalletAmount.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div className="mt-8 space-y-4">
                        <GreenButton
                            onClick={handleConfirmRecharge}
                            extraStyle="w-full py-4 text-xl font-semibold rounded-lg border-2 border-green-400 hover:shadow-[0_0_15px_#00FF99] transition-all duration-300"
                        >
                            ✅ Confirm Recharge
                        </GreenButton>
                        
                        <BlackButton
                            onClick={handleBackClick}
                            extraStyle="w-full py-3 text-lg rounded-lg border border-gray-600 hover:border-green-500"
                        >
                            Cancel
                        </BlackButton>
                    </div>
                </div>
            </div>
        </div>
    );
}