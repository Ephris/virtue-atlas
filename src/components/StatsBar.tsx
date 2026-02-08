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
    <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
