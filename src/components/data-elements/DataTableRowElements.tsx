import { NextImage } from "../custom-elements/UIUtilities"
import { StarRating } from "../custom-elements/StarRating"
import Link from "next/link"
import { FaTrash } from "react-icons/fa"
import { EditButton } from "../custom-elements/Buttons"

export const UserViewListTableRow = ({
    id, 
    user_name, 
    user_id, 
    email,
    role,
    userImageURL, 
    totalSpent,
    onClickNavigate
} : {
    id: number, 
    user_name: string, 
    user_id: string, 
    email: string,
    role: string,
    userImageURL?: string, 
    totalSpent?: number,
    onClickNavigate: () => void
}) => 
{
    return (
        <div className="flex items-center p-2 w-full h-[120px] border-b-1 border-green-900 text-center">
            <p className="w-[5%]">{id}</p>
            <button className="w-[20%] hover:text-green-500 hover:scale-110 transition-all duration-150 cursor-pointer" onClick={() => onClickNavigate()}>{user_name}</button>
            <NextImage className="w-[15%] h-full cursor-pointer bg-gray-600" nextImageClassName="object-contain" src={userImageURL || '/image-not-found.png'} alt={user_name}/>
            <p className="w-[20%]">{email}</p>
            <p className="w-[10%]">{role}</p>
            <p className="w-[10%]">{totalSpent}</p>
            <button className="w-[20%] hover:text-green-500 hover:scale-110 transition-all duration-150 cursor-pointer" onClick={() => onClickNavigate()}>{user_id}</button>
        </div>
    )
}

export const CategoryViewListTableRow = ({
    id,
    categoryName,
    category_id,
    categoryType,
    slug,
    isActive,
    onEdit,
    onDelete
} : {
    id: number,
    categoryName: string,
    category_id: string,
    categoryType: string,
    slug: string,
    isActive: boolean,
    onEdit: () => void,
    onDelete: () => void
}) => 
{
    return (
        <div className="flex items-center p-2 w-full h-[100px] border-b-1 border-green-900 text-center">
            <p className="w-[5%]">{id}</p>
            <p className="w-[20%] hover:text-green-500 hover:scale-110 transition-all duration-150 cursor-pointer">{categoryName}</p>
            <p className="w-[10%]">{categoryType}</p>
            <p className="w-[15%]">{slug}</p>
            <p className="w-[10%]">{isActive !== null ? ((isActive === true) ? "Yes" : "No") : "N/A"}</p>
            <p className="w-[20%] hover:text-green-500 hover:scale-110 transition-all duration-150 cursor-pointer">{category_id}</p>
            <div className="w-[20%] flex items-center justify-center space-x-2">
                <EditButton className="scale-90 hover:scale-110" onClick={onEdit}></EditButton>
                <button onClick={onDelete} className="p-1 bg-red-500 rounded hover:bg-red-400 hover:scale-110">
                    <FaTrash className="text-black cursor-pointer"/>
                </button>
            </div>
        </div>
    )
}

export const LocationListTableRow = ({
    id, name, locationType, navigateOnClick, onEditClick
} : {
    id: number, 
    name: string, 
    locationType: string,
    navigateOnClick: () => void,
    onEditClick: () => void
}) => {
    const locationDisplay = "Bangladesh";
    
    return (
        <div className="flex p-2 w-full border-green-900 hover:bg-gray-600 text-center justify-center" onClick={() => navigateOnClick()}>
            <p className="w-[10%]">{id}</p>
            <p className="w-[30%] hover:cursor-pointer px-2">{name}</p>
            <p className="w-[25%]">{locationType}</p>
            <p className="w-[25%] px-2">{locationDisplay}</p>
            <p className="w-[15%]">
                <button 
                    className="text-blue-400 hover:text-blue-300 bg-inherit text-sm"
                    onClick={() => onEditClick()}
                >
                    Edit
                </button>
            </p>
        </div>
    )
}

