/**
 * ============================================================================
 * CHAT MESSAGE - Message Display Component
 * ============================================================================
 * 
 * Renders individual chat messages with:
 * - Markdown support
 * - Chain of Thought stepper (always visible for reasoning)
 * - Citations list with 1-click access
 */

import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import ChainOfThoughtStepper from "./ChainOfThoughtStepper";
import CitationList from "./CitationList";
import { type ChatMessage as ChatMessageType } from "@/data/mockData";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : ""}`}
    >
      {message.role === "assistant" && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary shadow-sm">
          <Bot className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}
      
      <div
        className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm shadow-sm ${
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground border border-border"
        }`}
      >
        {/* Message Content with Markdown support */}
        <div className={`prose prose-sm max-w-none ${message.role === "assistant" ? "dark:prose-invert" : ""}`}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              code: ({ children }) => (
                <code className="rounded bg-background/50 px-1.5 py-0.5 text-[11px] font-mono">{children}</code>
              ),
              table: ({ children }) => (
                <div className="my-2 overflow-x-auto">
                  <table className="min-w-full text-[11px] border-collapse">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-border bg-muted px-2 py-1 text-left font-medium">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border border-border px-2 py-1">{children}</td>
              ),
              h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2">{children}</h3>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Chain of Thought Stepper - Always visible for reasoning/flagged responses */}
        {message.chainOfThought && message.chainOfThought.length > 0 && (
          <ChainOfThoughtStepper steps={message.chainOfThought} />
        )}

        {/* Citations - 1-click access to sources */}
        {message.citations && message.citations.length > 0 && (
          <CitationList citations={message.citations} />
        )}
      </div>
      
      {message.role === "user" && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary shadow-sm">
          <User className="h-3.5 w-3.5 text-secondary-foreground" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
