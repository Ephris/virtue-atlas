import { FileText, ExternalLink } from "lucide-react";
import { type Citation } from "@/data/mockData";
import { toast } from "sonner";

interface CitationListProps {
  citations: Citation[];
}

const CitationList = ({ citations }: CitationListProps) => {
  const handleCitationClick = (citation: Citation) => {
    // In production, this would call the API to get the PDF URL
    // and open it in a viewer at the specific page
    // getCitationUrl(citation.source, citation.page).then(...)
    
    toast.info(`Opening ${citation.source} at page ${citation.page}`, {
      description: "PDF viewer would open here with highlighted text",
    });
  };

  return (
    <div className="mt-3 space-y-1.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <FileText className="h-3 w-3" />
        Sources ({citations.length}):
      </p>
      {citations.map((citation) => (
        <button
          key={citation.id}
          onClick={() => handleCitationClick(citation)}
          className="group block w-full rounded border border-border bg-card p-2 text-left text-[11px] transition-colors hover:border-hub-blue hover:bg-hub-blue-light/30"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-hub-blue">
                {citation.source}
              </span>
              <span className="text-muted-foreground">
                {" "}— p.{citation.page}
              </span>
              <p className="mt-0.5 text-muted-foreground italic truncate">
                "{citation.snippet}"
              </p>
            </div>
            <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          
          {/* Confidence indicator */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${
                  citation.confidence >= 0.8
                    ? "bg-teal"
                    : citation.confidence >= 0.5
                    ? "bg-amber"
                    : "bg-cold-spot"
                }`}
                style={{ width: `${citation.confidence * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {(citation.confidence * 100).toFixed(0)}% match
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default CitationList;
