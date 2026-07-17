import { ReviewApi } from "@/services/api";
import { ReviewType } from "@/types/enums";

import { PageReviewConsole } from "../console-elements/PageReviewConsole";
import RatingStats from "../custom-elements/RatingStats";
import { HorizontalDivider } from "../custom-elements/UIUtilities";
import { PageReviewList } from "../data-list-modules/PageReviewList";

interface Props {
    pageAssetType: ReviewType;
    assetId: string;
    assetName: string;
}

export const ReviewModule = async ({pageAssetType, assetId, assetName} : Props) => {
    let reviewsData;
    try {
        reviewsData = await ReviewApi.getPageReviews({reviewType: pageAssetType, reviewAssetId: assetId});
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        // Return early with a fallback UI
        reviewsData = { data: [] };
    }

    const reviews = reviewsData?.data || [];
    const noReviewsSubmitted = reviews.length === 0;

    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / (reviews.length || 1);

    return (
        <div className="flex flex-col p-2 theme-outline">
            <h3 className="theme-text-teal mt-5 pl-2">Reviews</h3>

            <div className="flex flex-col md:flex-row justify-between px-2">
                <PageReviewConsole
                    pageAssetType={pageAssetType} 
                    pageAssetId={assetId}
                    pageAssetName={assetName}
                    reviewUserIds={reviews.map(review => review.userId || "unknown_user_id")}
                />

                <div className="flex flex-col w-full md:w-[30%] space-y-1 mt-5">
                    <h4 className="font-semibold theme-text-teal">Customer Reviews</h4>
                    <h4 className="theme-text-muted">{averageRating} stars out of 5</h4>
                    <p className="theme-text">{reviews.length} user ratings</p>

                    <RatingStats totalReviews={reviews.length} expectedReviews={reviews.filter(review => review.rating === 5).length} rating={5}></RatingStats>
                    <RatingStats totalReviews={reviews.length} expectedReviews={reviews.filter(review => review.rating === 4).length} rating={4}></RatingStats>
                    <RatingStats totalReviews={reviews.length} expectedReviews={reviews.filter(review => review.rating === 3).length} rating={3}></RatingStats>
                    <RatingStats totalReviews={reviews.length} expectedReviews={reviews.filter(review => review.rating === 2).length} rating={2}></RatingStats>
                    <RatingStats totalReviews={reviews.length} expectedReviews={reviews.filter(review => review.rating === 1).length} rating={1}></RatingStats>
                </div>
            </div>
            
            <HorizontalDivider className="my-6"/>

            <PageReviewList 
                noReviewsSubmitted={noReviewsSubmitted} 
                pageReviews={reviews}
            />
        </div>
    );
};
