import { NextImage } from "../custom-elements/UIUtilities"
import { StarRating } from "../custom-elements/StarRating"
import Link from "next/link"
import { FaTrash, FaHeart } from "react-icons/fa"
import { EditButton } from "../custom-elements/Buttons"
import { motion } from "framer-motion"
import { ImageViewerModule } from "../modular-components/ImageViewerModule"
import { useState, type ReactNode } from "react"

const infoCardClass =
    "w-full shrink-0 rounded-sm md:rounded-md p-4 md:p-5 mb-3 border-0 md:border transition-colors min-h-[7.5rem]";

const infoCardStyle = {
    backgroundColor: "var(--theme-bg)",
    borderColor: "var(--theme-deep-green)",
} as const;

const metaChipClass =
    "inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium";

const imageFrameClass =
    "relative w-full sm:w-32 sm:min-w-[8rem] aspect-[4/3] sm:aspect-square rounded-sm overflow-hidden shrink-0 border-0 md:border bg-transparent p-0";

const MetaChip = ({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) => (
    <span
        className={metaChipClass}
        style={{
            backgroundColor: "var(--theme-section-bg)",
            color: "var(--theme-text-muted)",
        }}
    >
        <span className="theme-text-subtle mr-1">{label}:</span>
        <span className="theme-text">{value}</span>
    </span>
);

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
        <article className={infoCardClass} style={infoCardStyle}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 min-w-0">
                <button
                    type="button"
                    onClick={onClickNavigate}
                    className={imageFrameClass}
                    style={{
                        backgroundColor: "var(--theme-section-bg)",
                        borderColor: "var(--theme-deep-green)",
                    }}
                >
                    <NextImage
                        className="absolute inset-0 w-full h-full"
                        nextImageClassName="object-cover"
                        src={userImageURL || "/image-not-found.png"}
                        alt={user_name}
                    />
                </button>

                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <button
                            type="button"
                            onClick={onClickNavigate}
                            className="text-left text-base md:text-lg font-semibold theme-text hover:theme-text-teal transition-colors bg-transparent p-0"
                        >
                            {user_name}
                        </button>
                        <span className="text-xs theme-text-subtle shrink-0">#{id}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        <MetaChip label="Role" value={role} />
                        {totalSpent != null && (
                            <MetaChip
                                label="Spent"
                                value={`৳ ${totalSpent.toLocaleString()}`}
                            />
                        )}
                    </div>

                    <p className="text-sm theme-text-muted break-all">{email}</p>
                    <button
                        type="button"
                        onClick={onClickNavigate}
                        className="text-xs theme-text-subtle hover:theme-text-teal break-all bg-transparent p-0 text-left"
                    >
                        ID: {user_id}
                    </button>
                </div>
            </div>
        </article>
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
        <div className="flex items-center p-2 w-full h-[100px] text-center" style={{borderBottom: '1px solid var(--theme-deep-green)'}}>
            <p className="w-[5%]">{id}</p>
            <p className="w-[30%] hover:theme-text-teal hover:scale-110 transition-all duration-150 cursor-pointer">{categoryName}</p>
            <p className="w-[15%]">{categoryType}</p>
            <p className="w-[15%]">{slug}</p>
            <p className="w-[15%]">{isActive !== null ? ((isActive === true) ? "Yes" : "No") : "N/A"}</p>
            <div className="w-[20%] flex items-center justify-center space-x-2">
                <EditButton className="scale-90 hover:scale-110" onClick={onEdit}></EditButton>
                <button onClick={onDelete} className="p-1 rounded hover:scale-110" style={{backgroundColor: 'var(--theme-red)', color: 'var(--theme-text)'}}>
                    <FaTrash className="cursor-pointer"/>
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
        <div className="flex p-2 w-full text-center justify-center" style={{borderColor: 'var(--theme-deep-green)'}} onClick={() => navigateOnClick()}>
            <p className="w-[10%]">{id}</p>
            <p className="w-[30%] hover:cursor-pointer px-2">{name}</p>
            <p className="w-[25%]">{locationType}</p>
            <p className="w-[25%] px-2">{locationDisplay}</p>
            <p className="w-[15%]">
                <button 
                    className="text-sm" style={{color: 'var(--theme-teal)', backgroundColor: 'inherit'}}
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
        <article className={infoCardClass} style={infoCardStyle}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 min-w-0">
                <button
                    type="button"
                    onClick={onClickNavigate}
                    className={imageFrameClass}
                    style={{
                        backgroundColor: "var(--theme-section-bg)",
                        borderColor: "var(--theme-deep-green)",
                    }}
                >
                    <NextImage
                        className="absolute inset-0 w-full h-full"
                        nextImageClassName="object-cover"
                        src={tourSpotImageURL || "/image-not-found.png"}
                        alt={tourSpotName}
                    />
                </button>

                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <button
                                type="button"
                                onClick={onClickNavigate}
                                className="text-left text-base md:text-lg font-semibold theme-text hover:theme-text-teal transition-colors bg-transparent p-0 break-words"
                            >
                                {tourSpotName}
                            </button>
                            <p className="text-sm theme-text-muted mt-0.5 break-words">
                                📍 {tourSpotLocation}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs theme-text-subtle">#{id}</span>
                            <EditButton className="scale-90 hover:scale-110" onClick={onEdit} />
                            <button
                                type="button"
                                onClick={onDelete}
                                className="p-1.5 rounded-sm hover:scale-110"
                                style={{
                                    backgroundColor: "var(--theme-red)",
                                    color: "var(--theme-text)",
                                }}
                                aria-label="Delete tour spot"
                            >
                                <FaTrash className="cursor-pointer" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <MetaChip label="Type" value={tourType} />
                        <MetaChip
                            label="Popular"
                            value={isPopular !== null ? (isPopular ? "Yes" : "No") : "N/A"}
                        />
                        <span className="inline-flex items-center">
                            {rating ? <StarRating rating={rating} /> : (
                                <span className="text-xs theme-text-subtle">No rating</span>
                            )}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClickNavigate}
                        className="text-xs theme-text-subtle hover:theme-text-teal break-all bg-transparent p-0 text-left"
                    >
                        ID: {tourSpot_id}
                    </button>
                </div>
            </div>
        </article>
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
        <article className={infoCardClass} style={infoCardStyle}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 min-w-0">
                <button
                    type="button"
                    onClick={onClickNavigate}
                    className={imageFrameClass}
                    style={{
                        backgroundColor: "var(--theme-section-bg)",
                        borderColor: "var(--theme-deep-green)",
                    }}
                >
                    <NextImage
                        className="absolute inset-0 w-full h-full"
                        nextImageClassName="object-cover"
                        src={activitySpotImageURL || "/image-not-found.png"}
                        alt={activitySpotName}
                    />
                </button>

                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <button
                                type="button"
                                onClick={onClickNavigate}
                                className="text-left text-base md:text-lg font-semibold theme-text hover:theme-text-teal transition-colors bg-transparent p-0 break-words"
                            >
                                {activitySpotName}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs theme-text-subtle">#{id}</span>
                            <EditButton className="scale-90 hover:scale-110" onClick={onEdit} />
                            <button
                                type="button"
                                onClick={onDelete}
                                className="p-1.5 rounded-sm hover:scale-110"
                                style={{
                                    backgroundColor: "var(--theme-red)",
                                    color: "var(--theme-text)",
                                }}
                                aria-label="Delete activity spot"
                            >
                                <FaTrash className="cursor-pointer" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <MetaChip label="Type" value={activityType} />
                        <MetaChip
                            label="Entry"
                            value={entryCost != null ? `৳ ${entryCost}` : "N/A"}
                        />
                        <span className="inline-flex items-center">
                            {rating ? <StarRating rating={rating} /> : (
                                <span className="text-xs theme-text-subtle">No rating</span>
                            )}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClickNavigate}
                        className="text-xs theme-text-subtle hover:theme-text-teal break-all bg-transparent p-0 text-left"
                    >
                        ID: {activitySpot_id}
                    </button>
                </div>
            </div>
        </article>
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
        <article className={infoCardClass} style={infoCardStyle}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 min-w-0">
                <button
                    type="button"
                    onClick={onClickNavigate}
                    className={imageFrameClass}
                    style={{
                        backgroundColor: "var(--theme-section-bg)",
                        borderColor: "var(--theme-deep-green)",
                    }}
                >
                    <NextImage
                        className="absolute inset-0 w-full h-full"
                        nextImageClassName="object-cover"
                        src={hotelImageURL || "/image-not-found.png"}
                        alt={hotelName}
                    />
                </button>

                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <button
                                type="button"
                                onClick={onClickNavigate}
                                className="text-left text-base md:text-lg font-semibold theme-text hover:theme-text-teal transition-colors bg-transparent p-0 break-words"
                            >
                                {hotelName}
                            </button>
                            <p className="text-sm theme-text-muted mt-0.5 break-words">
                                📍 {hotelLocation}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs theme-text-subtle">#{id}</span>
                            <EditButton className="scale-90 hover:scale-110" onClick={onEdit} />
                            <button
                                type="button"
                                onClick={onDelete}
                                className="p-1.5 rounded-sm hover:scale-110"
                                style={{
                                    backgroundColor: "var(--theme-red)",
                                    color: "var(--theme-text)",
                                }}
                                aria-label="Delete hotel"
                            >
                                <FaTrash className="cursor-pointer" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <MetaChip label="Type" value={hotelType} />
                        <MetaChip
                            label="Rooms"
                            value={totalRooms ?? "N/A"}
                        />
                        <span className="inline-flex items-center">
                            <StarRating rating={rating} />
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClickNavigate}
                        className="text-xs theme-text-subtle hover:theme-text-teal break-all bg-transparent p-0 text-left"
                    >
                        ID: {hotel_id}
                    </button>
                </div>
            </div>
        </article>
    )
}

