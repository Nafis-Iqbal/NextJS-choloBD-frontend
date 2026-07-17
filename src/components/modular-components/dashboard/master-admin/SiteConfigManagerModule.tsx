"use client";

import { useState } from "react";
import { ConfigApi } from "@/services/api";
import { ImageUploadModule } from "@/components/modular-components/ImageUploadModule";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { queryClient } from "@/services/apiInstance";
import { HeroSection } from "@/types/enums";

export const SiteConfigManagerModule = () => {
    const [actionTriggerTop, setActionTriggerTop] = useState<boolean>(false);
    const [actionTriggerMid, setActionTriggerMid] = useState<boolean>(false);
    const [actionTriggerBottom, setActionTriggerBottom] = useState<boolean>(false);

    const [fileReadyStateTop, setFileReadyStateTop] = useState<boolean>(false);
    const [fileReadyStateMid, setFileReadyStateMid] = useState<boolean>(false);
    const [fileReadyStateBottom, setFileReadyStateBottom] = useState<boolean>(false);

    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    const { data: siteConfig } = ConfigApi.useGetSiteConfigRQ();

    const { mutate: updateSiteConfig } = ConfigApi.useUpdateSiteConfigRQ(
        (responseData) => {
            if (responseData.status === "success") {
                openNotificationPopUpMessage("Site config updated successfully.");
                showLoadingContent(false);
                resetActionTriggers();
                queryClient.invalidateQueries({ queryKey: ["config"] });
            } else {
                openNotificationPopUpMessage("Failed to update site config.");
                showLoadingContent(false);
            }
        },
        () => {
            openNotificationPopUpMessage("Failed to save changes. Please try again.");
            showLoadingContent(false);
        }
    );

    const { mutate: deleteHeroSectionImages } = ConfigApi.useDeleteHeroSectionImagesRQ(
        (responseData) => {
            if (responseData.status === "success") {
                queryClient.invalidateQueries({ queryKey: ["config"] });
            } else {
                openNotificationPopUpMessage("Failed to delete hero section images.");
            }
        },
        () => {
            openNotificationPopUpMessage(
                "Failed to delete hero section images. Please try again."
            );
        }
    );

    const siteConfigData = siteConfig?.data;

    const resetActionTriggers = () => {
        setActionTriggerTop(false);
        setActionTriggerMid(false);
        setActionTriggerBottom(false);
    };

    const configHeroSectionPicUploadURLBuilder = (configId: string) => {
        return `cholo_bd/config/heroSection${configId}/images`;
    };

    return (
        <section className="w-full theme-text mt-8 mb-4" id="site_settings_management">
            <div className="mb-6">
                <h3 className="theme-text-teal font-semibold">Site Config Features</h3>
                <p className="theme-text-muted text-sm mt-1">
                    Manage hero branding images and platform feature toggles
                </p>
            </div>

            <div className="flex flex-col space-y-6">
                {/* Hero Section Branding Images */}
                <div className="rounded-xl theme-outline bg-section overflow-hidden">
                    <div
                        className="mb-0 p-4 md:p-6 pb-4 border-b"
                        style={{ borderColor: "var(--theme-deep-green)" }}
                    >
                        <h2 className="text-2xl font-bold theme-text-teal">
                            Hero Section Branding Images
                        </h2>
                        <p className="theme-text-muted text-sm mt-1">
                            Upload and update top, mid, and bottom hero section images.
                            Changes can take up to 500 seconds to take effect.
                        </p>
                    </div>

                    <div className="py-4 px-2 md:p-6">
                        <div className="flex flex-col space-y-8">
                            <div className="flex items-end space-x-3">
                                <ImageUploadModule
                                    imageUploadMode="edit"
                                    MAX_FILES={4}
                                    actionTrigger={actionTriggerTop}
                                    resourceId={"one"}
                                    resourceLabel="Edit Top Hero Section Images"
                                    resourceLabelStyle="text-sm"
                                    oldResourceImages={(siteConfigData?.heroImages || []).filter(
                                        (image) => image.section === HeroSection.TOP
                                    )}
                                    pic_url_Builder={configHeroSectionPicUploadURLBuilder}
                                    setFileReadyState={setFileReadyStateTop}
                                    updateResourceMutation={({ id, imageURLs }: { id: string; imageURLs: string[] }) =>
                                        updateSiteConfig({ id, imageURLs, section: HeroSection.TOP })
                                    }
                                    deleteResourceMutation={({ id, imageIds }: { id: string; imageIds: string[] }) =>
                                        deleteHeroSectionImages({ configId: id, imageIds })
                                    }
                                />

                                <button
                                    className="p-1 text-sm rounded-xs max-h-[35px] theme-btn-teal disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    oldResourceImages={(siteConfigData?.heroImages || []).filter(
                                        (image) => image.section === HeroSection.MIDDLE
                                    )}
                                    pic_url_Builder={configHeroSectionPicUploadURLBuilder}
                                    setFileReadyState={setFileReadyStateMid}
                                    updateResourceMutation={({ id, imageURLs }: { id: string; imageURLs: string[] }) =>
                                        updateSiteConfig({ id, imageURLs, section: HeroSection.MIDDLE })
                                    }
                                    deleteResourceMutation={({ id, imageIds }: { id: string; imageIds: string[] }) =>
                                        deleteHeroSectionImages({ configId: id, imageIds })
                                    }
                                />

                                <button
                                    className="p-1 text-sm rounded-xs max-h-[35px] theme-btn-teal disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    oldResourceImages={(siteConfigData?.heroImages || []).filter(
                                        (image) => image.section === HeroSection.BOTTOM
                                    )}
                                    pic_url_Builder={configHeroSectionPicUploadURLBuilder}
                                    setFileReadyState={setFileReadyStateBottom}
                                    updateResourceMutation={({ id, imageURLs }: { id: string; imageURLs: string[] }) =>
                                        updateSiteConfig({ id, imageURLs, section: HeroSection.BOTTOM })
                                    }
                                    deleteResourceMutation={({ id, imageIds }: { id: string; imageIds: string[] }) =>
                                        deleteHeroSectionImages({ configId: id, imageIds })
                                    }
                                />

                                <button
                                    className="p-1 text-sm rounded-xs max-h-[35px] theme-btn-teal disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => setActionTriggerBottom(true)}
                                    disabled={!fileReadyStateBottom}
                                    title={!fileReadyStateBottom ? "Select an image first" : ""}
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toggle Features */}
                <div className="rounded-xl theme-outline bg-section overflow-hidden">
                    <div
                        className="flex flex-wrap items-center gap-3 p-4 md:p-6 pb-4 border-b"
                        style={{ borderColor: "var(--theme-deep-green)" }}
                    >
                        <div>
                            <h2 className="text-2xl font-bold theme-text-teal">
                                Toggle Features
                            </h2>
                            <p className="theme-text-muted text-sm mt-1">
                                Enable or freeze platform features for maintenance and control
                            </p>
                        </div>
                        <div
                            className="text-sm px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: "var(--theme-red)" }}
                        >
                            Feature Not Ready
                        </div>
                    </div>

                    <div className="py-4 px-2 md:p-6">
                        <div className="flex flex-col w-full md:w-[40%] space-y-4">
                            <div className="flex justify-between items-center p-3 space-x-2 theme-card rounded-lg">
                                <label className="theme-text">Freeze New Trip Requests</label>
                                <input className="w-6 h-6" type="checkbox" />
                            </div>

                            <div className="flex justify-between items-center p-3 space-x-2 theme-card rounded-lg">
                                <label className="theme-text">Freeze Refund Requests</label>
                                <input className="w-6 h-6" type="checkbox" />
                            </div>

                            <div className="flex justify-between items-center p-3 space-x-2 theme-card rounded-lg">
                                <label className="theme-text">Freeze New Complaints</label>
                                <input className="w-6 h-6" type="checkbox" />
                            </div>

                            <div className="flex justify-between items-center p-3 space-x-2 theme-card rounded-lg">
                                <label className="theme-text" style={{ color: "var(--theme-red)" }}>
                                    Toggle Maintenance Mode
                                </label>
                                <input className="w-6 h-6" type="checkbox" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
