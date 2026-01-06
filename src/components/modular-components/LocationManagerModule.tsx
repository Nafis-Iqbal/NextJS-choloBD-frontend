import { useState } from "react"

import { LocationType } from "@/types/enums"
import { LocationApi, WalletApi } from "@/services/api"
import { LocationListTableRow } from "../data-elements/DataTableRowElements"
import LocationUpdateModal from "../modals/LocationUpdateModal"
import WalletRechargeOptionModal from "../modals/WalletRechargeOptionModal"
import TableLayout from "../layout-elements/TableLayout"
import FilterSectionLayout from "../layout-elements/FilterSectionLayout"
import { CustomSelectInput, CustomTextInput} from "../custom-elements/CustomInputElements"
import { HorizontalDivider } from "../custom-elements/UIUtilities"
import { NoContentTableRow } from "../placeholder-components/NoContentTableRow"

export const LocationManagerModule = () => {
    const [locationModal, setLocationModal] = useState<{isOpen: boolean, locationId: string, mode: 'create' | 'edit'}>({
        isOpen: false, 
        locationId: '',
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
    const locationList = locationListData?.data;

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

    return (
        <section className="flex flex-col space-y-2 mt-4" id="location_wallet_manager">
            <LocationUpdateModal
                isVisible={locationModal.isOpen}
                location_id={locationModal.locationId}
                onCancel={() => toggleLocationFormModal(false, locationModal.locationId, 'create')}
                mode={locationModal.mode}
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
                            <p className="w-[25%]">Country</p>
                            <p className="w-[15%]">Actions</p>
                        </div>
                        <div className="flex flex-col border-1 border-green-800 h-[80vh] md:h-[50vh] overflow-y-auto">
                            {
                                isLocationLoading ? (<NoContentTableRow displayMessage="Loading Data"  tdColSpan={1}/>) :
                                isLocationError ? (<NoContentTableRow displayMessage="An error occured"  tdColSpan={1}/>) :

                                (locationList && Array.isArray(locationList) && locationList.length <= 0) ? (<NoContentTableRow displayMessage="No locations found" tdColSpan={1}/>) :
                                (getFilteredLocations().length === 0) ? (<NoContentTableRow displayMessage="No locations match the selected filters" tdColSpan={1}/>) :
                                (getFilteredLocations().map((location, index) => (
                                        <LocationListTableRow 
                                            key={location.id} 
                                            id={index + 1}
                                            name={location.name}
                                            locationType={location.locationType}
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
        </section>
    )
}