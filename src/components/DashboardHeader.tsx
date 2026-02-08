import { Shield, Bell, RefreshCw, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dashboardStats } from "@/data/mockData";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface DashboardHeaderProps {
  onUploadClick?: () => void;
}

const DashboardHeader = ({ onUploadClick }: DashboardHeaderProps) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    toast.info("Syncing data...", { duration: 1500 });
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Data synchronized", {
        description: `${dashboardStats.totalFacilities} facilities updated`,
      });
    }, 2000);
  };

  const handleUpload = () => {
    if (onUploadClick) {
      onUploadClick();
    } else {
      toast.info("Upload feature", {
        description: "Drop PDF/CSV files to import facility data",
      });
    }
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between border-b border-border bg-card px-4 sm:px-6 py-3"
    >
      <div className="flex items-center gap-3">
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md"
          style={{ boxShadow: "0 4px 14px hsl(var(--primary) / 0.3)" }}
        >
          <Shield className="h-5 w-5 text-primary-foreground" />
        </motion.div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            Bridging Medical Deserts
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="h-4 w-4 text-amber" />
            </motion.span>
          </h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Virtue Foundation — Geospatial Intelligence Platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Status indicators - desktop only */}
        <div className="hidden items-center gap-3 text-xs text-muted-foreground lg:flex">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-teal/10 cursor-default"
          >
            <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
            <span className="font-medium text-teal">{dashboardStats.verifiedFacilities}</span>
            <span className="text-muted-foreground">Verified</span>
          </motion.span>
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber/10 cursor-default"
          >
            <span className="h-2 w-2 rounded-full bg-amber" />
            <span className="font-medium text-amber">{dashboardStats.pendingVerifications}</span>
            <span className="text-muted-foreground">Pending</span>
          </motion.span>
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-cold-spot/10 cursor-default"
          >
            <span className="h-2 w-2 rounded-full bg-cold-spot" />
            <span className="font-medium text-cold-spot">{dashboardStats.coldSpots}</span>
            <span className="text-muted-foreground">Cold Spots</span>
          </motion.span>
        </div>

        {/* Upload Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 text-xs hover:bg-primary/5 hover:border-primary/30 transition-all"
            onClick={handleUpload}
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
        </motion.div>

        {/* Notifications */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => toast.info("3 new notifications", { description: "2 facilities flagged, 1 sync complete" })}
          >
            <Bell className="h-4 w-4" />
            <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-amber p-0 text-[10px] text-amber-foreground flex items-center justify-center animate-pulse">
              3
            </Badge>
          </Button>
        </motion.div>

        {/* Sync Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1.5 text-xs"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;