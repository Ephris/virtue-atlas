/**
 * ============================================================================
 * QUICK QUERY BAR - Common Questions Shortcuts
 * ============================================================================
 * 
 * Provides one-click access to common NGO planner questions
 * Reduces friction - no typing required for frequent queries
 */

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface QuickQueryBarProps {
  queries: string[];
  onQueryClick: (query: string) => void;
  disabled?: boolean;
}

const QuickQueryBar = ({ queries, onQueryClick, disabled }: QuickQueryBarProps) => {
  return (
    <div className="shrink-0 border-b border-border px-3 py-2 bg-muted/30">
      <div className="flex items-center gap-1 mb-1.5">
        <Sparkles className="h-2.5 w-2.5 text-primary" />
        <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">
          Quick Queries
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {queries.map((q, i) => (
          <motion.button
            key={q}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onQueryClick(q)}
            disabled={disabled}
            className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-foreground hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {q}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickQueryBar;
