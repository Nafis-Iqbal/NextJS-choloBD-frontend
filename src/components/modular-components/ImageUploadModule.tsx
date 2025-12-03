/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";
import debounce from "debounce";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { apiFetchExternalURL } from "@/services/apiInstance";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

import LoadingSpinnerBlock from "../placeholder-components/LoadingSpinnerBlock";

const MAX_SIZE_MB = 1;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const ImageUploadModule = ({
    className,
    MAX_FILES = 3,
    imageUploadMode, //Decides which update mutation to use: "create" or "edit"
    actionTrigger, //Used in edit mode, when resourceId is readily availabe and external trigger necessary for submit. actionTrigger is a state variable
    resourceId, //Both actionTrigger, and resourceId are used in combo for uploading images in create and update mode.
    resourceLabel,
    resourceLabelStyle,
    oldResourceImages, // For edit mode, to show existing images
    pic_url_Builder, 
    setFileReadyState, //Used in create mode, to set file ready state for parent component
    updateResourceMutation,
    deleteResourceMutation
} : {
    className?: string,
    MAX_FILES?: number;
    imageUploadMode: "create" | "edit",
    actionTrigger: boolean;
    resourceId?: string, 
    resourceLabel: string,
    resourceLabelStyle?: string,
    oldResourceImages?: Image[], 
    pic_url_Builder: (resourceId: string) => string, 
    setFileReadyState?: React.Dispatch<React.SetStateAction<boolean>> 
    updateResourceMutation: ({id, imageURLs} : {id: string, imageURLs: string[]}) => void,
    deleteResourceMutation: ({id, imageIds} : {id: string, imageIds: string[]}) => void
}) => {
    const [pendingFiles, setPendingFiles] = useState<File[]>([]); // For prompt mode
    const [productImages, setProductImages] = useState<Image[]>(oldResourceImages || []);
    const imageURLsToDeleteRef = useRef<string[]>([]);
    const [isImageDataSyncing, setIsImageDataSyncing] = useState(false);

    const {showLoadingContent, openNotificationPopUpMessage} = useGlobalUI();
    
    useEffect(() => {
        if(oldResourceImages){
            setProductImages(oldResourceImages);
        }
    }, [oldResourceImages]);

    useEffect(() => {
        const objectURLs = pendingFiles.map(file => URL.createObjectURL(file));

        return () => {
            objectURLs.forEach(url => URL.revokeObjectURL(url));
        };
    }, [pendingFiles]);

    useEffect(() => {
        if(resourceId && actionTrigger){
            const uploadResourceImages = async () => {
                const uploadedImageURLs = await uploadFiles(pendingFiles);
                updateResourceMutation({id: resourceId, imageURLs: uploadedImageURLs}); 
            }
            
            uploadResourceImages();
        }
    }, [resourceId, actionTrigger]);
    
    //Image Upload methods
    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter((file) => file.size <= MAX_SIZE_BYTES);

        if(setFileReadyState){
            if(validFiles.length > 0) setFileReadyState(true);
            else setFileReadyState(false);
        }

        if (validFiles.length !== files.length) {
            openNotificationPopUpMessage(`Some files exceed the ${MAX_SIZE_MB}MB limit and were skipped.`);
        }

        const totalFiles = [...pendingFiles, ...validFiles];

        if (totalFiles.length + productImages.length > MAX_FILES) {
            openNotificationPopUpMessage(`You can only upload up to ${MAX_FILES} images.`);
            setPendingFiles(totalFiles.slice(0, MAX_FILES - productImages.length)); // keep only first 3
        } else {
            setPendingFiles(totalFiles);
        }
    };

    const handleRemoveFile = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveUploadedFile = (image_id: string) => {
        setProductImages(productImages.filter((c) => c.id !== image_id));
        imageURLsToDeleteRef.current = [...imageURLsToDeleteRef.current, image_id];
        
        if(imageUploadMode === 'edit'){
            setIsImageDataSyncing(true);
            debouncedDeleteImageURLs(imageURLsToDeleteRef.current);
        }
    };

    const debouncedDeleteImageURLs = useCallback(
        debounce((imageIds: string[]) => {
            deleteResourceMutation({id: resourceId ?? "", imageIds});
        }, 500),
        [] // -> no dependencies, so it will not change
    );
        
    const uploadFiles = async (files: File[]): Promise<string[]> => {
        if (!files || files.length === 0) return [];

        showLoadingContent(true);
        try {
            const uploadedUrls: string[] = [];

            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUD_UPLOAD_PRESET ?? "");
                formData.append("folder", pic_url_Builder(resourceId ?? ""));

                const res = await apiFetchExternalURL(process.env.NEXT_PUBLIC_PIC_HOST ?? "", {
                    method: "POST",
                    body: formData,
                });

                uploadedUrls.push(res.url);
            }

            setPendingFiles([]);

            if(setFileReadyState) setFileReadyState(false);

            return uploadedUrls;
        } catch (err) {
            console.error("Upload failed:", err);
            onPicUpdateFailure();
            return [];
        }
    };
    
    const onPicUpdateFailure = () => {
        showLoadingContent(false);
        openNotificationPopUpMessage("Image upload failed in file system. Try again");
    };

    return (
        <div className={`flex flex-col space-y-2 ${className}`}>
            <label className={`text-green-300 ${resourceLabelStyle}`}>{resourceLabel}</label>

            {/* Input Handling */}
            <div className="flex items-center space-x-3">
                {/* Hidden Native File Input */}
                <label className="relative bg-gray-300 text-gray-800 px-4 py-1 text-sm rounded-xs cursor-pointer hover:bg-gray-400 transition">
                    Select Images
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileSelection}
                    />
                </label>

                {/* Show Selected File Count */}
                <span className="text-sm text-gray-300">
                    {pendingFiles.length + productImages.length} / {MAX_FILES} images selected
                </span>

                {/* Loading Spinner */}
                <LoadingSpinnerBlock isOpen={isImageDataSyncing} className="w-[30px] h-[30px]" />
            </div>
            
            {/* Display selected images for upload */}
            {(pendingFiles.length > 0 || productImages.length > 0)&& (
                <div className="flex flex-wrap w-full md:w-[650px] p-2 gap-2 bg-white border-green-600 border-1 rounded-sm">
                    {pendingFiles.map((file, idx) => (
                        <div className="relative flex w-[80px] h-[80px] md:w-[150px] md:h-[150px] object-cover rounded-md" key={idx}>
                            <Image    
                                src={URL.createObjectURL(file)}
                                alt={`Pending ${idx}`}
                                width={150}
                                height={150}
                                className="w-[80px] h-[80px] md:w-[150px] md:h-[150px] object-cover"
                            />

                            <button className="absolute flex justify-center items-center top-0 right-0 bg-red-500 hover:bg-400 h-[20px] w-[20px]" 
                                onClick={() => handleRemoveFile(idx)} type="button">
                                x
                            </button>
                        </div>
                    ))}
                    
                    {productImages && productImages.map((image, idx) => (
                        <div className="relative flex w-[80px] h-[80px] md:w-[150px] md:h-[150px] object-cover rounded-md" key={idx}>
                            <Image
                                src={image.url}
                                alt={`Existing ${idx}`}
                                width={150}
                                height={150}
                                className="w-[80px] h-[80px] md:w-[150px] md:h-[150px] object-cover"
                            />

                            <button className="absolute flex justify-center items-center top-0 right-0 bg-red-500 hover:bg-red-400 h-[20px] w-[20px]" 
                                onClick={() => handleRemoveUploadedFile(image.id)} type="button">
                                x
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}