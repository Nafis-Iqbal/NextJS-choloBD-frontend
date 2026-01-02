import { useState } from "react"

import { LocationType } from "@/types/enums"
import { LocationApi, WalletApi } from "@/services/api"
import LocationUpdateModal from "../modals/LocationUpdateModal"
import WalletRechargeOptionModal from "../modals/WalletRechargeOptionModal"
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

    const [locationFilters, setLocationFilters] = useState<{
        locationType: string;
        locationName: string;
    }>({
        locationType: '',
        locationName: ''
    });

    const {data: locationListData, isLoading: isLocationLoading, isError: isLocationError} = LocationApi.useGetAllLocationsRQ();
    const {data: walletOptionsList, isLoading: isWalletOptionsLoading} = WalletApi.useGetWalletRechargeOptionsRQ();
    const locationList = locationListData?.data;
    const walletRechargeOptions = walletOptionsList?.data;

    const locationTypeOptions = Object.values(LocationType).map(locationType => ({
        value: locationType,
        label: locationType.replace("_", " ").toLowerCase().replace(/^\w/, c => c.toUpperCase())
    }));

    const handleLocationFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocationFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getFilteredLocations = () => {
        if (!Array.isArray(locationList)) return [];
        
        return locationList.filter(location => {
            const matchesType = locationFilters.locationType === '' || location.locationType === locationFilters.locationType;
            const matchesName = locationFilters.locationName === '' || location.name.toLowerCase().includes(locationFilters.locationName.toLowerCase());
            
            return matchesType && matchesName;
        });
    };

    const filterByOrderStatus = () => {

    };

    const toggleLocationFormModal = (isOpen: boolean, locationId: string, mode: 'create' | 'edit') => {
        setLocationModal({isOpen, locationId, mode});
    }

    const toggleRechargeOptionModal = (isOpen: boolean, rechargeOptionId: string, mode: 'create' | 'edit') => {
        setRechargeOptionModal({isOpen, rechargeOptionId, mode});
    }

    return (
        <section className="flex flex-col space-y-2 mt-4" id="location_wallet_manager">
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
            <h4 className="mb-2">Location List</h4>

            <TableLayout className="mr-5">
                <div className="overflow-x-auto w-full">
                    <div className="min-w-[900px]">
                        <div className="flex border border-green-800 p-2 bg-gray-600 text-center">
                            <p className="w-[10%]">Sr.</p>
                            <p className="w-[30%]">Location Name</p>
                            <p className="w-[25%]">Type</p>
                            <p className="w-[25%]">Country/City</p>
                            <p className="w-[15%]">Actions</p>
                        </div>
                        <div className="flex flex-col border-1 border-green-800">
                            {
                                isLocationLoading ? (<NoContentTableRow displayMessage="Loading Data"  tdColSpan={1}/>) :
                                isLocationError ? (<NoContentTableRow displayMessage="An error occured"  tdColSpan={1}/>) :

                                (locationList && Array.isArray(locationList) && locationList.length <= 0) ? (<NoContentTableRow displayMessage="No locations found" tdColSpan={1}/>) :
                                (getFilteredLocations().length === 0) ? (<NoContentTableRow displayMessage="No locations match the selected filters" tdColSpan={1}/>) :
                                (getFilteredLocations().map((location, index) => (
                                        <LocationListTableRow 
                                            key={location.id} 
                                            id={index + 1}
                                            locationId={location.id}
                                            name={location.name}
                                            locationType={location.locationType}
                                            country={location.country}
                                            city={location.city}
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
                            name="locationType"
                            options={[{ value: '', label: '-- All Types --' }, ...locationTypeOptions]}
                            value={locationFilters.locationType}
                            onChange={handleLocationFilterChange}
                            className="bg-gray-600"
                        />
                    </div>

                    <div className="flex flex-col space-y-1">
                        <CustomTextInput
                            label="Location Name"  
                            name="locationName"
                            placeholderText="Enter location name"
                            value={locationFilters.locationName}
                            onChange={handleLocationFilterChange}
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
            <div className="flex space-x-5 mb-2 items-center">
                <h4 className="">Wallet Recharge Options</h4>
                <p className="text-gray-400">Will be moved to config files content</p>
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
    id, locationId, name, locationType, country, city, createdAt, navigateOnClick, onEditClick
} : {
    id: number, 
    locationId: string, 
    name: string, 
    locationType: LocationType, 
    country: string, 
    city?: string, 
    createdAt: Date, 
    navigateOnClick: () => void,
    onEditClick: () => void
}) => {
    const locationDisplay = city ? `${country}, ${city}` : country;
    
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