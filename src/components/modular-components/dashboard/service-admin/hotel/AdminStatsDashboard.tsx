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
  color?: string;
  trend?: string;
}> = ({ label, value, unit, icon, color, trend }) => (
  <div className="theme-card rounded-lg p-4">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-2xl font-bold theme-text">{value}</div>
        {unit && <div className="text-xs theme-text-subtle mt-1">{unit}</div>}
        <div className="text-xs theme-text-muted mt-2">{label}</div>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
    {trend && (
      <div className="mt-2 text-xs theme-text-teal">📈 {trend}</div>
    )}
  </div>
);

export const AdminStatsDashboard = ({isReady = false, className} : {isReady?: boolean, className?: string}) => {
  const stats = FAKE_ADMIN_STATS;
  
  return (
    <section className={`theme-section mb-8 ${className}`}>
      <h2 className="text-2xl font-bold theme-text mb-6">Admin Statistics</h2>
      
      {!isReady ? (
        <FeatureUnderDevelopment moduleName="Admin Statistics" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Earnings"
            value={`৳ ${(stats.totalEarnings / 100000).toFixed(1)}L`}
            icon="💰"
            trend="↑ 12% this month"
          />
          <StatCard
            label="Monthly Earnings"
            value={`৳ ${(stats.monthlyEarnings / 1000).toFixed(0)}K`}
            icon="📊"
            trend="↑ 8% vs last month"
          />
          <StatCard
            label="Active Bookings"
            value={stats.activeBookings}
            unit={`/ ${stats.totalBookings} total`}
            icon="📅"
          />
          <StatCard
            label="Occupancy Rate"
            value={stats.occupancyRate.toFixed(1)}
            unit="%"
            icon="🛏️"
          />
          <StatCard
            label="Avg Room Price"
            value={`৳ ${stats.averageRoomPrice.toLocaleString()}`}
            icon="💳"
          />
          <StatCard
            label="Customer Satisfaction"
            value={stats.customerSatisfaction}
            unit="/ 5"
            icon="⭐"
          />
          <StatCard
            label="Total Complaints"
            value={stats.totalComplaints}
            icon="⚠️"
          />
        </div>
      )}
    </section>
  );
};