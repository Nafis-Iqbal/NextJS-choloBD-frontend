import Link from "next/link";

type BookingOption = {
	title: string;
	slug: string;
	description: string;
	offer: string;
	emoji: string;
	bgFrom: string;
	bgTo: string;
};

const options: BookingOption[] = [
	{
		title: "Air Ways",
		slug: "flight",
		description: "Flights across Bangladesh and popular international routes.",
		offer: "Up to 25% off on select airlines",
		emoji: "✈️",
		bgFrom: "from-sky-400",
		bgTo: "to-indigo-500",
	},
	{
		title: "Bus",
		slug: "bus",
		description: "Comfortable intercity buses and daily commuters.",
		offer: "Save 15% with wallet cashback",
		emoji: "🚌",
		bgFrom: "from-emerald-400",
		bgTo: "to-green-500",
	},
	{
		title: "Hotel",
		slug: "hotel",
		description: "Handpicked hotels and resorts with verified reviews.",
		offer: "Exclusive 20% member discount",
		emoji: "🏨",
		bgFrom: "from-amber-400",
		bgTo: "to-orange-500",
	},
	{
		title: "Railway",
		slug: "railway",
		description: "Bangladesh Railway tickets and schedules across major routes.",
		offer: "Flat 10% off on early bookings",
		emoji: "🚆",
		bgFrom: "from-cyan-400",
		bgTo: "to-blue-500",
	},
];

export default function BookingLandingPage() {
	return (
		<div className="min-h-[70vh] w-full">
			<section className="mx-auto max-w-6xl px-4 py-8 md:py-10">
				<div className="mb-6 md:mb-8">
					<h1 className="text-2xl font-semibold md:text-3xl">Booking Options</h1>
					<p className="mt-2 text-sm text-gray-600 md:text-base">
						Find the best deals on flights, buses, hotels, and railways. Enjoy seasonal offers and member-exclusive discounts.
					</p>
				</div>

				{/* Offers & Highlights */}
				<div className="grid gap-3 md:grid-cols-3 md:gap-4">
					<div className="rounded-lg border border-gray-200 bg-white p-4">
						<p className="text-sm font-medium">New Season Sale</p>
						<p className="mt-1 text-xs text-gray-600">Save up to 25% on flights</p>
					</div>
					<div className="rounded-lg border border-gray-200 bg-white p-4">
						<p className="text-sm font-medium">Wallet Rewards</p>
						<p className="mt-1 text-xs text-gray-600">Get 5% cashback on bus bookings</p>
					</div>
					<div className="rounded-lg border border-gray-200 bg-white p-4">
						<p className="text-sm font-medium">Member Exclusive</p>
						<p className="mt-1 text-xs text-gray-600">Hotel deals with extra 20% off</p>
					</div>
				</div>

				{/* Booking Category Tiles */}
				<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{options.map((opt) => (
						<Link
							key={opt.slug}
							href={`/booking/${opt.slug}`}
							className="group relative block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
						>
							{/* Top Offer Badge */}
							<div className={`pointer-events-none absolute right-3 top-3 rounded-full bg-linear-to-br ${opt.bgFrom} ${opt.bgTo} px-3 py-1 text-xs font-semibold text-white shadow-sm`}> 
								{opt.offer}
							</div>

							{/* Tile Body */}
							<div className="flex h-40 flex-col justify-end bg-linear-to-br from-gray-50 to-gray-100 p-4">
								<div className="mb-2 text-3xl">
									<span aria-hidden>{opt.emoji}</span>
								</div>
								<h3 className="text-lg font-semibold">{opt.title}</h3>
								<p className="mt-1 line-clamp-2 text-sm text-gray-600">{opt.description}</p>
								<div className="mt-3 flex items-center gap-2">
									<span className="text-xs font-medium text-gray-700">Explore {opt.title.toLowerCase()}</span>
									<span className="text-gray-400 transition group-hover:translate-x-0.5">→</span>
								</div>
							</div>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}

