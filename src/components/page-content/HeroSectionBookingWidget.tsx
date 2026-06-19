/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { NextImage } from "../custom-elements/UIUtilities";
import { CustomDatePicker } from "../custom-elements/CustomInputElements";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { MdHotel, MdDirectionsBus, MdTrain, MdFlightTakeoff, MdTour, MdHiking } from "react-icons/md";
import { LocationApi } from "@/services/api";
import { HomeLanguageToggle } from "./HomeLanguageToggle";
import type { HomeMessages, SupportedHomeLocale } from "@/i18n/homeMessages";

type BookingTab = "hotels" | "bus" | "train" | "flight" | "tours" | "activities";

interface ImageProps {
  imageURL: string;
  imageAlt?: string;
}

interface HotelFilters {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  rooms: string;
}

interface BusFilters {
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  returnDate: string;
  passengers: string;
  busClass: string;
  tripType: "oneway" | "returntrip";
}

interface TrainFilters {
  departureStation: string;
  arrivalStation: string;
  departureDate: string;
  returnDate: string;
  passengers: string;
  trainClass: string;
  tripType: "oneway" | "returntrip";
}

interface FlightFilters {
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  returnDate: string;
  passengers: string;
  tripType: "oneway" | "roundtrip";
}

interface TourFilters {
  location: string;
  startDate: string;
  duration: string;
  tourists: string;
  tourType: string;
}

interface ActivityFilters {
  location: string;
  date: string;
  participants: string;
  activityType: string;
}

