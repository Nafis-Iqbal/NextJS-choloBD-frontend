import { TourBuilderApi } from "@/services/api";
import { HeroSection } from "@/types/enums";
import { getLocale } from "next-intl/server";

import { HeroSectionBookingWidget } from "./HeroSectionBookingWidget";
import {
  FeatureGrid,
  TourSuggestions,
  HotelDeals,
  TransportTickets,
  CommunitySection,
  Testimonials,
  NewsletterSection,
} from "./index";
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities";
import {
  homeMessages,
  type HomeMessages,
  type SupportedHomeLocale,
} from "@/i18n/homeMessages";

export const HomepageContent = async () => {
  const locale = (await getLocale()) as SupportedHomeLocale;
  const copy: HomeMessages = homeMessages[locale] ?? homeMessages.en;

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
  const siteHeroSectionImages: HeroImage[] = [];
  const topHeroSectionImages = siteHeroSectionImages.filter((image) => image.section === HeroSection.TOP);

  const features = copy.featureGrid.items;
  const tickets = copy.transportTickets.cards;
  const buddies = copy.community.buddies;
  const testimonials = copy.testimonials.items;

  type Tour = { id: string; name: string; place: string; days: number; price: number; rating: number };
  const suggestedTours: Tour[] = tourPackagesTour.map((tour) => ({
    id: tour.id,
    name: tour.packageName,
    place: tour.location?.name || copy.common.na,
    days: tour.duration || 0,
    price: tour.totalBudget || 0,
    rating: tour.rating || 0,
  }));

  return (
    <div className="flex flex-col items-center space-y-10 md:space-y-16 w-full mx-auto">
      <HeroSectionBookingWidget
        imageList={topHeroSectionImages ? topHeroSectionImages.map((image) => ({ imageURL: image.url, imageAlt: image?.altText })) : []}
        copy={copy.hero}
        currentLocale={locale}
        requiredFieldsAlert={copy.common.requiredFieldsAlert}
      />

      <div className="flex flex-col items-center space-y-10 md:space-y-16 w-full px-1 mx-auto md:w-[85%]">
        <FeatureGrid features={features} className="min-h-[75vh]" copy={copy.featureGrid} />
        <HorizontalDivider className="w-full border-gray-600 my-10" />

        <HotelDeals className="min-h-[75vh]" copy={copy.hotelDeals} />
        <HorizontalDivider className="w-full border-gray-600 my-10" />

        <TransportTickets tickets={tickets} className="min-h-[75vh]" copy={copy.transportTickets} />
        <HorizontalDivider className="w-full border-gray-600 my-10" />

        <TourSuggestions tours={suggestedTours} className="min-h-[75vh]" copy={copy.tourSuggestions} />
        <HorizontalDivider className="w-full border-gray-600 my-10" />

        <CommunitySection buddies={buddies} className="min-h-[75vh]" copy={copy.community} />
        <HorizontalDivider className="w-full border-gray-600 my-10" />

        <Testimonials items={testimonials} className="min-h-[75vh]" copy={copy.testimonials} />
        <HorizontalDivider className="w-full border-gray-600 my-10" />

        <NewsletterSection className="min-h-[50vh]" copy={copy.newsletter} />
      </div>
    </div>
  );
};
