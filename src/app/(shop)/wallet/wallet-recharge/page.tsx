"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthApi, WalletApi } from "@/services/api";
import { GreenButton } from "@/components/custom-elements/Buttons";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities";
import { queryClient } from "@/services/apiInstance";
import { RechargeOptionCard } from "@/components/data-elements/RechargeOptionCard";

export default function WalletRechargePage() {
    const router = useRouter();
    const {openNotificationPopUpMessage, showLoadingContent} = useGlobalUI();
    const [selectedRechargeOption, setSelectedRechargeOption] = useState<WalletRechargeOption | null>(null);
    
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId || "";

    const {data: walletRechargeOptions, isLoading: isFetchLoading} = WalletApi.useGetWalletRechargeOptionsRQ();
    const rechargeOptions = (walletRechargeOptions?.data || []).sort((a, b) => Number(a.rechargeAmount) - Number(b.rechargeAmount));

    const {mutate: createWalletRechargePaymentMutation } = WalletApi.useCreateWalletRechargePaymentAndTransactionRQ(
        (responseData) => {
            if(responseData.status === "success")
            {
                showLoadingContent(false);
                
                window.location.assign(responseData.data.paymentGatewayURL);
            }
            else {
                openNotificationPopUpMessage("Failed to create wallet recharge transaction. Please try again.");
                showLoadingContent(false);
            }
        },
        () => {
            openNotificationPopUpMessage("Failed to create wallet recharge transaction. Please try again.");
            showLoadingContent(false);
        }
    );

    const handleRechargeOptionSelect = (option: WalletRechargeOption) => {
        setSelectedRechargeOption(option);
    };

    const handleProceedToPayment = () => {
        if(currentUserId === "") {
            openNotificationPopUpMessage("User authentication required. Please log in to proceed.");
            return;
        }
        if (selectedRechargeOption) {
            createWalletRechargePaymentMutation({
                walletRechargeOptionId: selectedRechargeOption.id,
                userId: currentUserId,
            })
        }
    };

    return (
        <div className="flex flex-col p-6 space-y-6 w-full font-sans bg-gray-800 min-h-screen">
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <h1 className="text-4xl md:text-6xl text-white">Recharge Wallet</h1>
                <p className="text-green-200 text-lg md:text-xl">Select an amount to add to your wallet</p> 
            </div>

            <HorizontalDivider className="border-green-500" />

            <div className="max-w-4xl mx-auto w-full">
                <h2 className="text-2xl md:text-3xl text-white font-semibold text-center mb-8">Choose Recharge Amount</h2>
                
                {isFetchLoading ? (
                    <div className="text-center text-gray-400 text-lg py-12">
                        <p>⏳ Loading recharge options...</p>
                    </div>
                ) : rechargeOptions.length === 0 ? (
                    <div className="bg-gray-700 border-2 border-yellow-500 rounded-xl p-8 text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h3 className="text-2xl font-semibold text-yellow-400 mb-4">No Recharge Options Available</h3>
                        <p className="text-gray-300 text-lg mb-6">
                            We're currently updating our recharge options. Please try again later or contact support if this issue persists.
                        </p>
                        
                        <GreenButton
                            onClick={() => window.location.reload()}
                            extraStyle="px-6 py-3 rounded-lg border border-green-500 hover:border-green-400"
                        >
                            🔄 Refresh Page
                        </GreenButton>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row space-y-4 md:space-x-4 md:space-y-0 justify-center">
                        {rechargeOptions.map((option) => (
                            <RechargeOptionCard
                                key={option.id}
                                rechargeOption={option}
                                isLoading={isFetchLoading}
                                selectedRechargeOption={selectedRechargeOption}
                                onRechargeOptionSelect={handleRechargeOptionSelect}
                            />  
                        ))}
                    </div>
                )}
                
                {/* Helper text when no option selected */}
                {!selectedRechargeOption && rechargeOptions.length > 0 && (
                    <div className="text-center text-gray-400 text-lg mt-8">
                        <p>👆 Select a recharge amount above to continue</p>
                    </div>
                )}
            </div>

            {/* Recharge Summary Card */}
            {selectedRechargeOption && (
                <div className="bg-linear-to-br from-gray-750 to-gray-800 border border-green-600 rounded-xl p-8 max-w-2xl mx-auto w-full shadow-2xl shadow-green-900/20">
                    {/* Header */}
                    <h3 className="text-2xl font-bold text-white mb-1 text-center">Recharge Summary</h3>
                    <p className="text-green-300 text-sm text-center mb-6">Review your recharge details</p>
                    
                    {/* Summary Items */}
                    <div className="space-y-4 mb-6">
                        {/* Recharge Amount */}
                        <div className="bg-gray-800/60 border border-green-700/40 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300 font-medium">Recharge Amount</span>
                                <span className="text-green-300 font-bold text-lg">৳{selectedRechargeOption.rechargeAmount.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        {/* Bonus Amount */}
                        {selectedRechargeOption.bonusAmount && selectedRechargeOption.bonusAmount > 0 && (
                            <div className="bg-gray-800/60 border border-green-700/40 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300 font-medium">🎁 Bonus Credits</span>
                                    <span className="text-green-300 font-bold text-lg">+{selectedRechargeOption.bonusAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Total */}
                    <div className="bg-linear-to-r from-green-700/30 to-teal-700/30 border-2 border-green-500 rounded-lg p-5 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-white font-semibold text-lg">Total Amount</span>
                            <div className="text-right">
                                <span className="text-green-200 font-bold text-2xl block">৳{(
                                    selectedRechargeOption.rechargeAmount + (selectedRechargeOption.bonusAmount || 0)
                                ).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Button */}
                    <div className="mt-8">
                        <GreenButton
                            onClick={handleProceedToPayment}
                            extraStyle="w-full py-4 text-lg font-semibold rounded-lg border-2 border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300"
                        >
                            💳 Proceed to Payment
                        </GreenButton>
                    </div>
                </div>
            )}
        </div>
    );
}