"use client";

import { useState } from "react";
import { ConfigApi, UserApi, AuthApi } from "@/services/api";
import { useRouter } from "next/navigation";

import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"
import { UserManagerModule } from "@/components/modular-components/UserManagerModule";
import { ComplaintManagerModule } from "@/components/modular-components/ComplaintManagerModule";
import { ImageUploadModule } from "@/components/modular-components/ImageUploadModule";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { queryClient } from "@/services/apiInstance";
import { HeroSection } from "@/types/enums";
import { LocationWalletManagerModule } from "@/components/modular-components/LocationAndWalletManagerModule";

export default function MasterAdminDashboard() {
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserRole = authResponse?.data?.userRole;
    
    const router = useRouter();

    const [actionTriggerTop, setActionTriggerTop] = useState<boolean>(false);
    const [actionTriggerMid, setActionTriggerMid] = useState<boolean>(false);
    const [actionTriggerBottom, setActionTriggerBottom] = useState<boolean>(false);

    const [fileReadyStateTop, setFileReadyStateTop] = useState<boolean>(false);
    const [fileReadyStateMid, setFileReadyStateMid] = useState<boolean>(false);
    const [fileReadyStateBottom, setFileReadyStateBottom] = useState<boolean>(false);

    const {showLoadingContent, openNotificationPopUpMessage} = useGlobalUI();

    const { data: siteConfig } = ConfigApi.useGetSiteConfigRQ();

    const {mutate: updateSiteConfig} = ConfigApi.useUpdateSiteConfigRQ(
        (responseData) => {
            if(responseData.status === "success")
            {
                openNotificationPopUpMessage("Site config updated successfully.");
                showLoadingContent(false);

                resetActionTriggers();

                queryClient.invalidateQueries({ queryKey: ["config"] });
            }
            else {
                openNotificationPopUpMessage("Failed to update site config.");
                showLoadingContent(false);
            }
        },
        () => {
            openNotificationPopUpMessage("Failed to save changes. Please try again.");
            showLoadingContent(false);
        }
    );

    const {mutate: deleteHeroSectionImages} = ConfigApi.useDeleteHeroSectionImagesRQ(
        (responseData) => {
            if(responseData.status === "success")
            {
                queryClient.invalidateQueries({ queryKey: ["config"] });
            }
            else openNotificationPopUpMessage("Failed to delete hero section images.");
        },
        () => {
            openNotificationPopUpMessage("Failed to delete hero section images. Please try again.");
        }
    );

    const siteConfigData = siteConfig?.data;

    const resetActionTriggers = () => {
        setActionTriggerTop(false);
        setActionTriggerMid(false);
        setActionTriggerBottom(false);
    }

    const configHeroSectionPicUploadURLBuilder = (configId: string) => {
        return `cholo_bd/config/heroSection${configId}/images`;
    }

    if(!isAuthenticated || currentUserRole !== "MASTER_ADMIN"){
        return (
            <>
            </>
        );
    }

    return (
        <section className="flex flex-col p-2 font-sans" id="dashboard_master_admin">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h2 className="text-green-500">Your System</h2>
                <p className="text-green-200">Site management functions here.</p>

                <div className="flex flex-col space-y-6 my-10">
                    <h3 className="text-green-500 font-semibold mr-5">Manage Site Content Pages</h3>

                    <div className="flex flex-col w-full md:w-[40%] space-y-3">
                        <div className="flex justify-between mx-2">
                            <button className="green-underline-button text-xl" onClick={() => router.push('/hotels')}>View Hotel List</button>
                            <button className="green-button" onClick={() => router.push('/hotels/create')}>Add new Hotel</button>
                        </div>

                        <div className="flex justify-between mx-2">
                            <button className="green-underline-button text-xl" onClick={() => router.push('/tour-spots')}>View Tour Spot List</button>
                            <button className="green-button" onClick={() => router.push('/tour-spots/create')}>Add new Tour Spot</button>
                        </div>
                        
                        <div className="flex justify-between mx-2">
                            <button className="green-underline-button text-xl" onClick={() => router.push('/activity-spots')}>View Activity Spot List</button>
                            <button className="green-button" onClick={() => router.push('/activity-spots/create')}>Add new Activity Spot</button>
                        </div>
                    </div>
                </div>

                <LocationWalletManagerModule/>

                <UserManagerModule/>

                <ComplaintManagerModule/>

                <section className="ml-2 flex flex-col space-y-3" id="dashboard_site_settings">
                    <div className="flex items-center space-x-5">
                        <h3 className="text-green-500 font-bold">Site Config Features</h3>
                        
                    </div>

                    <h4 className="my-2 text-green-300">Hero Section Branding Images</h4>

                    <div className="flex flex-col space-y-2">
                        <div className="flex flex-col space-y-8">
                            <div className="flex items-end space-x-3">
                                <ImageUploadModule
                                    imageUploadMode="edit"
                                    MAX_FILES={4}
                                    actionTrigger={actionTriggerTop}
                                    resourceId={"one"}
                                    resourceLabel="Edit Top Hero Section Images"
                                    resourceLabelStyle="text-sm"
                                    oldResourceImages={(siteConfigData?.heroImages || []).filter(image => image.section === HeroSection.TOP)}
                                    pic_url_Builder={configHeroSectionPicUploadURLBuilder}
                                    setFileReadyState={setFileReadyStateTop}
                                    updateResourceMutation={({id, imageURLs} : {id: string, imageURLs: string[]}) => updateSiteConfig({id, imageURLs, section: HeroSection.TOP})}
                                    deleteResourceMutation={({id, imageIds} : {id: string, imageIds: string[]}) => deleteHeroSectionImages({configId: id, imageIds})}
                                />

                                <button 
                                    className="p-1 bg-green-600 hover:bg-green-500 text-sm rounded-xs max-h-[35px] disabled:cursor-not-allowed disabled:bg-gray-500" 
                                    onClick={() => setActionTriggerTop(true)}
                                    disabled={!fileReadyStateTop}
                                    title={!fileReadyStateTop ? "Select an image first" : ""}
                                >
                                    Update
                                </button>
                            </div>
                            
                            <div className="flex space-x-3 items-end">
                                <ImageUploadModule
                                    imageUploadMode="edit"
                                    MAX_FILES={4}
                                    actionTrigger={actionTriggerMid}
                                    resourceId={"two"}
                                    resourceLabel="Edit Mid Hero Section Images"
                                    resourceLabelStyle="text-sm"
                                    oldResourceImages={(siteConfigData?.heroImages || []).filter(image => image.section === HeroSection.MIDDLE)}
                                    pic_url_Builder={configHeroSectionPicUploadURLBuilder}
                                    setFileReadyState={setFileReadyStateMid}
                                    updateResourceMutation={({id, imageURLs} : {id: string, imageURLs: string[]}) => updateSiteConfig({id, imageURLs, section: HeroSection.MIDDLE})}
                                    deleteResourceMutation={({id, imageIds} : {id: string, imageIds: string[]}) => deleteHeroSectionImages({configId: id, imageIds})}
                                />

                                <button 
                                    className="p-1 bg-green-600 hover:bg-green-500 text-sm rounded-xs max-h-[35px] disabled:cursor-not-allowed disabled:bg-gray-500" 
                                    onClick={() => setActionTriggerMid(true)}
                                    disabled={!fileReadyStateMid}
                                    title={!fileReadyStateMid ? "Select an image first" : ""}
                                >
                                    Update
                                </button>
                            </div>

                            <div className="flex space-x-3 items-end">
                                <ImageUploadModule
                                    imageUploadMode="edit"
                                    MAX_FILES={4}
                                    actionTrigger={actionTriggerBottom}
                                    resourceId={"three"}
                                    resourceLabel="Edit Bottom Hero Section Images"
                                    resourceLabelStyle="text-sm"
                                    oldResourceImages={(siteConfigData?.heroImages || []).filter(image => image.section === HeroSection.BOTTOM)}
                                    pic_url_Builder={configHeroSectionPicUploadURLBuilder}
                                    setFileReadyState={setFileReadyStateBottom}
                                    updateResourceMutation={({id, imageURLs} : {id: string, imageURLs: string[]}) => updateSiteConfig({id, imageURLs, section: HeroSection.BOTTOM})}
                                    deleteResourceMutation={({id, imageIds} : {id: string, imageIds: string[]}) => deleteHeroSectionImages({configId: id, imageIds})}
                                />

                                <button 
                                    className="p-1 bg-green-600 hover:bg-green-500 text-sm rounded-xs max-h-[35px] disabled:cursor-not-allowed disabled:bg-gray-500" 
                                    onClick={() => setActionTriggerBottom(true)}
                                    disabled={!fileReadyStateBottom}
                                    title={!fileReadyStateBottom ? "Select an image first" : ""}
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-5">
                        <h4 className="my-2 text-green-300">Toggle Features</h4>
                        <div className="text-sm px-1 bg-red-400 rounded-md self-center">Feature Not Ready</div>
                    </div>

                    <div className="flex flex-col w-[90%] md:w-[40%] space-y-5 justify-between">
                        <div className="flex justify-between items-center p-2 space-x-2 hover:bg-gray-700">
                            <label>Freeze New Trip Requests</label>
                            <input className="w-6 h-6" type="checkbox"></input>
                        </div>

                        <div className="flex justify-between items-center p-2 space-x-2 hover:bg-gray-700">
                            <label>Freeze Refund Requests</label>
                            <input className="w-6 h-6" type="checkbox"></input>
                        </div>

                        <div className="flex justify-between items-center p-2 space-x-2 hover:bg-gray-700">
                            <label>Freeze New Complaints</label>
                            <input className="w-6 h-6" type="checkbox"></input>
                        </div>

                        <div className="flex justify-between items-center p-2 space-x-2 hover:bg-gray-700">
                            <label className="text-red-500">Toggle Maintenance Mode</label>
                            <input className="w-6 h-6" type="checkbox"></input>
                        </div>
                    </div>
                </section>
            </div>
            
            <HorizontalDivider className="border-green-500 mt-15 md:mt-20"/>
        </section>
    )
}