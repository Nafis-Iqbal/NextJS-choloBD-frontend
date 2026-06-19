"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MdArrowForward,
  MdCalendarToday,
  MdDirectionsBus,
  MdFlightTakeoff,
  MdLuggage,
  MdPeople,
  MdTrain,
} from "react-icons/md";

type TransportTab = "bus" | "train" | "flight";

type SearchForm = {
  from: string;
  to: string;
  date: string;
  passengers: string;
  classOrType: string;
};

type TransportResult = {
  id: number;
  title: string;
  route: string;
  depart: string;
  arrive: string;
  duration: string;
  type: string;
  price: number;
  seats: number;
};

type TransportTabConfig = {
  id: TransportTab;
  label: string;
  icon: React.ReactNode;
};

type TransportHeaderProps = {
  activeTab: TransportTab;
  activeLabel: string;
  onTabChange: (tab: TransportTab) => void;
  onFieldChange: (updates: Partial<SearchForm>) => void;
};

type TransportSearchPanelProps = {
  activeTab: TransportTab;
  activeLabel: string;
  form: SearchForm;
  onFieldChange: (updates: Partial<SearchForm>) => void;
};

type TransportResultsListProps = {
  results: TransportResult[];
  activeLabel: string;
  form: SearchForm;
  selectedResult: TransportResult | null;
  onSelect: (item: TransportResult) => void;
};

type ConfirmationModalProps = {
  isOpen: boolean;
  selectedResult: TransportResult | null;
  form: SearchForm;
  isConfirmed: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const cityOptions = [
  "Dhaka",
  "Chattogram",
  "Cox’s Bazar",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Barishal",
  "Rangpur",
];

const transportTabs: TransportTabConfig[] = [
  { id: "bus", label: "Bus", icon: <MdDirectionsBus className="text-xl" /> },
  { id: "train", label: "Train", icon: <MdTrain className="text-xl" /> },
  {
    id: "flight",
    label: "Flight",
    icon: <MdFlightTakeoff className="text-xl" />,
  },
];

const busResults: TransportResult[] = [
  {
    id: 1,
    title: "GreenLine",
    route: "Dhaka → Cox’s Bazar",
    depart: "07:30",
    arrive: "16:10",
    duration: "8h 40m",
    type: "Business",
    price: 1600,
    seats: 18,
  },
  {
    id: 2,
    title: "Hanif",
    route: "Dhaka → Chattogram",
    depart: "09:00",
    arrive: "15:30",
    duration: "6h 30m",
    type: "Economy",
    price: 900,
    seats: 35,
  },
  {
    id: 3,
    title: "Sakura",
    route: "Khulna → Dhaka",
    depart: "21:00",
    arrive: "05:30",
    duration: "8h 30m",
    type: "Sleeper",
    price: 1400,
    seats: 14,
  },
];

const trainResults: TransportResult[] = [
  {
    id: 1,
    title: "Subarna Express",
    route: "Dhaka → Chattogram",
    depart: "07:00",
    arrive: "12:20",
    duration: "5h 20m",
    type: "Chair",
    price: 550,
    seats: 42,
  },
  {
    id: 2,
    title: "Turna Nishita",
    route: "Dhaka → Chattogram",
    depart: "23:30",
    arrive: "05:30",
    duration: "6h 00m",
    type: "AC Berth",
    price: 900,
    seats: 18,
  },
  {
    id: 3,
    title: "Joyantika Express",
    route: "Dhaka → Sylhet",
    depart: "12:00",
    arrive: "18:40",
    duration: "6h 40m",
    type: "Shovon",
    price: 420,
    seats: 60,
  },
];

const flightResults: TransportResult[] = [
  {
    id: 1,
    title: "Biman Bangladesh",
    route: "Dhaka → Chattogram",
    depart: "08:10",
    arrive: "09:05",
    duration: "55m",
    type: "Economy",
    price: 4200,
    seats: 9,
  },
  {
    id: 2,
    title: "US-Bangla",
    route: "Dhaka → Cox’s Bazar",
    depart: "10:30",
    arrive: "11:40",
    duration: "1h 10m",
    type: "Premium Economy",
    price: 5800,
    seats: 16,
  },
  {
    id: 3,
    title: "Novoair",
    route: "Dhaka → Sylhet",
    depart: "13:15",
    arrive: "14:05",
    duration: "50m",
    type: "Business",
    price: 9200,
    seats: 6,
  },
];

const transportData: Record<TransportTab, TransportResult[]> = {
  bus: busResults,
  train: trainResults,
  flight: flightResults,
};

function getDefaultClassForTab(tab: TransportTab) {
  if (tab === "flight") return "Economy";
  if (tab === "train") return "Chair";
  return "Business";
}

function getClassOptions(tab: TransportTab) {
  if (tab === "flight") {
    return ["Economy", "Premium Economy", "Business"];
  }

  if (tab === "train") {
    return ["Chair", "Shovon", "First Class", "AC Berth"];
  }

  return ["Business", "Economy", "Sleeper"];
}

function getPassengerLabel(count: string) {
  return `${count} traveler${count !== "1" ? "s" : ""}`;
}

function getTotalPrice(result: TransportResult, passengers: string) {
  return result.price * Number(passengers || 1);
}

function TransportHeader({
  activeTab,
  activeLabel,
  onTabChange,
  onFieldChange,
}: TransportHeaderProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-100">
            Transport booking preview
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Book your next journey
          </h1>
        </div>
        <div className="flex gap-2 rounded-full bg-white/10 p-1 backdrop-blur-sm">
          {transportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                onFieldChange({
                  classOrType: getDefaultClassForTab(tab.id),
                });
              }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-white text-slate-900"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 text-sm text-emerald-50/90">
        {activeLabel} •{" "}
        {activeLabel === "Flight" ? "Fastest option" : "Popular route"}
      </div>
    </div>
  );
}

