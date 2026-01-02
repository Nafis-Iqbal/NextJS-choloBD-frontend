import { ConfigApi } from "@/services/api";
import { HeroSection } from "@/types/enums";

import { HeroSectionImageViewer } from "../structure-components/HeroSectionImageViewer";

export const HomepageContent = async () => {
    let configData;
    try {
        configData = await ConfigApi.getSiteConfig();
        console.log(configData?.data);
    } catch (error) {
        console.error("Failed to fetch Tour Spot Details. Error: ", error);
        configData = {data: null};
    }
    
    const siteHeroSectionImages = configData?.data?.heroImages || [];
    const topHeroSectionImages = siteHeroSectionImages.filter(image => image.section === HeroSection.TOP);
    const middleHeroSectionImages = siteHeroSectionImages.filter(image => image.section === HeroSection.MIDDLE);
    const bottomHeroSectionImages = siteHeroSectionImages.filter(image => image.section === HeroSection.BOTTOM);

    return (
        <div className="flex flex-col items-center space-y-10 md:space-y-20 w-full mx-auto md:w-[85%] bg-gray-800">
            <HeroSectionImageViewer 
                className="md:rounded-xl bg-gray-700 mt-2 md:mt-10 md:w-[110%]"
                imageList={topHeroSectionImages.map(image => ({
                    imageURL: image.url,
                    imageAlt: image?.altText
                }))} 
            />


            <HeroSectionImageViewer
                className="md:rounded-xl bg-gray-700 md:w-[110%]"
                imageList={middleHeroSectionImages.map(image => ({
                    imageURL: image.url,
                    imageAlt: image?.altText
                }))} 
            />
        </div>
    );
};
