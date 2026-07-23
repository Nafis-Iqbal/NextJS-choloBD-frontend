import Link from "next/link"
import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"

export default function DashboardPage() {
    return (
        <div className="flex flex-col p-2 space-y-2 justify-center w-full font-sans">
            <h1 className="ml-3 md:ml-6 mt-20">Dashboard</h1>
            <p className="ml-3 md:ml-6 theme-text-subtle">Welcome back. Let's get things done.</p>

            {/* Development Notice */}
            {/* <div className="mx-6 p-3 rounded-md" style={{backgroundColor: 'var(--theme-card-bg)', border: '1px solid var(--theme-deep-green)'}}>
                <p className="text-sm font-medium" style={{color: 'var(--theme-text-muted)'}}>
                    ⚠️ All Filters may not work at the moment. Most filters are under development
                </p>
            </div> */}

            <HorizontalDivider className="border-green-500 mb-0"/>
        </div>
    )
}