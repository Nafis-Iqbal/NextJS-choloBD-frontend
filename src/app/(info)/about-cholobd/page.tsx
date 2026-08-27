import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
    FeatureGrid,
    CommunitySection,
    Testimonials,
    NewsletterSection,
} from "@/components/page-content";
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities";

export const metadata: Metadata = {
    title: "About CholoBD",
    description:
        "Learn how CholoBD makes cashless travel across Bangladesh simple — QR payments, community trips, and traveler stories.",
};

const HERO_IMAGE = "/BDHeroImg.jpg";

const FEATURES = [
    { title: "QR Code Tickets & Entry", desc: "Scan once and enter — no paper tickets, no queues", link: "hotels" },
    { title: "Fully Cashless Payments", desc: "Pay with bKash, Nagad, cards or QR. No ATM hunts", link: "transport" },
    { title: "Instant Booking", desc: "Real-time availability for tours, buses, trains & ferries", link: "tours" },
    { title: "Secure & Trackable", desc: "All transactions protected. Track every payment in wallet", link: "community" },
    { title: "Digital Travel Wallet", desc: "Store tickets, passes & receipts in one place", link: "wallet" },
    { title: "Cashback & Deals", desc: "Exclusive offers on every QR payment", link: "deals" },
];

const FEATURES_FOCUS_TITLE = "Your Journey, Already Paid.";
const FEATURES_FOCUS_TEXT = "Pay upfront, then simply scan and enjoy—no cash, no ATMs, no payment hassles.";
const COMMUNITY_FOCUS_TEXT =
    "Connect with fellow travelers and create unforgettable group adventures. Join or form communities, split costs upfront on the platform, and enjoy shared QR experiences together. Make safer, more enjoyable trips with like-minded people — all while keeping the entire journey cash-free and convenient.";

export default function AboutCholoBDPage() {
    return (
        <main className="w-full bg-white theme-text">
            {/*
              Full-viewport hero breakout from the info layout's 70% content column.
              Uses 100vw centering so the image spans the screen without layout changes.
            */}
            <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen min-h-[52vh] overflow-hidden md:min-h-[58vh]">
                <Image
                    src={HERO_IMAGE}
                    alt="Bangladesh travel landscape"
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/45" />

                <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-5 py-16 text-center md:px-8 md:py-24">
                    <p className="font-satisfy text-5xl leading-none text-white md:text-7xl drop-shadow-md">CholoBD</p>
                    <h1 className="mt-5 max-w-2xl font-sans text-2xl font-semibold tracking-tight text-white md:text-4xl drop-shadow-md">
                        Cashless travel across Bangladesh, built around the journey.
                    </h1>
                    <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-white/90 md:text-base drop-shadow">
                        We help travelers book early, pay once, and move freely — hotels, transport, tours, guides, and
                        more — without chasing ATMs or carrying cash.
                    </p>
                    <Link
                        href="/"
                        className="theme-btn-teal group mt-8 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold tracking-wide"
                    >
                        Start exploring
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.25} />
                    </Link>
                </div>
            </section>

            <div className="mx-auto flex w-full max-w-6xl flex-col items-center space-y-12 bg-white px-3 py-12 md:space-y-16 md:px-6 md:py-16">
                <FeatureGrid
                    features={FEATURES}
                    className="w-full"
                    focusTitle={FEATURES_FOCUS_TITLE}
                    focusText={FEATURES_FOCUS_TEXT}
                />

                <HorizontalDivider className="w-full border-[var(--theme-border-subtle)]" />

                <CommunitySection className="w-full" focusText={COMMUNITY_FOCUS_TEXT} />

                <HorizontalDivider className="w-full border-[var(--theme-border-subtle)]" />

                <Testimonials className="w-full" animationSpeed={100} />

                <HorizontalDivider className="w-full border-[var(--theme-border-subtle)]" />

                <NewsletterSection className="w-full max-w-4xl" />
            </div>
        </main>
    );
}
