const RatingStats = ({className, totalReviews, expectedReviews, rating}: {className?: string, totalReviews: number, expectedReviews: number, rating: number}) => {
    let percentValue = ((expectedReviews/totalReviews) * 100).toFixed(1);

    if (isNaN(Number(percentValue))) {
        percentValue = "0"; // or whatever default you want
    }
    
    return (
        <div className={`flex space-x-5 items-center ${className}`}>
            <div className="w-[15%] text-green-200">{rating} star</div>

            <div className="w-[60%] h-4 bg-gray-200 rounded overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${percentValue}%` }}>
                </div>
            </div>

            <div className="w-[20%] text-right text-green-200">{percentValue} {percentValue === "N/A" ? "" : "%"}</div>
        </div>
    )
}

export default RatingStats;