export const HeroSectionBookingWidget = ({
  imageList,
  className,
  copy,
  currentLocale,
  requiredFieldsAlert,
}: {
  imageList?: ImageProps[];
  className?: string;
  copy: HomeMessages["hero"];
  currentLocale: SupportedHomeLocale;
  requiredFieldsAlert: string;
}) => {
  // Provide fallback to BDHeroImg.jpg if no images provided
  const images = imageList && imageList.length > 0 ? imageList : [{ imageURL: "/BDHeroImg.jpg", imageAlt: "BD Hero" }];
  console.log("HeroSectionBookingWidget images:", images);
  const [displayedImageId, setDisplayedImageId] = useState<number>(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [activeTab, setActiveTab] = useState<BookingTab>("hotels");
  const [prevTab, setPrevTab] = useState<BookingTab>("hotels");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Fetch all locations once on component mount
  const { data: locationsResponse } = LocationApi.useGetAllLocationsRQ();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const isFullyInView = useInView(heroRef, { amount: 1 });

  const startAutoSlide = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isFullyInView) return;

    timerRef.current = setInterval(() => {
      setDirection("next");
      setDisplayedImageId((prev) => (prev + 1) % images.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length, isFullyInView]);

  const showNextImage = () => {
    setDirection("next");
    setDisplayedImageId((prev) => (prev + 1) % images.length);
    startAutoSlide();
  };

  const showPreviousImage = () => {
    setDirection("prev");
    setDisplayedImageId((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    startAutoSlide();
  };

  const tabs: { id: BookingTab; label: string; icon: React.ReactNode }[] = [
    { id: "hotels", label: copy.tabs.hotels, icon: <MdHotel className="text-xl" /> },
    { id: "bus", label: copy.tabs.bus, icon: <MdDirectionsBus className="text-xl" /> },
    { id: "train", label: copy.tabs.train, icon: <MdTrain className="text-xl" /> },
    { id: "flight", label: copy.tabs.flight, icon: <MdFlightTakeoff className="text-xl" /> },
    { id: "tours", label: copy.tabs.tours, icon: <MdTour className="text-xl" /> },
    { id: "activities", label: copy.tabs.activities, icon: <MdHiking className="text-xl" /> },
  ];

  const handleTabChange = (newTab: BookingTab) => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    const newIndex = tabs.findIndex(t => t.id === newTab);
    setDirection(newIndex > currentIndex ? "next" : "prev");
    setPrevTab(activeTab);
    setActiveTab(newTab);
  };

  const slideVariants = {
    enter: (direction: "next" | "prev") => ({
      x: direction === "next" ? 300 : -300,
      opacity: 0,
      transition: {
        duration: 0.08,
      },
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "next" | "prev") => ({
      x: direction === "next" ? -300 : 300,
      opacity: 0,
      transition: {
        duration: 0.08,
      },
    }),
  };

  const allLocations = locationsResponse?.data || [];

  return (
    <div
      className={`relative w-full min-h-screen md:min-h-[90vh] overflow-hidden bg-black font-sans ${className ?? ""}`}
    >
      {/* Background Image Carousel */}
      <motion.div 
        ref={heroRef} 
        //style={{ scale }} 
        className="absolute w-full h-full"
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={displayedImageId}
            custom={direction}
            variants={{
              enter: (dir: "next" | "prev") => ({
                x: dir === "next" ? 300 : -300,
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
              },
              exit: (dir: "next" | "prev") => ({
                x: dir === "next" ? -300 : 300,
                opacity: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full h-full"
          >
            <NextImage
              className="w-full h-full"
              src={images[displayedImageId]?.imageURL ?? "/BDHeroImg.jpg"}
              alt={images[displayedImageId]?.imageAlt ?? "Hero image"}
              priority={true}
              nextImageClassName="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Booking Widget Container - Centered */}
      <div className="relative flex mt-4 md:mt-24 px-3 md:px-6 pt-12 md:pt-16 pb-8 md:pb-12 items-start justify-center z-10 bg-transparent">
        <div className="w-full max-w-6xl flex flex-col">
          <div className="mb-4 flex justify-end">
            <HomeLanguageToggle locale={currentLocale} label={copy.toggle.label} />
          </div>
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-2 md:mb-8"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-6 drop-shadow-lg">
              {copy.title}
            </h1>
            <p className="text-base md:text-xl text-white/95 max-w-3xl mx-auto drop-shadow-md">
              {copy.subtitle}
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 md:gap-3 justify-center mb-4 md:mb-5 flex-shrink-0"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-black shadow-lg scale-105"
                    : "bg-white/65 text-gray-700 hover:bg-white/90"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Filter Content - Slides in/out */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 500, damping: 20 },
                opacity: { duration: 0.1 },
              }}
              className="w-full"
            >
              {activeTab === "hotels" && <HotelFilterPanel locations={allLocations} copy={copy.panels.hotels} requiredFieldsAlert={requiredFieldsAlert} />}
              {activeTab === "bus" && <BusFilterPanel locations={allLocations} copy={copy.panels.bus} requiredFieldsAlert={requiredFieldsAlert} />}
              {activeTab === "train" && <TrainFilterPanel locations={allLocations} copy={copy.panels.train} requiredFieldsAlert={requiredFieldsAlert} />}
              {activeTab === "flight" && <FlightFilterPanel locations={allLocations} copy={copy.panels.flight} requiredFieldsAlert={requiredFieldsAlert} />}
              {activeTab === "tours" && <TourFilterPanel locations={allLocations} copy={copy.panels.tours} requiredFieldsAlert={requiredFieldsAlert} />}
              {activeTab === "activities" && <ActivityFilterPanel locations={allLocations} copy={copy.panels.activities} requiredFieldsAlert={requiredFieldsAlert} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ─────── Hotel Filter Panel ─────── */
function HotelFilterPanel({
  locations,
  copy,
  requiredFieldsAlert,
}: {
  locations: Location[];
  copy: HomeMessages["hero"]["panels"]["hotels"];
  requiredFieldsAlert: string;
}) {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [filters, setFilters] = useState<HotelFilters>({
    city: "",
    checkIn: getTodayDate(),
    checkOut: "",
    guests: "2",
    rooms: "1",
  });

  const [locationSearch, setLocationSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const locationSuggestions = locations
    .filter(loc => loc.locationType === "DISTRICT")
    .filter(loc => {
      const term = locationSearch.trim().toLowerCase();
      if (!term) return false;
      const name = loc.name?.toLowerCase() || "";
      const city = loc.city?.toLowerCase() || "";
      const division = loc.division?.toLowerCase() || "";
      return name.includes(term) || city.includes(term) || division.includes(term);
    })
    .sort((a, b) => {
        const term = locationSearch.trim().toLowerCase();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const score = (loc: any) => {
            const name = loc.name?.toLowerCase() || "";
            const city = loc.city?.toLowerCase() || "";
            const division = loc.division?.toLowerCase() || "";

            if (name === term)return 300;
            if (name.startsWith(term)) return 250;

            if (city === term) return 200;
            if (city.startsWith(term)) return 150;

            if (division === term) return 100;
            if (division.startsWith(term)) return 50;

            return 10;
        };

        return score(b) - score(a);
    })
    .slice(0, 5);

  const handleLocationSelect = (locationName: string) => {
    setFilters({ ...filters, city: locationName });
    setLocationSearch(locationName);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    if (!filters.city || !filters.checkIn || !filters.checkOut) {
      alert(requiredFieldsAlert);
      return;
    }
    const qs = new URLSearchParams();
    qs.set("city", filters.city);
    qs.set("checkIn", filters.checkIn);
    qs.set("checkOut", filters.checkOut);
    qs.set("guests", filters.guests);
    qs.set("rooms", filters.rooms);
    window.location.href = `/booking/hotel?${qs.toString()}`;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xl">
      <h3 className="text-lg md:text-xl font-bold text-black mb-6">{copy.title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.destinationLabel}</label>
          <div className="relative">
            <input
              type="text"
              placeholder={copy.destinationPlaceholder}
              value={locationSearch}
              onChange={(e) => {
                setLocationSearch(e.target.value);
                setFilters({ ...filters, city: e.target.value });
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
            />
            {showSuggestions && locationSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-10 max-h-48 overflow-y-auto"
              >
                {locationSuggestions.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => handleLocationSelect(location.name)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 text-sm"
                  >
                    {location.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.checkInLabel}</label>
          <CustomDatePicker
            value={filters.checkIn}
            onChange={(value) => setFilters({ ...filters, checkIn: value })}
            placeholder={copy.checkInPlaceholder}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.checkOutLabel}</label>
          <CustomDatePicker
            value={filters.checkOut}
            onChange={(value) => setFilters({ ...filters, checkOut: value })}
            placeholder={copy.checkOutPlaceholder}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.guestsLabel}</label>
          <select
            value={filters.guests}
            onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {copy.guestsOptions.map((option, index) => (
              <option key={option} value={String(index + 1)}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.roomsLabel}</label>
          <select
            value={filters.rooms}
            onChange={(e) => setFilters({ ...filters, rooms: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {copy.roomsOptions.map((option, index) => (
              <option key={option} value={String(index + 1)}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full mt-6 px-4 py-2 bg-[var(--theme-teal)] hover:bg-[var(--theme-teal-hover)] text-white font-semibold rounded-lg transition"
      >
        {copy.button}
      </button>
      <p className="text-xs text-gray-600 text-center mt-3">{copy.footer}</p>
    </div>
  );
}

/* ─────── Bus Filter Panel ─────── */
function BusFilterPanel({
  locations,
  copy,
  requiredFieldsAlert,
}: {
  locations: Location[];
  copy: HomeMessages["hero"]["panels"]["bus"];
  requiredFieldsAlert: string;
}) {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [filters, setFilters] = useState<BusFilters>({
    departureCity: "",
    arrivalCity: "",
    departureDate: getTodayDate(),
    returnDate: "",
    passengers: "1",
    busClass: "standard",
    tripType: "oneway",
  });

  const handleSearch = () => {
    if (!filters.departureCity || !filters.arrivalCity || !filters.departureDate) {
      alert(requiredFieldsAlert);
      return;
    }
    const qs = new URLSearchParams();
    qs.set("from", filters.departureCity);
    qs.set("to", filters.arrivalCity);
    qs.set("date", filters.departureDate);
    qs.set("passengers", filters.passengers);
    qs.set("class", filters.busClass);
    qs.set("tripType", filters.tripType);
    window.location.href = `/booking/bus?${qs.toString()}`;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xl">
      <h3 className="text-lg md:text-xl font-bold text-black mb-6">{copy.title}</h3>
      <div className="mb-6">
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-black">
            <input
              type="radio"
              value="oneway"
              checked={filters.tripType === "oneway"}
            onChange={(e) => setFilters({ ...filters, tripType: e.target.value as "oneway" })}
              className="accent-[var(--theme-teal)]"
            />
            <span className="font-medium">{copy.oneWay}</span>
          </label>
          <label className="flex items-center gap-2 text-black">
            <input
              type="radio"
              value="returntrip"
              checked={filters.tripType === "returntrip"}
            onChange={(e) => setFilters({ ...filters, tripType: e.target.value as "returntrip" })}
              className="accent-[var(--theme-teal)]"
            />
            <span className="font-medium">{copy.returnTrip}</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.departureCityLabel}</label>
          <input
            type="text"
            placeholder={copy.departureCityPlaceholder}
            value={filters.departureCity}
            onChange={(e) => setFilters({ ...filters, departureCity: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.arrivalCityLabel}</label>
          <input
            type="text"
            placeholder={copy.arrivalCityPlaceholder}
            value={filters.arrivalCity}
            onChange={(e) => setFilters({ ...filters, arrivalCity: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.departureDateLabel}</label>
          <CustomDatePicker
            value={filters.departureDate}
            onChange={(value) => setFilters({ ...filters, departureDate: value })}
            placeholder={copy.departureDatePlaceholder}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.returnDateLabel}</label>
          <CustomDatePicker
            value={filters.returnDate}
            onChange={(value) => setFilters({ ...filters, returnDate: value })}
            placeholder={copy.returnDatePlaceholder}
            disabled={filters.tripType === "oneway"}
            disabledText={`💰 ${copy.returnDateDisabledText}`}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.passengersLabel}</label>
          <select
            value={filters.passengers}
            onChange={(e) => setFilters({ ...filters, passengers: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {copy.passengersOptions.map((option, index) => (
              <option key={option} value={String(index + 1)}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.busTypeLabel}</label>
          <select
            value={filters.busClass}
            onChange={(e) => setFilters({ ...filters, busClass: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            <option value="standard">{copy.busTypeOptions.standard}</option>
            <option value="ac">{copy.busTypeOptions.ac}</option>
            <option value="sleeper">{copy.busTypeOptions.sleeper}</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full mt-6 px-4 py-2 bg-[var(--theme-teal)] hover:bg-[var(--theme-teal-hover)] text-white font-semibold rounded-lg transition"
      >
        {copy.button}
      </button>
      <p className="text-xs text-gray-600 text-center mt-3">{copy.footer}</p>
    </div>
  );
}

/* ─────── Train Filter Panel ─────── */
function TrainFilterPanel({
  locations,
  copy,
  requiredFieldsAlert,
}: {
  locations: Location[];
  copy: HomeMessages["hero"]["panels"]["train"];
  requiredFieldsAlert: string;
}) {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [filters, setFilters] = useState<TrainFilters>({
    departureStation: "",
    arrivalStation: "",
    departureDate: getTodayDate(),
    returnDate: "",
    passengers: "1",
    trainClass: "general",
    tripType: "oneway",
  });

  const handleSearch = () => {
    if (!filters.departureStation || !filters.arrivalStation || !filters.departureDate) {
      alert(requiredFieldsAlert);
      return;
    }
    const qs = new URLSearchParams();
    qs.set("from", filters.departureStation);
    qs.set("to", filters.arrivalStation);
    qs.set("date", filters.departureDate);
    qs.set("passengers", filters.passengers);
    qs.set("class", filters.trainClass);
    qs.set("tripType", filters.tripType);
    window.location.href = `/booking/train?${qs.toString()}`;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xl">
      <h3 className="text-lg md:text-xl font-bold text-black mb-6">{copy.title}</h3>
      <div className="mb-6">
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-black">
            <input
              type="radio"
              value="oneway"
              checked={filters.tripType === "oneway"}
            onChange={(e) => setFilters({ ...filters, tripType: e.target.value as "oneway" })}
              className="accent-[var(--theme-teal)]"
            />
            <span className="font-medium">{copy.oneWay}</span>
          </label>
          <label className="flex items-center gap-2 text-black">
            <input
              type="radio"
              value="returntrip"
              checked={filters.tripType === "returntrip"}
            onChange={(e) => setFilters({ ...filters, tripType: e.target.value as "returntrip" })}
              className="accent-[var(--theme-teal)]"
            />
            <span className="font-medium">{copy.returnTrip}</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.fromStationLabel}</label>
          <input
            type="text"
            placeholder={copy.fromStationPlaceholder}
            value={filters.departureStation}
            onChange={(e) => setFilters({ ...filters, departureStation: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.toStationLabel}</label>
          <input
            type="text"
            placeholder={copy.toStationPlaceholder}
            value={filters.arrivalStation}
            onChange={(e) => setFilters({ ...filters, arrivalStation: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.departureDateLabel}</label>
          <CustomDatePicker
            value={filters.departureDate}
            onChange={(value) => setFilters({ ...filters, departureDate: value })}
            placeholder={copy.departureDatePlaceholder}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.returnDateLabel}</label>
          <CustomDatePicker
            value={filters.returnDate}
            onChange={(value) => setFilters({ ...filters, returnDate: value })}
            placeholder={copy.returnDatePlaceholder}
            disabled={filters.tripType === "oneway"}
            disabledText={`💰 ${copy.returnDateDisabledText}`}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.passengersLabel}</label>
          <select
            value={filters.passengers}
            onChange={(e) => setFilters({ ...filters, passengers: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {copy.passengersOptions.map((option, index) => (
              <option key={option} value={String(index + 1)}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.classLabel}</label>
          <select
            value={filters.trainClass}
            onChange={(e) => setFilters({ ...filters, trainClass: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            <option value="general">{copy.classOptions.general}</option>
            <option value="first">{copy.classOptions.first}</option>
            <option value="second">{copy.classOptions.second}</option>
            <option value="sleeper">{copy.classOptions.sleeper}</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full mt-6 px-4 py-2 bg-[var(--theme-teal)] hover:bg-[var(--theme-teal-hover)] text-white font-semibold rounded-lg transition"
      >
        {copy.button}
      </button>
      <p className="text-xs text-gray-600 text-center mt-3">{copy.footer}</p>
    </div>
  );
}

/* ─────── Flight Filter Panel ─────── */
function FlightFilterPanel({
  locations,
  copy,
  requiredFieldsAlert,
}: {
  locations: Location[];
  copy: HomeMessages["hero"]["panels"]["flight"];
  requiredFieldsAlert: string;
}) {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [filters, setFilters] = useState<FlightFilters>({
    departureCity: "",
    arrivalCity: "",
    departureDate: getTodayDate(),
    returnDate: "",
    passengers: "1",
    tripType: "oneway",
  });

  const handleSearch = () => {
    if (!filters.departureCity || !filters.arrivalCity || !filters.departureDate) {
      alert(requiredFieldsAlert);
      return;
    }
    const qs = new URLSearchParams();
    qs.set("from", filters.departureCity);
    qs.set("to", filters.arrivalCity);
    qs.set("departure", filters.departureDate);
    if (filters.tripType === "roundtrip" && filters.returnDate) {
      qs.set("return", filters.returnDate);
    }
    qs.set("passengers", filters.passengers);
    qs.set("tripType", filters.tripType);
    window.location.href = `/booking/flight?${qs.toString()}`;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xl">
      <h3 className="text-lg md:text-xl font-bold text-black mb-6">{copy.title}</h3>
      <div className="mb-6">
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-black">
            <input
              type="radio"
              value="oneway"
              checked={filters.tripType === "oneway"}
            onChange={(e) => setFilters({ ...filters, tripType: e.target.value as "oneway" })}
              className="accent-[var(--theme-teal)]"
            />
            <span className="font-medium">{copy.oneWay}</span>
          </label>
          <label className="flex items-center gap-2 text-black">
            <input
              type="radio"
              value="roundtrip"
              checked={filters.tripType === "roundtrip"}
            onChange={(e) => setFilters({ ...filters, tripType: e.target.value as "roundtrip" })}
              className="accent-[var(--theme-teal)]"
            />
            <span className="font-medium">{copy.roundTrip}</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.fromLabel}</label>
          <input
            type="text"
            placeholder={copy.fromPlaceholder}
            value={filters.departureCity}
            onChange={(e) => setFilters({ ...filters, departureCity: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.toLabel}</label>
          <input
            type="text"
            placeholder={copy.toPlaceholder}
            value={filters.arrivalCity}
            onChange={(e) => setFilters({ ...filters, arrivalCity: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.departureDateLabel}</label>
          <CustomDatePicker
            value={filters.departureDate}
            onChange={(value) => setFilters({ ...filters, departureDate: value })}
            placeholder={copy.departureDatePlaceholder}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.returnDateLabel}</label>
          <CustomDatePicker
            value={filters.returnDate}
            onChange={(value) => setFilters({ ...filters, returnDate: value })}
            placeholder={copy.returnDatePlaceholder}
            disabled={filters.tripType === "oneway"}
            disabledText={`💰 ${copy.returnDateDisabledText}`}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.passengersLabel}</label>
          <select
            value={filters.passengers}
            onChange={(e) => setFilters({ ...filters, passengers: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {copy.passengersOptions.map((option, index) => (
              <option key={option} value={String(index + 1)}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full mt-6 px-4 py-2 bg-[var(--theme-teal)] hover:bg-[var(--theme-teal-hover)] text-white font-semibold rounded-lg transition"
      >
        {copy.button}
      </button>
      <p className="text-xs text-gray-600 text-center mt-3">{copy.footer}</p>
    </div>
  );
}

/* ─────── Tour Filter Panel ─────── */
function TourFilterPanel({
  locations,
  copy,
  requiredFieldsAlert,
}: {
  locations: Location[];
  copy: HomeMessages["hero"]["panels"]["tours"];
  requiredFieldsAlert: string;
}) {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [filters, setFilters] = useState<TourFilters>({
    location: "",
    startDate: getTodayDate(),
    duration: "3",
    tourists: "2",
    tourType: "",
  });

  const [locationSearch, setLocationSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const locationSuggestions = locations
    .filter(loc => loc.locationType === "DISTRICT")
    .filter(loc => {
      const term = locationSearch.trim().toLowerCase();
      if (!term) return false;
      const name = loc.name?.toLowerCase() || "";
      const city = loc.city?.toLowerCase() || "";
      const division = loc.division?.toLowerCase() || "";
      return name.includes(term) || city.includes(term) || division.includes(term);
    })
    .sort((a, b) => {
        const term = locationSearch.trim().toLowerCase();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const score = (loc: any) => {
            const name = loc.name?.toLowerCase() || "";
            const city = loc.city?.toLowerCase() || "";
            const division = loc.division?.toLowerCase() || "";

            if (name === term)return 300;
            if (name.startsWith(term)) return 250;

            if (city === term) return 200;
            if (city.startsWith(term)) return 150;

            if (division === term) return 100;
            if (division.startsWith(term)) return 50;

            return 10;
        };

        return score(b) - score(a);
    })
    .slice(0, 5);

  const handleLocationSelect = (locationName: string) => {
    setFilters({ ...filters, location: locationName });
    setLocationSearch(locationName);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    if (!filters.location || !filters.startDate || !filters.duration) {
      alert(requiredFieldsAlert);
      return;
    }
    const qs = new URLSearchParams();
    qs.set("location", filters.location);
    qs.set("startDate", filters.startDate);
    qs.set("duration", filters.duration);
    qs.set("tourists", filters.tourists);
    if (filters.tourType) qs.set("type", filters.tourType);
    window.location.href = `/tour-builder?${qs.toString()}`;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xl">
      <h3 className="text-lg md:text-xl font-bold text-black mb-6">{copy.title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.tourTypeLabel}</label>
          <select
            value={filters.tourType}
            onChange={(e) => setFilters({ ...filters, tourType: e.target.value })}
            className="max-w-xs w-full text-sm md:text-base px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            <option value="">{copy.tourTypeOptions.any}</option>
            <option value="adventure">{copy.tourTypeOptions.adventure}</option>
            <option value="cultural">{copy.tourTypeOptions.cultural}</option>
            <option value="nature">{copy.tourTypeOptions.nature}</option>
            <option value="beach">{copy.tourTypeOptions.beach}</option>
            <option value="hiking">{copy.tourTypeOptions.hiking}</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.destinationLabel}</label>
          <div className="relative">
            <input
              type="text"
              placeholder={copy.destinationPlaceholder}
              value={locationSearch}
              onChange={(e) => {
                setLocationSearch(e.target.value);
                setFilters({ ...filters, location: e.target.value });
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
            />
            {showSuggestions && locationSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-10 max-h-48 overflow-y-auto"
              >
                {locationSuggestions.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => handleLocationSelect(location.name)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 text-sm"
                  >
                    {location.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.startDateLabel}</label>
          <CustomDatePicker
            value={filters.startDate}
            onChange={(value) => setFilters({ ...filters, startDate: value })}
            placeholder={copy.startDatePlaceholder}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.durationLabel}</label>
          <select
            value={filters.duration}
            onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {copy.durationOptions.map((option, index) => (
              <option key={option} value={String([1, 2, 3, 4, 5, 7, 10, 14][index])}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.touristsLabel}</label>
          <select
            value={filters.tourists}
            onChange={(e) => setFilters({ ...filters, tourists: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {copy.touristsOptions.map((option, index) => (
              <option key={option} value={String([1, 2, 3, 4, 5, 6, 8, 10][index])}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full mt-6 px-4 py-2 bg-[var(--theme-teal)] hover:bg-[var(--theme-teal-hover)] text-white font-semibold rounded-lg transition"
      >
        {copy.button}
      </button>
      <p className="text-xs text-gray-600 text-center mt-3">{copy.footer}</p>
    </div>
  );
}

/* ─────── Activity Filter Panel ─────── */
function ActivityFilterPanel({
  locations,
  copy,
  requiredFieldsAlert,
}: {
  locations: Location[];
  copy: HomeMessages["hero"]["panels"]["activities"];
  requiredFieldsAlert: string;
}) {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [filters, setFilters] = useState<ActivityFilters>({
    location: "",
    date: getTodayDate(),
    participants: "1",
    activityType: "",
  });

  const [locationSearch, setLocationSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const locationSuggestions = locations
    .filter((loc) => loc.locationType === "DISTRICT")
    .filter((loc) => {
      const term = locationSearch.trim().toLowerCase();
      if (!term) return false;
      const name = loc.name?.toLowerCase() || "";
      const city = loc.city?.toLowerCase() || "";
      const division = loc.division?.toLowerCase() || "";
      return name.includes(term) || city.includes(term) || division.includes(term);
    })
    .sort((a, b) => {
      const term = locationSearch.trim().toLowerCase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const score = (loc: any) => {
        const name = loc.name?.toLowerCase() || "";
        const city = loc.city?.toLowerCase() || "";
        const division = loc.division?.toLowerCase() || "";

        if (name === term) return 300;
        if (name.startsWith(term)) return 250;

        if (city === term) return 200;
        if (city.startsWith(term)) return 150;

        if (division === term) return 100;
        if (division.startsWith(term)) return 50;

        return 10;
      };

      return score(b) - score(a);
    })
    .slice(0, 5);

  const handleLocationSelect = (locationName: string) => {
    setFilters({ ...filters, location: locationName });
    setLocationSearch(locationName);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    if (!filters.location || !filters.date) {
      alert(requiredFieldsAlert);
      return;
    }
    const qs = new URLSearchParams();
    qs.set("location", filters.location);
    qs.set("date", filters.date);
    qs.set("participants", filters.participants);
    if (filters.activityType) qs.set("type", filters.activityType);
    window.location.href = `/activity-spots?${qs.toString()}`;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xl">
      <h3 className="text-lg md:text-xl font-bold text-black mb-6">{copy.title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.activityTypeLabel}</label>
          <select
            value={filters.activityType}
            onChange={(e) => setFilters({ ...filters, activityType: e.target.value })}
            className="max-w-xs w-full text-sm md:text-base px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            <option value="">{copy.activityTypeOptions.any}</option>
            <option value="adventure">{copy.activityTypeOptions.adventure}</option>
            <option value="water">{copy.activityTypeOptions.water}</option>
            <option value="trek">{copy.activityTypeOptions.trek}</option>
            <option value="cultural">{copy.activityTypeOptions.cultural}</option>
            <option value="extreme">{copy.activityTypeOptions.extreme}</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.locationLabel}</label>
          <div className="relative">
            <input
              type="text"
              placeholder={copy.locationPlaceholder}
              value={locationSearch}
              onChange={(e) => {
                setLocationSearch(e.target.value);
                setFilters({ ...filters, location: e.target.value });
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
            />
            {showSuggestions && locationSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-10 max-h-48 overflow-y-auto"
              >
                {locationSuggestions.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => handleLocationSelect(location.name)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 text-sm"
                  >
                    {location.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.activityDateLabel}</label>
          <CustomDatePicker
            value={filters.date}
            onChange={(value) => setFilters({ ...filters, date: value })}
            placeholder={copy.activityDatePlaceholder}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">{copy.participantsLabel}</label>
          <select
            value={filters.participants}
            onChange={(e) => setFilters({ ...filters, participants: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {copy.participantsOptions.map((option, index) => (
              <option key={option} value={String([1, 2, 3, 4, 5, 6, 8, 10][index])}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full mt-6 px-4 py-2 bg-[var(--theme-teal)] hover:bg-[var(--theme-teal-hover)] text-white font-semibold rounded-lg transition"
      >
        {copy.button}
      </button>
      <p className="text-xs text-gray-600 text-center mt-3">{copy.footer}</p>
    </div>
  );
}
