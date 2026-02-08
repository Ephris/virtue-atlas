/**
 * ============================================================================
 * CITATION LIST - 1-Click Source Access
 * ============================================================================
 * 
 * Provides transparent access to AI source documents
 * Critical for NGO trust - proves data provenance
 * 
 * Features:
 * - 1-click access to PDF page/snippet
 * - Confidence score visualization
 * - Source document preview
 * - External link to full document
 * 
 * HIGHLIGHT ENDPOINT: GET /citation/:sourceId - Opens PDF at specific page
 * 
 * TEST CHECKLIST:
 * ✓ Citations are clickable
 * ✓ Confidence bars show correct colors
 * ✓ Snippet text is readable
 * ✓ External link icon appears on hover
 */

import { FileText, ExternalLink, BookOpen, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { type Citation } from "@/data/mockData";
import { toast } from "sonner";
import { getCitationUrl } from "@/lib/api";

interface CitationListProps {
  citations: Citation[];
}

const CitationList = ({ citations }: CitationListProps) => {
  const handleCitationClick = async (citation: Citation) => {
    // ============================================================================
    // HIGHLIGHT ENDPOINT: GET /citation/:sourceId - 1-click PDF citation access
    // ============================================================================
    
    // Demo mode - show toast (replace with real PDF viewer in production)
    toast.info(`Opening source document`, {
      description: `${citation.source} — Page ${citation.page}`,
      action: {
        label: "View PDF",
        onClick: () => {
          // In production: window.open(citation.sourceUrl, '_blank')
          console.log('Opening PDF:', citation.source, 'Page:', citation.page);
        },
      },
    });

    // ============================================================================
    // PRODUCTION CODE: Uncomment when backend is ready
    // ============================================================================
    // try {
    //   const { data, error } = await getCitationUrl(citation.source, citation.page);
    //   if (data?.url) {
    //     window.open(data.url, '_blank');
    //   } else {
    //     toast.error("Could not open citation", { description: error });
    //   }
    // } catch (err) {
    //   toast.error("Failed to load citation");
    // }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return "Very High";
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    if (confidence >= 0.4) return "Low";
    return "Very Low";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-teal";
    if (confidence >= 0.5) return "bg-amber";
    return "bg-cold-spot";
  };

  return (
    <div className="mt-3 rounded-xl border border-border bg-card/50 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          Source Citations
        </p>
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {citations.length} source{citations.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Citations */}
      <div className="space-y-2">
        {citations.map((citation, index) => (
          <motion.button
            key={citation.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleCitationClick(citation)}
            className="group w-full rounded-lg border border-border bg-background p-2.5 text-left transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {/* Source Title */}
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-primary shrink-0" />
                  <span className="font-medium text-xs text-primary truncate">
                    {citation.source}
                  </span>
                </div>
                
                {/* Page Number */}
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Page {citation.page}
                </span>
                
                {/* Snippet */}
                <p className="mt-1.5 text-[11px] text-muted-foreground italic line-clamp-2 leading-relaxed">
                  "{citation.snippet}"
                </p>
              </div>
              
              {/* External Link Icon */}
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            
            {/* Confidence Meter */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Shield className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Match:</span>
              </div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${citation.confidence * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`h-full rounded-full ${getConfidenceColor(citation.confidence)}`}
                />
              </div>
              <span className={`text-[10px] font-medium ${
                citation.confidence >= 0.8 ? 'text-teal' : 
                citation.confidence >= 0.5 ? 'text-amber' : 'text-cold-spot'
              }`}>
                {(citation.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer hint */}
      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        Click any citation to view the original source document
      </p>
    </div>
  );
};

export default CitationList;
