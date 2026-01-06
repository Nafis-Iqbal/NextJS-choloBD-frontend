import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SearchApi } from "@/services/api";
import { NextImage } from "../custom-elements/UIUtilities";

export const SearchInputBar = ({
    isOpen, 
    className,
    setInputBarVisibility,
} : {
    isOpen?: boolean, 
    className?: string,
    setInputBarVisibility: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 1500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const queryString = debouncedSearchTerm ? `name=${encodeURIComponent(debouncedSearchTerm)}` : undefined;
    const {data: searchListData} = SearchApi.useGetCombinedSubstringSearchResultRQ({queryString, enabled: !!debouncedSearchTerm});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }

    const onSearchResultNavigate = (assetType: "tour-spots" | "activity-spots" | "hotels", assetId: string) => {
        router.push(`/${assetType}/${assetId}`);
        setSearchTerm(""); // Clear search term to hide results
        setInputBarVisibility(false); // Close mobile search bar if needed
    }

    const searchList = searchListData?.data || [];
    const hotelList = searchList?.hotels || [];
    const tourSpotList = searchList?.tourSpots || [];
    const activitySpotList = searchList?.activitySpots || [];

    if(!isOpen) return null;

    return (
        <div className={`bg-transparent ${className}`}>
            <div className="relative flex justify-center bg-inherit">
                <input 
                    type="text" 
                    placeholder="Looking for something?"
                    value={searchTerm}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 font-sans placeholder-gray-400 text-gray-800 
                        focus:outline-none focus:ring-2 focus:ring-green-600"
                />

                {/* Search Results */}
                {(hotelList.length > 0 || tourSpotList.length > 0 || activitySpotList.length > 0) &&
                    <div className="absolute top-full left-0 w-full font-sans bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-10">
                        {hotelList.length > 0 && hotelList.map((hotel: Hotel) => (
                            <div 
                                key={hotel.id} 
                                className="flex justify-between items-center max-h-[100px] p-2 bg-white hover:bg-gray-200 
                                    text-gray-700 border-b border-gray-300 cursor-pointer"
                                onClick={() => onSearchResultNavigate("hotels", hotel.id)}
                            >
                                <p className="ml-1 md:ml-3">{hotel.name}</p>
                                <p className="text-blue-400 font-semibold"> Activity Spot</p>
                                <NextImage 
                                    src={hotel.images?.[0]?.url || null} 
                                    alt={hotel.name} 
                                    className="w-16 h-16" 
                                />
                            </div>
                        ))}
                        {tourSpotList.length > 0 && tourSpotList.map((tourSpot: TourSpot) => (
                            <div 
                                key={tourSpot.id} 
                                className="flex justify-between items-center max-h-[100px] p-2 bg-white hover:bg-gray-200 
                                    text-gray-700 border-b border-gray-300 cursor-pointer"
                                onClick={() => onSearchResultNavigate("tour-spots", tourSpot.id)}
                            >
                                <p className="ml-1 md:ml-3">{tourSpot.name}</p>
                                <p className="text-green-400 font-semibold"> Tour Spot</p>
                                <NextImage 
                                    src={tourSpot.images?.[0]?.url || null} 
                                    alt={tourSpot.name} 
                                    className="w-16 h-16" 
                                />
                            </div>
                        ))}
                        {activitySpotList.length > 0 && activitySpotList.map((activitySpot: ActivitySpot) => (
                            <div 
                                key={activitySpot.id} 
                                className="flex justify-between items-center max-h-[100px] p-2 bg-white hover:bg-gray-200 
                                    text-gray-700 border-b border-gray-300 cursor-pointer"
                                onClick={() => onSearchResultNavigate("activity-spots", activitySpot.id)}
                            >
                                <p className="ml-1 md:ml-3">{activitySpot.name}</p>
                                <p className="text-pink-400 font-semibold"> Activity Spot</p>
                                <NextImage 
                                    src={activitySpot.images?.[0]?.url || null} 
                                    alt={activitySpot.name} 
                                    className="w-16 h-16" 
                                />
                            </div>
                        ))}
                    </div>
                }
                {activitySpotList.length > 0 &&
                    <div className="absolute top-full left-0 w-full font-sans bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-10">
                        {hotelList.map((activitySpot: ActivitySpot) => (
                            <div 
                                key={activitySpot.id} 
                                className="flex justify-between items-center max-h-[100px] p-2 bg-white hover:bg-gray-200 
                                    text-gray-700 border-b border-gray-300 cursor-pointer"
                                onClick={() => onSearchResultNavigate("activity-spots", activitySpot.id)}
                            >
                                <p className="ml-1 md:ml-3">{activitySpot.name}</p>
                                <NextImage 
                                    src={activitySpot.images?.[0]?.url || null} 
                                    alt={activitySpot.name} 
                                    className="w-16 h-16" 
                                />
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    );
}