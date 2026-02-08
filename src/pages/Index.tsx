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
      <DashboardHeader />
      <StatsBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content area with tabs */}
        <div className="relative flex flex-1 flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex items-center border-b border-border bg-card px-2 sm:px-4">
              <TabsList className="h-11 bg-transparent p-0 gap-0.5 sm:gap-1">
                <TabsTrigger 
                  value="map" 
                  className="gap-1.5 px-3 sm:px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200"
                >
                  <Map className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Intelligence Map</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="gap-1.5 px-3 sm:px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200 lg:hidden"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">AI Console</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="planner" 
                  className="gap-1.5 px-3 sm:px-4 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200 relative"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Resource Planner</span>
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

            {/* Map Tab */}
            <TabsContent value="map" className="flex-1 m-0 relative" forceMount>
              <motion.div 
                className="h-full w-full"
                initial={false}
                animate={{ 
                  opacity: activeTab === "map" ? 1 : 0,
                  display: activeTab === "map" ? "block" : "none" 
                }}
                transition={{ duration: 0.2 }}
              >
                <IntelligenceMap onFacilityClick={setSelectedFacility} selectedFacility={selectedFacility} />
                
                {/* Verification sidebar overlay on map */}
                <AnimatePresence>
                  {selectedFacility && (
                    <VerificationSidebar facility={selectedFacility} onClose={() => setSelectedFacility(null)} />
                  )}
                </AnimatePresence>
              </motion.div>
            </TabsContent>

            {/* Chat Tab (mobile only) */}
            <TabsContent value="chat" className="flex-1 m-0 lg:hidden">
              <ChatConsole />
            </TabsContent>

            {/* Resource Planner Tab */}
            <TabsContent value="planner" className="flex-1 m-0">
              <PlanningPanel />
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat console - desktop sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden w-96 border-l border-border lg:block"
        >
          <ChatConsole />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
