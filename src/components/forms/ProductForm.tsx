/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ProductApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { createProductSchema } from "@/validators/productValidators";
import { CategorySelectionModule } from "@/components/modular-components/CategorySelectionModule";

import { CustomTextInput, CustomTextAreaInput } from "@/components/custom-elements/CustomInputElements";
import { ImageUploadModule } from "@/components/modular-components/ImageUploadModule";

type ProductFormMode = "create" | "edit";

interface ProductFormProps {
  mode: ProductFormMode;
  productData?: Partial<Product>;
  product_id?: string;
}

export const ProductForm = ({mode, productData = {}, product_id}: ProductFormProps) => {
    const router = useRouter();
    const {data: session} = useSession();

    const [productId, setProductId] = useState<string>(product_id ?? "");

    const [productFormData, setProductFormData] = useState<Partial<Product>>(productData);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
    const [actionTrigger, setActionTrigger] = useState<boolean>(false);

    const {showLoadingContent, openNotificationPopUpMessage} = useGlobalUI();

    //Hooks
    const {mutate: createProductMutate} = ProductApi.useCreateProductRQ(
        (responseData) => {
            if(responseData.status === "success")
            {               
                setProductId(responseData.data?.id || "");
                modifyProductCategoriesMutate({productId: responseData.data?.id, productCategories: (selectedCategories.map((cat) => cat.id)), action: "add"});
            }
            else finishWithMessage(mode === "create" ? "Failed to create product. Try again." : "Failed to save changes. Kindly try again.");
        },
        () => {
            finishWithMessage(mode === "create" ? "Failed to create product. Try again." : "Failed to save changes. Kindly try again.");
        }
    );

    const {mutate: modifyProductCategoriesMutate} = ProductApi.useModifyProductCategoriesRQ(
        async (responseData) => {
            if(responseData.status === "success") finishWithMessage("Product created successfully. Looking for images to upload...");
            else finishWithMessage("Product created. But failed to modify product categories & upload images. Try again from product edit mode");
        },
        () => {
            finishWithMessage("Product created.But failed to modify product categories & upload images. Try again from product edit mode");
        }
    );

    const {mutate: updateProductMutate} = ProductApi.useUpdateProductRQ(
        (responseData) => {
            if(responseData.status === "success")
            {
                finishWithMessage("Product created successfully. Images uploaded.");

                queryClient.invalidateQueries({ queryKey: ["products"] });
                router.replace(`/products?user_id=${session?.user.user_id}`);
            }
            else {finishWithMessage(mode === "create" ? "Product created. But failed to save images to db. Try again from product edit mode" : 
                "Failed to save changes. Please try again.");

                showLoadingContent(false);
            }
        },
        () => {
            finishWithMessage(mode === "create" ? "Product created. But failed to save images to db. Try again from product edit mode" : 
                "Failed to save changes. Please try again.");

            showLoadingContent(false);
        }
    );

    const {mutate: deleteProductImagesMutate} = ProductApi.useDeleteProductImagesRQ(
        (responseData) => {
            if(responseData.status === "success") console.log("Product images deleted successfully.");
            else console.log("Failed to delete image URLs from db. Try again.");
        },
        () => {
            console.log("Failed to delete image URLs from db. Try again.");
        }
    );

    useEffect(() => {
        if(productData && mode === "edit") setProductFormData(productData);
    }, [productData]);

    const onProductFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const result = createProductSchema.safeParse(productFormData);

        if(result.success === true){
            if(mode === "create") createProductMutate(productFormData as Product);
            else updateProductMutate(productFormData as Product);

            setActionTrigger(true);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        const numericFields = new Set(["price", "quantity"]);

        let parsedValue: string | number | undefined;

        if (numericFields.has(name)) {
            const noLeadingZeros = value.replace(/^0+(?=\d)/, '');

            parsedValue = noLeadingZeros === '' ? undefined : Number(noLeadingZeros);
        } else {
            parsedValue = value || undefined;
        }

        setProductFormData((prev) => ({
            ...prev,
            [name]: parsedValue
        }));
        
        const updatedData = { ...productFormData, [name]: parsedValue };
        
        const result = createProductSchema.safeParse(updatedData);
        if (!result.success) {
            const key = name as keyof typeof result.error.formErrors.fieldErrors;
            const fieldError = result.error.formErrors.fieldErrors[key]?.[0];

            setErrors((prev) => ({ ...prev, [name]: fieldError }));
        } else {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const productPicUploadURLBuilder = (productId: string) => {
        return `suitup_ecommerce/products/${productId}/images`;
    }

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    }
    console.log(productFormData?.images);
    return (
        <form className="flex flex-col p-2 space-y-8 mt-5" onSubmit={onProductFormSubmit}>
            <CustomTextInput
                type="text"
                className="w-full px-2 md:px-0 md:w-[500px]"
                placeholderText="Enter product title"
                label="Product Title"
                labelStyle="text-green-300"
                name="title"
                value={productFormData?.title || ""}
                onChange={handleChange}
                error={errors.title}
            />

            <CustomTextAreaInput
                className="w-full px-2 md:px-0 md:w-[500px] md:h-[150px]"
                placeholderText="Enter product description"
                label="Description"
                labelStyle="text-green-300"
                name="description"
                value={productFormData?.description || ""}
                onChange={handleChange}
                error={errors.description}
            />

            <CategorySelectionModule productId={productId} className="md:w-[500px] md:min-h-[150px]" editMode={mode}
                selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories} labelStyle="text-green-300"
            />

            <CustomTextInput
                type="number"
                className="w-full px-2 md:px-0 md:w-[250px]"
                placeholderText="Enter product price"
                label="Price"
                labelStyle="text-green-300"
                name="price"
                value={productFormData?.price || ""}
                onChange={handleChange}
                error={errors.price}
            />

            <CustomTextInput
                type="number"
                className="w-full px-2 md:px-0 md:w-[250px]"
                placeholderText="Enter initial product quantity"
                label="Initial Inventory Quantity"
                labelStyle="text-green-300"
                name="quantity"
                value={productFormData?.quantity || ""}
                onChange={handleChange}
                error={errors.quantity}
            />

            <ImageUploadModule 
                imageUploadMode={mode} 
                MAX_FILES={3}
                actionTrigger={actionTrigger} 
                resourceId={productId}
                resourceLabel={mode === "edit" ? "Edit Product Images" : "Add Product Images"}

                pic_url_Builder={productPicUploadURLBuilder} 
                updateResourceMutation={updateProductMutate}
                deleteResourceMutation={({id, imageIds} : {id: string, imageIds: string[]}) => deleteProductImagesMutate({productId: id, imageIds})}
                oldResourceImages={productFormData?.images || []}
            />

            <button type="submit" className="w-fit px-10 bg-green-600 hover:bg-green-500 text-white p-2 rounded mt-3">{mode === "create" ? "Create Product" : "Save Changes"}</button>
        </form>
    )
}