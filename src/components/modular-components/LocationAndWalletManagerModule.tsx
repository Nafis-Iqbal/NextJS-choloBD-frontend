import { LocationApi, WalletApi } from "@/services/api"
import { useState } from "react"

import LocationUpdateModal from "../modals/LocationUpdateModal"
import WalletRechargeOptionModal from "../modals/WalletRechargeOptionModal"
import { ComplaintStatus, LocationType } from "@/types/enums"
import TableLayout from "../layout-elements/TableLayout"
import FilterSectionLayout from "../layout-elements/FilterSectionLayout"
import { CustomSelectInput, CustomTextInput} from "../custom-elements/CustomInputElements"
import { HorizontalDivider } from "../custom-elements/UIUtilities"
import { NoContentTableRow } from "../placeholder-components/NoContentTableRow"

export const LocationWalletManagerModule = () => {
    const [locationModal, setLocationModal] = useState<{isOpen: boolean, locationId: string, mode: 'create' | 'edit'}>({
        isOpen: false, 
        locationId: '',
        mode: 'create'
    });

    const [rechargeOptionModal, setRechargeOptionModal] = useState<{isOpen: boolean, rechargeOptionId: string, mode: 'create' | 'edit'}>({
        isOpen: false, 
        rechargeOptionId: '',
        mode: 'create'
    });

    const {data: locationListData, isLoading: isLocationLoading, isError: isLocationError} = LocationApi.useGetAllLocationsRQ();
    const {data: walletOptionsList, isLoading: isWalletOptionsLoading} = WalletApi.useGetWalletRechargeOptionsRQ();
    const locationList = locationListData?.data;
    const walletRechargeOptions = walletOptionsList?.data;

    const complaintStatusOptions = Object.values(ComplaintStatus).map(status => ({
        value: status,
        label: status.replace("_", " ").toLowerCase().replace(/^\w/, c => c.toUpperCase())
    }));

    const filterByOrderStatus = () => {

    };

    const toggleLocationFormModal = (isOpen: boolean, locationId: string, mode: 'create' | 'edit') => {
        setLocationModal({isOpen, locationId, mode});
    }

    const toggleRechargeOptionModal = (isOpen: boolean, rechargeOptionId: string, mode: 'create' | 'edit') => {
        setRechargeOptionModal({isOpen, rechargeOptionId, mode});
    }

    return (
        <section className="flex flex-col space-y-2 mt-4" id="dashboard_complaints">
            <LocationUpdateModal
                isVisible={locationModal.isOpen}
                location_id={locationModal.locationId}
                onCancel={() => toggleLocationFormModal(false, locationModal.locationId, 'create')}
                mode={locationModal.mode}
            />

            <WalletRechargeOptionModal
                isVisible={rechargeOptionModal.isOpen}
                rechargeOption_id={rechargeOptionModal.rechargeOptionId}
                onCancel={() => toggleRechargeOptionModal(false, rechargeOptionModal.rechargeOptionId, 'create')}
                mode={rechargeOptionModal.mode}
            />

            {/* Location List Section */}
            <div className="flex space-x-5 mb-2">
                <h4 className="">Location List</h4>
            </div>

            <TableLayout className="mr-5">
                <div className="overflow-x-auto w-full">
                    <div className="min-w-[900px]">
                        <div className="flex border border-green-800 p-2 bg-gray-600 text-center">
                            <p className="w-[5%]">Sr.</p>
                            <p className="w-[25%]">Location Name</p>
                            <p className="w-[20%]">Type</p>
                            <p className="w-[20%]">Country/City</p>
                            <p className="w-[10%]">Popular</p>
                            <p className="w-[10%]">Score</p>
                            <p className="w-[10%]">Actions</p>
                        </div>
                        <div className="flex flex-col border-1 border-green-800">
                            {
                                isLocationLoading ? (<NoContentTableRow displayMessage="Loading Data"  tdColSpan={1}/>) :
                                isLocationError ? (<NoContentTableRow displayMessage="An error occured"  tdColSpan={1}/>) :

                                (locationList && Array.isArray(locationList) && locationList.length <= 0) ? (<NoContentTableRow displayMessage="No locations found" tdColSpan={1}/>) :
                                (Array.isArray(locationList) &&
                                    locationList.map((location, index) => (
                                        <LocationListTableRow 
                                            key={location.id} 
                                            id={index + 1}
                                            locationId={location.id}
                                            name={location.name}
                                            locationType={location.locationType}
                                            country={location.country}
                                            city={location.city}
                                            isPopular={location.isPopular}
                                            popularityScore={location.popularityScore}
                                            createdAt={location.createdAt}
                                            navigateOnClick={() => console.log(`Navigate to location ${location.id}`)}
                                            onEditClick={() => toggleLocationFormModal(true, location.id, 'edit')}
                                        />
                                    ))
                                )
                            }
                        </div>
                    </div>
                </div>
            </TableLayout>

            <FilterSectionLayout className="mr-5" onSubmit={filterByOrderStatus}>
                <div className="flex justify-left space-x-6">
                    <div className="flex flex-col space-y-1">
                        <CustomSelectInput
                            label="Location Type"
                            options={complaintStatusOptions}
                            value="Active"
                            onChange={() => filterByOrderStatus()}
                            className="bg-gray-600"
                            disabled
                        />
                    </div>

                    <div className="flex flex-col space-y-1">
                        <CustomTextInput
                            label="Location Name"  
                            placeholderText="Enter location name"
                            disabled
                        />
                    </div>
                </div>
            </FilterSectionLayout>

            <button 
                className="mr-5 mt-2 p-2 w-fit bg-green-700 hover:bg-green-600 text-sm md:text-base text-white rounded-sm"
                onClick={() => toggleLocationFormModal(true, locationModal.locationId, 'create')}
            >
                Add New Location
            </button>

            <HorizontalDivider className="mr-5 my-10"/>

            {/* Wallet Recharge Options Section */}
            <div className="flex space-x-5 mb-2">
                <h4 className="">Wallet Recharge Options</h4>
            </div>

            <TableLayout className="mr-5">
                <div className="overflow-x-auto w-full">
                    <div className="min-w-[900px]">
                        <div className="flex border border-green-800 p-2 bg-gray-600 text-center">
                            <p className="w-[5%]">Sr.</p>
                            <p className="w-[25%]">Title</p>
                            <p className="w-[30%]">Description</p>
                            <p className="w-[12%]">Amount (৳)</p>
                            <p className="w-[12%]">Cost (৳)</p>
                            <p className="w-[10%]">Bonus (৳)</p>
                            <p className="w-[6%]">Actions</p>
                        </div>
                        <div className="flex flex-col border-1 border-green-800">
                            {
                                isWalletOptionsLoading ? (<NoContentTableRow displayMessage="Loading Data"  tdColSpan={1}/>) :
                                !walletRechargeOptions ? (<NoContentTableRow displayMessage="An error occurred"  tdColSpan={1}/>) :

                                (walletRechargeOptions && Array.isArray(walletRechargeOptions) && walletRechargeOptions.length <= 0) ? (<NoContentTableRow displayMessage="No recharge options found" tdColSpan={1}/>) :
                                (Array.isArray(walletRechargeOptions) &&
                                    walletRechargeOptions.map((option, index) => (
                                        <RechargeOptionListTableRow 
                                            key={option.id} 
                                            id={index + 1}
                                            optionId={option.id}
                                            title={option.title}
                                            description={option.description}
                                            rechargeAmount={option.rechargeAmount}
                                            rechargeCost={option.rechargeCost}
                                            bonusAmount={option.bonusAmount}
                                            createdAt={option.createdAt}
                                            navigateOnClick={() => console.log(`Navigate to recharge option ${option.id}`)}
                                            onEditClick={() => toggleRechargeOptionModal(true, option.id, 'edit')}
                                        />
                                    ))
                                )
                            }
                        </div>
                    </div>
                </div>
            </TableLayout>

            <FilterSectionLayout className="mr-5" onSubmit={filterByOrderStatus}>
                <div className="flex justify-left space-x-6">
                    <div className="flex flex-col space-y-1">
                        <CustomTextInput
                            label="Option Title"  
                            placeholderText="Enter option title"
                            disabled
                        />
                    </div>

                    <div className="flex flex-col space-y-1">
                        <CustomTextInput
                            label="Amount Range"  
                            placeholderText="Min - Max amount"
                            disabled
                        />
                    </div>
                </div>
            </FilterSectionLayout>

            <button 
                className="mr-5 mt-2 p-2 w-fit bg-green-700 hover:bg-green-600 text-sm md:text-base text-white rounded-sm"
                onClick={() => toggleRechargeOptionModal(true, rechargeOptionModal.rechargeOptionId, 'create')}
            >
                Add New Recharge Option
            </button>

            <HorizontalDivider className="mr-5 my-10"/>
        </section>
    )
}

