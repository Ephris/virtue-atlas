import { Shield, Bell, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dashboardStats } from "@/data/mockData";

interface DashboardHeaderProps {
  onUploadClick?: () => void;
}

const DashboardHeader = ({ onUploadClick }: DashboardHeaderProps) => {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            Bridging Medical Deserts
          </h1>
          <p className="text-xs text-muted-foreground">
            Virtue Foundation — Geospatial Intelligence Platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-teal" />
            {dashboardStats.verifiedFacilities} Verified
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber" />
            {dashboardStats.pendingVerifications} Pending
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cold-spot" />
            {dashboardStats.coldSpots} Cold Spots
          </span>
        </div>

        {/* Upload Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5 text-xs"
          onClick={onUploadClick}
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Upload Data</span>
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-amber p-0 text-[10px] text-amber-foreground">
            3
          </Badge>
        </Button>

        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sync</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