function TransportSearchPanel({
  activeTab,
  activeLabel,
  form,
  onFieldChange,
}: TransportSearchPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Search
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            {activeLabel} booking
          </h2>
        </div>
        <button className="rounded-full bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white">
          Search
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-600">From</label>
            <select
              value={form.from}
              onChange={(e) => onFieldChange({ from: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500"
            >
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600">To</label>
            <select
              value={form.to}
              onChange={(e) => onFieldChange({ to: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500"
            >
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-600">Date</label>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <MdCalendarToday className="text-slate-500" />
            <input
              type="date"
              value={form.date}
              onChange={(e) => onFieldChange({ date: e.target.value })}
              className="w-full bg-transparent outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-slate-600">Passengers</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <MdPeople className="text-slate-500" />
              <select
                value={form.passengers}
                onChange={(e) => onFieldChange({ passengers: e.target.value })}
                className="w-full bg-transparent outline-none"
              >
                <option value="1">1 Passenger</option>
                <option value="2">2 Passengers</option>
                <option value="3">3 Passengers</option>
                <option value="4">4 Passengers</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-600">
              {activeTab === "flight"
                ? "Cabin"
                : activeTab === "train"
                  ? "Class"
                  : "Coach"}
            </label>
            <select
              value={form.classOrType}
              onChange={(e) => onFieldChange({ classOrType: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-emerald-500"
            >
              {getClassOptions(activeTab).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Route</span>
            <button className="rounded-full bg-white p-1.5 shadow-sm">
              <MdArrowForward className="rotate-90" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400">From</p>
              <p className="font-semibold text-slate-900">{form.from}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">To</p>
              <p className="font-semibold text-slate-900">{form.to}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransportResultsList({
  results,
  activeLabel,
  form,
  selectedResult,
  onSelect,
}: TransportResultsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm text-slate-500">
            Showing {results.length} {activeLabel.toLowerCase()} options
          </p>
          <h3 className="text-xl font-semibold text-slate-900">
            {form.from} → {form.to}
          </h3>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
          <MdLuggage />
          {getPassengerLabel(form.passengers)}
        </div>
      </div>

      <div className="space-y-3">
        {results.map((item) => {
          const isSelected = selectedResult?.id === item.id;
          const totalPrice = getTotalPrice(item, form.passengers);

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 shadow-sm transition ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md"
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900">
                      {item.title}
                    </h4>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {item.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{item.route}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div>
                    <p className="text-slate-400">Depart</p>
                    <p className="font-medium text-slate-900">{item.depart}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Arrive</p>
                    <p className="font-medium text-slate-900">{item.arrive}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Duration</p>
                    <p className="font-medium text-slate-900">
                      {item.duration}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                  <p className="text-xs text-slate-400">Seats left</p>
                  <p className="font-semibold text-slate-900">{item.seats}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-slate-400">From</p>
                    <p className="text-xl font-semibold text-slate-900">
                      ৳{totalPrice}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelect(item)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                      isSelected
                        ? "bg-slate-900 text-white"
                        : "bg-emerald-500 text-white"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConfirmationModal({
  isOpen,
  selectedResult,
  form,
  isConfirmed,
  onClose,
  onConfirm,
}: ConfirmationModalProps) {
  if (!isOpen || !selectedResult) return null;

  const totalPrice = getTotalPrice(selectedResult, form.passengers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div
          className={`rounded-t-3xl border-b border-white/10 p-6 ${
            isConfirmed
              ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500"
              : "bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={`text-xs font-semibold uppercase tracking-[0.26em] ${
                  isConfirmed ? "text-emerald-50" : "text-emerald-200"
                }`}
              >
                {isConfirmed ? "Booking confirmed" : "Confirm booking"}
              </p>
              <h3 className="mt-2 text-2xl font-bold leading-tight text-white drop-shadow-sm sm:text-3xl">
                {selectedResult.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-6">
          {!isConfirmed ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Route</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedResult.route}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Travel time</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedResult.depart} → {selectedResult.arrive}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Passengers</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {form.passengers}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Seat type</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {form.classOrType}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Travel date</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {form.date}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Total price</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    ৳{totalPrice}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                Please review the details below before confirming your transport
                booking.
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Confirm booking
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl bg-emerald-50 p-5 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Payment successful
                </p>
                <h4 className="mt-2 text-3xl font-bold text-slate-900">
                  Booking Complete
                </h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Booking ID</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    TRX-{selectedResult.id}2026
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Passenger name</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    Demo Traveler
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Route</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedResult.route}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Travel date</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {form.date}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Seats</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {form.passengers}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Amount paid</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    ৳{totalPrice}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TransportReviewPage() {
  const [activeTab, setActiveTab] = useState<TransportTab>("bus");
  const [form, setForm] = useState<SearchForm>({
    from: "Dhaka",
    to: "Chattogram",
    date: "2026-06-25",
    passengers: "1",
    classOrType: getDefaultClassForTab("bus"),
  });
  const [selectedResult, setSelectedResult] = useState<TransportResult | null>(
    null,
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const results = useMemo(() => transportData[activeTab], [activeTab]);

  useEffect(() => {
    setSelectedResult((current) => {
      if (current && results.some((item) => item.id === current.id)) {
        return current;
      }
      return results[0] ?? null;
    });
    setIsConfirmed(false);
  }, [results]);

  const activeLabel =
    transportTabs.find((tab) => tab.id === activeTab)?.label ?? "Bus";

  const handleFieldChange = (updates: Partial<SearchForm>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSelect = (item: TransportResult) => {
    setSelectedResult(item);
    setIsConfirmOpen(true);
    setIsConfirmed(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ConfirmationModal
        isOpen={isConfirmOpen}
        selectedResult={selectedResult}
        form={form}
        isConfirmed={isConfirmed}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => setIsConfirmed(true)}
      />

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <TransportHeader
          activeTab={activeTab}
          activeLabel={activeLabel}
          onTabChange={(tab) => setActiveTab(tab)}
          onFieldChange={handleFieldChange}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <TransportSearchPanel
            activeTab={activeTab}
            activeLabel={activeLabel}
            form={form}
            onFieldChange={handleFieldChange}
          />

          <TransportResultsList
            results={results}
            activeLabel={activeLabel}
            form={form}
            selectedResult={selectedResult}
            onSelect={handleSelect}
          />
        </div>
      </section>
    </div>
  );
}
