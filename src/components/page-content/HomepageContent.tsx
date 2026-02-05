import { ConfigApi } from "@/services/api";
import { HeroSection } from "@/types/enums";
import { HeroSectionImageViewer } from "../structure-components/HeroSectionImageViewer";
import { FeatureGrid, TourSuggestions, BuildTourCTA, HotelDeals, TransportTickets, 
    CommunitySection, Testimonials, NewsletterSection } from "./index";

export const HomepageContent = async () => {
    let configData;
    try {
        configData = await ConfigApi.getSiteConfig();
    } catch (error) {
        console.error("Failed to fetch site config. Error:", error);
        configData = { data: null };
    }

    type HeroImage = { url: string; altText?: string; section: HeroSection };
    const siteHeroSectionImages = (configData?.data?.heroImages as HeroImage[]) || [];
    const topHeroSectionImages = siteHeroSectionImages.filter((image) => image.section === HeroSection.TOP);
    const middleHeroSectionImages = siteHeroSectionImages.filter((image) => image.section === HeroSection.MIDDLE);
    const bottomHeroSectionImages = siteHeroSectionImages.filter((image) => image.section === HeroSection.BOTTOM);

    // Fake data for homepage modules (no external packages)
    const features = [
        { title: "Smart Tours", desc: "Auto plan, quick tweaks" },
        { title: "Hotel Book", desc: "Trusted stays, easy pay" },
        { title: "Ride Tickets", desc: "Bus, train, air" },
        { title: "Find Buddies", desc: "Meet travel friends" },
        { title: "Wallet & Deals", desc: "Cashback and perks" },
        { title: "Local Guides", desc: "Tips from pros" },
    ];

    const suggestedTours = [
        { id: "t1", name: "Mystic Hills", place: "Sylhet", days: 3, price: 12999, rating: 4.6 },
        { id: "t2", name: "Sea Breeze", place: "Cox’s Bazar", days: 2, price: 9999, rating: 4.4 },
        { id: "t3", name: "River Glow", place: "Sundarbans", days: 4, price: 17999, rating: 4.7 },
        { id: "t4", name: "Heritage Walk", place: "Sonargaon", days: 1, price: 3999, rating: 4.2 },
    ];

    const hotels = [
        { id: "h1", name: "Sky Nest", city: "Dhaka", price: 3499, rating: 4.3 },
        { id: "h2", name: "Blue Bay", city: "Cox’s Bazar", price: 5499, rating: 4.6 },
        { id: "h3", name: "Tea Leaf", city: "Sylhet", price: 2899, rating: 4.1 },
        { id: "h4", name: "Forest Den", city: "Khulna", price: 3199, rating: 4.0 },
    ];

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
        <div className="flex flex-col items-center space-y-10 md:space-y-16 w-full mx-auto md:w-[85%]">
            {/* Hero banners from config (if available) */}
            <HeroSectionImageViewer
                className="md:rounded-xl bg-gray-800/60 mt-2 md:mt-8 md:w-[110%]"
                imageList={topHeroSectionImages.map((image) => ({ imageURL: image.url, imageAlt: image?.altText }))}
            />

            {/* Key features */}
            <FeatureGrid features={features} />

            {/* Suggested tours */}
            <TourSuggestions tours={suggestedTours} />

            {/* Build your tour CTA */}
            <BuildTourCTA />

            {/* Hotel deals */}
            <HotelDeals hotels={hotels} />

            {/* Transport tickets */}
            <TransportTickets tickets={tickets} />

            {/* Community: find tour buddies */}
            <CommunitySection buddies={buddies} />

            {/* Testimonials */}
            <Testimonials items={testimonials} />

            {/* Newsletter */}
            <NewsletterSection />

            {/* Optional bottom hero strip if provided */}
            {bottomHeroSectionImages?.length > 0 && (
                <HeroSectionImageViewer
                    className="md:rounded-xl bg-gray-800/60 md:w-[110%]"
                    imageList={bottomHeroSectionImages.map((image) => ({ imageURL: image.url, imageAlt: image?.altText }))}
                />
            )}
        </div>
    );
};
