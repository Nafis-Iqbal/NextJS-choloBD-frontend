import React from "react";
import { useState } from "react";

import { CategoryType } from "@/types/enums";
import { CategoryApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import TableLayout from "../layout-elements/TableLayout";
import CategoryUpdateModal from "../modals/CategoryUpdateModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { CategoryViewListTableRow } from "../data-elements/DataTableRowElements";
import { NoContentTableRow } from "../placeholder-components/NoContentTableRow";
import { HorizontalDivider } from "../custom-elements/UIUtilities";

const CategoryManagerModule = () => {
    const {showLoadingContent, openNotificationPopUpMessage} = useGlobalUI();
    // Navigation handled by parent or route links; avoid forcing router here

    const [mode, setMode] = useState<"create" | "edit">("create");
    const [showCategoryType, setShowCategoryType] = useState<string>("");
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [categoryDeleteConfirmationVisible, setCategoryDeleteConfirmationVisible] = useState<boolean>(false);

    const {data: categoryData, isLoading, isError, refetch} = CategoryApi.useGetAllCategoriesRQ("type=" + showCategoryType);
    const categories = categoryData?.data || [];

    const {mutate: deleteCategoryMutate} = CategoryApi.useDeleteCategoryRQ(
        (responseData) => {
            if(responseData.status === "success")
            {               
                queryClient.invalidateQueries({queryKey: ["categories"]});

                finishWithMessage("Category deleted successfully.");
            }
            else finishWithMessage("Failed to delete category. Try again.");
        },
        () => {
            openNotificationPopUpMessage("Failed to delete category. Try again.");
        }
    );

    const onNewCategoryCreate = () => {
        setMode("create");
        setIsCategoryModalOpen(true);
    }

    const onCategoryUpdate = (categoryId: string) => {
        setMode("edit");
        setSelectedCategoryId(categoryId);
        setIsCategoryModalOpen(true);
    }

    const onCategoryDelete = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        setCategoryDeleteConfirmationVisible(true);
    }

    const onCategoryDeleteConfirm = () => {
        deleteCategoryMutate(selectedCategoryId);
    }

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    }

    return (
        <div className="flex flex-col space-y-2 mt-4">
            <CategoryUpdateModal
                isVisible={isCategoryModalOpen}
                mode = {mode}
                category_id={selectedCategoryId}
                onCancel={() => setIsCategoryModalOpen(false)}
            />

            <ConfirmationModal
                isVisible={categoryDeleteConfirmationVisible}
                onConfirm={() => onCategoryDeleteConfirm()}
                onCancel={() => setCategoryDeleteConfirmationVisible(false)}
                message="Are you sure you want to delete this category? This action cannot be undone."
            />
            
            <h4 className="">Category Manager</h4>

            <TableLayout className="mt-5 md:mr-5 mb-5 md:mb-10">
                <div className="overflow-x-auto w-full">
                    <div className="min-w-[900px]">
                        <div className="flex border-1 border-green-800 p-2 bg-gray-600 text-center">
                            <p className="w-[5%]">Sr. No.</p>
                            <p className="w-[20%]">Category Name</p>
                            <p className="w-[10%]">Type</p>
                            <p className="w-[15%]">Slug</p>
                            <p className="w-[10%]">Active</p>
                            <p className="w-[20%]">Category ID</p>
                            <p className="w-[20%]">Actions</p>
                        </div>
                        <div className="flex flex-col border-1 border-green-800">
                            {
                                isLoading ? (<NoContentTableRow displayMessage="Loading Data" tdColSpan={1}/>) :
                                isError ? (<NoContentTableRow displayMessage="An error occurred" tdColSpan={1}/>) :
                                (categories && Array.isArray(categories) && categories.length <= 0) ? 
                                (<NoContentTableRow displayMessage="No categories found" tdColSpan={1}/>) :
                                
                                (categories ?? []).map((category, index) => {
                                    return (
                                        <CategoryViewListTableRow 
                                            key={category.id} 
                                            id={index + 1} 
                                            categoryName={category.name || ''} 
                                            category_id={category.id} 
                                            categoryType={category.type || ''}
                                            slug={category.slug || ''}
                                            isActive={Boolean(category.isActive)}
                                            onEdit={() => onCategoryUpdate(category.id)}
                                            onDelete={() => onCategoryDelete(category.id)}
                                        />
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            </TableLayout>
            
            <div className="flex flex-col space-y-4">
                <div className="flex space-x-2 items-center">
                    <p className="text-lg">Show categories: </p>
                    
                    <select
                        className="bg-gray-700 text-white p-1 rounded"
                        value={showCategoryType}
                        onChange={(e) => setShowCategoryType(e.target.value)}
                    >
                        <option value="">All</option>
                        {Object.values(CategoryType).map((ct) => (
                            <option key={ct} value={ct}>{ct}</option>
                        ))}
                    </select>
                </div>

                <button className="green-button w-fit" onClick={() => onNewCategoryCreate()}>Add new category</button>
            </div>

            <HorizontalDivider className="mr-5 my-10"/>
        </div>
    );
}

export default CategoryManagerModule;