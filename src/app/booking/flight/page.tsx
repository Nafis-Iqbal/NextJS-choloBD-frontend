"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

type Flight = {
  id: string;
  airline: string;
  flightNo: string;
  from: string;
  to: string;
  departTime: string; // HH:mm
  arriveTime: string; // HH:mm
  duration: string; // e.g., 1h 45m
  stops: number; // 0 = non-stop
  cabin: "Economy" | "Premium Economy" | "Business";
  refundable: boolean;
  price: number; // per passenger
  seatsLeft: number;
};

function parseDurationToMinutes(d: string) {
  // accepts formats like "1h 45m", "2h", "55m"
  let h = 0;
  let m = 0;
  const hMatch = d.match(/(\d+)h/);
  const mMatch = d.match(/(\d+)m/);
  if (hMatch) h = Number(hMatch[1]);
  if (mMatch) m = Number(mMatch[1]);
  return h * 60 + m;
}

function parseTimeToMinutes(t: string) {
  // HH:mm
  const [hh, mm] = t.split(":");
  const H = Number(hh || 0);
  const M = Number(mm || 0);
  return H * 60 + M;
}

function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-2xl rounded-xl border border-gray-700 bg-gray-900 p-4 md:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 sticky top-0 bg-gray-900">
          <h3 className="text-xl md:text-2xl font-semibold text-white">{title}</h3>
          <button className="green-underline-button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mt-4 font-sans">{children}</div>
      </div>
    </div>
  );
}

function AirBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cityOptions = useMemo(() => [
    "Dhaka",
    "Chattogram",
    "Cox’s Bazar",
    "Sylhet",
    "Khulna",
    "Rajshahi",
    "Barishal",
    "Rangpur",
  ], []);

  const flights: Flight[] = useMemo(() => [
    {
      id: "fly-1001",
      airline: "Biman Bangladesh",
      flightNo: "BG201",
      from: "Dhaka",
      to: "Chattogram",
      departTime: "08:10",
      arriveTime: "09:05",
      duration: "55m",
      stops: 0,
      cabin: "Economy",
      refundable: true,
      price: 4200,
      seatsLeft: 9,
    },
    {
      id: "fly-1002",
      airline: "US-Bangla",
      flightNo: "UB321",
      from: "Dhaka",
      to: "Cox’s Bazar",
      departTime: "10:30",
      arriveTime: "11:40",
      duration: "1h 10m",
      stops: 0,
      cabin: "Economy",
      refundable: false,
      price: 5800,
      seatsLeft: 16,
    },
    {
      id: "fly-1003",
      airline: "Novoair",
      flightNo: "VQ67",
      from: "Dhaka",
      to: "Sylhet",
      departTime: "13:15",
      arriveTime: "14:05",
      duration: "50m",
      stops: 0,
      cabin: "Business",
      refundable: true,
      price: 9200,
      seatsLeft: 6,
    },
    {
      id: "fly-1004",
      airline: "Biman Bangladesh",
      flightNo: "BG455",
      from: "Dhaka",
      to: "Cox’s Bazar",
      departTime: "18:10",
      arriveTime: "19:45",
      duration: "1h 35m",
      stops: 1,
      cabin: "Premium Economy",
      refundable: true,
      price: 7600,
      seatsLeft: 12,
    },
    {
      id: "fly-1005",
      airline: "US-Bangla",
      flightNo: "UB111",
      from: "Chattogram",
      to: "Dhaka",
      departTime: "07:00",
      arriveTime: "07:55",
      duration: "55m",
      stops: 0,
      cabin: "Economy",
      refundable: false,
      price: 4000,
      seatsLeft: 20,
    },
    {
      id: "fly-1006",
      airline: "Novoair",
      flightNo: "VQ90",
      from: "Rajshahi",
      to: "Dhaka",
      departTime: "16:20",
      arriveTime: "17:25",
      duration: "1h 5m",
      stops: 0,
      cabin: "Economy",
      refundable: true,
      price: 5200,
      seatsLeft: 14,
    },
    {
      id: "fly-1007",
      airline: "Biman Bangladesh",
      flightNo: "BG777",
      from: "Dhaka",
      to: "Cox’s Bazar",
      departTime: "20:00",
      arriveTime: "21:15",
      duration: "1h 15m",
      stops: 0,
      cabin: "Business",
      refundable: true,
      price: 9900,
      seatsLeft: 4,
    },
    {
      id: "fly-1008",
      airline: "US-Bangla",
      flightNo: "UB502",
      from: "Dhaka",
      to: "Chattogram",
      departTime: "12:45",
      arriveTime: "13:40",
      duration: "55m",
      stops: 0,
      cabin: "Premium Economy",
      refundable: false,
      price: 6100,
      seatsLeft: 11,
    },
  ], []);

  const [form, setForm] = useState({
    from: "Dhaka",
    to: "Chattogram",
    date: "",
    returnDate: "",
    passengers: "1",
    cabin: "Any" as "Any" | Flight["cabin"],
    nonstopOnly: false,
    refundableOnly: false,
    sort: "price" as "price" | "duration" | "departTime",
  });

  const [selected, setSelected] = useState<Flight | null>(null);

  // Prefill from URL
  useEffect(() => {
    const from = searchParams.get("from") || "Dhaka";
    const to = searchParams.get("to") || "Chattogram";
    const date = searchParams.get("date") || "";
    const ret = searchParams.get("return") || "";
    const passengers = searchParams.get("passengers") || "1";
    const cabinParam = searchParams.get("cabin") || "Any";
    const ns = (searchParams.get("ns") || "0") === "1";
    const rf = (searchParams.get("rf") || "0") === "1";
    const sortParam = searchParams.get("sort") || "price";

    const isValidCabin = (v: string): v is "Any" | Flight["cabin"] =>
      ["Any", "Economy", "Premium Economy", "Business"].includes(v);
    const isValidSort = (v: string): v is typeof form.sort =>
      ["price", "duration", "departTime"].includes(v);

    setForm((p) => ({
      ...p,
      from: cityOptions.includes(from) ? from : p.from,
      to: cityOptions.includes(to) ? to : p.to,
      date,
      returnDate: ret,
      passengers,
      cabin: isValidCabin(cabinParam) ? cabinParam : "Any",
      nonstopOnly: ns,
      refundableOnly: rf,
      sort: isValidSort(sortParam) ? sortParam : "price",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const results = useMemo(() => {
    let list = flights
      .filter((f) => (form.from ? f.from === form.from : true))
      .filter((f) => (form.to ? f.to === form.to : true))
      .filter((f) => (form.cabin === "Any" ? true : f.cabin === form.cabin))
      .filter((f) => (form.nonstopOnly ? f.stops === 0 : true))
      .filter((f) => (form.refundableOnly ? f.refundable : true));

    if (form.sort === "price") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (form.sort === "duration") {
      list = [...list].sort((a, b) => parseDurationToMinutes(a.duration) - parseDurationToMinutes(b.duration));
    } else if (form.sort === "departTime") {
      list = [...list].sort((a, b) => parseTimeToMinutes(a.departTime) - parseTimeToMinutes(b.departTime));
    }

    return list;
  }, [flights, form.from, form.to, form.cabin, form.nonstopOnly, form.refundableOnly, form.sort]);

  const pushQuery = () => {
    const qs = new URLSearchParams();
    qs.set("from", form.from);
    qs.set("to", form.to);
    if (form.date) qs.set("date", form.date);
    if (form.returnDate) qs.set("return", form.returnDate);
    qs.set("passengers", form.passengers);
    if (form.cabin !== "Any") qs.set("cabin", form.cabin);
    if (form.nonstopOnly) qs.set("ns", "1");
    if (form.refundableOnly) qs.set("rf", "1");
    if (form.sort !== "price") qs.set("sort", form.sort);
    router.push(`?${qs.toString()}`);
  };

  return (
    <div className="flex flex-col p-3 md:p-6 mt-5 font-sans">
      <div className="flex flex-col gap-2">
        <h3 className="text-green-500 font-fredericka">Air Tickets</h3>
        <p className="text-green-200">Search flights, compare fares, and book seats (demo data).</p>
      </div>

      <section className="mt-5 rounded-xl border border-green-900/60 bg-gray-900/40 p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-200">From</label>
            <select
              value={form.from}
              onChange={(e) => setForm((p) => ({ ...p, from: e.target.value }))}
              className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
            >
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-200">To</label>
            <select
              value={form.to}
              onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))}
              className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
            >
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="text-sm text-gray-200">Depart</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm text-gray-200">Return</label>
            <input
              type="date"
              value={form.returnDate}
              onChange={(e) => setForm((p) => ({ ...p, returnDate: e.target.value }))}
              className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-200">Passengers</label>
            <select
              value={form.passengers}
              onChange={(e) => setForm((p) => ({ ...p, passengers: e.target.value }))}
              className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
            >
              {["1", "2", "3", "4", "5", "6"].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-200">Cabin</label>
            <select
              value={form.cabin}
              onChange={(e) => {
                const val = e.target.value;
                const isValidCabin = (v: string): v is "Any" | Flight["cabin"] =>
                  ["Any", "Economy", "Premium Economy", "Business"].includes(v);
                setForm((p) => ({ ...p, cabin: isValidCabin(val) ? val : "Any" }));
              }}
              className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
            >
              <option value="Any">Any</option>
              <option value="Economy">Economy</option>
              <option value="Premium Economy">Premium Economy</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-200">Sort by</label>
            <select
              value={form.sort}
              onChange={(e) => {
                const val = e.target.value;
                const isValidSort = (v: string): v is typeof form.sort =>
                  ["price", "duration", "departTime"].includes(v);
                setForm((p) => ({ ...p, sort: isValidSort(val) ? val : "price" }));
              }}
              className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
            >
              <option value="price">Price (low first)</option>
              <option value="duration">Duration (short first)</option>
              <option value="departTime">Departure (early first)</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex gap-4">
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-200">
              <input
                type="checkbox"
                checked={form.nonstopOnly}
                onChange={(e) => setForm((p) => ({ ...p, nonstopOnly: e.target.checked }))}
              />
              Non-stop only
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-200">
              <input
                type="checkbox"
                checked={form.refundableOnly}
                onChange={(e) => setForm((p) => ({ ...p, refundableOnly: e.target.checked }))}
              />
              Refundable only
            </label>
          </div>

          <div className="flex gap-2">
            <button
              className="green-button"
              onClick={() => {
                if (form.from === form.to) return;
                pushQuery();
              }}
            >
              Search
            </button>
            <button
              className="green-underline-button"
              onClick={() => {
                setForm({
                  from: "Dhaka",
                  to: "Chattogram",
                  date: "",
                  returnDate: "",
                  passengers: "1",
                  cabin: "Any",
                  nonstopOnly: false,
                  refundableOnly: false,
                  sort: "price",
                });
                router.push("?");
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {form.from === form.to && (
          <p className="mt-3 text-red-300 text-sm">From and To cannot be the same.</p>
        )}
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-gray-200">
            Showing <span className="text-white font-medium">{results.length}</span> results for
            <span className="text-white font-medium"> {form.from}</span> →
            <span className="text-white font-medium"> {form.to}</span>
            {form.date ? <span className="text-gray-400"> ( {form.date} )</span> : null}
          </p>
          <p className="text-xs text-gray-400">Tip: try URL like ?from=Dhaka&to=Cox%E2%80%99s%20Bazar&date=2026-02-10&cabin=Economy&ns=1</p>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {results.length === 0 ? (
            <div className="rounded-xl border border-gray-700 bg-gray-900/30 p-5">
              <p className="text-gray-300">No flights found. Try changing route/filters.</p>
            </div>
          ) : (
            results.map((f) => (
              <div
                key={f.id}
                className="rounded-xl border border-gray-700 bg-gray-900/30 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-white font-semibold">{f.airline}</p>
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">{f.flightNo}</span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">{f.cabin}</span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">{f.stops === 0 ? "Non-stop" : `${f.stops} stop`}</span>
                    {f.refundable ? (
                      <span className="text-xs px-2 py-1 rounded bg-emerald-700/40 text-emerald-200 border border-emerald-600/50">Refundable</span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-sm text-gray-300">
                    {f.from} → {f.to}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    {f.departTime} → {f.arriveTime} • {f.duration} {f.stops > 0 ? `• ${f.stops} stop` : "• Non-stop"}
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3">
                  <div className="text-white font-semibold">৳ {f.price.toLocaleString()}</div>
                  <button className="green-button" onClick={() => setSelected(f)}>
                    Select
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Modal
        title={selected ? `Confirm Flight (${selected.airline} ${selected.flightNo})` : "Confirm Flight"}
        open={!!selected}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-3">
              <p className="text-gray-200">
                <span className="text-white font-medium">{selected.from}</span> → <span className="text-white font-medium">{selected.to}</span>
              </p>
              <p className="text-sm text-gray-400">
                {selected.departTime} → {selected.arriveTime} • {selected.duration} • {selected.stops === 0 ? "Non-stop" : `${selected.stops} stop`}
              </p>
              <p className="text-sm text-gray-400">Cabin: {selected.cabin} • {selected.refundable ? "Refundable" : "Non-refundable"}</p>
              <p className="text-sm text-gray-400">Passengers: {form.passengers}</p>
              <p className="text-sm text-gray-400">Depart: {form.date || "(not selected)"}{form.returnDate ? ` • Return: ${form.returnDate}` : ""}</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Total: ৳ {(selected.price * Number(form.passengers || 1)).toLocaleString()}</p>
              <button
                className="green-button"
                onClick={() => {
                  alert("Booking confirmed (demo). Next step: passenger details & payment.");
                  setSelected(null);
                }}
              >
                Confirm
              </button>
            </div>
            <p className="text-xs text-gray-500">Demo only — replace with your real booking flow.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function AirWaysBookingPage() {
  return (
    <Suspense fallback={<SuspenseFallback loadingText="air tickets" />}>
      <AirBookingContent />
    </Suspense>
  );
}
