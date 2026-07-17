"use client";

import { useRouter } from "next/navigation";

export default function PaymentConfirmationPage() {
    const router = useRouter();

    return (
        <div
            className="flex flex-col min-h-screen p-4 md:p-6 font-sans"
            style={{ backgroundColor: "var(--theme-bg)" }}
        >
            {/* Main Container */}
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md">
                    {/* Success Card */}
                    <div className="theme-card theme-outline rounded-lg p-8 space-y-6">
                        {/* Success Icon */}
                        <div className="flex justify-center">
                            <div
                                className="w-16 h-16 theme-outline-teal rounded-full flex items-center justify-center animate-pulse"
                                style={{
                                    backgroundColor:
                                        "color-mix(in srgb, var(--theme-teal) 20%, transparent)",
                                }}
                            >
                                <span className="text-4xl theme-text-teal">✓</span>
                            </div>
                        </div>

                        {/* Status Message */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold theme-text">Payment Successful</h1>
                            <p className="theme-text-muted text-sm">
                                Your payment has been processed successfully
                            </p>
                        </div>

                        {/* Divider */}
                        <div
                            className="border-t"
                            style={{ borderColor: "var(--theme-deep-green)" }}
                        />

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="w-full px-4 py-3 theme-btn-teal rounded-lg font-medium transition-colors"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => router.push("/")}
                                className="w-full px-4 py-2 theme-section theme-outline theme-text rounded-lg font-medium transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="text-center theme-text-subtle text-sm mt-8">
                <p>Need help? Contact our support team at support@cholobd.com</p>
            </div>
        </div>
    );
}
