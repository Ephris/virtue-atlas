import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Map, MessageSquare, ClipboardList, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "@/components/DashboardHeader";
import StatsBar from "@/components/StatsBar";
import IntelligenceMap from "@/components/IntelligenceMap";
import ChatConsole from "@/components/ChatConsole";
import VerificationSidebar from "@/components/VerificationSidebar";
import PlanningPanel from "@/components/PlanningPanel";
import { type Facility } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [activeTab, setActiveTab] = useState("map");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header - fixed height */}
      <div className="shrink-0">
        <DashboardHeader />
      </div>
      
      {/* Stats Bar - fixed height */}
      <div className="shrink-0">
        <StatsBar />
      </div>

      {/* Main content area - takes remaining space */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main content area with tabs */}
        <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col min-h-0 overflow-hidden">
            {/* Tab Navigation - fixed height */}
            <div className="shrink-0 flex items-center border-b border-border bg-card px-1.5 sm:px-4">
              <TabsList className="h-10 bg-transparent p-0 gap-0 sm:h-11 sm:gap-1">
                <TabsTrigger 
                  value="map" 
                  className="gap-1 px-2 py-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200 sm:gap-1.5 sm:px-4 sm:py-2 sm:text-sm"
                >
                  <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="font-medium">Map</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="gap-1 px-2 py-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200 lg:hidden sm:gap-1.5 sm:px-4 sm:py-2 sm:text-sm"
                >
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="font-medium">AI</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="planner" 
                  className="gap-1 px-2 py-1.5 text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200 relative sm:gap-1.5 sm:px-4 sm:py-2 sm:text-sm"
                >
                  <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="font-medium">Planner</span>
                  <Badge 
                    variant="secondary" 
                    className="hidden sm:flex h-4 px-1.5 text-[9px] bg-amber/15 text-amber border-0 ml-1"
                  >
                    <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                    New
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content - fills remaining space */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
              {/* Map Tab */}
              <TabsContent 
                value="map" 
                className="absolute inset-0 m-0 data-[state=inactive]:hidden"
                forceMount
              >
                <div className="h-full w-full relative">
                  <IntelligenceMap onFacilityClick={setSelectedFacility} selectedFacility={selectedFacility} />
                  
                  {/* Verification sidebar overlay on map */}
                  <AnimatePresence>
                    {selectedFacility && (
                      <VerificationSidebar facility={selectedFacility} onClose={() => setSelectedFacility(null)} />
                    )}
                  </AnimatePresence>
                </div>
              </TabsContent>

              {/* Chat Tab (mobile only) */}
              <TabsContent 
                value="chat" 
                className="absolute inset-0 m-0 lg:hidden overflow-hidden data-[state=inactive]:hidden"
              >
                <ChatConsole />
              </TabsContent>

              {/* Resource Planner Tab */}
              <TabsContent 
                value="planner" 
                className="absolute inset-0 m-0 overflow-hidden data-[state=inactive]:hidden"
              >
                <PlanningPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Chat console - desktop sidebar */}
        <div className="hidden w-96 shrink-0 border-l border-border lg:flex lg:flex-col overflow-hidden">
          <ChatConsole />
        </div>
      </div>
    </div>
  );
};

export default Index;
