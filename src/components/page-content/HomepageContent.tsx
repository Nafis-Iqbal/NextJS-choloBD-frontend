import { HeroSectionBookingWidget } from "./HeroSectionBookingWidget";
import {
    TourSuggestions,
    HotelDeals,
    GuideSuggestions,
    ActivitySuggestions,
    TransportTickets,
    FrequentlyAskedQuestions,
    MobileAppIntroduction,
} from "./index";
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities";

export const HomepageContent = () => {
    const tickets = [
        { id: "r1", type: "Bus", route: "Dhaka → Cox’s Bazar", price: 1400 },
        { id: "r2", type: "Train", route: "Dhaka → Sylhet", price: 900 },
        { id: "r3", type: "Air", route: "Dhaka → Chattogram", price: 5200 },
        { id: "r4", type: "Launch", route: "Dhaka → Barishal", price: 1200 },
    ];

    const hotelsFocusText =
        "Handpicked stays, upfront payments, and seamless QR check-in—all so you can relax from arrival.";
    const transportFocusText =
        "Prepay your journey and simply scan to board—no cash, tickets, or payment worries.";
    const toursFocusText =
        "Book your experience upfront and enjoy effortless access to every guide, entry, and activity along the way.";
    const activitiesFocusText =
        "From adventure to relaxation, discover activities that fit your style and plan them effortlessly in advance.";
    const guidesFocusText =
        "Connect with knowledgeable local guides and experience destinations through the eyes of someone who knows them best.";

    return (
        <div className="flex flex-col items-center space-y-10 md:space-y-16 w-full mx-auto">
            <HeroSectionBookingWidget imageList={[]} />

            <div className="flex flex-col items-center space-y-10 md:space-y-16 w-full px-1 mx-auto md:w-[70%]">
                <HotelDeals className="min-h-[50vh]" focusText={hotelsFocusText} />
                <HorizontalDivider className="w-full border-gray-600 mb-5" />

                <TransportTickets tickets={tickets} className="min-h-[50vh]" focusText={transportFocusText} />
                <HorizontalDivider className="w-full border-gray-600 mb-5" />

                <TourSuggestions className="min-h-[50vh]" focusText={toursFocusText} />
                <HorizontalDivider className="w-full border-gray-600 mb-5" />

                <ActivitySuggestions className="min-h-[50vh]" focusText={activitiesFocusText} />
                <HorizontalDivider className="w-full border-gray-600 mb-5" />

                <GuideSuggestions className="min-h-[50vh]" focusText={guidesFocusText} />
                <HorizontalDivider className="w-full border-gray-600 mb-5" />

                <FrequentlyAskedQuestions className="min-h-[50vh]" />
                <HorizontalDivider className="w-full border-gray-600 mb-5" />

                <MobileAppIntroduction className="min-h-[50vh] mb-20 md:mb-30" />
            </div>
        </div>
    );
};
