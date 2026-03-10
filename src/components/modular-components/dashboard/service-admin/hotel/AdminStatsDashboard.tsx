import { FeatureUnderDevelopment } from "@/components/placeholder-components/FeatureUnderDevelopment";

type AdminStats = {
  totalEarnings: number;
  monthlyEarnings: number;
  totalBookings: number;
  activeBookings: number;
  averageRoomPrice: number;
  occupancyRate: number;
  customerSatisfaction: number;
  totalComplaints: number;
};

const FAKE_ADMIN_STATS: AdminStats = {
  totalEarnings: 2042000,
  monthlyEarnings: 325000,
  totalBookings: 45,
  activeBookings: 8,
  averageRoomPrice: 6508,
  occupancyRate: 66.7,
  customerSatisfaction: 4.6,
  totalComplaints: 5,
};

// Stats Card Component
const StatCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
  trend?: string;
}> = ({ label, value, unit, icon, color, trend }) => (
  <div className={`${color} rounded-lg p-4 text-white`}>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-2xl font-bold">{value}</div>
        {unit && <div className="text-xs text-gray-200 mt-1">{unit}</div>}
        <div className="text-xs text-gray-300 mt-2">{label}</div>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
    {trend && (
      <div className="mt-2 text-xs text-green-200">📈 {trend}</div>
    )}
  </div>
);

export const AdminStatsDashboard = ({isReady = false, className} : {isReady?: boolean, className?: string}) => {
  const stats = FAKE_ADMIN_STATS;
  
  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-bold text-white mb-6">Admin Statistics</h2>
      
      {!isReady ? (
        <FeatureUnderDevelopment moduleName="Admin Statistics" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Earnings"
            value={`৳ ${(stats.totalEarnings / 100000).toFixed(1)}L`}
            icon="💰"
            color="bg-gradient-to-br from-green-600 to-green-700"
            trend="↑ 12% this month"
          />
          <StatCard
            label="Monthly Earnings"
            value={`৳ ${(stats.monthlyEarnings / 1000).toFixed(0)}K`}
            icon="📊"
            color="bg-gradient-to-br from-blue-600 to-blue-700"
            trend="↑ 8% vs last month"
          />
          <StatCard
            label="Active Bookings"
            value={stats.activeBookings}
            unit={`/ ${stats.totalBookings} total`}
            icon="📅"
            color="bg-gradient-to-br from-purple-600 to-purple-700"
          />
          <StatCard
            label="Occupancy Rate"
            value={stats.occupancyRate.toFixed(1)}
            unit="%"
            icon="🛏️"
            color="bg-gradient-to-br from-teal-600 to-teal-700"
          />
          <StatCard
            label="Avg Room Price"
            value={`৳ ${stats.averageRoomPrice.toLocaleString()}`}
            icon="💳"
            color="bg-gradient-to-br from-orange-600 to-orange-700"
          />
          <StatCard
            label="Customer Satisfaction"
            value={stats.customerSatisfaction}
            unit="/ 5"
            icon="⭐"
            color="bg-gradient-to-br from-yellow-600 to-yellow-700"
          />
          <StatCard
            label="Total Complaints"
            value={stats.totalComplaints}
            icon="⚠️"
            color="bg-gradient-to-br from-red-600 to-red-700"
          />
        </div>
      )}
    </section>
  );
};