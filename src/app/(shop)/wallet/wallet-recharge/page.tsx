"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthApi, WalletApi } from "@/services/api";
import walletRechargeOptions from "@/lib/walletRechargeOptions.json";
import { GreenButton } from "@/components/custom-elements/Buttons";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities";
import { RechargeOptionCard } from "@/components/data-elements/RechargeOptionCard";

export default function WalletRechargePage() {
    const router = useRouter();
    const {openNotificationPopUpMessage, showLoadingContent} = useGlobalUI();
    const [selectedRechargeOption, setSelectedRechargeOption] = useState<WalletRechargeOption | null>(null);
    
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId || "";

    const rechargeOptions = walletRechargeOptions.sort((a, b) => Number(a.rechargeAmount) - Number(b.rechargeAmount)).filter((option) => option.enabled);

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
        <div className="flex flex-col p-6 space-y-6 w-full font-sans min-h-screen" style={{ backgroundColor: 'var(--theme-bg)' }}>
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <h1 className="text-4xl md:text-6xl theme-text">Recharge Wallet</h1>
                <p className="theme-text-teal text-lg md:text-xl">Select an amount to add to your wallet</p> 
            </div>

            <HorizontalDivider className="theme-outline-teal" />

            <div className="max-w-4xl mx-auto w-full">
                <h2 className="text-2xl md:text-3xl theme-text font-semibold text-center mb-8">Choose Recharge Amount</h2>
                
                {rechargeOptions.length === 0 ? (
                    <div className="theme-card theme-outline rounded-xl p-8 text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h3 className="text-2xl font-semibold theme-text-teal mb-4">No Recharge Options Available</h3>
                        <p className="theme-text-muted text-lg mb-6">
                            We're currently updating our recharge options. Please try again later or contact support if this issue persists.
                        </p>
                        
                        <GreenButton
                            onClick={() => window.location.reload()}
                            extraStyle="px-6 py-3 rounded-lg theme-outline-teal"
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
                                selectedRechargeOption={selectedRechargeOption}
                                onRechargeOptionSelect={handleRechargeOptionSelect}
                            />  
                        ))}
                    </div>
                )}
                
                {/* Helper text when no option selected */}
                {!selectedRechargeOption && rechargeOptions.length > 0 && (
                    <div className="text-center theme-text-muted text-lg mt-8">
                        <p>👆 Select a recharge amount above to continue</p>
                    </div>
                )}
            </div>

            {/* Recharge Summary Card */}
            {selectedRechargeOption && (
                <div
                    className="theme-card theme-outline rounded-xl p-8 max-w-2xl mx-auto w-full shadow-2xl"
                    style={{ boxShadow: '0 25px 50px -12px color-mix(in srgb, var(--theme-teal) 20%, transparent)' }}
                >
                    {/* Header */}
                    <h3 className="text-2xl font-bold theme-text mb-1 text-center">Recharge Summary</h3>
                    <p className="theme-text-teal text-sm text-center mb-6">Review your recharge details</p>
                    
                    {/* Summary Items */}
                    <div className="space-y-4 mb-6">
                        {/* Recharge Amount */}
                        <div className="theme-section theme-outline rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="theme-text font-medium">Recharge Amount</span>
                                <span className="theme-text-teal font-bold text-lg">৳{selectedRechargeOption.rechargeAmount.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        {/* Bonus Amount */}
                        {selectedRechargeOption.bonusAmount && selectedRechargeOption.bonusAmount > 0 && (
                            <div className="theme-section theme-outline rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="theme-text font-medium">🎁 Bonus Credits</span>
                                    <span className="theme-text-teal font-bold text-lg">+{selectedRechargeOption.bonusAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Total */}
                    <div className="theme-section theme-outline-teal rounded-lg p-5 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="theme-text font-semibold text-lg">Total Amount</span>
                            <div className="text-right">
                                <span className="theme-text-teal font-bold text-2xl block">৳{(
                                    selectedRechargeOption.rechargeAmount + (selectedRechargeOption.bonusAmount || 0)
                                ).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Button */}
                    <div className="mt-8">
                        <GreenButton
                            onClick={handleProceedToPayment}
                            extraStyle="w-full py-4 text-lg font-semibold rounded-lg theme-outline-teal transition-all duration-300 hover:shadow-lg"
                        >
                            💳 Proceed to Payment
                        </GreenButton>
                    </div>
                </div>
            )}
        </div>
    );
}