import Link from "next/link";
import Image from "next/image";

type BookingOption = {
	title: string;
	slug: string;
	description: string;
	offer: string;
	imageSrc: string;
	imageAlt: string;
};

const options: BookingOption[] = [
	{
		title: "Hotel",
		slug: "hotel",
		description: "Handpicked hotels and resorts with verified reviews.",
		offer: "Exclusive 20% member discount",
		imageSrc: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80",
		imageAlt: "Resort hotel with pool",
	},
	{
		title: "Activity",
		slug: "activity",
		description: "Book local experiences, adventures, and activity spots.",
		offer: "Seasonal deals on top activities",
		imageSrc: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=900&q=80",
		imageAlt: "Outdoor adventure activity",
	},
	{
		title: "Guide",
		slug: "guide",
		description: "Hire verified local guides for tours and day trips.",
		offer: "Member rates on guided tours",
		imageSrc: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80",
		imageAlt: "Travelers on a guided tour",
	},
	{
		title: "Bus",
		slug: "bus",
		description: "Comfortable intercity buses and daily commuters.",
		offer: "Save 15% with wallet cashback",
		imageSrc: "https://images.unsplash.com/photo-1544620341-9adfb96ea2e2?w=900&q=80",
		imageAlt: "Intercity bus on the road",
	},
	{
		title: "Air Ways",
		slug: "flight",
		description: "Flights across Bangladesh and popular international routes.",
		offer: "Up to 25% off on select airlines",
		imageSrc: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80",
		imageAlt: "Airplane flying above the clouds",
	},
	{
		title: "Railway",
		slug: "railway",
		description: "Bangladesh Railway tickets and schedules across major routes.",
		offer: "Flat 10% off on early bookings",
		imageSrc: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=900&q=80",
		imageAlt: "Passenger train on railway tracks",
	}
];

export default function BookingLandingPage() {
	return (
		<div className="min-h-[70vh] w-full">
			<section className="mx-auto max-w-6xl px-4 py-8 md:py-10 font-sans">
				<div className="mb-6 md:mb-8">
					<h1 className="theme-text text-2xl font-semibold md:text-3xl">Booking Options</h1>
					<p className="theme-text-muted mt-2 text-sm md:text-base">
						Find the best deals on flights, buses, hotels, railways, activities, and guides. Enjoy seasonal offers and member-exclusive discounts.
					</p>
				</div>

				{/* Offers & Highlights */}
				<div className="grid gap-3 md:grid-cols-3 md:gap-4">
					<div className="theme-card rounded-lg p-4">
						<p className="theme-text text-sm font-medium">New Season Sale</p>
						<p className="theme-text-muted mt-1 text-xs">Save up to 25% on flights</p>
					</div>
					<div className="theme-card rounded-lg p-4">
						<p className="theme-text text-sm font-medium">Wallet Rewards</p>
						<p className="theme-text-muted mt-1 text-xs">Get 5% cashback on bus bookings</p>
					</div>
					<div className="theme-card rounded-lg p-4">
						<p className="theme-text text-sm font-medium">Member Exclusive</p>
						<p className="theme-text-muted mt-1 text-xs">Hotel deals with extra 20% off</p>
					</div>
				</div>

				{/* Booking Category Tiles: 1 col flex on small, 2×N grid on md+ */}
				<div className="mt-6 flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-5">
					{options.map((opt) => (
						<Link
							key={opt.slug}
							href={`/booking/${opt.slug}`}
							className="theme-outline group relative block h-56 overflow-hidden rounded-xl shadow-sm transition hover:shadow-md md:h-64"
						>
							{/* Background image with hover zoom */}
							<Image
								src={opt.imageSrc}
								alt={opt.imageAlt}
								fill
								sizes="(max-width: 768px) 100vw, 50vw"
								className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
							/>

							{/* Readability overlay */}
							<div
								className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/35 to-black/10"
								aria-hidden
							/>

							{/* Top Offer Badge */}
							<div className="theme-badge pointer-events-none absolute right-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold shadow-sm">
								{opt.offer}
							</div>

							{/* Tile Body */}
							<div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-4">
								<h3 className="text-lg font-semibold text-white">{opt.title}</h3>
								<p className="mt-1 line-clamp-2 text-sm text-white/85">{opt.description}</p>
								<div className="mt-3 flex items-center gap-2">
									<span className="text-xs font-medium text-white">Explore {opt.title.toLowerCase()}</span>
									<span className="text-white/70 transition group-hover:translate-x-0.5">→</span>
								</div>
							</div>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
