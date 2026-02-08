import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  FileText,
  X,
  AlertTriangle,
  MapPin,
  Stethoscope,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Facility } from "@/data/mockData";
import { motion } from "framer-motion";

interface VerificationSidebarProps {
  facility: Facility;
  onClose: () => void;
}

const statusConfig = {
  verified: {
    icon: ShieldCheck,
    label: "Verified",
    color: "bg-teal-light text-teal",
  },
  unverified: {
    icon: ShieldQuestion,
    label: "Unverified",
    color: "bg-muted text-muted-foreground",
  },
  flagged: {
    icon: ShieldAlert,
    label: "Flagged",
    color: "bg-amber/15 text-amber",
  },
};

const ConfidenceMeter = ({ score }: { score: number }) => {
  const color =
    score >= 0.8
      ? "bg-teal"
      : score >= 0.5
      ? "bg-amber"
      : "bg-cold-spot";
  const label =
    score >= 0.8
      ? "High"
      : score >= 0.5
      ? "Medium"
      : "Low";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Confidence Score</span>
        <span className="font-semibold text-foreground">
          {(score * 100).toFixed(0)}% — {label}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

const VerificationSidebar = ({ facility, onClose }: VerificationSidebarProps) => {
  const status = statusConfig[facility.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: "spring", damping: 25 }}
      className="absolute right-0 top-0 z-[1001] h-full w-80 overflow-y-auto border-l border-border bg-card shadow-xl custom-scrollbar"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border p-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">{facility.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`gap-1 text-[10px] ${status.color}`}
            >
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
            <Badge variant="outline" className="text-[10px] capitalize">
              {facility.type}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 p-4">
        {/* Confidence */}
        <ConfidenceMeter score={facility.confidence} />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3" /> Location
            </div>
            <p className="mt-0.5 text-xs font-medium text-foreground">
              {facility.lat.toFixed(4)}, {facility.lng.toFixed(4)}
            </p>
          </div>
          <div className="rounded-lg border border-border p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Stethoscope className="h-3 w-3" /> Surgical
            </div>
            <p className="mt-0.5 text-xs font-medium text-foreground">
              {facility.surgicalCapacity ? "Available" : "None"}
            </p>
          </div>
          <div className="rounded-lg border border-border p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              Beds
            </div>
            <p className="mt-0.5 text-xs font-medium text-foreground">{facility.beds}</p>
          </div>
          <div className="rounded-lg border border-border p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              Doctors
            </div>
            <p className="mt-0.5 text-xs font-medium text-foreground">{facility.doctors}</p>
          </div>
        </div>

        {/* Last updated */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Last updated: {facility.lastUpdated}
        </div>

        {/* Anomalies */}
        {facility.anomalies.length > 0 && (
          <div className="rounded-lg border border-amber/30 bg-amber/5 p-3 anomaly-pulse">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber">
              <AlertTriangle className="h-3.5 w-3.5" />
              Anomalies Detected
            </div>
            <ul className="space-y-1">
              {facility.anomalies.map((a, i) => (
                <li key={i} className="text-[11px] text-amber-foreground flex items-start gap-1.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Citation / Source */}
        <div>
          <h4 className="mb-2 text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Source Citation
          </h4>
          <button className="w-full rounded-lg border border-border bg-muted/50 p-3 text-left transition-colors hover:border-hub-blue">
            <p className="text-xs font-medium text-hub-blue">{facility.source}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Page {facility.sourcePage}</p>
            <p className="mt-1.5 text-[11px] text-foreground italic leading-relaxed">
              "{facility.sourceSnippet}"
            </p>
            <p className="mt-2 text-[10px] text-hub-blue underline">
              View original PDF →
            </p>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationSidebar;
