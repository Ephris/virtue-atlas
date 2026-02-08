import { Building2, ShieldCheck, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { dashboardStats } from "@/data/mockData";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const stats = [
  {
    label: "Total Facilities",
    value: dashboardStats.totalFacilities.toLocaleString(),
    icon: Building2,
    color: "text-hub-blue",
    bg: "bg-hub-blue/10",
    borderColor: "border-hub-blue/20",
    trend: "+12",
    description: "Healthcare facilities in registry",
  },
  {
    label: "Verified",
    value: dashboardStats.verifiedFacilities.toLocaleString(),
    icon: ShieldCheck,
    color: "text-teal",
    bg: "bg-teal/10",
    borderColor: "border-teal/20",
    trend: "+8",
    description: "Facilities with confirmed data",
  },
  {
    label: "Cold Spots",
    value: dashboardStats.coldSpots.toLocaleString(),
    icon: AlertTriangle,
    color: "text-cold-spot",
    bg: "bg-cold-spot/10",
    borderColor: "border-cold-spot/20",
    trend: "-3",
    description: "Areas lacking healthcare access",
  },
  {
    label: "Population at Risk",
    value: (dashboardStats.populationAtRisk / 1000000).toFixed(1) + "M",
    icon: Users,
    color: "text-amber",
    bg: "bg-amber/10",
    borderColor: "border-amber/20",
    trend: "-150K",
    description: "People without nearby surgical care",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const StatsBar = () => {
  return (
    <TooltipProvider>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-2 py-2 sm:gap-3 sm:px-4 sm:py-3 border-b border-border bg-gradient-to-r from-muted/30 via-background to-muted/30"
      >
        {stats.map((stat, index) => (
          <Tooltip key={stat.label}>
            <TooltipTrigger asChild>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`
                  flex items-center gap-2 sm:gap-3 rounded-xl border ${stat.borderColor} 
                  bg-card px-2.5 py-2 sm:px-4 sm:py-3 cursor-default
                  hover:shadow-md transition-all duration-200
                `}
              >
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                  className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}
                >
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </motion.div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1">
                    <motion.p 
                      key={stat.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-base sm:text-xl font-bold text-foreground leading-tight"
                    >
                      {stat.value}
                    </motion.p>
                    <span className={`hidden sm:flex items-center text-[10px] font-medium ${
                      stat.trend.startsWith('+') ? 'text-teal' : stat.trend.startsWith('-') && stat.label !== 'Cold Spots' && stat.label !== 'Population at Risk' ? 'text-cold-spot' : 'text-teal'
                    }`}>
                      <TrendingUp className={`h-2.5 w-2.5 mr-0.5 ${stat.trend.startsWith('-') ? 'rotate-180' : ''}`} />
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate font-medium">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs bg-popover border border-border z-50">
              <p>{stat.description}</p>
              <p className="text-muted-foreground mt-1">
                Last 30 days: <span className={stat.trend.startsWith('-') && (stat.label === 'Cold Spots' || stat.label === 'Population at Risk') ? 'text-teal' : stat.trend.startsWith('+') ? 'text-teal' : 'text-cold-spot'}>{stat.trend}</span>
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </motion.div>
    </TooltipProvider>
  );
};

export default StatsBar;