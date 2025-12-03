"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DivGap, { Logo } from "@/components/custom-elements/UIUtilities";
import { FaHome, FaArrowLeft, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

export default function NotFound() {
    const router = useRouter();

    const handleGoBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header with Logo */}
            <div className="w-full p-4">
                <Logo textSize="text-2xl md:text-3xl" position="text-center" />
            </div>

            <DivGap customHeightGap="h-[20px]" />

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="text-center max-w-2xl mx-auto">
                    {/* Error Icon */}
                    <div className="mb-8">
                        <FaExclamationTriangle className="mx-auto text-[#00FF99] text-8xl md:text-9xl animate-pulse" />
                    </div>

                    {/* Error Code */}
                    <div className="mb-6">
                        <h1 className="text-8xl md:text-9xl font-bold text-[#00FF99] mb-2">404</h1>
                        <h2 className="text-2xl md:text-3xl font-semibold text-white">Page Not Found</h2>
                    </div>

                    {/* Error Message */}
                    <div className="mb-8">
                        <p className="text-lg md:text-xl text-gray-300 mb-4">
                            Oops! The page you're looking for has vanished into the digital void.
                        </p>
                        <p className="text-md text-gray-400">
                            Don't worry, even the best explorers sometimes take a wrong turn.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        {/* Go Home Button */}
                        <Link 
                            href="/"
                            className="flex items-center gap-2 px-6 py-3 bg-[#00FF99] text-black font-semibold rounded-lg 
                                     hover:bg-[#00CC7A] transition-all duration-300 hover:scale-105 
                                     focus:outline-none focus:ring-2 focus:ring-[#00FF99] focus:ring-offset-2 focus:ring-offset-black"
                        >
                            <FaHome className="text-lg" />
                            <span>Go Home</span>
                        </Link>

                        {/* Go Back Button */}
                        <button 
                            onClick={handleGoBack}
                            className="flex items-center gap-2 px-6 py-3 border-2 border-[#00FF99] text-[#00FF99] font-semibold rounded-lg 
                                     hover:bg-[#00FF99] hover:text-black transition-all duration-300 hover:scale-105
                                     focus:outline-none focus:ring-2 focus:ring-[#00FF99] focus:ring-offset-2 focus:ring-offset-black"
                        >
                            <FaArrowLeft className="text-lg" />
                            <span>Go Back</span>
                        </button>

                        {/* Search Button */}
                        <Link 
                            href="/search"
                            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-600 text-gray-300 font-semibold rounded-lg 
                                     hover:border-[#00FF99] hover:text-[#00FF99] transition-all duration-300 hover:scale-105
                                     focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-black"
                        >
                            <FaSearch className="text-lg" />
                            <span>Search</span>
                        </Link>
                    </div>

                    <DivGap customHeightGap="h-[30px]" />

                    {/* Helpful Links */}
                    <div className="border-t border-gray-700 pt-6">
                        <p className="text-gray-400 mb-4">Looking for something specific?</p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <Link href="/shop" className="text-[#00FF99] hover:underline transition-colors">
                                Shop
                            </Link>
                            <Link href="/categories" className="text-[#00FF99] hover:underline transition-colors">
                                Categories
                            </Link>
                            <Link href="/cart" className="text-[#00FF99] hover:underline transition-colors">
                                Cart
                            </Link>
                            <Link href="/profile" className="text-[#00FF99] hover:underline transition-colors">
                                Profile
                            </Link>
                            <Link href="/contact" className="text-[#00FF99] hover:underline transition-colors">
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="w-full p-6 text-center border-t border-gray-800">
                <p className="text-gray-500 text-sm">
                    Developed by <span className="font-bold text-[#00FF99]">Nafis Iqbal</span>
                </p>
                <DivGap customHeightGap="h-[10px]" />
                <p className="text-gray-600 text-xs">
                    If you believe this is an error, please contact our support team.
                </p>
            </div>
        </div>
    );
}