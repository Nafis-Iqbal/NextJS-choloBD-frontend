"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WalletApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { createWalletRechargeOptionSchema } from "../../validators/walletValidators";
import { CustomTextInput } from "../custom-elements/CustomInputElements";

type WalletRechargeOptionFormMode = "create" | "edit";

interface WalletRechargeOptionFormProps {
    mode: WalletRechargeOptionFormMode;
    rechargeOption_id?: string;
}

export const WalletRechargeOptionForm: React.FC<WalletRechargeOptionFormProps> = ({
    mode,
    rechargeOption_id
}) => {
    const router = useRouter();
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const {data: rechargeOptionData } = WalletApi.useGetWalletRechargeOptionByIdRQ(rechargeOption_id || "");
    const [walletRechargeOptionFormData, setWalletRechargeOptionFormData] = useState<Partial<WalletRechargeOption>>({});
    
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    // React Query Hooks
    const { mutate: createRechargeOptionMutate } = WalletApi.useCreateWalletRechargeOptionRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Recharge option created successfully.");
                queryClient.invalidateQueries({ queryKey: ["walletRechargeOptions"] });
                router.back();
            } else {
                finishWithMessage("Failed to create recharge option. Try again.");
            }
        },
        () => {
            finishWithMessage("Failed to create recharge option. Try again.");
        }
    );

    const { mutate: updateRechargeOptionMutate } = WalletApi.useUpdateWalletRechargeOptionRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Recharge option updated successfully.");
                queryClient.invalidateQueries({ queryKey: ["walletRechargeOptions"] });
                router.back();
            } else {
                finishWithMessage("Failed to update recharge option. Try again.");
            }
        },
        () => {
            finishWithMessage("Failed to update recharge option. Try again.");
        }
    );

    useEffect(() => {
        if (rechargeOptionData && mode === "edit") {
            setWalletRechargeOptionFormData(rechargeOptionData?.data || {});
        }
    }, [rechargeOptionData, mode]);

    const onRechargeOptionFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = createWalletRechargeOptionSchema.safeParse(walletRechargeOptionFormData);

        if (result.success === true) {
            showLoadingContent(true);
            
            if (mode === "create") {
                createRechargeOptionMutate(walletRechargeOptionFormData as WalletRechargeOption);
            } else {
                updateRechargeOptionMutate({
                    walletOptionId: rechargeOption_id || "",
                    optionData: walletRechargeOptionFormData as Partial<WalletRechargeOption>
                });
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        const numericFields = new Set(["rechargeAmount", "rechargeCost", "bonusAmount"]);

        let parsedValue: string | number | undefined;

        if (numericFields.has(name)) {
            const noLeadingZeros = value.replace(/^0+(?=\d)/, '');
            parsedValue = noLeadingZeros === '' ? undefined : Number(noLeadingZeros);
        } else {
            parsedValue = value || undefined;
        }

        setWalletRechargeOptionFormData((prev) => ({
            ...prev,
            [name]: parsedValue
        }));
        
        const updatedData = { ...walletRechargeOptionFormData, [name]: parsedValue };
        
        const result = createWalletRechargeOptionSchema.safeParse(updatedData);
        if (!result.success) {
            const key = name as keyof typeof result.error.formErrors.fieldErrors;
            const fieldError = result.error.formErrors.fieldErrors[key]?.[0];

            setErrors((prev) => ({ ...prev, [name]: fieldError }));
        } else {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    };

    return (
        <form className="flex flex-col p-2 space-y-8 mt-5" onSubmit={onRechargeOptionFormSubmit}>
            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[500px]"
                placeholderText="Enter recharge option title"
                label="Title"
                labelStyle="text-green-300"
                name="title"
                value={walletRechargeOptionFormData?.title || ""}
                onChange={handleChange}
                error={errors.title}
            />

            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[500px]"
                placeholderText="Enter recharge option description"
                label="Description"
                labelStyle="text-green-300"
                name="description"
                value={walletRechargeOptionFormData?.description || ""}
                onChange={handleChange}
                error={errors.description}
            />

            <CustomTextInput
                type="number"
                className="w-full px-2 md:px-0 md:w-[250px]"
                placeholderText="Enter recharge amount"
                label="Recharge Amount (৳)"
                labelStyle="text-green-300"
                name="rechargeAmount"
                value={walletRechargeOptionFormData?.rechargeAmount || ""}
                onChange={handleChange}
                error={errors.rechargeAmount}
            />

            <CustomTextInput
                type="number"
                className="w-full px-2 md:px-0 md:w-[250px]"
                placeholderText="Enter recharge cost"
                label="Recharge Cost (৳)"
                labelStyle="text-green-300"
                name="rechargeCost"
                value={walletRechargeOptionFormData?.rechargeCost || ""}
                onChange={handleChange}
                error={errors.rechargeCost}
            />

            <CustomTextInput
                type="number"
                className="w-full px-2 md:px-0 md:w-[250px]"
                placeholderText="Enter bonus amount"
                label="Bonus Amount (৳)"
                labelStyle="text-green-300"
                name="bonusAmount"
                value={walletRechargeOptionFormData?.bonusAmount || ""}
                onChange={handleChange}
                error={errors.bonusAmount}
            />

            <button 
                type="submit" 
                className="w-fit px-10 bg-green-600 hover:bg-green-500 text-white p-2 rounded mt-3"
            >
                {mode === "create" ? "Create Recharge Option" : "Save Changes"}
            </button>
        </form>
    );
};
