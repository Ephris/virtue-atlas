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
      className={`flex gap-2 ${message.role === "user" ? "justify-end" : ""}`}
    >
      {message.role === "assistant" && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
          <Bot className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
      
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {/* Message Content with Markdown support */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
              ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              code: ({ children }) => (
                <code className="rounded bg-background/50 px-1 py-0.5 text-[11px]">{children}</code>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Chain of Thought Stepper */}
        {message.chainOfThought && message.chainOfThought.length > 0 && (
          <ChainOfThoughtStepper steps={message.chainOfThought} />
        )}

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <CitationList citations={message.citations} />
        )}
      </div>
      
      {message.role === "user" && (
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary">
          <User className="h-3 w-3 text-secondary-foreground" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
