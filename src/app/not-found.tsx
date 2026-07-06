"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DivGap, { Logo } from "@/components/custom-elements/UIUtilities";
import { FaHome, FaArrowLeft, FaSearch } from 'react-icons/fa';

export default function NotFound() {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-inherit theme-text flex flex-col font-sans">
            {/* Header with Logo */}
            <div className="w-full p-6 border-b theme-outline">
                <Logo position="text-center" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12 font-sans">
                <div className="text-center max-w-2xl mx-auto">
                    {/* Large Decorative 404 Section */}
                    <div className="mb-12 relative">
                        <div className="inline-block">
                            <div 
                                className="text-9xl md:text-10xl font-bold mb-2"
                                style={{ color: 'var(--theme-teal)' }}
                            >
                                4
                                <span 
                                    className="inline-block rounded-full w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mx-2"
                                    style={{ backgroundColor: 'var(--theme-teal)' }}
                                >
                                    <span className="text-white">0</span>
                                </span>
                                4
                            </div>
                        </div>
                    </div>

                    {/* Main Heading */}
                    <div className="mb-6">
                        <h1 className="text-4xl md:text-5xl font-bold theme-text mb-3">
                            Page Not Found
                        </h1>
                        <p className="text-lg theme-text-muted">
                            Looks like you've wandered off the beaten path
                        </p>
                    </div>

                    {/* Description */}
                    <div className="mb-10 p-6 rounded-lg" style={{ backgroundColor: 'var(--theme-section-bg)' }}>
                        <p className="text-base md:text-lg theme-text-muted mb-3">
                            The page you're looking for doesn't exist or has been moved. 
                        </p>
                        <p className="text-sm md:text-base theme-text-subtle">
                            But don't worry – our team is on it, and you can return home to continue exploring.
                        </p>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                        {/* Go Home Button */}
                        <Link 
                            href="/"
                            className="flex items-center gap-2 px-8 py-3 theme-btn-teal font-semibold rounded-lg 
                                     transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            <FaHome className="text-lg" />
                            <span>Go Home</span>
                        </Link>

                        {/* Go Back Button */}
                        <button 
                            onClick={handleGoBack}
                            className="flex items-center gap-2 px-8 py-3 theme-btn-teal font-semibold rounded-lg 
                                     transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            <FaArrowLeft className="text-lg" />
                            <span>Go Back</span>
                        </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="mb-8">
                        <p className="text-sm theme-text-subtle mb-4">Or explore these popular pages:</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link 
                                href="/hotels" 
                                className="px-4 py-2 rounded transition-colors duration-300 theme-text-teal hover:underline text-sm"
                            >
                                Hotels
                            </Link>
                            <span className="theme-text-subtle">•</span>
                            <Link 
                                href="/booking/flight" 
                                className="px-4 py-2 rounded transition-colors duration-300 theme-text-teal hover:underline text-sm"
                            >
                                Flights
                            </Link>
                            <span className="theme-text-subtle">•</span>
                            <Link 
                                href="/tour-spots" 
                                className="px-4 py-2 rounded transition-colors duration-300 theme-text-teal hover:underline text-sm"
                            >
                                Tour Spots
                            </Link>
                            <span className="theme-text-subtle">•</span>
                            <Link 
                                href="/user_profile" 
                                className="px-4 py-2 rounded transition-colors duration-300 theme-text-teal hover:underline text-sm"
                            >
                                Profile
                            </Link>
                        </div>
                    </div>

                    {/* Additional Help Section */}
                    <div 
                        className="mt-12 p-6 rounded-lg border"
                        style={{ 
                            backgroundColor: 'var(--theme-card-bg)',
                            borderColor: 'var(--theme-deep-green)'
                        }}
                    >
                        <p className="theme-text-subtle text-sm mb-3">Need help? Try these actions:</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <Link 
                                href="/"
                                className="flex items-center gap-2 px-4 py-2 text-sm rounded transition-colors duration-300"
                                style={{ 
                                    color: 'var(--theme-teal)',
                                    borderBottom: '1px solid var(--theme-teal)',
                                }}
                            >
                                <FaSearch className="text-sm" />
                                Search
                            </Link>
                            <span className="hidden sm:inline theme-text-subtle">|</span>
                            <Link 
                                href="/community"
                                className="theme-text-teal text-sm hover:underline transition-colors"
                            >
                                Community
                            </Link>
                            <span className="hidden sm:inline theme-text-subtle">|</span>
                            <a 
                                href="mailto:support@cholobd.com"
                                className="theme-text-teal text-sm hover:underline transition-colors"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div 
                className="w-full p-6 text-center border-t"
                style={{ borderColor: 'var(--theme-deep-green)' }}
            >
                <p className="theme-text-muted text-sm">
                    Made with care for your journey
                </p>
            </div>
        </div>
    );
}