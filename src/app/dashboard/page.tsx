"use client";

import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"

export default function DashboardPage() {
    // Auth redirect lives only in dashboard/layout.tsx — do not duplicate it here
    // (dual redirects + login's "if authenticated → dashboard" caused a bounce loop).

    return (
        <div className="flex flex-col p-2 space-y-2 justify-center w-full font-sans">
            <h1 className="ml-3 md:ml-6 mt-20">Dashboard</h1>
            <p className="ml-3 md:ml-6 theme-text-subtle">Welcome back. Let's get things done.</p>

            <HorizontalDivider className="border-green-500 mb-0"/>
        </div>
    )
}
