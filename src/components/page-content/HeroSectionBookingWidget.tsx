/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { NextImage } from "../custom-elements/UIUtilities";
import { CustomDatePicker } from "../custom-elements/CustomInputElements";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { MdHotel, MdDirectionsBus, MdTrain, MdFlightTakeoff, MdTour, MdHiking } from "react-icons/md";
import { LocationApi } from "@/services/api";
import { RoomShift } from "@/types/enums";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

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
  shift: RoomShift;
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
}: {
  imageList?: ImageProps[];
  className?: string;
}) => {
  // Provide fallback to BDHeroImg.jpg if no images provided
  const images = imageList && imageList.length > 0 ? imageList : [{ imageURL: "/BDHeroImg.jpg", imageAlt: "BD Hero" }];
  
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
    { id: "hotels", label: "Hotels", icon: <MdHotel className="text-xl" /> },
    { id: "bus", label: "Bus", icon: <MdDirectionsBus className="text-xl" /> },
    { id: "train", label: "Train", icon: <MdTrain className="text-xl" /> },
    { id: "flight", label: "Flight", icon: <MdFlightTakeoff className="text-xl" /> },
    { id: "tours", label: "Tours", icon: <MdTour className="text-xl" /> },
    { id: "activities", label: "Activities", icon: <MdHiking className="text-xl" /> },
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
      className={`relative w-full h-screen md:h-[90vh] overflow-hidden bg-black font-sans ${className ?? ""}`}
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
      <div className="absolute inset-0 flex mt-4 md:mt-24 px-3 md:px-6 pt-12 md:pt-16 items-start justify-center z-10 bg-transparent ">
        <div className="w-full max-w-6xl flex flex-col">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-2 md:mb-8"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-6 drop-shadow-lg">
              Prepaid. QR Easy. Cash-Free Journeys.
            </h1>
            <p className="text-base md:text-xl text-white/95 max-w-3xl mx-auto drop-shadow-md">
              One payment covers your whole trip. Scan QR codes at every stop — hotels, bus terminals, 
              boats, attractions. We handle the rest.
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
              {activeTab === "hotels" && <HotelFilterPanel locations={allLocations} />}
              {activeTab === "bus" && <BusFilterPanel locations={allLocations} />}
              {activeTab === "train" && <TrainFilterPanel locations={allLocations} />}
              {activeTab === "flight" && <FlightFilterPanel locations={allLocations} />}
              {activeTab === "tours" && <TourFilterPanel locations={allLocations} />}
              {activeTab === "activities" && <ActivityFilterPanel locations={allLocations} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ─────── Hotel Filter Panel ─────── */
function HotelFilterPanel({ locations }: { locations: Location[] }) {
  const { openNotificationPopUpMessage } = useGlobalUI();
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
    shift: RoomShift.NIGHT,
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

  const handleShiftChange = (newShift: RoomShift) => {
    if (newShift !== RoomShift.ALL_DAY) {
      // Set checkout date to be the same as checkin date
      setFilters({ ...filters, shift: newShift, checkOut: filters.checkIn });
    } else {
      // If changing to ALL_DAY and checkout is the same as checkin, clear it
      if (filters.checkOut === filters.checkIn) {
        setFilters({ ...filters, shift: newShift, checkOut: "" });
      } else {
        setFilters({ ...filters, shift: newShift });
      }
    }
  };

  const handleSearch = () => {
    let validationFilters = filters;

    // Apply shift logic before validation
    if (filters.shift !== RoomShift.ALL_DAY) {
      validationFilters = { ...validationFilters, checkOut: validationFilters.checkIn };
    } else {
      if (validationFilters.checkOut === validationFilters.checkIn) {
        validationFilters = { ...validationFilters, checkOut: "" };
      }
    }

    if (!validationFilters.city || !validationFilters.checkIn || !validationFilters.checkOut) {
      openNotificationPopUpMessage("Please fill in all required fields");
      return;
    }
    const qs = new URLSearchParams();
    qs.set("city", validationFilters.city);
    qs.set("shift", RoomShift[validationFilters.shift]);
    qs.set("checkIn", validationFilters.checkIn);
    qs.set("checkOut", validationFilters.checkOut);
    qs.set("guests", validationFilters.guests);
    qs.set("rooms", validationFilters.rooms);
    window.location.href = `/booking/hotel?${qs.toString()}`;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xl">
      <h3 className="text-lg md:text-xl font-bold text-black mb-6">Book a Hotel</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Destination City</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search destination..."
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
        <div className="hidden md:flex md:flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Shift</label>
          <select
            value={filters.shift}
            onChange={(e) => handleShiftChange(parseInt(e.target.value) as RoomShift)}
            className="max-w-xs w-full text-sm md:text-base px-1 md:px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            <option value={RoomShift.ALL_DAY}>Whole Day</option>
            <option className="md:block" value={RoomShift.NIGHT}>Night (10 PM - 8 AM)</option>
            <option value={RoomShift.MORNING}>Morning (8 AM - 3 PM)</option>
            <option value={RoomShift.AFTERNOON}>Afternoon (3 PM - 10 PM)</option>
          </select>
        </div>
        <div className="flex flex-col md:hidden">
          <label className="text-sm font-semibold text-gray-700 mb-2">Shift</label>
          <select
            value={filters.shift}
            onChange={(e) => handleShiftChange(parseInt(e.target.value) as RoomShift)}
            className="max-w-xs w-full text-sm md:text-base px-1 md:px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            <option value={RoomShift.ALL_DAY}>Whole Day</option>
            <option className="md:block" value={RoomShift.NIGHT}>Night</option>
            <option value={RoomShift.MORNING}>Morning</option>
            <option value={RoomShift.AFTERNOON}>Afternoon</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Check-in Date</label>
          <CustomDatePicker
            value={filters.checkIn}
            onChange={(value) => setFilters({ ...filters, checkIn: value })}
            placeholder="Select Check-in Date"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Check-out Date</label>
          <CustomDatePicker
            value={filters.checkOut}
            onChange={(value) => setFilters({ ...filters, checkOut: value })}
            placeholder="Select Check-out Date"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Guests</label>
          <select
            value={filters.guests}
            onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} Guest{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Rooms</label>
          <select
            value={filters.rooms}
            onChange={(e) => setFilters({ ...filters, rooms: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} Room{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full mt-6 px-4 py-2 bg-[var(--theme-teal)] hover:bg-[var(--theme-teal-hover)] text-white font-semibold rounded-lg transition"
      >
        Find Cashless Hotels
      </button>
      <p className="text-xs text-gray-600 text-center mt-3">Join thousands exploring Cox's Bazar, Sylhet, Bandarban & more — completely hassle-free.</p>
    </div>
  );
}

/* ─────── Bus Filter Panel ─────── */
function BusFilterPanel({ locations }: { locations: Location[] }) {
  const { openNotificationPopUpMessage } = useGlobalUI();
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
      openNotificationPopUpMessage("Please fill in all required fields");
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
      <h3 className="text-lg md:text-xl font-bold text-black mb-6">Book a Bus</h3>
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
            <span className="font-medium">One-way</span>
          </label>
          <label className="flex items-center gap-2 text-black">
            <input
              type="radio"
              value="returntrip"
              checked={filters.tripType === "returntrip"}
              onChange={(e) => setFilters({ ...filters, tripType: e.target.value as "returntrip" })}
              className="accent-[var(--theme-teal)]"
            />
            <span className="font-medium">Return Trip</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Departure City</label>
          <input
            type="text"
            placeholder="From..."
            value={filters.departureCity}
            onChange={(e) => setFilters({ ...filters, departureCity: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Arrival City</label>
          <input
            type="text"
            placeholder="To..."
            value={filters.arrivalCity}
            onChange={(e) => setFilters({ ...filters, arrivalCity: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Departure Date</label>
          <CustomDatePicker
            value={filters.departureDate}
            onChange={(value) => setFilters({ ...filters, departureDate: value })}
            placeholder="Select Departure Date"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Return Date</label>
          <CustomDatePicker
            value={filters.returnDate}
            onChange={(value) => setFilters({ ...filters, returnDate: value })}
            placeholder="Select Return Date"
            disabled={filters.tripType === "oneway"}
            disabledText="💰 Save costs on return trip"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Passengers</label>
          <select
            value={filters.passengers}
            onChange={(e) => setFilters({ ...filters, passengers: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} Passenger{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Bus Type</label>
          <select
            value={filters.busClass}
            onChange={(e) => setFilters({ ...filters, busClass: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            <option value="standard">Standard</option>
            <option value="ac">AC</option>
            <option value="sleeper">Sleeper</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full mt-6 px-4 py-2 bg-[var(--theme-teal)] hover:bg-[var(--theme-teal-hover)] text-white font-semibold rounded-lg transition"
      >
        Get QR Bus Tickets
      </button>
      <p className="text-xs text-gray-600 text-center mt-3">Board instantly with QR — no queues, no paper tickets.</p>
    </div>
  );
}

/* ─────── Train Filter Panel ─────── */
function TrainFilterPanel({ locations }: { locations: Location[] }) {
  const { openNotificationPopUpMessage } = useGlobalUI();
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
      openNotificationPopUpMessage("Please fill in all required fields");
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
      <h3 className="text-lg md:text-xl font-bold text-black mb-6">Book a Train</h3>
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
            <span className="font-medium">One-way</span>
          </label>
          <label className="flex items-center gap-2 text-black">
            <input
              type="radio"
              value="returntrip"
              checked={filters.tripType === "returntrip"}
              onChange={(e) => setFilters({ ...filters, tripType: e.target.value as "returntrip" })}
              className="accent-[var(--theme-teal)]"
            />
            <span className="font-medium">Return Trip</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">From Station</label>
          <input
            type="text"
            placeholder="Departure station..."
            value={filters.departureStation}
            onChange={(e) => setFilters({ ...filters, departureStation: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">To Station</label>
          <input
            type="text"
            placeholder="Arrival station..."
            value={filters.arrivalStation}
            onChange={(e) => setFilters({ ...filters, arrivalStation: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Departure Date</label>
          <CustomDatePicker
            value={filters.departureDate}
            onChange={(value) => setFilters({ ...filters, departureDate: value })}
            placeholder="Select Departure Date"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Return Date</label>
          <CustomDatePicker
            value={filters.returnDate}
            onChange={(value) => setFilters({ ...filters, returnDate: value })}
            placeholder="Select Return Date"
            disabled={filters.tripType === "oneway"}
            disabledText="💰 Save costs on return trip"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Passengers</label>
          <select
            value={filters.passengers}
            onChange={(e) => setFilters({ ...filters, passengers: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} Passenger{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Class</label>
          <select
            value={filters.trainClass}
            onChange={(e) => setFilters({ ...filters, trainClass: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            <option value="general">General</option>
            <option value="first">First Class</option>
            <option value="second">Second Class</option>
            <option value="sleeper">Sleeper</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full mt-6 px-4 py-2 bg-[var(--theme-teal)] hover:bg-[var(--theme-teal-hover)] text-white font-semibold rounded-lg transition"
      >
        Get QR Train Tickets
      </button>
      <p className="text-xs text-gray-600 text-center mt-3">Travel smoothly with instant QR tickets — cashless & convenient.</p>
    </div>
  );
}

/* ─────── Flight Filter Panel ─────── */
function FlightFilterPanel({ locations }: { locations: Location[] }) {
  const { openNotificationPopUpMessage } = useGlobalUI();
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
      openNotificationPopUpMessage("Please fill in all required fields");
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
      <h3 className="text-lg md:text-xl font-bold text-black mb-6">Book a Flight</h3>
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
            <span className="font-medium">One-way</span>
          </label>
          <label className="flex items-center gap-2 text-black">
            <input
              type="radio"
              value="roundtrip"
              checked={filters.tripType === "roundtrip"}
              onChange={(e) => setFilters({ ...filters, tripType: e.target.value as "roundtrip" })}
              className="accent-[var(--theme-teal)]"
            />
            <span className="font-medium">Round-trip</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">From</label>
          <input
            type="text"
            placeholder="Departure city..."
            value={filters.departureCity}
            onChange={(e) => setFilters({ ...filters, departureCity: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">To</label>
          <input
            type="text"
            placeholder="Arrival city..."
            value={filters.arrivalCity}
            onChange={(e) => setFilters({ ...filters, arrivalCity: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Departure Date</label>
          <CustomDatePicker
            value={filters.departureDate}
            onChange={(value) => setFilters({ ...filters, departureDate: value })}
            placeholder="Select Departure Date"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Return Date</label>
          <CustomDatePicker
            value={filters.returnDate}
            onChange={(value) => setFilters({ ...filters, returnDate: value })}
            placeholder="Select Return Date"
            disabled={filters.tripType === "oneway"}
            disabledText="💰 Save costs on round trip"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Passengers</label>
          <select
            value={filters.passengers}
            onChange={(e) => setFilters({ ...filters, passengers: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} Passenger{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full mt-6 px-4 py-2 bg-[var(--theme-teal)] hover:bg-[var(--theme-teal-hover)] text-white font-semibold rounded-lg transition"
      >
        Find Cashless Flights
      </button>
      <p className="text-xs text-gray-600 text-center mt-3">Skip the hassle — pay with bKash, Nagad or QR instantly.</p>
    </div>
  );
}

/* ─────── Tour Filter Panel ─────── */
function TourFilterPanel({ locations }: { locations: Location[] }) {
  const { openNotificationPopUpMessage } = useGlobalUI();
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
      openNotificationPopUpMessage("Please fill in all required fields");
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
      <h3 className="text-lg md:text-xl font-bold text-black mb-6">Plan a Tour</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Tour Type</label>
          <select
            value={filters.tourType}
            onChange={(e) => setFilters({ ...filters, tourType: e.target.value })}
            className="max-w-xs w-full text-sm md:text-base px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            <option value="">-- Any Tour Type --</option>
            <option value="adventure">Adventure</option>
            <option value="cultural">Cultural</option>
            <option value="nature">Nature</option>
            <option value="beach">Beach</option>
            <option value="hiking">Hiking</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Destination</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search destination..."
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
          <label className="text-sm font-semibold text-gray-700 mb-2">Start Date</label>
          <CustomDatePicker
            value={filters.startDate}
            onChange={(value) => setFilters({ ...filters, startDate: value })}
            placeholder="Select Start Date"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Duration</label>
          <select
            value={filters.duration}
            onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {[1, 2, 3, 4, 5, 7, 10, 14].map((d) => (
              <option key={d} value={d}>
                {d} Day{d > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Tourists</label>
          <select
            value={filters.tourists}
            onChange={(e) => setFilters({ ...filters, tourists: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10].map((t) => (
              <option key={t} value={t}>
                {t} Tourist{t > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full mt-6 px-4 py-2 bg-[var(--theme-teal)] hover:bg-[var(--theme-teal-hover)] text-white font-semibold rounded-lg transition"
      >
        Explore Cashless Tours
      </button>
      <p className="text-xs text-gray-600 text-center mt-3">All-inclusive tours with QR payments — no cash needed anywhere.</p>
    </div>
  );
}

/* ─────── Activity Filter Panel ─────── */
function ActivityFilterPanel({ locations }: { locations: Location[] }) {
  const { openNotificationPopUpMessage } = useGlobalUI();
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
    if (!filters.location || !filters.date) {
      openNotificationPopUpMessage("Please fill in all required fields");
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
      <h3 className="text-lg md:text-xl font-bold text-black mb-6">Find Activities</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Activity Type</label>
          <select
            value={filters.activityType}
            onChange={(e) => setFilters({ ...filters, activityType: e.target.value })}
            className="max-w-xs w-full text-sm md:text-base px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            <option value="">-- Any Activity Type --</option>
            <option value="adventure">Adventure Sports</option>
            <option value="water">Water Sports</option>
            <option value="trek">Trekking</option>
            <option value="cultural">Cultural</option>
            <option value="extreme">Extreme Sports</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Location</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search location..."
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
          <label className="text-sm font-semibold text-gray-700 mb-2">Activity Date</label>
          <CustomDatePicker
            value={filters.date}
            onChange={(value) => setFilters({ ...filters, date: value })}
            placeholder="Select Activity Date"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">Participants</label>
          <select
            value={filters.participants}
            onChange={(e) => setFilters({ ...filters, participants: e.target.value })}
            className="max-w-xs w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--theme-teal)] text-black"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10].map((p) => (
              <option key={p} value={p}>
                {p} Participant{p > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full mt-6 px-4 py-2 bg-[var(--theme-teal)] hover:bg-[var(--theme-teal-hover)] text-white font-semibold rounded-lg transition"
      >
        Book QR Activities
      </button>
      <p className="text-xs text-gray-600 text-center mt-3">Seamless experiences — pay once, enjoy everything with QR.</p>
    </div>
  );
}
