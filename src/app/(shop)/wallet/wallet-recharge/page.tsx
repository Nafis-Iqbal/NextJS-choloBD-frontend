"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthApi, WalletApi } from "@/services/api";
import { GreenButton } from "@/components/custom-elements/Buttons";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities";
import { queryClient } from "@/services/apiInstance";
import { RechargeOptionDisplay } from "@/components/data-elements/RechargeOptionDisplay";

export default function WalletRechargePage() {
    const router = useRouter();
    const {openNotificationPopUpMessage, showLoadingContent} = useGlobalUI();
    const [selectedRechargeOption, setSelectedRechargeOption] = useState<WalletRechargeOption | null>(null);
    
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;

    const {data: walletRechargeOptions, isLoading: isFetchLoading} = WalletApi.useGetWalletRechargeOptionsRQ();
    const rechargeOptions = walletRechargeOptions?.data || [];

    const {mutate: createWalletRechargeTransactionMutation } = WalletApi.useCreateWalletRechargeTransactionRQ(
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
        if (selectedRechargeOption) {
            createWalletRechargeTransactionMutation({walletRechargeOptionId: selectedRechargeOption.id})
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

            {/* Recharge Options */}
            <RechargeOptionDisplay
                rechargeOptions={rechargeOptions}
                isLoading={isFetchLoading}
                selectedRechargeOption={selectedRechargeOption}
                onRechargeOptionSelect={handleRechargeOptionSelect}
            />

            {/* Payment Method Preview */}
            {selectedRechargeOption && (
                <div className="bg-gray-700 border border-green-500 rounded-lg p-6 max-w-2xl mx-auto w-full">
                    <h3 className="text-xl font-semibold text-white mb-4 text-center">Recharge Summary</h3>
                    
                    <div className="space-y-3 text-gray-300">
                        <div className="flex justify-between">
                            <span>Recharge Amount:</span>
                            <span className="text-green-400 font-semibold">৳{selectedRechargeOption.rechargeAmount.toLocaleString()}</span>
                        </div>
                        
                        {selectedRechargeOption.bonusAmount && selectedRechargeOption.bonusAmount > 0 && (
                            <div className="flex justify-between">
                                <span>Bonus:</span>
                                <span className="text-green-400 font-semibold">
                                    +৳{selectedRechargeOption.bonusAmount.toLocaleString()}
                                </span>
                            </div>
                        )}
                        
                        <HorizontalDivider className="border-gray-600 my-2" />
                        
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total Amount:</span>
                            <span className="text-green-400">
                                ৳{(
                                    selectedRechargeOption.rechargeAmount + (selectedRechargeOption.bonusAmount || 0)
                                ).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <GreenButton
                            onClick={handleProceedToPayment}
                            extraStyle="w-full py-4 text-xl font-semibold rounded-lg border-2 border-green-400 hover:shadow-[0_0_15px_#00FF99] transition-all duration-300"
                        >
                            💳 Proceed to Payment
                        </GreenButton>
                    </div>
                </div>
            )}
        </div>
    );
}