export const GuideViewListTableRow = ({
    id,
    guideName,
    guideLocation,
    guide_id,
    guideImageURL,
    specializations,
    rating,
    pricePerDay,
    isVerified,
    onClickNavigate,
    onEdit,
    onDelete
} : {
    id: number,
    guideName: string,
    guideLocation: string,
    guide_id: string,
    guideImageURL?: string,
    specializations: string,
    rating: number,
    pricePerDay?: number,
    isVerified?: boolean,
    onClickNavigate: () => void,
    onEdit: () => void,
    onDelete: () => void
}) =>
{
    return (
        <article className={infoCardClass} style={infoCardStyle}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 min-w-0">
                <button
                    type="button"
                    onClick={onClickNavigate}
                    className={imageFrameClass}
                    style={{
                        backgroundColor: "var(--theme-section-bg)",
                        borderColor: "var(--theme-deep-green)",
                    }}
                >
                    <NextImage
                        className="absolute inset-0 w-full h-full"
                        nextImageClassName="object-cover"
                        src={guideImageURL || "/image-not-found.png"}
                        alt={guideName}
                    />
                </button>

                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <button
                                type="button"
                                onClick={onClickNavigate}
                                className="text-left text-base md:text-lg font-semibold theme-text hover:theme-text-teal transition-colors bg-transparent p-0 break-words"
                            >
                                {guideName}
                            </button>
                            <p className="text-sm theme-text-muted mt-0.5 break-words">
                                📍 {guideLocation}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs theme-text-subtle">#{id}</span>
                            <EditButton className="scale-90 hover:scale-110" onClick={onEdit} />
                            <button
                                type="button"
                                onClick={onDelete}
                                className="p-1.5 rounded-sm hover:scale-110"
                                style={{
                                    backgroundColor: "var(--theme-red)",
                                    color: "var(--theme-text)",
                                }}
                                aria-label="Delete guide"
                            >
                                <FaTrash className="cursor-pointer" />
                            </button>
                        </div>
                    </div>

                    {specializations && (
                        <p className="text-sm theme-text-muted break-words">
                            {specializations}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5">
                        <MetaChip
                            label="Rate"
                            value={pricePerDay != null ? `৳${pricePerDay}/day` : "N/A"}
                        />
                        <MetaChip
                            label="Verified"
                            value={isVerified ? "Yes" : "No"}
                        />
                        <span className="inline-flex items-center">
                            <StarRating rating={rating} />
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClickNavigate}
                        className="text-xs theme-text-subtle hover:theme-text-teal break-all bg-transparent p-0 text-left"
                    >
                        ID: {guide_id}
                    </button>
                </div>
            </div>
        </article>
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
        <div className="flex flex-col p-2 w-full space-y-5 rounded-md" style={{border: '1px solid var(--theme-deep-green)', backgroundColor: 'var(--theme-card-bg)'}}>
            <div className="flex space-x-5" style={{backgroundColor: 'var(--theme-card-bg)'}}>
                <NextImage className="w-[40px] h-[40px] overflow-hidden rounded-full" src={reviewUserImage} alt="user_image"></NextImage>

                <Link className="px-1 self-center" style={{backgroundColor: 'var(--theme-card-bg)'}} href={`/user_profile/${reviewUserId}`}>{reviewUserName}</Link>
            </div>

            <StarRating rating={rating} className=""/>
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
            className={`relative flex flex-col p-3 theme-outline md:text-lg ${className}`} 
            onClick={addressSelectMode ? onChangeDefault : undefined}
        >
            <div className="flex flex-col space-x-0 space-y-1 md:flex-row md:space-x-3 md:space-y-0">
                <p>{AddressInfo.addressLine1}, </p>
                {AddressInfo.addressLine2 && <p>{AddressInfo.addressLine2}</p>}
            </div>

            <div className="flex space-x-3">
                <p className="theme-text-teal">Country:&nbsp; <span className="theme-text">{AddressInfo.country}</span></p>
                <p className="theme-text-teal">City:&nbsp; <span className="theme-text">{AddressInfo.city}</span></p>
                <p className="theme-text-teal">State:&nbsp; <span className="theme-text">{AddressInfo.state}</span></p>
            </div>
            
            <div className="flex space-x-3">
                <p className="theme-text-teal">Postal Code:&nbsp; <span className="theme-text">{AddressInfo.postalCode}</span></p>
                <p className="theme-text-teal">Phone Number:&nbsp; <span className="theme-text">{AddressInfo.phoneNumber}</span></p>
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
                            className="px-3 py-1 theme-btn-teal text-xs md:text-sm rounded-sm"
                        >
                            {noEditMode ? "Select" : "Set as Default"}
                        </button>
                    }
                </div>
            )}

            {(!noEditMode && selectedAddressId === AddressInfo.id) && <div className="absolute top-2 right-2 p-1 text-xs md:text-sm theme-outline-teal theme-text-teal rounded-sm">
                Selected
            </div>}
        </div>
    );
};

