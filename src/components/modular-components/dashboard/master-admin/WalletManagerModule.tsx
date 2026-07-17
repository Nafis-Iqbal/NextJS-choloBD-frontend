import { useState } from "react"

import walletRechargeOptions from "@/lib/walletRechargeOptions.json"
import TableLayout from "../../../layout-elements/TableLayout"
import FilterSectionLayout from "../../../layout-elements/FilterSectionLayout"
import { CustomTextInput} from "../../../custom-elements/CustomInputElements"
import { NoContentTableRow } from "../../../placeholder-components/NoContentTableRow"

export const WalletManagerModule = () => {
    const [rechargeOptionModal, setRechargeOptionModal] = useState<{isOpen: boolean, rechargeOptionId: string, mode: 'create' | 'edit'}>({
        isOpen: false, 
        rechargeOptionId: '',
        mode: 'create'
    });

    const walletRechargeOptionsData = walletRechargeOptions;

    const toggleRechargeOptionModal = (isOpen: boolean, rechargeOptionId: string, mode: 'create' | 'edit') => {
        setRechargeOptionModal({isOpen, rechargeOptionId, mode});
    }

    return (
        <section className="flex flex-col space-y-2 mt-4" id="wallet_management">
            {/* Wallet Recharge Options Section */}
            <div className="flex space-x-5 mb-2 items-center">
                <h4 className="theme-text">Wallet Recharge Options</h4>
                <p className="theme-text-subtle">(Show only. Content loaded from config file)</p>
            </div>

            <TableLayout className="mr-5">
                <div className="overflow-x-auto w-full">
                    <div className="min-w-[900px]">
                        <div className="flex theme-outline p-2 text-center" style={{backgroundColor: 'var(--theme-card-bg)'}}>
                            <p className="w-[5%]">Sr.</p>
                            <p className="w-[25%]">Title</p>
                            <p className="w-[30%]">Description</p>
                            <p className="w-[15%]">Amount (৳)</p>
                            <p className="w-[15%]">Cost (৳)</p>
                            <p className="w-[10%]">Bonus (৳)</p>
                        </div>
                        <div className="flex flex-col theme-outline">
                            {
                                (!walletRechargeOptionsData || walletRechargeOptionsData.length === 0) ? (<NoContentTableRow displayMessage="No recharge options found" tdColSpan={1}/>) :
                                (Array.isArray(walletRechargeOptionsData) &&
                                    walletRechargeOptionsData.map((option, index) => (
                                        <RechargeOptionListTableRow 
                                            key={option.id} 
                                            id={index + 1}
                                            optionId={option.id}
                                            title={option.title}
                                            description={option.description}
                                            rechargeAmount={option.rechargeAmount}
                                            rechargeCost={option.rechargeCost}
                                            bonusAmount={option.bonusAmount}
                                            navigateOnClick={() => console.log(`Navigate to recharge option ${option.id}`)}
                                            onEditClick={() => toggleRechargeOptionModal(true, option.id, 'edit')}
                                        />
                                    ))
                                )
                            }
                        </div>
                    </div>
                </div>
            </TableLayout>

            <FilterSectionLayout className="mr-5" onSubmit={(e) => e.preventDefault()} >
                <div className="flex justify-left space-x-6">
                    <div className="flex flex-col space-y-1">
                        <CustomTextInput
                            label="Option Title"  
                            placeholderText="Enter option title"
                            disabled
                        />
                    </div>

                    <div className="flex flex-col space-y-1">
                        <CustomTextInput
                            label="Amount Range"  
                            placeholderText="Min - Max amount"
                            disabled
                        />
                    </div>
                </div>
            </FilterSectionLayout>

            <button 
                className="mr-5 mt-2 p-2 w-fit theme-btn-teal text-sm md:text-base rounded-sm"
                onClick={() => toggleRechargeOptionModal(true, rechargeOptionModal.rechargeOptionId, 'create')}
            >
                Add New Recharge Option
            </button>
        </section>
    )
}

const RechargeOptionListTableRow = ({
    id, optionId, title, description, rechargeAmount, rechargeCost, bonusAmount, navigateOnClick, onEditClick
} : {
    id: number, 
    optionId: string, 
    title: string, 
    description: string, 
    rechargeAmount: number, 
    rechargeCost: number, 
    bonusAmount: number, 
    navigateOnClick: () => void,
    onEditClick: () => void
}) => {
    const truncatedDescription = description.length > 50 ? description.substring(0, 50) + '...' : description;
    
    return (
        <div className="flex p-2 w-full theme-outline hover:bg-gray-100 text-center" onClick={() => navigateOnClick()}>
            <p className="w-[5%]">{id}</p>
            <p className="w-[25%] hover:cursor-pointer px-2">{title}</p>
            <p className="w-[30%] px-2" title={description}>{truncatedDescription}</p>
            <p className="w-[15%]">৳{rechargeAmount.toLocaleString()}</p>
            <p className="w-[15%]">৳{rechargeCost.toLocaleString()}</p>
            <p className="w-[10%]">৳{bonusAmount.toLocaleString()}</p>
        </div>
    )
}
