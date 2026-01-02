"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { CategoryApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { CategoryType } from "@/types/enums";
import { CategoryValidators } from "@/validators";
import { CustomTextInput, CustomSelectInput } from "../custom-elements/CustomInputElements";
import { produceValidationErrorMessage, stripNulls } from "@/utilities/utilities";
import { Cat } from "lucide-react";

type CategoryFormMode = "create" | "edit";

interface CategoryFormProps {
    mode: CategoryFormMode;
    category_id?: string;
    onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
    mode,
    category_id,
    onCancel
}) => {
    const router = useRouter();
    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const {data: categoryData } = CategoryApi.useGetCategoryByIdRQ(category_id || "");
    const [categoryFormData, setCategoryFormData] = useState<Partial<Category>>({type: CategoryType.AMENITY});
    
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    // React Query Hooks
    const {mutate: createCategoryMutate} = CategoryApi.useCreateCategoryRQ(
        (responseData) => {
            if(responseData.status === "success")
            {               
                queryClient.invalidateQueries({queryKey: ["categories"]});

                finishWithMessage("Category created successfully.");

                onCancel();
            }
            else finishWithMessage("Failed to create category. Try again.");
        },
        () => {
            openNotificationPopUpMessage("Failed to create category. Try again.");
        }
    );

    const {mutate: updateCategoryMutate} = CategoryApi.useUpdateCategoryRQ(
        (responseData) => {
            if(responseData.status === "success")
            {               
                queryClient.invalidateQueries({queryKey: ["categories"]});

                finishWithMessage("Category updated successfully.");

                onCancel();
            }
            else finishWithMessage("Failed to update category. Try again.");
        },
        () => {
            openNotificationPopUpMessage("Failed to update category. Try again.");
        }
    );

    useEffect(() => {
        if (categoryData && mode === "edit") {
            setCategoryFormData(categoryData?.data || {});
        }
    }, [categoryData, mode]);

    const onCategoryFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if(mode === "create")
        {
            const result = CategoryValidators.createCategorySchema.safeParse(categoryFormData);

            if (result.success === true) {
                showLoadingContent(true);
                createCategoryMutate(result.data as Category);
            }
            else{
                const errorMessage = produceValidationErrorMessage(result);
                finishWithMessage(`Validation Failed: ${errorMessage}. Try Again.`);
            }
        }else{
            if(category_id)
            {
                const result = CategoryValidators.updateCategorySchema.safeParse(categoryFormData);

                if( result.success === true) {
                    showLoadingContent(true);
                    updateCategoryMutate({
                        categoryId: category_id,
                        categoryData: result.data as Partial<Category>
                    });
                }
                else{
                    const errorMessage = produceValidationErrorMessage(result);
                    finishWithMessage(`Validation Failed: ${errorMessage}. Try Again.`);
                }
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        const booleanFields = new Set(["isActive"]);

        let parsedValue: string | boolean | undefined;

        if (booleanFields.has(name)) {
            parsedValue = (e.target as HTMLInputElement).checked;
        } else {
            parsedValue = value || undefined;
        }

        setCategoryFormData((prev) => ({
            ...prev,
            [name]: parsedValue
        }));
        
        const updatedData = { ...categoryFormData, [name]: parsedValue };
        
        const result = CategoryValidators.createCategorySchema.safeParse(updatedData);
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
        <form className="flex flex-col p-2 space-y-8 mt-5" onSubmit={onCategoryFormSubmit}>
            {/* Category Name Input */}
            <CustomTextInput
                label="Category Name"
                name="name"
                type="text"
                placeholder="Enter category name"
                value={categoryFormData.name || ""}
                onChange={handleChange}
                error={errors.name}
                required
            />

            {/* Category Type Select */}
            <CustomSelectInput
                label="Category Type"
                name="type"
                className="bg-gray-600"
                value={categoryFormData.type || CategoryType.AMENITY}
                onChange={handleChange}
                options={Object.values(CategoryType).map((type) => ({
                    value: type,
                    label: type
                }))}
                error={errors.type}
                required
            />

            {/* Category Slug Input */}
            <CustomTextInput
                label="Slug"
                name="slug"
                type="text"
                placeholder="Enter URL-friendly slug (e.g., travel-packages)"
                value={categoryFormData.slug || ""}
                onChange={handleChange}
                error={errors.slug}
                required
            />

            {/* Is Active Checkbox */}
            <div className="flex flex-col space-y-2">
                <label htmlFor="isActive" className="font-medium text-gray-200">
                    Active
                </label>

                <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={categoryFormData.isActive || false}
                    onChange={handleChange}
                    className="w-4 h-4 accent-blue-600"
                />
                {errors.isActive && <span className="text-red-600 text-sm">{errors.isActive}</span>}
            </div>

            <button 
                type="submit" 
                className="w-fit px-10 bg-green-600 hover:bg-green-500 text-white p-2 rounded mt-3"
            >
                {mode === "create" ? "Create Category" : "Save Changes"}
            </button>
        </form>
    );
};