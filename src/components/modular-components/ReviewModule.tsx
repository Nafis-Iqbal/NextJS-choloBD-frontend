import { ReviewApi } from "@/services/api";

import { InfoPageReviewConsole } from "../console-elements/InfoPageReviewConsole";
import RatingStats from "../custom-elements/RatingStats";
import { HorizontalDivider } from "../custom-elements/UIUtilities";
import { ProductReviewList } from "../data-list-elements/ProductReviewList";

interface Props {
  productId: string;
  productName: string;
  productUserId: string;
}

export const ReviewModule = async ({productId, productName, productUserId} : Props) => {
    const productReviewsData = await ReviewApi.getProductReviews(productId);
    const productReviews = productReviewsData?.data || [];
    const noReviewsSubmitted = productReviews.length === 0;

    const averageRating = productReviews.reduce((acc, review) => acc + review.rating, 0) / (productReviews.length || 1);

    return (
        <div className="flex flex-col p-2 border-[0.5px] border-green-800">
            <h3 className="text-green-500 mt-5 pl-2">Reviews</h3>

            <div className="flex flex-col md:flex-row justify-between px-2">
                <InfoPageReviewConsole
                    productId={productId} 
                    productVendorId={productUserId}
                    productName={productName}
                    reviewUserIds={productReviews.map(review => review.userId)}
                />

                <div className="flex flex-col w-full md:w-[30%] space-y-1 mt-5">
                    <h4 className="font-semibold text-green-500">Customer Reviews</h4>
                    <h4 className="text-green-200">{averageRating} stars out of 5</h4>
                    <p>{productReviews.length} user ratings</p>

                    <RatingStats totalReviews={productReviews.length} expectedReviews={productReviews.filter(review => review.rating === 5).length} rating={5}></RatingStats>
                    <RatingStats totalReviews={productReviews.length} expectedReviews={productReviews.filter(review => review.rating === 4).length} rating={4}></RatingStats>
                    <RatingStats totalReviews={productReviews.length} expectedReviews={productReviews.filter(review => review.rating === 3).length} rating={3}></RatingStats>
                    <RatingStats totalReviews={productReviews.length} expectedReviews={productReviews.filter(review => review.rating === 2).length} rating={2}></RatingStats>
                    <RatingStats totalReviews={productReviews.length} expectedReviews={productReviews.filter(review => review.rating === 1).length} rating={1}></RatingStats>
                </div>
            </div>
            
            <HorizontalDivider className="my-6"/>

            <ProductReviewList 
                noReviewsSubmitted={noReviewsSubmitted} 
                productReviews={productReviews}
            />
        </div>
    );
};
