import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

    const queryString = debouncedSearchTerm ? `title=${encodeURIComponent(debouncedSearchTerm)}` : undefined;
    //const {data: productListData} = ProductApi.useGetProductsRQ({queryString, enabled: !!debouncedSearchTerm});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }

    const onSearchResultNavigate = (productId: string) => {
        router.push(`/products/${productId}`);
        setSearchTerm(""); // Clear search term to hide results
        setInputBarVisibility(false); // Close mobile search bar if needed
    }

    //const productList = productListData?.data || [];
    const hotelList = [];

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
                {hotelList.length > 0 &&
                    <div className="absolute top-full left-0 w-full font-sans bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-10">
                        {/* {hotelList.map(product => (
                            <div 
                                key={product.id} 
                                className="flex justify-between items-center max-h-[100px] p-2 bg-white hover:bg-gray-200 
                                    text-gray-700 border-b border-gray-300 cursor-pointer"
                                onClick={() => onSearchResultNavigate(product.id)}
                            >
                                <p className="ml-1 md:ml-3">{product.title}</p>
                                <NextImage 
                                    src={product.images?.[0]?.url || null} 
                                    alt={product.title} 
                                    className="w-16 h-16" 
                                />
                            </div>
                        ))} */}
                    </div>
                }
            </div>
        </div>
    );
}