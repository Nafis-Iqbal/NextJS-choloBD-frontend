"use client";

import { useState } from "react";

import { ReviewListTableRow } from "../data-elements/DataTableRowElements";

export const ProductReviewList = ({noReviewsSubmitted, productReviews} : {noReviewsSubmitted: boolean, productReviews: Review[]}) => {
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

    const sortedReviews = [...productReviews].sort((a, b) =>
        sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating
    );
    
    const handleSortByRating = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    }

    return (
        <>
            <div className="flex justify-between mb-10">
                <h4 className="text-green-300">User reviews</h4>
                {!noReviewsSubmitted && 
                    <button 
                        className="px-2 text-sm bg-green-700 hover:bg-green-600 self-baseline-last rounded-md"
                        onClick={handleSortByRating}
                    >
                        Sort by Rating ({sortOrder === "asc" ? "Low to High" : "High to Low"})
                    </button>
                }
            </div>

            <div className="flex flex-col space-y-5">
                {noReviewsSubmitted ?  (
                    <div className="text-gray-500 mb-5">   
                        <h4 className="text-center text-green-700">No reviews submitted yet.</h4>
                    </div>
                ) : (Array.isArray(productReviews) &&
                    sortedReviews.map((review) => (
                        <ReviewListTableRow 
                            key={review.id}
                            reviewUserId={review.user?.id || ""}
                            reviewUserName={review.user?.userName || "Unknown"} 
                            reviewUserImage={review.user?.profileImage?.url || null} 
                            reviewDescription={review.description} 
                            rating={review.rating}
                        />
                    ))
                )
                }
            </div>
        </>
        
    )
}