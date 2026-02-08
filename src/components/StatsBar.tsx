import { Building2, ShieldCheck, AlertTriangle, Users } from "lucide-react";
import { dashboardStats } from "@/data/mockData";

const stats = [
  {
    label: "Total Facilities",
    value: dashboardStats.totalFacilities.toLocaleString(),
    icon: Building2,
    color: "text-hub-blue",
    bg: "bg-hub-blue-light",
  },
  {
    label: "Verified",
    value: dashboardStats.verifiedFacilities.toLocaleString(),
    icon: ShieldCheck,
    color: "text-teal",
    bg: "bg-teal-light",
  },
  {
    label: "Cold Spots",
    value: dashboardStats.coldSpots.toLocaleString(),
    icon: AlertTriangle,
    color: "text-cold-spot",
    bg: "bg-cold-spot-light",
  },
  {
    label: "Population at Risk",
    value: (dashboardStats.populationAtRisk / 1000000).toFixed(1) + "M",
    icon: Users,
    color: "text-amber",
    bg: "bg-amber/10",
  },
];

const StatsBar = () => {
  return (
    <div className="grid grid-cols-2 gap-2 p-2 sm:gap-3 sm:p-3 md:p-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-2 sm:gap-3 rounded-lg border border-border bg-card p-2 sm:p-3"
        >
          <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
            <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-base sm:text-xl font-bold text-foreground truncate">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
