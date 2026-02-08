import { useState, useRef, useEffect } from "react";
import { Bot, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import {
  ChatMessage,
  QuickQueryBar,
  ChatInput,
} from "@/components/chat";
import {
  type ChatMessage as ChatMessageType,
  type ChainStep,
  sampleChainOfThought,
} from "@/data/mockData";
// import { queryAI } from "@/lib/api"; // Uncomment when backend is ready

const quickQueries = [
  "Where are the nearest labs?",
  "Show cold spots in Southern Province",
  "What's the surgical capacity gap?",
  "Flag unverified facilities",
];

const ChatConsole = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to the Intelligence Console. Ask me about facility locations, cold spots, surgical capacity gaps, or any health infrastructure question.",
      timestamp: new Date(),
      type: "basic",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // === BACKEND INTEGRATION ===
    // Uncomment below when backend is ready:
    // const { data, error } = await queryAI(text, {
    //   mapBounds: currentMapBounds, // Pass from context if available
    // });
    // if (data) {
    //   const aiMsg: ChatMessageType = {
    //     id: (Date.now() + 1).toString(),
    //     role: "assistant",
    //     content: data.answer,
    //     timestamp: new Date(),
    //     type: data.type,
    //     chainOfThought: data.chainOfThought,
    //     citations: data.citations,
    //   };
    //   setMessages((prev) => [...prev, aiMsg]);
    // }
    // setIsLoading(false);
    // return;

    // Simulate AI response with chain of thought (demo mode)
    setTimeout(() => {
      const aiMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getSimulatedResponse(text),
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
      <QuickQueryBar
        queries={quickQueries}
        onQueryClick={handleSend}
        disabled={isLoading}
      />

      {/* Messages */}
      <div className="custom-scrollbar flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing query...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
};

function getSimulatedResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("lab"))
    return "Found **1 verified lab** within your area: **Gitarama Lab** (BSL-2, TB/HIV testing). The nearest cold spot is 55km southwest with ~85,000 people lacking lab access.";
  if (q.includes("cold spot"))
    return "Identified **3 cold spots** in Southern Province:\n\n1. **Most Critical**: 180,000 population, 78km from nearest surgical facility\n2. 120,000 population, 52km gap\n3. 95,000 population, 65km gap\n\nRecommending urgent resource deployment.";
  if (q.includes("surgical") || q.includes("capacity"))
    return "**Current surgical capacity gap:**\n\n- 34 regions with zero surgical access\n- ~2.4M population at risk\n- Top 3 priority regions flagged on map";
  if (q.includes("unverified") || q.includes("flag"))
    return "**Flagged Facilities:**\n\n- 🟠 Nyamata Health Center — Outdated data (>18 months)\n- 🟠 Kibungo Pharmacy — Unverified operating status\n\nRecommend field verification within 30 days.";
  return "Based on analysis of 847 facilities across the registry, I've identified the relevant data points. See the **reasoning trace** below for my methodology.";
}

export default ChatConsole;
