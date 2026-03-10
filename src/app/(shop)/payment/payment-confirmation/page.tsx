"use client";

import { useRouter } from "next/navigation";

export default function PaymentConfirmationPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 p-4 md:p-6 font-sans">
            {/* Main Container */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md">
                    {/* Success Card */}
                    <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-8 space-y-6">
                        {/* Success Icon */}
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-green-600/20 border border-green-600 rounded-full flex items-center justify-center animate-pulse">
                                <span className="text-4xl text-green-400">✓</span>
                            </div>
                        </div>

                        {/* Status Message */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold text-white">Payment Successful</h1>
                            <p className="text-gray-400 text-sm">Your payment has been processed successfully</p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-700"></div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-gray-500 text-sm mt-8">
                <p>Need help? Contact our support team at support@cholobd.com</p>
            </div>
        </div>
    );
}