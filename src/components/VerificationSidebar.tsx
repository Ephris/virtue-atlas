/**
 * ============================================================================
 * VERIFICATION SIDEBAR - Facility Details & Citations
 * ============================================================================
 * 
 * Displays detailed facility information with transparency features
 * 
 * Features:
 * - Confidence score meter
 * - Validation status badge
 * - 1-click citation to PDF page/snippet
 * - Anomaly highlights (amber)
 * - Facility details grid
 * 
 * HIGHLIGHT ENDPOINT: GET /facility/:id - Fetch facility details
 * HIGHLIGHT ENDPOINT: GET /citation/:sourceId - 1-click PDF access
 * 
 * TEST CHECKLIST:
 * ✓ Confidence meter animates correctly
 * ✓ Status badge shows correct color
 * ✓ Citation is clickable and shows source
 * ✓ Anomalies are highlighted in amber
 * ✓ Sidebar slides in smoothly
 */

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
  Users,
  Bed,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Facility } from "@/data/mockData";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getCitationUrl } from "@/lib/api";

interface VerificationSidebarProps {
  facility: Facility;
  onClose: () => void;
}

const statusConfig = {
  verified: {
    icon: ShieldCheck,
    label: "Verified",
    color: "bg-teal/10 text-teal border-teal/30",
    description: "Data confirmed by official sources",
  },
  unverified: {
    icon: ShieldQuestion,
    label: "Unverified",
    color: "bg-muted text-muted-foreground border-border",
    description: "Awaiting verification",
  },
  flagged: {
    icon: ShieldAlert,
    label: "Flagged",
    color: "bg-amber/10 text-amber border-amber/30",
    description: "Requires attention",
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
  const textColor =
    score >= 0.8
      ? "text-teal"
      : score >= 0.5
      ? "text-amber"
      : "text-cold-spot";

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Confidence Score</span>
        <span className={`text-sm font-bold ${textColor}`}>
          {(score * 100).toFixed(0)}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <p className={`mt-1.5 text-[10px] font-medium ${textColor}`}>
        {label} confidence based on source verification
      </p>
    </div>
  );
};

const VerificationSidebar = ({ facility, onClose }: VerificationSidebarProps) => {
  const status = statusConfig[facility.status];
  const StatusIcon = status.icon;

  // ============================================================================
  // HIGHLIGHT ENDPOINT: GET /citation/:sourceId - 1-click PDF citation access
  // ============================================================================
  const handleCitationClick = async () => {
    toast.info(`Opening source document`, {
      description: `${facility.source} — Page ${facility.sourcePage}`,
      action: {
        label: "View PDF",
        onClick: () => {
          // In production: window.open(facility.sourceUrl, '_blank')
          console.log('Opening PDF:', facility.source, 'Page:', facility.sourcePage);
        },
      },
    });

    // ============================================================================
    // PRODUCTION CODE: Uncomment when backend is ready
    // ============================================================================
    // try {
    //   const { data, error } = await getCitationUrl(facility.source, facility.sourcePage);
    //   if (data?.url) {
    //     window.open(data.url, '_blank');
    //   } else {
    //     toast.error("Could not open citation", { description: error });
    //   }
    // } catch (err) {
    //   toast.error("Failed to load citation");
    // }
  };

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute right-0 top-0 z-[1001] h-full w-80 overflow-y-auto border-l border-border bg-card shadow-2xl custom-scrollbar"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground truncate">{facility.name}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={`gap-1 text-[10px] ${status.color}`}
              >
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
              <Badge variant="outline" className="text-[10px] capitalize">
                {facility.type}
              </Badge>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">{status.description}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {/* Confidence Meter */}
        <ConfidenceMeter score={facility.confidence} />

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-muted/30 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <MapPin className="h-3 w-3" /> Coordinates
            </div>
            <p className="mt-0.5 text-xs font-medium text-foreground">
              {facility.lat.toFixed(4)}, {facility.lng.toFixed(4)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Stethoscope className="h-3 w-3" /> Surgical
            </div>
            <p className={`mt-0.5 text-xs font-medium ${facility.surgicalCapacity ? 'text-teal' : 'text-muted-foreground'}`}>
              {facility.surgicalCapacity ? "Available" : "None"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Bed className="h-3 w-3" /> Beds
            </div>
            <p className="mt-0.5 text-xs font-medium text-foreground">{facility.beds}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Users className="h-3 w-3" /> Doctors
            </div>
            <p className="mt-0.5 text-xs font-medium text-foreground">{facility.doctors}</p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground rounded-lg border border-border bg-muted/30 p-2.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Last updated:</span>
          <span className="font-medium text-foreground">{facility.lastUpdated}</span>
        </div>

        {/* Anomalies */}
        {facility.anomalies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-amber/30 bg-gradient-to-br from-amber/5 to-amber/10 p-3"
          >
            <div className="mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber" />
              <span className="text-xs font-semibold text-amber">Anomalies Detected</span>
            </div>
            <ul className="space-y-1.5">
              {facility.anomalies.map((a, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-[11px] text-foreground flex items-start gap-2"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                  {a}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Source Citation - 1-Click Access */}
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <h4 className="text-xs font-semibold text-foreground">Source Citation</h4>
          </div>
          <button
            onClick={handleCitationClick}
            className="group w-full rounded-lg border border-border bg-muted/30 p-3 text-left transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-primary truncate">{facility.source}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Page {facility.sourcePage}</p>
                </div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground italic leading-relaxed line-clamp-3">
              "{facility.sourceSnippet}"
            </p>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-primary font-medium">
              <ExternalLink className="h-2.5 w-2.5" />
              Click to view original document
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            Request Verification
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            Report Issue
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationSidebar;
