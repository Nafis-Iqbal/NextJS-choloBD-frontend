"use client";

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion } from "framer-motion";
import { ImageUploadModule } from "../modular-components/ImageUploadModule";
import { CommunityApi } from "@/services/api";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

interface CommunityPostCreateModalProps {
    isVisible: boolean;
    onClose: () => void;
    userTripPlanId?: string; // Optional: link post to a trip plan
}

const CommunityPostCreateModal: React.FC<CommunityPostCreateModalProps> = ({ 
    isVisible, 
    onClose,
    userTripPlanId
}) => {
    const [caption, setCaption] = useState("");
    const [createdPostId, setCreatedPostId] = useState<string | undefined>(undefined);
    const [filesReadyState, setFilesReadyState] = useState(false);
    const [uploadTrigger, setUploadTrigger] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();

    // Reset state when modal closes
    useEffect(() => {
        if (!isVisible) {
            setCaption("");
            setCreatedPostId(undefined);
            setFilesReadyState(false);
            setUploadTrigger(false);
            setIsSubmitting(false);
        }
    }, [isVisible]);

    // API Mutations
    const createPostMutation = CommunityApi.useCreatePostRQ(
        (data) => {
            if (data.status === "success" && data.data) {
                setCreatedPostId(data.data.id);
                // If there are files to upload, trigger the upload
                if (filesReadyState) {
                    setUploadTrigger(true);
                } else {
                    // No files, just close
                    showLoadingContent(false);
                    openNotificationPopUpMessage("Post created successfully!");
                    onClose();
                }
            }
        },
        () => {
            showLoadingContent(false);
            openNotificationPopUpMessage("Failed to create post. Please try again.");
            setIsSubmitting(false);
        }
    );

    const updatePostMutation = CommunityApi.useUpdatePostRQ(
        (data) => {
            if (data.status === "success") {
                showLoadingContent(false);
                openNotificationPopUpMessage("Post created successfully!");
                onClose();
            }
        },
        () => {
            showLoadingContent(false);
            openNotificationPopUpMessage("Failed to upload images. Please try again.");
            setIsSubmitting(false);
        }
    );

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!caption.trim() && !filesReadyState) {
            openNotificationPopUpMessage("Please add a caption or at least one photo.");
            return;
        }

        setIsSubmitting(true);
        showLoadingContent(true);
        
        // Create the post first
        createPostMutation.mutate({ 
            caption
        });
    };

    // Custom mutation wrapper for ImageUploadModule
    const handleImageUpload = ({ id, imageURLs }: { id: string; imageURLs: string[] }) => {
        if (imageURLs.length > 0) {
            const images = imageURLs.map((url, index) => ({
                url,
                order: index
            }));
            updatePostMutation.mutate({ postId: id, images });
        }
    };

    // Dummy delete mutation (not used in create mode, but required by ImageUploadModule)
    const handleImageDelete = () => {
        // Not used in create mode
    };

    if (!isVisible) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed z-60 inset-0 flex items-center justify-center font-sans"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={onClose}
        >
            <motion.div
                className="theme-card rounded-md shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold theme-text-teal">
                            Create New Post
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-2xl text-center theme-text-muted hover:theme-text px-2 py-1 rounded-sm"
                            disabled={isSubmitting}
                        >
                            ×
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Caption Input */}
                        <div className="flex flex-col space-y-2">
                            <label 
                                htmlFor="caption" 
                                className="text-lg md:text-xl theme-text"
                            >
                                Caption
                            </label>
                            <textarea
                                id="caption"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Share your experience..."
                                rows={4}
                                className="theme-input px-4 py-3 text-base md:text-lg resize-none"
                                disabled={isSubmitting}
                                maxLength={500}
                            />
                            <span className="text-sm theme-text-subtle text-right">
                                {caption.length}/500 characters
                            </span>
                        </div>

                        {/* Image Upload Module */}
                        <ImageUploadModule
                            className="w-full"
                            MAX_FILES={5}
                            imageUploadMode="create"
                            actionTrigger={uploadTrigger}
                            resourceId={createdPostId}
                            resourceLabel="Upload Images (Max 5)"
                            resourceLabelStyle="text-lg md:text-xl theme-text"
                            pic_url_Builder={(postId) => `cholo_bd/community/posts/${postId}/images`}
                            setFileReadyState={setFilesReadyState}
                            updateResourceMutation={handleImageUpload}
                            deleteResourceMutation={handleImageDelete}
                        />

                        {/* Info Text */}
                        <p className="text-sm theme-text-muted">
                            Note: You can add a caption and/or upload up to 5 images. At least one is required.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || (!caption.trim() && !filesReadyState)}
                                className="flex-1 green-button px-6 py-3 text-base md:text-lg font-medium 
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Creating Post..." : "Create Post"}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex-1 theme-outline px-6 py-3 text-base md:text-lg font-medium 
                                         rounded bg-transparent theme-text hover:bg-opacity-10 
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default CommunityPostCreateModal;
