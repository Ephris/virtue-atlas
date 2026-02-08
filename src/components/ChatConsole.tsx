/**
 * ============================================================================
 * CHAT CONSOLE - Multi-Agent AI Interface
 * ============================================================================
 * 
 * Natural language query interface for NGO planners
 * Shows AI reasoning with Chain of Thought stepper
 * 
 * Features:
 * - Natural language input (no SQL required)
 * - Quick query buttons for common questions
 * - Chain of Thought stepper (always visible for reasoning)
 * - 1-click citations to source documents
 * - Response time target: <3 seconds
 * 
 * HIGHLIGHT ENDPOINT: POST /query - Natural language AI queries
 * 
 * TEST CHECKLIST:
 * ✓ Quick queries work
 * ✓ Chain of Thought stepper is visible for all AI responses
 * ✓ Citations are clickable
 * ✓ Response time indicator shows
 * ✓ Loading state is clear
 */

import { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Clock, Zap, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
import { queryAI, type QueryResponse } from "@/lib/api";

const quickQueries = [
  "Where are the nearest labs?",
  "Show cold spots in Southern Province",
  "What's the surgical capacity gap?",
  "Flag unverified facilities",
  "List hospitals with >100 beds",
  "Find clinics needing verification",
];

const ChatConsole = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to the **Intelligence Console**. I can help you analyze health facilities, identify coverage gaps, and plan resource deployment.\n\nTry asking about:\n- Facility locations and capacity\n- Cold spots (underserved areas)\n- Surgical capacity gaps\n- Data verification status",
      timestamp: new Date(),
      type: "basic",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
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
    setResponseTime(null);
    const startTime = Date.now();

    // ============================================================================
    // HIGHLIGHT ENDPOINT: POST /query - Natural language AI queries
    // Target response time: <3 seconds
    // ============================================================================

    // Demo mode - simulate AI response (remove for production)
    setTimeout(() => {
      const elapsed = Date.now() - startTime;
      setResponseTime(elapsed);
      
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
              "Kigali Central Hospital — tertiary referral, 450 beds, fully equipped surgical theatres...",
            confidence: 0.94,
          },
          {
            id: "c2",
            source: "UN Population Grid 2024",
            page: 3,
            snippet:
              "Southern Province estimated population density: 412/km², access analysis indicates...",
            confidence: 0.91,
          },
          {
            id: "c3",
            source: "MOH Facility Audit 2023",
            page: 42,
            snippet:
              "Nyamata HC — Level 3 health center, limited surgical capacity, reported equipment shortages...",
            confidence: 0.78,
          },
        ],
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1200 + Math.random() * 800);

    // ============================================================================
    // PRODUCTION CODE: Uncomment when backend is ready
    // ============================================================================
    // try {
    //   const { data, error } = await queryAI(text, {
    //     // mapBounds: currentMapBounds, // Pass from context if available
    //   });
    //   
    //   const elapsed = Date.now() - startTime;
    //   setResponseTime(elapsed);
    //   
    //   if (data) {
    //     const aiMsg: ChatMessageType = {
    //       id: (Date.now() + 1).toString(),
    //       role: "assistant",
    //       content: data.answer,
    //       timestamp: new Date(),
    //       type: data.type,
    //       chainOfThought: data.chainOfThought,
    //       citations: data.citations,
    //     };
    //     setMessages((prev) => [...prev, aiMsg]);
    //   } else {
    //     const errorMsg: ChatMessageType = {
    //       id: (Date.now() + 1).toString(),
    //       role: "assistant",
    //       content: `Sorry, I encountered an error: ${error}. Please try again.`,
    //       timestamp: new Date(),
    //       type: "basic",
    //     };
    //     setMessages((prev) => [...prev, errorMsg]);
    //   }
    // } catch (err) {
    //   console.error('Query error:', err);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-card">
      {/* Header - fixed height */}
      <div className="shrink-0 border-b border-border px-4 py-3 bg-gradient-to-r from-card to-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                Intelligence Console
                <Sparkles className="h-3 w-3 text-amber" />
              </h2>
              <p className="text-[11px] text-muted-foreground">Natural language queries • AI-powered analysis</p>
            </div>
          </div>
          
          {/* Response Time Indicator */}
          {responseTime !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                responseTime < 3000
                  ? "bg-teal/10 text-teal"
                  : "bg-amber/10 text-amber"
              }`}
            >
              <Zap className="h-2.5 w-2.5" />
              {(responseTime / 1000).toFixed(1)}s
            </motion.div>
          )}
        </div>
      </div>

      {/* Quick Queries - fixed height */}
      <div className="shrink-0">
        <QuickQueryBar
          queries={quickQueries}
          onQueryClick={handleSend}
          disabled={isLoading}
        />
      </div>

      {/* Messages - scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
              <Bot className="h-3 w-3 text-primary-foreground" />
            </div>
            <div className="rounded-lg bg-muted px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Analyzing query...</span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="h-2 w-48 animate-pulse rounded bg-muted-foreground/20" />
                <div className="h-2 w-36 animate-pulse rounded bg-muted-foreground/20" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input - fixed height */}
      <div className="shrink-0">
        <ChatInput 
          onSend={handleSend} 
          isLoading={isLoading}
          placeholder="Ask about facilities, cold spots, capacity..."
        />
      </div>
    </div>
  );
};

function getSimulatedResponse(query: string): string {
  const q = query.toLowerCase();
  
  if (q.includes("lab"))
    return "Found **1 verified lab** within your current view:\n\n**Gitarama Lab** (BSL-2)\n- Testing: TB, HIV, Malaria RDT\n- Blood bank services available\n- Last verified: Aug 2024\n\nThe nearest cold spot is **55km southwest** with ~85,000 people lacking laboratory access.";
  
  if (q.includes("cold spot"))
    return "Identified **3 critical cold spots** in Southern Province:\n\n1. **Western Province Rural** — 150,000 population, 65km from nearest surgical facility\n2. **Southern Highlands** — 95,000 population, 58km gap\n3. **Eastern Border Region** — 85,000 population, 45km gap\n\n⚠️ Total population at risk: **330,000**\n\nRecommending priority resource deployment to Western Province Rural.";
  
  if (q.includes("surgical") || q.includes("capacity"))
    return "**Current Surgical Capacity Analysis:**\n\n| Metric | Value |\n|--------|-------|\n| Regions with zero access | 34 |\n| Population at risk | ~2.4M |\n| Avg distance to surgery | 52km |\n\n**Top 3 Priority Regions:**\n1. Western Province Rural (65km gap)\n2. Southern Highlands (58km gap)\n3. Central Rural Zone (55km gap)\n\nThese regions are now highlighted on the map.";
  
  if (q.includes("unverified") || q.includes("flag"))
    return "**Flagged Facilities Requiring Verification:**\n\n🟠 **Nyamata Health Center**\n- Issue: Outdated data (>18 months)\n- Last update: Jun 2023\n- Action: Schedule field verification\n\n🟠 **Kibungo Pharmacy**\n- Issue: Unverified operating status\n- Possible stockouts reported\n- Action: Confirm operational within 30 days\n\n**Recommendation:** Prioritize field verification for these 2 facilities.";
  
  if (q.includes("hospital") && q.includes("beds"))
    return "**Hospitals with >100 beds:**\n\n1. **Kigali Central Hospital** — 450 beds\n   - Status: ✅ Verified\n   - Surgical: Yes (3 theatres)\n   - Doctors: 82\n\n2. **Ruhengeri Referral Hospital** — 230 beds\n   - Status: ✅ Verified\n   - Surgical: Yes\n   - Doctors: 38\n\n3. **Butaro District Hospital** — 150 beds\n   - Status: ✅ Verified\n   - Surgical: Yes (2 theatres)\n   - Doctors: 22";
  
  if (q.includes("clinic") && q.includes("verification"))
    return "**Clinics Needing Verification:**\n\nFound **12 clinics** with outdated or missing data:\n\n- 5 clinics: Data older than 12 months\n- 4 clinics: Missing capacity information\n- 3 clinics: Conflicting source data\n\n**Top Priority:**\n1. Nyamata Health Center (18+ months old)\n2. Gatsibo Clinic (conflicting bed counts)\n3. Muhanga Health Post (no recent update)";
  
  return "Based on analysis of **847 facilities** across the registry, I've identified the relevant data points for your query.\n\nThe analysis cross-referenced:\n- WHO Health Facility Registry 2024\n- UN Population Grid\n- MOH Facility Audit 2023\n\nSee the **reasoning trace** below for my complete methodology and the **sources** section for direct links to the original documents.";
}

export default ChatConsole;
