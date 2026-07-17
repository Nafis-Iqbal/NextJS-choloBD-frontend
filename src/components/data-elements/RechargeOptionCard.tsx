"use client";

interface RechargeOptionCardProps {
    rechargeOption: WalletRechargeOption;
    selectedRechargeOption: WalletRechargeOption | null;
    onRechargeOptionSelect: (option: WalletRechargeOption) => void;
}

export const RechargeOptionCard: React.FC<RechargeOptionCardProps> = ({
    rechargeOption,
    selectedRechargeOption,
    onRechargeOptionSelect
}) => {
    const isSelected = selectedRechargeOption?.id === rechargeOption.id;

    return (
        <div
            key={rechargeOption.id}
            onClick={() => onRechargeOptionSelect(rechargeOption)}
            className={`
                relative w-full md:w-[35%] cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105
                ${isSelected
                    ? 'theme-card theme-outline-teal border-2 shadow-2xl'
                    : 'theme-section theme-outline border-2 hover:shadow-lg'
                }
            `}
            style={isSelected ? { boxShadow: '0 25px 50px -12px color-mix(in srgb, var(--theme-teal) 30%, transparent)' } : undefined}
        >
            <div className="p-8 relative z-10 flex flex-col justify-between h-full">
                {/* Title & Description */}
                <div className="mb-10 text-center">
                    <h3 className="theme-text-teal font-extrabold text-2xl mb-2">{rechargeOption.title}</h3>
                    <p className="theme-text leading-relaxed">{rechargeOption.description}</p>
                </div>
                
                {/* Amount Display - Credits */}
                <div className="text-center space-y-2 mb-6">
                    <div className="text-4xl md:text-5xl font-extrabold theme-text-teal">
                        {rechargeOption.rechargeAmount.toLocaleString()}
                    </div>
                    <p className="theme-text-subtle text-sm font-semibold">Credits</p>
                </div>
                
                {/* Cost in Taka */}
                <div className="theme-card theme-outline rounded-lg p-4 mb-6 text-center">
                    <p className="theme-text-subtle text-xs mb-3">Cost</p>
                    <p className="text-3xl md:text-4xl font-extrabold theme-text-teal">
                        ৳{rechargeOption.rechargeCost.toLocaleString()}
                    </p>
                </div>
                
                {/* Bonus Badge */}
                {rechargeOption.bonusAmount && rechargeOption.bonusAmount > 0 && (
                    <div className="theme-badge rounded-xl p-3 mb-6 text-center">
                        <span className="font-bold text-sm">🎁 +{rechargeOption.bonusAmount.toLocaleString()} Bonus Credits</span>
                        <p className="theme-text-subtle text-xs mt-1">Extra on this recharge!</p>
                    </div>
                )}
                
                {/* Select Button */}
                <button
                    type="button"
                    className={`
                    w-full py-3 px-6 rounded-lg border-2 font-semibold text-sm transition-all duration-300 uppercase tracking-wide
                    ${isSelected
                        ? 'theme-btn-teal theme-outline-teal'
                        : 'bg-transparent theme-outline-teal theme-text-teal'
                    }
                `}
                >
                    {isSelected ? '✓ Selected' : 'Select Amount'}
                </button>
            </div>
        </div>
    );
};
