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
        { title: "QR Code Tickets & Entry", desc: "Scan once and enter — no paper tickets, no queues", link: "hotels" },
        { title: "Fully Cashless Payments", desc: "Pay with bKash, Nagad, cards or QR. No ATM hunts", link: "transport" },
        { title: "Instant Booking", desc: "Real-time availability for tours, buses, trains & ferries", link: "tours" },
        { title: "Secure & Trackable", desc: "All transactions protected. Track every payment in wallet", link: "community" },
        { title: "Digital Travel Wallet", desc: "Store tickets, passes & receipts in one place", link: "wallet" },
        { title: "Cashback & Deals", desc: "Exclusive offers on every QR payment", link: "deals" },
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

    const testimonials = [
        { id: "s1", name: "Rashed", quote: "I went to Sylhet without carrying a single note. Everything was QR — game changer!", place: "Dhaka" },
        { id: "s2", name: "Nadia & Family", quote: "No more ATM lines in remote areas. The QR tickets made our family trip so relaxing.", place: "Cox's Bazar" },
        { id: "s3", name: "Karim", quote: "Finally a platform that understands Bangladesh travel realities.", place: "Chittagong" },
    ];

    // Focus text content for each section
    const featuresFocusText = "Experience travel like never before. Pay for all major expenses upfront on our platform, then simply scan QR codes at every step of your journey. From entry tickets to services, we’ve pre-settled the costs so you can explore Bangladesh freely — no cash, no ATM worries, just convenient scanning and peace of mind.";
    const hotelsFocusText = "Stay at handpicked hotels and resorts across Bangladesh with complete confidence. Pay for your accommodation upfront on our platform and enjoy instant QR check-in at your destination. Skip the cash payments and reception queues — your booking is already settled, leaving you free to relax and make the most of your trip.";
    const transportFocusText = "Travel smoothly between cities and destinations without cash stress. Book buses, trains, launches, and more in advance on our platform, then board using simple QR code scans. We handle the payments upfront so you can focus on the journey — reliable, cashless, and hassle-free travel across Bangladesh.";
    const toursFocusText = "Discover carefully curated tours and experiences tailored for you. Pay for the full package upfront, including guides, entries, and activities, then enjoy seamless QR access at every location. Our suggested tours remove the burden of on-site payments, letting you immerse yourself fully in the beauty of Bangladesh.";
    const communityFocusText = "Connect with fellow travelers and create unforgettable group adventures. Join or form communities, split costs upfront on the platform, and enjoy shared QR experiences together. Make safer, more enjoyable trips with like-minded people — all while keeping the entire journey cash-free and convenient.";

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
                <FeatureGrid features={features} className="min-h-[75vh]" focusText={featuresFocusText}/>
                <HorizontalDivider className="w-full border-gray-600 my-10" />

                {/* Hotel deals */}
                <HotelDeals className="min-h-[75vh]" focusText={hotelsFocusText}/>
                <HorizontalDivider className="w-full border-gray-600 my-10" />

                {/* Transport tickets */}
                <TransportTickets tickets={tickets} className="min-h-[75vh]" focusText={transportFocusText}/>
                <HorizontalDivider className="w-full border-gray-600 my-10" />

                {/* Suggested tours from API */}
                <TourSuggestions tours={suggestedTours} className="min-h-[75vh]" focusText={toursFocusText}/>
                <HorizontalDivider className="w-full border-gray-600 my-10" />

                {/* Community: find tour buddies */}
                <CommunitySection className="min-h-[75vh]" focusText={communityFocusText}/>
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