export const TourPackageViewListTableRow = ({
    id,
    packageName,
    tourPackage_id,
    division,
    tourType,
    duration,
    daySegments,
    onClickNavigate,
    onEdit,
    onDelete
} : {
    id: number,
    packageName: string,
    tourPackage_id: string,
    division: string,
    tourType: string,
    duration: number,
    daySegments: Array<{
        dayNumber: number,
        tourSpotName?: string,
        activitySpotName?: string,
        transportOption?: string,
        hotelOption?: string
    }>,
    onClickNavigate: () => void,
    onEdit: () => void,
    onDelete: () => void
}) => {
    // Group segments by day number and limit to duration
    const groupedSegments = daySegments.reduce((acc, segment) => {
        if (segment.dayNumber <= duration && segment.dayNumber > 0) {
            if (!acc[segment.dayNumber]) {
                acc[segment.dayNumber] = [];
            }
            acc[segment.dayNumber].push(segment);
        }
        return acc;
    }, {} as Record<number, Array<{dayNumber: number, tourSpotName?: string, activitySpotName?: string}>>);

    // Create summary of first 3 days with their spots
    const daysSummary = Array.from({length: Math.min(duration, 3)}, (_, i) => i + 1)
        .map(dayNum => {
            const segments = groupedSegments[dayNum] || [];
            const spots = segments
                .map(s => s.tourSpotName || s.activitySpotName)
                .filter(Boolean)
                .slice(0, 3);
            
            if (spots.length === 0) return `Day ${dayNum}: No spots`;
            if (spots.length > 1) return `Day ${dayNum}: ${spots[0]} +${spots.length - 1}`;
            return `Day ${dayNum}: ${spots[0]}`;
        });

    return (
        <div className="flex items-center p-2 w-full h-[150px] text-center" style={{borderBottom: '1px solid var(--theme-deep-green)'}}>
            <p className="w-[5%] text-sm">{id}</p>
            
            <button 
                className="w-[20%] hover:theme-text-teal hover:scale-105 transition-all duration-150 cursor-pointer px-2"
                onClick={() => onClickNavigate()}
            >
                <span className="font-semibold">{packageName}</span>
            </button>
            
            <p className="w-[12%] text-sm" style={{color: 'var(--theme-text-muted)'}}>{division}</p>
            <p className="w-[10%] text-sm">{tourType}</p>
            <p className="w-[8%] text-sm font-medium" style={{color: 'var(--theme-text-teal)'}}>{duration} days</p>
            
            <div className="w-[25%] text-xs p-2 ml-15 space-y-1 overflow-hidden text-left">
                {daysSummary.map((summary, idx) => (
                    <p key={idx} className="truncate leading-tight" style={{color: 'var(--theme-text-subtle)'}}>{summary}</p>
                ))}
                {Object.keys(groupedSegments).length === 0 && 
                    <p className="italic" style={{color: 'var(--theme-text-subtle)'}}>No segments added</p>
                }
            </div>
            
            <button 
                className="w-[10%] hover:theme-text-teal hover:scale-105 transition-all duration-150 cursor-pointer text-xs"
                style={{color: 'var(--theme-text-subtle)'}}
                onClick={() => onClickNavigate()}
            >
                {tourPackage_id}
            </button>
            
            <div className="w-[10%] flex items-center justify-center space-x-2">
                <EditButton className="scale-90 hover:scale-110" onClick={onEdit}></EditButton>
                <button onClick={onDelete} className="p-1 rounded hover:scale-110" style={{backgroundColor: 'var(--theme-red)', color: 'var(--theme-text)'}}>
                    <FaTrash className="cursor-pointer"/>
                </button>
            </div>
        </div>
    )
}

