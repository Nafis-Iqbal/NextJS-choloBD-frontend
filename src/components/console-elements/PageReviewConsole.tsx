"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewApi, AuthApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { ReviewType } from "@/types/enums";

import { CustomTextAreaInput, CustomTextInput } from "../custom-elements/CustomInputElements";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import RatingInputModal from "../modals/RatingInputModal";

export const PageReviewConsole = ({
    pageAssetId, 
    pageAssetName,
    pageAssetType,
    reviewUserIds,
} : {
    pageAssetId: string, 
    pageAssetName: string,
    pageAssetType: ReviewType,
    reviewUserIds: string[]
}) => {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const sessionUserId = authResponse?.data?.userId;
    const userSubmittedReview = reviewUserIds.some(userId => userId === sessionUserId);

    const router = useRouter();

    const [reviewTitle, setReviewTitle] = useState<string>("");
    const [reviewDescription, setReviewDescription] = useState<string>("");
    const [reviewRating, setReviewRating] = useState<number>(0);

    const [isRatingModalOpen, setIsRatingModalOpen] = useState<boolean>(false);

    const {openNotificationPopUpMessage} = useGlobalUI();

    const {mutate: createPageReviewMutate} = ReviewApi.useCreatePageReviewRQ(
        (responseData) => {
            if(responseData.status === "success")
            {               
                queryClient.invalidateQueries({queryKey: ["reviews", pageAssetType, pageAssetId]});
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target as HTMLInputElement & HTMLTextAreaElement;
        if (name === "title") {
            setReviewTitle(value);
        } else if (name === "description") {
            setReviewDescription(value);
        }
    }

    const onReviewSubmitClicked = () => {
        if(!isAuthenticated)
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

    return (
        <div className="flex flex-col justify-between space-y-5 mt-5 w-full md:w-[65%]">
            <div className="flex items-end space-x-3">
                <h4>Write a review</h4>

                {userSubmittedReview && <p className="text-green-300 text-xs mb-1">You've already submitted a review</p>}
            </div>

            <RatingInputModal
                isVisible={isRatingModalOpen}
                message={`Please rate your experience for ${pageAssetName}`}
                onConfirm={() => {
                    createPageReviewMutate({
                        reviewType: pageAssetType,
                        reviewAssetId: pageAssetId,
                        title: reviewTitle || "My overall experience",
                        description: reviewDescription, 
                        rating: reviewRating
                    });

                    setIsRatingModalOpen(false);
                }}
                onCancel={onRatingCancelled}
                setRating={setReviewRating}
            />

            <pre className="">for    <span className="text-lg text-green-500">{pageAssetName}</span></pre>

            <CustomTextInput 
                name="title"
                placeholderText="Give a title to your review?(optional, but helps others to find it)"
                onChange={handleInputChange}
                value={reviewTitle}
            />

            <CustomTextAreaInput 
                name="description"
                className="min-h-[100px] md:min-h-[150px]" 
                placeholderText="Have something in mind?"
                onChange={handleInputChange}
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