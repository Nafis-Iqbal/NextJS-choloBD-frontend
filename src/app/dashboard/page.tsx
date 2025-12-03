import Link from "next/link"
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"

export default function DashboardPage() {
    return (
        <div className="flex flex-col p-2 space-y-2 justify-center w-full font-sans bg-gray-700">
            <h1 className="ml-6">Dashboard</h1>
            <p className="ml-6 text-green-200">Welcome back. Let's get things done.</p>

            {/* Development Notice */}
            <div className="mx-6 p-3 border border-yellow-400 bg-yellow-50 rounded-md">
                <p className="text-yellow-800 text-sm font-medium">
                    ⚠️ All Filters may not work at the moment. Most filters are under development
                </p>
            </div>

            <HorizontalDivider className="border-green-500 mb-0"/>
        </div>
    )
}