const LocationListTableRow = ({
    id, locationId, name, locationType, country, city, isPopular, popularityScore, createdAt, navigateOnClick, onEditClick
} : {
    id: number, 
    locationId: string, 
    name: string, 
    locationType: LocationType, 
    country: string, 
    city?: string, 
    isPopular: boolean, 
    popularityScore: number, 
    createdAt: Date, 
    navigateOnClick: () => void,
    onEditClick: () => void
}) => {
    const locationDisplay = city ? `${country}, ${city}` : country;
    
    return (
        <div className="flex p-2 w-full border-green-900 hover:bg-gray-600 text-center justify-center" onClick={() => navigateOnClick()}>
            <p className="w-[5%]">{id}</p>
            <p className="w-[25%] hover:cursor-pointer px-2">{name}</p>
            <p className="w-[20%]">{locationType}</p>
            <p className="w-[20%] px-2">{locationDisplay}</p>
            <p className="w-[10%]">{isPopular ? '⭐' : '-'}</p>
            <p className="w-[10%]">{popularityScore}</p>
            <p className="w-[10%]">
                <button 
                    className="text-blue-400 hover:text-blue-300 text-sm"
                    onClick={() => onEditClick()}
                >
                    Edit
                </button>
            </p>
        </div>
    )
}

const RechargeOptionListTableRow = ({
    id, optionId, title, description, rechargeAmount, rechargeCost, bonusAmount, createdAt, navigateOnClick, onEditClick
} : {
    id: number, 
    optionId: string, 
    title: string, 
    description: string, 
    rechargeAmount: number, 
    rechargeCost: number, 
    bonusAmount: number, 
    createdAt: Date, 
    navigateOnClick: () => void,
    onEditClick: () => void
}) => {
    const truncatedDescription = description.length > 50 ? description.substring(0, 50) + '...' : description;
    
    return (
        <div className="flex p-2 w-full border-green-900 hover:bg-gray-600 text-center" onClick={() => navigateOnClick()}>
            <p className="w-[5%]">{id}</p>
            <p className="w-[25%] hover:cursor-pointer px-2">{title}</p>
            <p className="w-[30%] px-2" title={description}>{truncatedDescription}</p>
            <p className="w-[12%]">৳{rechargeAmount.toLocaleString()}</p>
            <p className="w-[12%]">৳{rechargeCost.toLocaleString()}</p>
            <p className="w-[10%]">৳{bonusAmount.toLocaleString()}</p>
            <p className="w-[6%]">
                <button 
                    className="text-blue-400 hover:text-blue-300 text-sm"
                    onClick={() => onEditClick()}
                >
                    Edit
                </button>
            </p>
        </div>
    )
}