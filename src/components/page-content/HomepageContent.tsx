import { ConfigApi, TourBuilderApi } from "@/services/api";
import { HeroSection } from "@/types/enums";
import { HeroSectionBookingWidget } from "./HeroSectionBookingWidget";
import { FeatureGrid, TourSuggestions, HotelDeals, TransportTickets, 
    CommunitySection, Testimonials, NewsletterSection } from "./index";
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"

export const HomepageContent = async () => {
    let configData;
    try {
        configData = await ConfigApi.getSiteConfig();
    } catch (error) {
        console.error("Failed to fetch site config. Error:", error);
        configData = { data: null };
    }

    // Fetch tour data from API
    let tourPackagesTour: TourPackage[] = [];
    try {
        const tourResponse = await TourBuilderApi.getAllTourPlans();
        tourPackagesTour = tourResponse?.data || [];
    } catch (error) {
        console.error("Failed to fetch tours. Error:", error);
        tourPackagesTour = [];
    }

    type HeroImage = { url: string; altText?: string; section: HeroSection };
    const siteHeroSectionImages = (configData?.data?.heroImages as HeroImage[]) || [];
    const topHeroSectionImages = siteHeroSectionImages.filter((image) => image.section === HeroSection.TOP);
    const middleHeroSectionImages = siteHeroSectionImages.filter((image) => image.section === HeroSection.MIDDLE);
    const bottomHeroSectionImages = siteHeroSectionImages.filter((image) => image.section === HeroSection.BOTTOM);

    const features = [
        { title: "Hotel Book", desc: "Trusted stays, easy pay", link: "hotels" },
        { title: "Ride Tickets", desc: "Bus, train, air", link: "transport" },
        { title: "Smart Tours", desc: "Auto plan, quick tweaks", link: "tours" },
        { title: "Find Buddies", desc: "Meet travel friends", link: "community" },
        { title: "Local Guides", desc: "Tips from pros", link: "guides" },
        { title: "Wallet & Deals", desc: "Cashback and perks", link: "deals" },
    ];

    // Format tour data for display
    type Tour = { id: string; name: string; place: string; days: number; price: number; rating: number };
    const suggestedTours: Tour[] = tourPackagesTour.map((tour) => ({
        id: tour.id,
        name: tour.packageName,
        place: tour.location?.name || "N/A",
        days: tour.duration || 0,
        price: tour.totalBudget || 0,
        rating: tour.rating || 0,
    }));

    const tickets = [
        { id: "r1", type: "Bus", route: "Dhaka → Cox’s Bazar", price: 1400 },
        { id: "r2", type: "Train", route: "Dhaka → Sylhet", price: 900 },
        { id: "r3", type: "Air", route: "Dhaka → Chattogram", price: 5200 },
        { id: "r4", type: "Launch", route: "Dhaka → Barishal", price: 1200 },
    ];

    const buddies = [
        { id: "u1", name: "Nila", tag: "trekker", trips: 8 },
        { id: "u2", name: "Rafi", tag: "foodie", trips: 5 },
        { id: "u3", name: "Sumi", tag: "photog", trips: 12 },
        { id: "u4", name: "Tamal", tag: "chiller", trips: 6 },
    ];

    const testimonials = [
        { id: "s1", name: "Farah", quote: "Smooth booking and friendly help!", place: "Bandarban" },
        { id: "s2", name: "Imran", quote: "Tour builder saved my weekend.", place: "Sylhet" },
        { id: "s3", name: "Rhea", quote: "Found great hotel deals.", place: "Cox’s Bazar" },
    ];

    return (
        <div className="flex flex-col items-center space-y-10 md:space-y-16 w-full mx-auto">
            {/* Hero section with booking widget */}
            {/* <HeroSectionBookingWidget
                imageList={topHeroSectionImages ? topHeroSectionImages.map((image) => ({ imageURL: image.url, imageAlt: image?.altText })) : []}
            /> */}

            <HeroSectionBookingWidget
                imageList={[]}
            />

            <div className="flex flex-col items-center space-y-10 md:space-y-16 w-full px-1 mx-auto md:w-[85%]">
                {/* Key features */}
                <FeatureGrid features={features} className="min-h-[75vh]"/>
                <HorizontalDivider className="w-full border-gray-600 my-10" />

                {/* Hotel deals */}
                <HotelDeals className="min-h-[75vh]"/>
                <HorizontalDivider className="w-full border-gray-600 my-10" />

                {/* Transport tickets */}
                <TransportTickets tickets={tickets} className="min-h-[75vh]" />
                <HorizontalDivider className="w-full border-gray-600 my-10" />

                {/* Suggested tours from API */}
                <TourSuggestions tours={suggestedTours} className="min-h-[75vh]"/>
                <HorizontalDivider className="w-full border-gray-600 my-10" />

                {/* Community: find tour buddies */}
                <CommunitySection buddies={buddies} className="min-h-[75vh]"/>
                <HorizontalDivider className="w-full border-gray-600 my-10" />

                {/* SECTIONS ON GUIDES, WALLETS, & DEALS*/}

                {/* Testimonials */}
                <Testimonials items={testimonials} className="min-h-[75vh]"/>
                <HorizontalDivider className="w-full border-gray-600 my-10" />

                {/* Newsletter */}
                <NewsletterSection className="min-h-[50vh]"/>
            </div>
        </div>
    );
};
