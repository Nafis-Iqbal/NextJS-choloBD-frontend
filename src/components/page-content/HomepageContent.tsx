import { ConfigApi } from "@/services/api";
import { HeroSection } from "@/types/enums";

import { HeroSectionImageViewer } from "../structure-components/HeroSectionImageViewer";

export const HomepageContent = async () => {
    //const productsData = await ProductApi.getProducts();
    const configData = await ConfigApi.getSiteConfig();
    
    //const products = productsData?.data || [];
    
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

            {/* <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-4 w-[95%] md:w-full [grid-auto-rows:1fr]">
                {(products ?? []).map((item, index) => (
                    (index % 2 === 0) && <ProductInfoCard key={index} productInfo={item}/>
                ))}
            </div> */}

            <HeroSectionImageViewer
                className="md:rounded-xl bg-gray-700 md:w-[110%]"
                imageList={middleHeroSectionImages.map(image => ({
                    imageURL: image.url,
                    imageAlt: image?.altText
                }))} 
            />

            {/* <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-4 w-[95%] md:w-full mb-10 md:mb-20 [grid-auto-rows:1fr]">
                {(products ?? []).map((item, index) => (
                    (index % 2 !== 0) && <ProductInfoCard key={index} productInfo={item}/>
                ))}
            </div> */}
        </div>
    );
};
