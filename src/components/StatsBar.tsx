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
    <div className="grid grid-cols-4 gap-1.5 px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2 border-b border-border bg-muted/30">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-1.5 sm:gap-2 rounded-md border border-border bg-card px-2 py-1.5 sm:px-3 sm:py-2"
        >
          <div className={`flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md ${stat.bg}`}>
            <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="text-sm sm:text-base font-bold text-foreground leading-tight">{stat.value}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{stat.label}</p>
          </div>
          {/* Mobile: just value */}
          <div className="min-w-0 sm:hidden">
            <p className="text-xs font-bold text-foreground">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
