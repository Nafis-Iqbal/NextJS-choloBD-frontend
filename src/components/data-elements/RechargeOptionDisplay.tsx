"use client";

import { GreenButton } from "@/components/custom-elements/Buttons";

interface RechargeOptionDisplayProps {
    rechargeOptions: WalletRechargeOption[];
    isLoading: boolean;
    selectedRechargeOption: WalletRechargeOption | null;
    onRechargeOptionSelect: (option: WalletRechargeOption) => void;
}

export const RechargeOptionDisplay: React.FC<RechargeOptionDisplayProps> = ({
    rechargeOptions,
    isLoading,
    selectedRechargeOption,
    onRechargeOptionSelect
}) => {
    return (
        <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-2xl md:text-3xl text-white font-semibold text-center mb-8">Choose Recharge Amount</h2>
            
            {isLoading ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rechargeOptions.map((option) => (
                        <div
                            key={option.id}
                            onClick={() => onRechargeOptionSelect(option)}
                            className={`
                                relative cursor-pointer bg-gray-700 border-2 rounded-xl p-8 transition-all duration-300 hover:shadow-[0_0_20px_#00FF99]
                                ${selectedRechargeOption?.id === option.id 
                                    ? 'border-green-400 shadow-[0_0_20px_#00FF99] bg-gray-600' 
                                    : 'border-gray-600 hover:border-green-500'
                                }
                            `}
                        >
                            <div className="text-center space-y-4">
                                <div className="text-5xl md:text-6xl font-bold text-green-400">
                                    {option.title}
                                </div>
                                
                                {option.bonusAmount && option.bonusAmount > 0 && (
                                    <div className="bg-green-600 text-white px-4 py-2 rounded-lg inline-block">
                                        <span className="text-sm font-semibold">+ ৳{option.bonusAmount} Bonus!</span>
                                    </div>
                                )}
                                
                                <p className="text-gray-300 text-lg">
                                    {option.bonusAmount && option.bonusAmount > 0 
                                        ? `Total: ৳${(option.rechargeAmount + option.bonusAmount).toLocaleString()}`
                                        : `Amount: ৳${option.rechargeAmount.toLocaleString()}`
                                    }
                                </p>
                                
                                <div className={`
                                    w-full py-3 px-6 rounded-lg border-2 font-semibold text-lg transition-all duration-300
                                    ${selectedRechargeOption?.id === option.id 
                                        ? 'bg-green-500 border-green-400 text-white' 
                                        : 'bg-transparent border-green-500 text-green-400 hover:bg-green-500 hover:text-white'
                                    }
                                `}>
                                    {selectedRechargeOption?.id === option.id ? '✓ Selected' : 'Select This Amount'}
                                </div>
                            </div>
                        </div>
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
    );
};