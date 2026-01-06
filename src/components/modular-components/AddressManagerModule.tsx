/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddressApi, UserApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";

import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import AddressUpdateModal from "../modals/AddressUpdateModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { AddressDataBlock } from "../data-elements/DataTableRowElements";
import AddressSelectionModal from "../modals/AddressSelectionModal";

const MAX_ADDRESSES = 5;

interface AddressManagerModuleProps {
    className?: string;
    userId: string | undefined;
    addressBlockCustomStyle?: string;
    showFullList?: boolean;
    hideActions?: boolean;
    selectOnlyMode?: boolean;//Use only to select address for order forms
    infoOnlyMode?: boolean;//Use to show address in confirmation/checkout or other info pages
    infoAddressId?: string;//Used with infoOnlyMode
    setSelectedAddressId?: React.Dispatch<React.SetStateAction<string>>;
}

export const AddressManagerModule = ({ 
    className, 
    userId, 
    addressBlockCustomStyle, 
    showFullList = false,
    selectOnlyMode = false,
    infoOnlyMode = false,//Use only to show selected address. No edits
    hideActions = infoOnlyMode,
    infoAddressId,//Used with infoOnlyMode
    setSelectedAddressId //Used for sending data with order forms
} : AddressManagerModuleProps) => {
    const router = useRouter();

    const [isAddressUpdateModalOpen, setIsAddressUpdateModalOpen] = useState(false);
    const [isAddressSelectionModalOpen, setIsAddressSelectionModalOpen] = useState(false);
    const [isDeleteAddressConfirmationVisible, setDeleteAddressConfirmationVisible] = useState(false);

    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

    const [addresses, setAddresses] = useState<Address[]>([]);

    const { openNotificationPopUpMessage } = useGlobalUI();

    const {data: userDetail} = UserApi.useGetOwnUserDetailRQ(userId ? userId : "", userId ? true : false);
    const { data: addressesData } = AddressApi.useGetUserAddressesRQ(userId ? userId : "", userId ? true : false);
    const {data: addressInfoModeDetail} = AddressApi.useGetAddressDetailRQ(infoAddressId ? infoAddressId : "");
    
    const {mutate: createUserAddress} = AddressApi.useCreateAddressRQ(
        (response) => {
            if (response.status === "success") {
                setEditingAddress(null);
                queryClient.invalidateQueries({ queryKey: ["addresses"] });
                queryClient.invalidateQueries({ queryKey: ["users", userId] });

                openNotificationPopUpMessage("Address created successfully!");
                if(!userId && setSelectedAddressId) {
                    setAddresses(prev => [...prev, response.data]);
                    setSelectedAddressId(response.data?.id);
                }
            } 
            else openNotificationPopUpMessage("Failed to create address. Please try again.");
        },
        () => {
            openNotificationPopUpMessage("Failed to create address. An error occurred.");
        }
    );

    const { mutate: updateUserAddress } = AddressApi.useUpdateAddressRQ(
        (response) => {
            if (response.status === "success") {
                setEditingAddress(null);
                queryClient.invalidateQueries({ queryKey: ["addresses"] });

                openNotificationPopUpMessage("Address updated successfully!");
            } 
            else openNotificationPopUpMessage("Failed to update address. Please try again.");
        },
        () => {
            openNotificationPopUpMessage("Failed to update address. An error occurred.");
        }
    );

    const { mutate: deleteUserAddress } = AddressApi.useDeleteAddressRQ(
        (response) => {
            if (response.status === "success") {
                setDeletingAddressId(null);
                queryClient.invalidateQueries({ queryKey: ["addresses"] });

                openNotificationPopUpMessage("Address deleted successfully!");
            } 
            else openNotificationPopUpMessage("Failed to delete address. Please try again.");
        },
        () => {
            openNotificationPopUpMessage("Failed to delete address. An error occurred.");
        }
    );

    const { mutate: updateUserDefaultAddress } = UserApi.useUpdateUserRQ(
        (response) => {
            if (response.status === "success") {
                queryClient.invalidateQueries({ queryKey: ["users", userId] });
                queryClient.invalidateQueries({ queryKey: ["addresses"] });

                if(!selectOnlyMode) openNotificationPopUpMessage("New default address set successfully!");
            } 
            else openNotificationPopUpMessage("Failed to update default address. Please try again.");
        },
        () => {
            openNotificationPopUpMessage("Failed to update default address. Please try again.");
        }
    );
    
    const userData = (userDetail?.data || []) as User;
    const addressInfoData = addressInfoModeDetail?.data as Address;
    
    useEffect(() => {
        if(!infoOnlyMode){
            const tempAddresses: Address[] = addressesData?.data || [];
    
            for (let i = 0; i < tempAddresses.length; i++) {
                if (tempAddresses[i].id === userData.serviceAddressId) {
                    const temp = tempAddresses[0];
                    tempAddresses[0] = tempAddresses[i];
                    tempAddresses[i] = temp;
                    break;
                }
            }

            setAddresses(tempAddresses);
            if(setSelectedAddressId) setSelectedAddressId(tempAddresses[0]?.id);
        }
        else {
            if(addressInfoData)setAddresses([addressInfoData]); // Fixed line 140
        }
        
    }, [addressesData, addressInfoData]);
    
    const displayedAddresses = showFullList ? addresses : addresses.slice(0, 1);
    const remainingCount = addresses.length - displayedAddresses.length;
    
    const handleAddAddress = () => {
        setEditingAddress(null);
        setIsAddressUpdateModalOpen(true);
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setIsAddressUpdateModalOpen(true);
    };

    const handleDeleteAddress = (addressId: string) => {
        setDeletingAddressId(addressId);
        setDeleteAddressConfirmationVisible(true);
    };

    const handleChangeDefaultAddress = (addressId: string, address: Address) => {
        if(setSelectedAddressId) setSelectedAddressId(address.id);

        updateUserDefaultAddress({
            id: userData.id,
            serviceAddressId: address.id
        });
    }

    const handleSubmitAddress = (addressData: Partial<Address>) => {
        setIsAddressUpdateModalOpen(false);

        const payload = {
            ...addressData,
            userId: userId
        };

        if (editingAddress?.id) {
            // Update existing address
            updateUserAddress({
                ...payload,
                id: editingAddress.id
            });
        } else {
            // Create new address
            const allFieldsInitialized = Object.values(addressData).every(
                (value) => value !== undefined && value !== null && value !== ""
            );

            if (!allFieldsInitialized) {
                openNotificationPopUpMessage("Please fill out all required fields.");
                return;
            }
            else createUserAddress(payload as Address);
        }
    };

    const confirmDeleteAddress = () => {
        if (deletingAddressId) {
            deleteUserAddress(deletingAddressId);
        }
        setDeleteAddressConfirmationVisible(false);
    };

    return (
        <div className={`flex flex-col space-y-3 ${className}`}>
            <div className="flex items-baseline space-x-3">
                <h4 className="text-green-300">Shipping Address</h4>

                {!showFullList && !selectOnlyMode && !infoOnlyMode &&
                    <button className="px-2 py-1 bg-green-700 hover:bg-green-600 rounded-xs" onClick={() => router.push(`/addresses/${userId}`)}> View All </button>
                }

                {selectOnlyMode && !infoOnlyMode &&
                    <button className="px-2 py-1 bg-green-700 hover:bg-green-600 rounded-xs" onClick={() => setIsAddressSelectionModalOpen(true)}> Choose Another </button>
                }
            </div>

            <AddressUpdateModal
                isVisible={isAddressUpdateModalOpen}
                address={editingAddress || undefined}
                onSubmit={handleSubmitAddress}
                onCancel={() => {
                    setIsAddressUpdateModalOpen(false);
                    setEditingAddress(null);
                }}
            />

            {setSelectedAddressId &&
                <AddressSelectionModal
                    isVisible={isAddressSelectionModalOpen}
                    addresses={addresses}
                    onSelect={({ id, address } : { id: string, address: Address }) => handleChangeDefaultAddress(id, address)}
                    onCancel={() => setIsAddressSelectionModalOpen(false)}
                    selectedAddressId={userData.serviceAddressId || ""}
                />
            }

            <ConfirmationModal
                isVisible={isDeleteAddressConfirmationVisible}
                message="Are you sure you want to delete this address? This action cannot be undone."
                onConfirm={confirmDeleteAddress}
                onCancel={() => {
                    setDeleteAddressConfirmationVisible(false);
                    setDeletingAddressId(null);
                }}
            />

            {addresses.length === 0 ? (
                <div className="flex flex-col space-y-2">
                    <p className="text-gray-400">No addresses found.</p>
                    {!infoOnlyMode &&
                        <button
                            onClick={handleAddAddress}
                            className="w-fit px-2 py-1 bg-green-600 hover:bg-green-500 text-sm md:text-base text-white rounded-sm"
                        >
                            Add First Address
                        </button>
                    }
                </div>
            ) : (
                <>
                    {displayedAddresses.map((address) => (
                        <AddressDataBlock
                            key={address.id}
                            showActions={!infoOnlyMode}
                            noEditMode={selectOnlyMode || infoOnlyMode || hideActions}
                            selectedAddressId={userData.serviceAddressId || "Unknown"}
                            AddressInfo={address}
                            onEdit={() => handleEditAddress(address)}
                            onDelete={() => handleDeleteAddress(address.id)}
                            onChangeDefault={() => handleChangeDefaultAddress(address.id, address)}
                            className={addressBlockCustomStyle ? addressBlockCustomStyle : "w-[95%] md:w-[40%]"}
                        />
                    ))}

                    {!showFullList && remainingCount > 0 && !infoOnlyMode && (
                        <button 
                            className="w-fit text-white hover:text-green-500 hover:underline" 
                            onClick={() => router.push("/addresses")}
                        >
                            and {remainingCount} others...
                        </button>
                    )}

                    {showFullList && addresses.length < MAX_ADDRESSES && !infoOnlyMode && (
                        <button
                            onClick={handleAddAddress}
                            className="w-fit p-2 bg-green-600 hover:bg-green-500 text-white rounded-sm mt-3"
                        >
                            Add New Address
                        </button>
                    )}
                </>
            )}
        </div>
    );
};
