"use client";

import { GreenButton } from "@/components/custom-elements/Buttons";

interface RechargeOptionCardProps {
    rechargeOption: WalletRechargeOption;
    isLoading: boolean;
    selectedRechargeOption: WalletRechargeOption | null;
    onRechargeOptionSelect: (option: WalletRechargeOption) => void;
}

export const RechargeOptionCard: React.FC<RechargeOptionCardProps> = ({
    rechargeOption,
    isLoading,
    selectedRechargeOption,
    onRechargeOptionSelect
}) => {
    return (
        <div
            key={rechargeOption.id}
            onClick={() => onRechargeOptionSelect(rechargeOption)}
            className={`
                relative w-full md:w-[35%] cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105
                ${selectedRechargeOption?.id === rechargeOption.id 
                    ? 'bg-linear-to-br from-green-600/40 to-teal-700/40 border-2 border-green-400 shadow-2xl shadow-green-500/30' 
                    : 'bg-linear-to-br from-gray-700/60 to-gray-800 border-2 border-gray-600 hover:border-green-500 hover:shadow-lg hover:shadow-green-900/20'
                }
            `}
        >
            {/* Gradient overlay for selected state */}
            {selectedRechargeOption?.id === rechargeOption.id && (
                <div className="absolute inset-0 bg-linear-to-t from-green-600/10 to-transparent pointer-events-none" />
            )}
            
            <div className="p-8 relative z-10 flex flex-col justify-between h-full">
                {/* Title & Description */}
                <div className="mb-10 text-center">
                    <h3 className="text-green-200 font-extrabold text-2xl mb-2">{rechargeOption.title}</h3>
                    <p className="text-gray-200 leading-relaxed">{rechargeOption.description}</p>
                </div>
                
                {/* Amount Display - Credits */}
                <div className="text-center space-y-2 mb-6">
                    <div className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-green-300 to-teal-300">
                        {rechargeOption.rechargeAmount.toLocaleString()}
                    </div>
                    <p className="text-gray-400 text-sm font-semibold">Credits</p>
                </div>
                
                {/* Cost in Taka */}
                <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700 text-center">
                    <p className="text-gray-400 text-xs mb-3">Cost</p>
                    <p className="text-3xl md:text-4xl font-extrabold text-green-200">
                        ৳{rechargeOption.rechargeCost.toLocaleString()}
                    </p>
                </div>
                
                {/* Bonus Badge */}
                {rechargeOption.bonusAmount && rechargeOption.bonusAmount > 0 && (
                    <div className="bg-linear-to-r from-amber-500/30 to-amber-600/30 border border-amber-400/60 rounded-xl p-3 mb-6 text-center">
                        <span className="text-amber-200 font-bold text-sm">🎁 +{rechargeOption.bonusAmount.toLocaleString()} Bonus Credits</span>
                        <p className="text-amber-300/70 text-xs mt-1">Extra on this recharge!</p>
                    </div>
                )}
                
                {/* Select Button */}
                <button className={`
                    w-full py-3 px-6 rounded-lg border-2 font-semibold text-sm transition-all duration-300 uppercase tracking-wide
                    ${selectedRechargeOption?.id === rechargeOption.id 
                        ? 'bg-linear-to-r from-green-500 to-teal-500 border-green-400 text-white shadow-lg shadow-green-500/50' 
                        : 'bg-transparent border-green-500 text-green-300 hover:bg-green-500/20 hover:border-green-400'
                    }
                `}>
                    {selectedRechargeOption?.id === rechargeOption.id ? '✓ Selected' : 'Select Amount'}
                </button>
            </div>
        </div>
    );
};