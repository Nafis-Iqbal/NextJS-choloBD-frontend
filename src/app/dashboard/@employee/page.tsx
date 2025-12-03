import { HorizontalDivider } from "@/components/custom-elements/UIUtilities"

export default function ConsumerDashboard() {

    return (
        <section className="flex flex-col p-2 font-sans" id="dashboard_consumer">
            <div className="md:ml-6 flex flex-col space-y-2">
                <h3 className="text-green-500">Your Transactions</h3>
                <p className="text-green-200">All your shopping records, in one place.</p>
            </div>
            
            <HorizontalDivider className="border-green-500 mt-15 md:mt-20"/>
        </section>
    )
}

