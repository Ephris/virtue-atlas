import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  type ChatMessage,
  type ChainStep,
  sampleChainOfThought,
} from "@/data/mockData";

const quickQueries = [
  "Where are the nearest labs?",
  "Show cold spots in Southern Province",
  "What's the surgical capacity gap?",
  "Flag unverified facilities",
];

const ChainOfThoughtStepper = ({ steps }: { steps: ChainStep[] }) => (
  <div className="mt-3 rounded-lg border border-amber/30 bg-amber/5 p-3">
    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber">
      <Brain className="h-3.5 w-3.5" />
      AI Reasoning Trace
    </div>
    <div className="space-y-2">
      {steps.map((step, i) => (
        <motion.div
          key={step.step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15 }}
          className="cot-step flex gap-2"
        >
          <div className="flex flex-col items-center">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                step.status === "complete"
                  ? "bg-teal text-primary-foreground"
                  : step.status === "active"
                  ? "bg-amber text-amber-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.step}
            </div>
            {i < steps.length - 1 && (
              <div className="mt-1 h-full w-px bg-border" />
            )}
          </div>
          <div className="pb-2">
            <p className="text-xs font-medium text-foreground">{step.title}</p>
            <p className="text-[11px] text-muted-foreground">{step.detail}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const ChatConsole = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to the Intelligence Console. Ask me about facility locations, cold spots, surgical capacity gaps, or any health infrastructure question.",
      timestamp: new Date(),
      type: "basic",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const query = text || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response with chain of thought
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getSimulatedResponse(query),
        timestamp: new Date(),
        type: "reasoning",
        chainOfThought: sampleChainOfThought,
        citations: [
          {
            id: "c1",
            source: "WHO Health Facility Registry 2024",
            page: 14,
            snippet:
              "Kigali Central Hospital — tertiary referral, 450 beds...",
            confidence: 0.94,
          },
          {
            id: "c2",
            source: "UN Population Grid 2024",
            page: 3,
            snippet:
              "Southern Province estimated population density: 412/km²...",
            confidence: 0.91,
          },
        ],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1800);
  };

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Intelligence Console</h2>
            <p className="text-[11px] text-muted-foreground">Natural language queries • AI-powered analysis</p>
          </div>
        </div>
      </div>

      {/* Quick queries */}
      <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-2">
        {quickQueries.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="custom-scrollbar flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.chainOfThought && (
                  <ChainOfThoughtStepper steps={msg.chainOfThought} />
                )}

                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      Sources:
                    </p>
                    {msg.citations.map((c) => (
                      <button
                        key={c.id}
                        className="block w-full rounded border border-border bg-card p-2 text-left text-[11px] transition-colors hover:border-hub-blue"
                      >
                        <span className="font-medium text-hub-blue">
                          {c.source}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          — p.{c.page}
                        </span>
                        <p className="mt-0.5 text-muted-foreground italic truncate">
                          "{c.snippet}"
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <User className="h-3 w-3 text-secondary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing query...
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about facilities, cold spots, capacity..."
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

function getSimulatedResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("lab"))
    return "Found 1 verified lab within your area: Gitarama Lab (BSL-2, TB/HIV testing). The nearest cold spot is 55km southwest with ~85,000 people lacking lab access.";
  if (q.includes("cold spot"))
    return "Identified 3 cold spots in Southern Province. The most critical: 180,000 population, 78km from nearest surgical facility. Recommending urgent resource deployment.";
  if (q.includes("surgical") || q.includes("capacity"))
    return "Current surgical capacity gap: 34 regions identified with zero surgical access. Total population at risk: ~2.4M. Top 3 priority regions flagged below.";
  return "Based on analysis of 847 facilities across the registry, I've identified the relevant data points. See the reasoning trace below for my methodology.";
}

export default ChatConsole;