export const TourSpotViewListTableRow = ({
    id,
    tourSpotName,
    tourSpotLocation,
    tourSpot_id,
    tourSpotImageURL,
    tourType,
    rating,
    isPopular,
    onClickNavigate,
    onEdit,
    onDelete
} : {
    id: number,
    tourSpotName: string,
    tourSpotLocation: string,
    tourSpot_id: string,
    tourSpotImageURL?: string,
    tourType: string,
    rating?: number,
    isPopular: boolean,
    onClickNavigate: () => void,
    onEdit: () => void,
    onDelete: () => void
}) => 
{
    return (
        <div className="flex items-center p-2 w-full h-[150px] border-b-1 border-green-900 text-center">
            <p className="w-[5%]">{id}</p>
            <button className="w-[15%] hover:text-green-500 hover:scale-110 transition-all duration-150 cursor-pointer" onClick={() => onClickNavigate()}>{tourSpotName}</button>
            <p className="w-[15%]">{tourSpotLocation}</p>
            <NextImage className="w-[20%] h-full cursor-pointer bg-gray-600" nextImageClassName="object-contain" src={tourSpotImageURL || '/image-not-found.png'} alt={tourSpotName}/>
            <p className="w-[10%]">{tourType}</p>
            <div className="w-[5%]">
                {rating ? <StarRating rating={rating} /> : <span>N/A</span>}
            </div>
            <p className="w-[10%]">{isPopular !== null ? ((isPopular === true) ? "Yes" : "No") : "N/A"}</p>
            <button className="w-[10%] hover:text-green-500 hover:scale-110 transition-all duration-150 cursor-pointer" onClick={() => onClickNavigate()}>{tourSpot_id}</button>
            <div className="w-[10%] flex items-center justify-center space-x-2">
                <EditButton className="scale-90 hover:scale-110" onClick={onEdit}></EditButton>
                <button onClick={onDelete} className="p-1 bg-red-500 rounded hover:bg-red-400 hover:scale-110">
                    <FaTrash className="text-black cursor-pointer"/>
                </button>
            </div>
        </div>
    )
}

export const ActivitySpotViewListTableRow = ({
    id,
    activitySpotName,
    activitySpot_id,
    activitySpotImageURL,
    activityType,
    rating,
    entryCost,
    onClickNavigate,
    onEdit,
    onDelete
} : {
    id: number,
    activitySpotName: string,
    activitySpot_id: string,
    activitySpotImageURL?: string,
    activityType: string,
    rating?: number,
    entryCost: number,
    onClickNavigate: () => void,
    onEdit: () => void,
    onDelete: () => void
}) => 
{
    return (
        <div className="flex items-center p-2 w-full h-[150px] border-b-1 border-green-900 text-center">
            <p className="w-[5%]">{id}</p>
            <button className="w-[20%] hover:text-green-500 hover:scale-110 transition-all duration-150 cursor-pointer" onClick={() => onClickNavigate()}>{activitySpotName}</button>
            <NextImage className="w-[20%] h-full cursor-pointer bg-gray-600" nextImageClassName="object-contain" src={activitySpotImageURL || '/image-not-found.png'} alt={activitySpotName}/>
            <p className="w-[15%]">{activityType}</p>
            <div className="w-[10%]">
                {rating ? <StarRating rating={rating} /> : <span>N/A</span>}
            </div>
            <p className="w-[10%]">{entryCost ?? "N/A"}</p>
            <button className="w-[10%] hover:text-green-500 hover:scale-110 transition-all duration-150 cursor-pointer" onClick={() => onClickNavigate()}>{activitySpot_id}</button>
            <div className="w-[10%] flex items-center justify-center space-x-2">
                <EditButton className="scale-90 hover:scale-110" onClick={onEdit}></EditButton>
                <button onClick={onDelete} className="p-1 bg-red-500 rounded hover:bg-red-400 hover:scale-110">
                    <FaTrash className="text-black cursor-pointer"/>
                </button>
            </div>
        </div>
    )
}

export const HotelViewListTableRow = ({
    id,
    hotelName,
    hotelLocation,
    hotel_id,
    hotelImageURL,
    hotelType,
    rating,
    totalRooms,
    onClickNavigate,
    onEdit,
    onDelete
} : {
    id: number,
    hotelName: string,
    hotelLocation: string,
    hotel_id: string,
    hotelImageURL?: string,
    hotelType: string,
    rating: number,
    totalRooms?: number,
    onClickNavigate: () => void,
    onEdit: () => void,
    onDelete: () => void
}) => 
{
    return (
        <div className="flex items-center p-2 w-full h-[150px] border-b-1 border-green-900 text-center">
            <p className="w-[5%]">{id}</p>
            <button className="w-[20%] hover:text-green-500 hover:scale-110 transition-all duration-150 cursor-pointer" onClick={() => onClickNavigate()}>{hotelName}</button>
            <p className="w-[10%]">{hotelLocation}</p>
            <NextImage className="w-[20%] h-full cursor-pointer bg-gray-600" nextImageClassName="object-contain" src={hotelImageURL || '/image-not-found.png'} alt={hotelName}/>
            <p className="w-[10%]">{hotelType}</p>
            <div className="w-[10%]">
                <StarRating rating={rating} />
            </div>
            <p className="w-[5%]">{totalRooms ?? "N/A"}</p>
            <button className="w-[10%] hover:text-green-500 hover:scale-110 transition-all duration-150 cursor-pointer" onClick={() => onClickNavigate()}>{hotel_id}</button>
            <div className="w-[10%] flex items-center justify-center space-x-2">
                <EditButton className="scale-90 hover:scale-110" onClick={onEdit}></EditButton>
                <button onClick={onDelete} className="p-1 bg-red-500 rounded hover:bg-red-400 hover:scale-110">
                    <FaTrash className="text-black cursor-pointer"/>
                </button>
            </div>
        </div>
    )
}

