"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReviewApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";

import { CustomTextAreaInput } from "../custom-elements/CustomInputElements";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import RatingInputModal from "../modals/RatingInputModal";

export const InfoPageReviewConsole = ({
    productId, 
    productVendorId,
    productName,
    reviewUserIds,
} : {
    productId: string, 
    productVendorId: string,
    productName: string,
    reviewUserIds: string[]
}) => {
    const {data: session} = useSession();
    const router = useRouter();

    const [reviewDescription, setReviewDescription] = useState<string>("");
    const [reviewRating, setReviewRating] = useState<number>(0);

    const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);

    const {openNotificationPopUpMessage} = useGlobalUI();

    const {mutate: createProductReview} = ReviewApi.useCreateProductReviewRQ(
        (responseData) => {
            if(responseData.status === "success")
            {               
                queryClient.invalidateQueries({queryKey: ["reviews", productId]});
                setReviewDescription("");
                setReviewRating(0);

                openNotificationPopUpMessage("Review submitted successfully.");

                router.refresh();
            }
            else openNotificationPopUpMessage("Failed to create review. Try again.");
        },
        () => {
            openNotificationPopUpMessage("Failed to create review. Try again.");
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReviewDescription(e.target.value);
    }

    const onReviewSubmitClicked = () => {
        if(!session)
        {
            openNotificationPopUpMessage("You must be logged in to submit a review.");
        }
        else {
            if(reviewDescription.length < 10 || !/^[a-zA-Z]/.test(reviewDescription)) openNotificationPopUpMessage("Review description must exceed 10 letters & must start with a letter.");
            else setIsRatingModalOpen(true);
        }
    }

    const onRatingCancelled = () => {
        setIsRatingModalOpen(false)
        setReviewDescription("");
    }

    const sessionUserId = session?.user?.user_id;
    const userSubmittedReview = reviewUserIds.some(userId => userId === sessionUserId);
    const showReviewConsole = sessionUserId && sessionUserId !== productVendorId;
    
    if(!showReviewConsole) return null;

    return (
        <div className="flex flex-col justify-between space-y-5 mt-5 w-full md:w-[65%]">
            <div className="flex items-end space-x-3">
                <h4>Write a review</h4>

                {userSubmittedReview && <p className="text-green-300 text-xs mb-1">You've already submitted a review</p>}
            </div>

            <RatingInputModal
                isVisible={isRatingModalOpen}
                message={`Please rate your experience for ${productName}`}
                onConfirm={() => {
                    createProductReview({
                        productId, 
                        reviewData: {
                            description: reviewDescription, 
                            rating: reviewRating,
                            product_id: productId,
                            user_id: session?.user?.user_id || "",
                        }
                    });

                    setIsRatingModalOpen(false);
                }}
                onCancel={onRatingCancelled}
                setRating={setReviewRating}
            />

            <pre className="">for    <span className="text-lg text-green-500">{productName}</span></pre>

            <CustomTextAreaInput 
                className="min-h-[100px] md:min-h-[150px]" 
                placeholderText="Does this product make you calm? or angry?"
                onChange={handleChange}
                value={reviewDescription}
            />

            <div className="flex justify-end">
                <button 
                    className="px-8 py-2 bg-green-700 hover:bg-green-600 rounded-xs disabled:bg-gray-500 disabled:cursor-not-allowed" 
                    onClick={onReviewSubmitClicked}
                    disabled={userSubmittedReview}
                >
                        Submit
                </button>
            </div>
        </div>
    );
}