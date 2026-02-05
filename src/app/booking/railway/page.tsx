"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";

type TrainTrip = {
  id: string;
  train: string;
  trainNo: string;
  from: string;
  to: string;
  departTime: string; // HH:mm
  arriveTime: string; // HH:mm
  duration: string; // e.g., 7h 30m
  classType: "Shovon" | "Chair" | "First Class" | "AC Berth";
  ac: boolean;
  express: boolean;
  price: number; // per passenger
  seatsLeft: number;
};

function parseDurationToMinutes(d: string) {
  let h = 0;
  let m = 0;
  const hMatch = d.match(/(\d+)h/);
  const mMatch = d.match(/(\d+)m/);
  if (hMatch) h = Number(hMatch[1]);
  if (mMatch) m = Number(mMatch[1]);
  return h * 60 + m;
}

function parseTimeToMinutes(t: string) {
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

function RailwayBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cityOptions = useMemo(
    () => [
      "Dhaka",
      "Chattogram",
      "Cox’s Bazar",
      "Sylhet",
      "Khulna",
      "Rajshahi",
      "Barishal",
      "Rangpur",
    ],
    []
  );

  const trips: TrainTrip[] = useMemo(
    () => [
      {
        id: "tr-101",
        train: "Subarna Express",
        trainNo: "702",
        from: "Dhaka",
        to: "Chattogram",
        departTime: "07:00",
        arriveTime: "12:20",
        duration: "5h 20m",
        classType: "Chair",
        ac: true,
        express: true,
        price: 550,
        seatsLeft: 42,
      },
      {
        id: "tr-102",
        train: "Turna Nishita",
        trainNo: "741",
        from: "Dhaka",
        to: "Chattogram",
        departTime: "23:30",
        arriveTime: "05:30",
        duration: "6h 00m",
        classType: "AC Berth",
        ac: true,
        express: true,
        price: 900,
        seatsLeft: 18,
      },
      {
        id: "tr-103",
        train: "Parabat Express",
        trainNo: "709",
        from: "Dhaka",
        to: "Sylhet",
        departTime: "06:35",
        arriveTime: "13:10",
        duration: "6h 35m",
        classType: "First Class",
        ac: false,
        express: true,
        price: 780,
        seatsLeft: 26,
      },
      {
        id: "tr-104",
        train: "Joyantika Express",
        trainNo: "717",
        from: "Dhaka",
        to: "Sylhet",
        departTime: "12:00",
        arriveTime: "18:40",
        duration: "6h 40m",
        classType: "Shovon",
        ac: false,
        express: true,
        price: 420,
        seatsLeft: 60,
      },
      {
        id: "tr-105",
        train: "Sundarban Express",
        trainNo: "725",
        from: "Dhaka",
        to: "Khulna",
        departTime: "08:15",
        arriveTime: "16:30",
        duration: "8h 15m",
        classType: "Chair",
        ac: true,
        express: false,
        price: 650,
        seatsLeft: 33,
      },
      {
        id: "tr-106",
        train: "Intercity Local",
        trainNo: "LC10",
        from: "Rajshahi",
        to: "Dhaka",
        departTime: "05:45",
        arriveTime: "12:10",
        duration: "6h 25m",
        classType: "Shovon",
        ac: false,
        express: false,
        price: 380,
        seatsLeft: 71,
      },
    ],
    []
  );

  const [form, setForm] = useState({
    from: "Dhaka",
    to: "Chattogram",
    date: "",
    passengers: "1",
    classType: "Any" as "Any" | TrainTrip["classType"],
    acOnly: false,
    expressOnly: false,
    sort: "price" as "price" | "duration" | "departTime",
  });

  const [selected, setSelected] = useState<TrainTrip | null>(null);

  // Prefill from URL
  useEffect(() => {
    const from = searchParams.get("from") || "Dhaka";
    const to = searchParams.get("to") || "Chattogram";
    const date = searchParams.get("date") || "";
    const passengers = searchParams.get("passengers") || "1";
    const classParam = searchParams.get("class") || "Any";
    const ac = (searchParams.get("ac") || "0") === "1";
    const ex = (searchParams.get("ex") || "0") === "1";
    const sortParam = searchParams.get("sort") || "price";

    const isValidClass = (v: string): v is "Any" | TrainTrip["classType"] =>
      ["Any", "Shovon", "Chair", "First Class", "AC Berth"].includes(v);
    const isValidSort = (v: string): v is typeof form.sort =>
      ["price", "duration", "departTime"].includes(v);

    setForm((p) => ({
      ...p,
      from: cityOptions.includes(from) ? from : p.from,
      to: cityOptions.includes(to) ? to : p.to,
      date,
      passengers,
      classType: isValidClass(classParam) ? classParam : "Any",
      acOnly: ac,
      expressOnly: ex,
      sort: isValidSort(sortParam) ? sortParam : "price",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const results = useMemo(() => {
    let list = trips
      .filter((t) => (form.from ? t.from === form.from : true))
      .filter((t) => (form.to ? t.to === form.to : true))
      .filter((t) => (form.classType === "Any" ? true : t.classType === form.classType))
      .filter((t) => (form.acOnly ? t.ac : true))
      .filter((t) => (form.expressOnly ? t.express : true));

    if (form.sort === "price") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (form.sort === "duration") {
      list = [...list].sort((a, b) => parseDurationToMinutes(a.duration) - parseDurationToMinutes(b.duration));
    } else if (form.sort === "departTime") {
      list = [...list].sort((a, b) => parseTimeToMinutes(a.departTime) - parseTimeToMinutes(b.departTime));
    }

    return list;
  }, [trips, form.from, form.to, form.classType, form.acOnly, form.expressOnly, form.sort]);

  const pushQuery = () => {
    const qs = new URLSearchParams();
    qs.set("from", form.from);
    qs.set("to", form.to);
    if (form.date) qs.set("date", form.date);
    qs.set("passengers", form.passengers);
    if (form.classType !== "Any") qs.set("class", form.classType);
    if (form.acOnly) qs.set("ac", "1");
    if (form.expressOnly) qs.set("ex", "1");
    if (form.sort !== "price") qs.set("sort", form.sort);
    router.push(`?${qs.toString()}`);
  };

  return (
    <div className="flex flex-col p-3 md:p-6 mt-5 font-sans">
      <div className="flex flex-col gap-2">
        <h3 className="text-green-500 font-fredericka">Railway Tickets</h3>
        <p className="text-green-200">Search trains, compare classes, and book seats (demo data).</p>
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
            <label className="text-sm text-gray-200">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
            />
          </div>

          <div className="md:col-span-1">
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
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-3">
            <label className="text-sm text-gray-200">Class</label>
            <select
              value={form.classType}
              onChange={(e) => {
                const val = e.target.value;
                const isValidClass = (v: string): v is "Any" | TrainTrip["classType"] =>
                  ["Any", "Shovon", "Chair", "First Class", "AC Berth"].includes(v);
                setForm((p) => ({ ...p, classType: isValidClass(val) ? val : "Any" }));
              }}
              className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-gray-100"
            >
              <option value="Any">Any</option>
              <option value="Shovon">Shovon</option>
              <option value="Chair">Chair</option>
              <option value="First Class">First Class</option>
              <option value="AC Berth">AC Berth</option>
            </select>
          </div>

          <div className="md:col-span-3">
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
                checked={form.acOnly}
                onChange={(e) => setForm((p) => ({ ...p, acOnly: e.target.checked }))}
              />
              AC only
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-200">
              <input
                type="checkbox"
                checked={form.expressOnly}
                onChange={(e) => setForm((p) => ({ ...p, expressOnly: e.target.checked }))}
              />
              Express only
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
                  passengers: "1",
                  classType: "Any",
                  acOnly: false,
                  expressOnly: false,
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
          <p className="text-xs text-gray-400">Tip: try URL like ?from=Dhaka&to=Sylhet&date=2026-02-10&class=Chair&ac=1&ex=1</p>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {results.length === 0 ? (
            <div className="rounded-xl border border-gray-700 bg-gray-900/30 p-5">
              <p className="text-gray-300">No trains found. Try changing route/filters.</p>
            </div>
          ) : (
            results.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-gray-700 bg-gray-900/30 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-white font-semibold">{t.train}</p>
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">{t.trainNo}</span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">{t.classType}</span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">{t.ac ? "AC" : "Non-AC"}</span>
                    {t.express ? (
                      <span className="text-xs px-2 py-1 rounded bg-indigo-700/40 text-indigo-200 border border-indigo-600/50">Express</span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-sm text-gray-300">
                    {t.from} → {t.to}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    {t.departTime} → {t.arriveTime} • {t.duration} • Seats left: {t.seatsLeft}
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3">
                  <div className="text-white font-semibold">৳ {t.price.toLocaleString()}</div>
                  <button className="green-button" onClick={() => setSelected(t)}>
                    Select
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Modal
        title={selected ? `Confirm Train (${selected.train} ${selected.trainNo})` : "Confirm Train"}
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
                {selected.departTime} → {selected.arriveTime} • {selected.duration}
              </p>
              <p className="text-sm text-gray-400">Class: {selected.classType} • {selected.ac ? "AC" : "Non-AC"} {selected.express ? "• Express" : ""}</p>
              <p className="text-sm text-gray-400">Passengers: {form.passengers}</p>
              <p className="text-sm text-gray-400">Date: {form.date || "(not selected)"}</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Total: ৳ {(selected.price * Number(form.passengers || 1)).toLocaleString()}</p>
              <button
                className="green-button"
                onClick={() => {
                  alert("Booking confirmed (demo). Next step: seat selection & payment.");
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

export default function RailwayBookingPage() {
  return (
    <Suspense fallback={<SuspenseFallback loadingText="railway tickets" />}>
      <RailwayBookingContent />
    </Suspense>
  );
}