// ── Community Post Components ─────────────────────────────────────────────

export const CommunityPostCard = ({
    post,
    currentUserId,
    isAdmin = false,
    userHasReacted = false,
    onReact,
    onActivate,
    onDeactivate,
}: {
    post: CommunityPost;
    currentUserId?: string;
    isAdmin?: boolean;
    userHasReacted?: boolean;
    onReact?: (postId: string, reactionType: 'WOW') => void;
    onActivate?: (postId: string) => void;
    onDeactivate?: (postId: string) => void;
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const isOwner = currentUserId === post.creatorUserId;
    const isDraft = !post.isActive;

    const handleReactClick = () => {
        if (onReact) {
            setIsAnimating(true);
            onReact(post.id, 'WOW');
            setTimeout(() => setIsAnimating(false), 500);
        }
    };

    // Transform images for ImageViewerModule
    const imageList = post.images?.map(img => ({
        imageURL: img.url,
        imageAlt: img.altText || 'Post image',
        imageStyle: 'object-cover'
    })) || [];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col w-full rounded-lg overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow duration-300"
            style={{
                border: isDraft ? '2px solid var(--theme-yellow)' : '1px solid var(--theme-deep-green)',
                backgroundColor: 'var(--theme-card-bg)'
            }}
        >
            {/* Header Section */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative">
                        <NextImage 
                            className="w-11 h-11 rounded-full overflow-hidden transition-transform duration-200 hover:scale-105" 
                            style={{border: '1px solid var(--theme-deep-green)'}}
                            src={post.creator?.imageUrl || '/image-not-found.png'} 
                            alt={post.creator?.userName || 'User'}
                        />
                        {isDraft && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                                style={{backgroundColor: 'var(--theme-yellow)', color: 'var(--theme-black)', border: '2px solid var(--theme-card-bg)'}}>
                                ⏸
                            </div>
                        )}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex flex-col">
                        <Link 
                            href={`/user_profile/${post.creatorUserId}`}
                            className="font-semibold text-base hover:underline transition-all"
                            style={{color: 'var(--theme-text)'}}
                        >
                            {post.creator?.userName || 'Unknown User'}
                        </Link>
                        <p className="text-xs" style={{color: 'var(--theme-text-muted)'}}>
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                            {isDraft && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold" 
                                style={{backgroundColor: 'var(--theme-yellow)', color: 'var(--theme-black)'}}>
                                Draft
                            </span>}
                        </p>
                    </div>
                </div>

                {/* Quick Actions Menu */}
                <div className="flex items-center space-x-1">
                    {/* More options icon */}
                    <button
                        className="p-2 rounded-full hover:scale-110 transition-all hover:bg-opacity-10 hover:bg-white"
                        style={{color: 'var(--theme-text-muted)'}}
                        title="More options"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Caption Section */}
            {post.caption && (
                <div className="px-4 py-2">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{color: 'var(--theme-text)'}}>
                        {post.caption}
                    </p>
                </div>
            )}

            {/* Tagged Users */}
            {post.tags && post.tags.filter(tag => tag.status === 'ACCEPTED').length > 0 && (
                <div className="px-4 pb-2 flex items-center space-x-2 flex-wrap gap-1">
                    <span className="text-xs" style={{color: 'var(--theme-text-muted)'}}>with</span>
                    {post.tags.filter(tag => tag.status === 'ACCEPTED').map(tag => (
                        <Link
                            key={tag.id}
                            href={`/user_profile/${tag.taggedUserId}`}
                            className="text-xs px-2 py-0.5 rounded-full hover:underline font-medium"
                            style={{color: 'var(--theme-teal)'}}
                        >
                            @{tag.taggedUser?.userName || 'User'}
                        </Link>
                    ))}
                </div>
            )}

            {/* Images Section with ImageViewerModule */}
            {post.images && post.images.length > 0 && (
                <div className="w-full" style={{backgroundColor: 'var(--theme-section-bg)'}}>
                    <ImageViewerModule
                        imageList={imageList}
                        className="h-[35vh] md:h-[500px]"
                        imagePlacementStyle="object-cover"
                    />
                </div>
            )}

            {/* Action Bar - Social Media Style */}
            <div className="flex items-center justify-between px-5 py-3" style={{borderTop: '1px solid var(--theme-deep-green)'}}>
                {/* Left: Interaction Icons */}
                <div className="flex items-center space-x-6">
                    {/* React Icon */}
                    {post.isActive && onReact && (
                        <motion.button
                            onClick={handleReactClick}
                            className="flex items-center space-x-2 px-3 py-2 hover:scale-110 transition-all duration-300 bg-transparent"
                            title={userHasReacted ? "Unreact" : "React with Wow"}
                            animate={isAnimating ? { scale: [1, 1.3, 0.95, 1] } : {}}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            <FaHeart
                                className="text-2xl transition-all duration-300"
                                style={{
                                    color: userHasReacted ? "#FF3B30" : "#9CA3AF",
                                    filter: userHasReacted
                                        ? "brightness(1.3) drop-shadow(0 0 10px rgba(255, 59, 48, 0.7))"
                                        : "brightness(0.7)",
                                    transform: userHasReacted ? "scale(1.15)" : "scale(1)"
                                }}
                            />
                            <span 
                                className={`text-sm font-bold transition-all duration-300 ${userHasReacted ? 'text-black' : 'text-gray-500'}`}
                            >
                                {post.wowCount || 0}
                            </span>
                        </motion.button>
                    )}

                    {/* Share Icon (placeholder) */}
                    <button
                        className="flex items-center space-x-1 hover:scale-110 transition-transform bg-transparent"
                        title="Share post"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: 'var(--theme-text-muted)'}}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                </div>

                {/* Right: Admin Actions & Meta Info */}
                <div className="flex items-center space-x-3">
                    {post.images && post.images.length > 1 && (
                        <span className="text-xs" style={{color: 'var(--theme-text-muted)'}}>
                            📷 {post.images.length}
                        </span>
                    )}

                    {isAdmin && isDraft && onActivate && (
                        <button
                            onClick={() => onActivate(post.id)}
                            className="px-3 py-1 rounded-md text-xs font-semibold hover:scale-105 transition-all"
                            style={{backgroundColor: 'var(--theme-green)', color: 'white'}}
                        >
                            ✓ Approve
                        </button>
                    )}

                    {(isAdmin || isOwner) && post.isActive && onDeactivate && (
                        <button
                            onClick={() => onDeactivate(post.id)}
                            className="px-3 py-1 rounded-md text-xs font-semibold hover:scale-105 transition-all"
                            style={{backgroundColor: 'var(--theme-red)', color: 'white'}}
                        >
                            ⚠ Hide
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export const CommunityPostCompact = ({
    post,
    currentUserId,
    isAdmin = false,
    isLoadingAction = false,
    onReact,
    onActivate,
    onDeactivate,
    onViewPost
}: {
    post: CommunityPost;
    currentUserId?: string;
    isAdmin?: boolean;
    isLoadingAction?: boolean;
    onReact?: (postId: string, reactionType: 'WOW') => void;
    onActivate?: (postId: string) => void;
    onDeactivate?: (postId: string) => void;
    onDelete?: (postId: string) => void;
    onViewPost?: (postId: string) => void;
}) => {
    const isOwner = currentUserId === post.creatorUserId;
    const isDraft = !post.isActive;
    const hasImages = post.images && post.images.length > 0;
    const imageUrl = post.images?.[0]?.url ?? '/image-not-found.png';

    return (
        <div 
            className="flex flex-col w-full rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
            style={{
                border: `2px solid ${isDraft ? 'var(--theme-yellow)' : 'var(--theme-deep-green)'}`,
                backgroundColor: 'var(--theme-card-bg)'
            }}
        >
            {/* Status Header Bar */}
            <div 
                className="flex items-center justify-between px-4 py-2"
                style={{
                    backgroundColor: isDraft ? 'var(--theme-yellow)' : 'var(--theme-deep-green)',
                    borderBottom: '1px solid var(--theme-deep-green)'
                }}
            >
                <span 
                    className="text-xs font-bold tracking-wide"
                    style={{color: isDraft ? 'var(--theme-black)' : 'var(--theme-teal)'}}
                >
                    {isDraft ? '⚠ DRAFT POST' : '✓ ACTIVE POST'}
                </span>
                <span 
                    className="text-xs"
                    style={{color: isDraft ? 'var(--theme-black)' : 'var(--theme-text-muted)'}}
                >
                    {new Date(post.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col md:flex-row gap-4 p-4">
                {/* Left: Photo Thumbnail */}
                <div 
                    className="relative w-full md:w-[180px] h-[180px] shrink-0 rounded-lg overflow-hidden"
                    style={{
                        border: '2px solid var(--theme-deep-green)',
                        backgroundColor: 'var(--theme-section-bg)'
                    }}
                >
                    <NextImage
                        className="w-full h-full"
                        nextImageClassName="object-cover"
                        src={imageUrl}
                        alt="Post thumbnail"
                    />
                    {hasImages && post.images && post.images.length > 1 && (
                        <div 
                            className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold shadow-lg"
                            style={{backgroundColor: 'rgba(0,0,0,0.8)', color: 'white'}}
                        >
                            📷 +{post.images.length - 1}
                        </div>
                    )}
                    {!hasImages && (
                        <div 
                            className="absolute inset-0 flex items-center justify-center text-xs"
                            style={{
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                color: 'var(--theme-text-muted)'
                            }}
                        >
                            No Images
                        </div>
                    )}
                </div>

                {/* Right: Content & Metadata */}
                <div className="flex-1 flex flex-col min-w-0 space-y-3">
                    {/* Creator Info */}
                    <div className="flex items-center gap-3 pb-3" style={{borderBottom: '1px solid var(--theme-deep-green)'}}>
                        <NextImage 
                            className="w-12 h-12 rounded-full overflow-hidden shrink-0"
                            style={{border: '2px solid var(--theme-teal)'}}
                            src={post.creator?.imageUrl || '/image-not-found.png'} 
                            alt={post.creator?.userName || 'User'}
                        />
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-base truncate" style={{color: 'var(--theme-teal)'}}>
                                {post.creator?.userName || 'Unknown User'}
                            </p>
                            <p className="text-xs" style={{color: 'var(--theme-text-muted)'}}>
                                Post Creator
                            </p>
                        </div>
                    </div>

                    {/* Caption */}
                    <div className="flex-1">
                        <p className="text-xs font-semibold mb-1" style={{color: 'var(--theme-text-muted)'}}>
                            Caption:
                        </p>
                        <p className="text-sm line-clamp-3" style={{color: 'var(--theme-text)'}}>
                            {post.caption || <span style={{color: 'var(--theme-text-muted)', fontStyle: 'italic'}}>No caption provided</span>}
                        </p>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-4 flex-wrap text-xs" style={{color: 'var(--theme-text-muted)'}}>
                        <div className="flex items-center gap-1">
                            <FaHeart className="text-yellow-400" />
                            <span className="font-semibold">{post.wowCount || 0}</span>
                            <span>reactions</span>
                        </div>
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                                <span>👥</span>
                                <span className="font-semibold">{post.tags.filter(t => t.status === 'ACCEPTED').length}</span>
                                <span>tagged</span>
                            </div>
                        )}
                        {hasImages && post.images && (
                            <div className="flex items-center gap-1">
                                <span>📷</span>
                                <span className="font-semibold">{post.images.length}</span>
                                <span>{post.images.length === 1 ? 'photo' : 'photos'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <div 
                className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap"
                style={{
                    backgroundColor: 'var(--theme-section-bg)',
                    borderTop: '1px solid var(--theme-deep-green)'
                }}
            >
                {/* Left: Reaction Button */}
                <div className="flex items-center gap-2">
                    {post.isActive && onReact && (
                        <button
                            onClick={() => onReact(post.id, 'WOW')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold text-sm hover:scale-105 transition-all"
                            style={{
                                backgroundColor: 'var(--theme-deep-green)',
                                color: 'var(--theme-teal)'
                            }}
                        >
                            <FaHeart className="text-yellow-400" />
                            <span>React</span>
                        </button>
                    )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    {onViewPost && (
                        <button
                            onClick={() => onViewPost(post.id)}
                            className="px-4 py-1.5 rounded-md text-sm font-semibold hover:scale-105 transition-all shadow-sm"
                            style={{backgroundColor: 'var(--theme-teal)', color: 'white'}}
                        >
                            👁 View Details
                        </button>
                    )}

                    {isAdmin && isDraft && onActivate && (
                        isLoadingAction ? (
                            <div className="flex items-center justify-center px-4 py-1.5 rounded-md" style={{backgroundColor: 'var(--theme-deep-green)'}}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => onActivate(post.id)}
                                className="bg-green-700 hover:bg-green-600 px-4 py-1.5 rounded-md text-white text-sm font-semibold 
                                    hover:scale-105 transition-all shadow-sm"
                            >
                                ✓ Approve
                            </button>
                        )
                    )}

                    {isAdmin && post.isActive && onDeactivate && (
                        isLoadingAction ? (
                            <div className="flex items-center justify-center px-4 py-1.5 rounded-md" style={{backgroundColor: 'var(--theme-deep-green)'}}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => onDeactivate(post.id)}
                                className="bg-red-700 hover:bg-red-600 px-4 py-1.5 rounded-md text-white text-sm font-semibold 
                                    hover:scale-105 transition-all shadow-sm"
                            >
                                ⚠ Take Down
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export type SearchAssetType = 'tourSpot' | 'activitySpot' | 'hotel' | 'guide';

/** Responsive public search result card — used by /search page */
export const SearchResultBlock = ({
    assetType,
    title,
    subtitle,
    imageUrl,
    rating,
    metaLeft,
    metaRight,
    href,
}: {
    assetType: SearchAssetType;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    rating?: number;
    metaLeft?: string;
    metaRight?: string;
    href: string;
}) => {
    const typeLabel =
        assetType === 'tourSpot' ? 'Tour Spot' :
        assetType === 'activitySpot' ? 'Activity' :
        assetType === 'hotel' ? 'Hotel' : 'Guide';

    return (
        <Link
            href={href}
            className="flex flex-col sm:flex-row w-full overflow-hidden rounded-md theme-card theme-outline hover:opacity-95 transition-all duration-200"
        >
            <div
                className="relative w-full sm:w-[140px] md:w-[180px] h-[160px] sm:h-auto sm:min-h-[120px] shrink-0"
                style={{ backgroundColor: 'var(--theme-section-bg)' }}
            >
                <NextImage
                    className="w-full h-full"
                    nextImageClassName="object-cover"
                    src={imageUrl || '/image-not-found.png'}
                    alt={title}
                />
            </div>

            <div className="flex flex-1 flex-col justify-between gap-2 p-3 sm:p-4 min-w-0">
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="theme-badge text-xs px-2 py-0.5">{typeLabel}</span>
                        {rating != null && rating > 0 && (
                            <div className="flex items-center gap-1">
                                <StarRating rating={rating} />
                            </div>
                        )}
                    </div>
                    <h4 className="theme-label text-base md:text-lg truncate">{title}</h4>
                    {subtitle && (
                        <p className="theme-text-muted text-sm truncate">{subtitle}</p>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    {metaLeft && <span className="theme-text-subtle">{metaLeft}</span>}
                    {metaRight && <span className="theme-text-teal font-medium">{metaRight}</span>}
                </div>
            </div>
        </Link>
    );
};
