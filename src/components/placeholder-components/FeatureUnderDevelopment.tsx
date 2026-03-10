import { FaTools } from "react-icons/fa";
import { MdWarning } from "react-icons/md";

export const FeatureUnderDevelopment = ({moduleName} : {moduleName: string}) => {
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                <FaTools className="text-6xl text-blue-500 mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">{moduleName ? moduleName : "Transport Booking Tracker"}</h2>
                <p className="text-gray-400">
                    This feature is currently under development
                </p>
                <p className="text-gray-500 text-sm mt-2">Coming soon...</p>
                </div>
            </div>
        </div>
    );
}

export const PlaceholderFeatureWarning = ({moduleName} : {moduleName: string}) => {
    return (
        <div className="w-full bg-linear-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-600/50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <MdWarning className="text-2xl text-yellow-400 shrink-0" />
            <div className="flex-1 bg-transparent">
                <p className="text-yellow-100 font-semibold text-sm">
                    ⚠️ Simulated Data
                </p>
                <p className="text-yellow-200/80 text-xs mt-1">
                    The information displayed below is placeholder/simulated data for demonstration purposes only.
                </p>
            </div>
        </div>
    );
}