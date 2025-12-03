import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { apiFetchExternalURL } from "@/services/apiInstance";

interface ImageUploadButtonProps {
    className?: string;
    imageSrc: string;
    resourceId: string; // Made required (not optional)
    pic_url_Builder: (resourceId: string) => string;
    updateResourceMutation: ({id, imageUrl} : {id: string, imageUrl: string}) => void;
}

export const ImageUploadButton = ({
    className = "",
    imageSrc,
    resourceId,
    pic_url_Builder, 
    updateResourceMutation,
}: ImageUploadButtonProps) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // Create FormData for upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUD_UPLOAD_PRESET ?? "");
            formData.append("folder", pic_url_Builder(resourceId ?? ""));

            // Upload using apiFetchExternalURL
            const response = await apiFetchExternalURL(process.env.NEXT_PUBLIC_PIC_HOST ?? "", {
                method: 'POST',
                body: formData,
            });

            updateResourceMutation({
                id: resourceId,
                imageUrl: response.url,
            });
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setIsUploading(false);
            // Clear the input value to allow re-uploading the same file
            e.target.value = '';
        }
    };

    return (
        <label className={`hover:outline-1 cursor-pointer inline-block ${isUploading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            {/* Custom image that looks clickable */}
            <Image 
                src={imageSrc} 
                alt="upload icon" 
                width={22} 
                height={22}
                className={`transition-opacity ${isUploading ? 'animate-pulse' : 'hover:opacity-80'}`}
            />

            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                disabled={isUploading}
            />
        </label>
    );
};


