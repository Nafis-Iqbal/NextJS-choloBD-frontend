"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import BasicButton from "../custom-elements/Buttons";
import { CategoryApi } from "@/services/api";
import LoadingSpinnerBlock from "../placeholder-components/LoadingSpinnerBlock";

const maxCategoriesPerProduct = 4;

export const CategorySelectionModule = ({
  className,
  labelName,
  labelStyle,
  editMode,
  availableCategories,
  selectedCategories,
  setSelectedCategories
} : {
  className: string, 
  labelName: string,
  labelStyle?: string,
  editMode: 'create' | 'edit',
  availableCategories?: string,
  selectedCategories: Category[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}) => {
    const {data: categoriesDataList} = CategoryApi.useGetAllCategoriesRQ("type=" + availableCategories);
    const categoriesData = categoriesDataList?.data;

    const [isCategoryDataSyncing, setIsCategoryDataSyncing] = useState(false);

    const categoriesToDeleteRef = useRef<string[]>([]);

    // FUNCTION CALLS
    const addCategory = (category: Category | undefined) => {
      console.log("Adding category:", selectedCategories);
      if (category && selectedCategories.length < maxCategoriesPerProduct) {
        if (!selectedCategories.some((c) => c.id === category.id)) {
          setSelectedCategories((prev) => [...prev, category]);
          
          if(editMode === 'edit'){
            setIsCategoryDataSyncing(true);
          }
        }
      }
    };

    const removeCategory = (categoryId: string) => {
      setSelectedCategories(selectedCategories.filter((c) => c.id !== categoryId));
      categoriesToDeleteRef.current = [...categoriesToDeleteRef.current, categoryId];
      
      if(editMode === 'edit'){
        setIsCategoryDataSyncing(true);
      }
    };

  return (
    <div className={`flex flex-col space-y-2 mb-4 ${className}`}>
      {/* Product Categories Header */}
      <label className={`w-fit ${labelStyle}`}>
        {labelName}
      </label>

      {/* Selected Categories */}
      <div className={`h-[100px] gap-2 contain-content rounded-sm bg-gray-400 ${selectedCategories?.length > 0 && ("border-green-700 border-2")}`}>
        {selectedCategories?.length > 0 &&
          selectedCategories.map((category) => (
            <div
              className="relative inline-block w-fit items-center p-1 mx-1 mt-1 text-sm md:text-base text-white rounded-md"
              key={category.id}
            >
              <div className="flex">
                {category.name}
                <div className="min-w-10"></div>
                <button className="absolute flex right-0 top-0 h-[25px] w-[25px] items-center justify-center text-center bg-red-500 hover:bg-red-400" type="button" onClick={() => removeCategory(category.id)}>×</button>
              </div>
            </div>
          ))}
      </div>

      <div className="flex flex-row h-[100px] justify-between">
        {/* Button Selection Mode */}
        <div className="h-[100px] w-full contain-content gap-2 rounded-sm bg-gray-600 border-green-900 border">
          {categoriesData && categoriesData?.length > 0 &&
            categoriesData.map((category) => (
              <BasicButton
                key={category.id}
                buttonColor="bg-green-500 hover:bg-green-400"
                buttonTextColor="text-white"
                extraStyle="mb-1 mt-1 mr-1 text-sm md:text-base p-1 md:p-2"
                onClick={() => addCategory(category)}
              >
                {category.name}
              </BasicButton>
            ))}
        </div>
        
        <div className="flex flex-col items-center">
          <LoadingSpinnerBlock className="h-[50px]" isOpen={isCategoryDataSyncing} />
        </div>
      </div>
    </div>
  );
};