export const ReviewListTableRow = ({
    reviewUserId,
    reviewUserName, 
    reviewUserImage, 
    reviewDescription, 
    rating,
} : {
    reviewUserId: string,
    reviewUserName: string, 
    reviewUserImage: string | null, 
    reviewDescription: string, 
    rating: number,
}) => 
{
    return (
        <div className="flex flex-col p-2 w-full space-y-5 border-1 border-green-900 bg-gray-700 rounded-md">
            <div className="flex space-x-5 bg-inherit">
                <NextImage className="w-[40px] h-[40px] overflow-hidden rounded-full" src={reviewUserImage} alt="user_image"></NextImage>

                <Link className="px-1 self-center hover:outline-1 bg-inherit" href={`/user_profile/${reviewUserId}`}>{reviewUserName}</Link>
            </div>

            <StarRating rating={rating} className="bg-gray-700"/>
            <p className="mb-5">{reviewDescription}</p>
        </div>
    )
}

export const AddressDataBlock = ({ 
    addressSelectMode = false,
    noEditMode = false,
    showActions = false,
    selectedAddressId,
    AddressInfo, 
    className, 
    onEdit,
    onDelete,
    onChangeDefault
}: { 
    addressSelectMode?: boolean;
    noEditMode?: boolean;
    showActions?: boolean;
    selectedAddressId: string;
    AddressInfo: Partial<Address>; 
    className?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onChangeDefault?: () => void;
}) => {
    return (
        <div 
            className={`relative flex flex-col p-3 border-1 border-green-800 md:text-lg ${className}`} 
            onClick={addressSelectMode ? onChangeDefault : undefined}
        >
            <div className="flex flex-col space-x-0 space-y-1 md:flex-row md:space-x-3 md:space-y-0">
                <p>{AddressInfo.addressLine1}, </p>
                {AddressInfo.addressLine2 && <p>{AddressInfo.addressLine2}</p>}
            </div>

            <div className="flex space-x-3">
                <p className="text-green-300">Country:&nbsp; <span className="text-white">{AddressInfo.country}</span></p>
                <p className="text-green-300">City:&nbsp; <span className="text-white">{AddressInfo.city}</span></p>
                <p className="text-green-300">State:&nbsp; <span className="text-white">{AddressInfo.state}</span></p>
            </div>
            
            <div className="flex space-x-3">
                <p className="text-green-300">Postal Code:&nbsp; <span className="text-white">{AddressInfo.postalCode}</span></p>
                <p className="text-green-300">Phone Number:&nbsp; <span className="text-white">{AddressInfo.phoneNumber}</span></p>
            </div>

            {showActions && (
                <div className="flex space-x-2 mt-3">
                    {!noEditMode && (
                        <>
                            <EditButton className="scale-105 hover:scale-120" onClick={onEdit ? onEdit : () => {}}></EditButton>

                            <button onClick={onDelete} className="p-1 bg-red-500 rounded hover:bg-red-400 hover:scale-110">
                                <FaTrash className="text-black cursor-pointer"/>
                            </button>
                        </>
                    ) 
                    }
                    
                    {(selectedAddressId !== AddressInfo.id && !addressSelectMode) && 
                        <button
                            onClick={onChangeDefault}
                            className="px-3 py-1 bg-blue-400 hover:bg-blue-300 text-white text-xs md:text-sm rounded-sm"
                        >
                            {noEditMode ? "Select" : "Set as Default"}
                        </button>
                    }
                </div>
            )}

            {(!noEditMode && selectedAddressId === AddressInfo.id) && <div className="absolute top-2 right-2 p-1 text-xs md:text-sm border-1 border-green-500 text-green-500 rounded-sm">
                Selected
            </div>}
        </div>
    );
};

export const ProductViewListTableRow = ({
    id, 
    productName, 
    product_id, 
    productImageURL, 
    productCategoryType, 
    price,
    onClickNavigate
} : {
    id: number, 
    productName: string, 
    product_id: string, 
    productImageURL: string, 
    productCategoryType: string, 
    price: number,
    onClickNavigate: () => void
}) => 
{
    return (
        <div className="flex items-center p-2 w-full h-[150px] border-b-1 border-green-900 text-center">
            <p className="w-[5%]">{id}</p>
            <button className="w-[20%] hover:text-green-500 hover:scale-110 transition-all duration-150 cursor-pointer" onClick={() => onClickNavigate()}>{productName}</button>
            <NextImage className="w-[35%] h-full cursor-pointer bg-gray-600" nextImageClassName="object-contain" src={productImageURL} alt={productName}/>
            <p className="w-[15%]">{productCategoryType}</p>
            <p className="w-[10%]">{price}</p>
            <button className="w-[15%] hover:text-green-500 hover:scale-110 transition-all duration-150 cursor-pointer" onClick={() => onClickNavigate()}>{product_id}</button>
        </div>
    )
}

export default ProductViewListTableRow;