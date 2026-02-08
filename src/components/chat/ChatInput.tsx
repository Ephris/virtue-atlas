/**
 * ============================================================================
 * CHAT INPUT - Natural Language Query Input
 * ============================================================================
 * 
 * Low-friction input for NGO planners
 * Supports Enter to send, shows loading state
 */

import { useState } from "react";
import { Send, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInput = ({ onSend, isLoading, placeholder }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border p-3 bg-card">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask about facilities, cold spots, capacity..."}
            disabled={isLoading}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          />
          {/* Character hint */}
          {input.length > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
              ↵
            </span>
          )}
        </div>
        
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 rounded-xl shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      </div>
      
      {/* Hint text */}
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        Natural language queries • No SQL required • Response time &lt;3 seconds
      </p>
    </div>
  );
};

export default ChatInput;
