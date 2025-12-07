"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GreenButton } from "@/components/custom-elements/Buttons";
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities";

export default function PaymentConfirmationPage() {
    // const router = useRouter();
    // const searchParams = useSearchParams();
    // const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
    
    // // Mock payment status based on URL params or random for demo
    // useEffect(() => {
    //     const status = searchParams.get('status');
    //     const mockStatus = status || (Math.random() > 0.3 ? 'success' : 'failed');
    //     setPaymentStatus(mockStatus as 'success' | 'failed' | 'pending');
    // }, [searchParams]);

    // const getStatusIcon = () => {
    //     switch (paymentStatus) {
    //         case 'success': return '✅';
    //         case 'failed': return '❌';
    //         case 'pending': return '⏳';
    //         default: return '🔄';
    //     }
    // };

    // const getStatusMessage = () => {
    //     switch (paymentStatus) {
    //         case 'success': return 'Payment Successful!';
    //         case 'failed': return 'Payment Failed';
    //         case 'pending': return 'Processing Payment...';
    //         default: return 'Processing...';
    //     }
    // };

    // const getStatusColor = () => {
    //     switch (paymentStatus) {
    //         case 'success': return 'text-green-400';
    //         case 'failed': return 'text-red-400';
    //         case 'pending': return 'text-yellow-400';
    //         default: return 'text-gray-400';
    //     }
    // };

    // const mockTransactionData = {
    //     transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    //     amount: 1500,
    //     bonus: 150,
    //     total: 1650,
    //     paymentMethod: 'Credit Card',
    //     timestamp: new Date().toLocaleString(),
    // };

    return (
        <div className="flex flex-col p-6 space-y-6 w-full font-sans bg-gray-800 min-h-screen">
            

            {/* Footer Note */}
            <div className="max-w-2xl mx-auto w-full text-center text-gray-500 text-sm">
                <p>📧 A confirmation email has been sent to your registered email address.</p>
                <p className="mt-2">Need help? Contact our support team at support@cholobd.com</p>
            </div>
        </div>
    );
}