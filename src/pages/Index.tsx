import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Map, MessageSquare, ClipboardList } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "@/components/DashboardHeader";
import StatsBar from "@/components/StatsBar";
import IntelligenceMap from "@/components/IntelligenceMap";
import ChatConsole from "@/components/ChatConsole";
import VerificationSidebar from "@/components/VerificationSidebar";
import PlanningPanel from "@/components/PlanningPanel";
import { type Facility } from "@/data/mockData";

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
            <div className="flex items-center border-b border-border bg-card px-4">
              <TabsList className="h-10 bg-transparent p-0 gap-1">
                <TabsTrigger 
                  value="map" 
                  className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <Map className="h-4 w-4" />
                  <span className="hidden sm:inline">Intelligence Map</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary lg:hidden"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Console</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="planner" 
                  className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">Resource Planner</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Map Tab */}
            <TabsContent value="map" className="flex-1 m-0 relative">
              <IntelligenceMap onFacilityClick={setSelectedFacility} selectedFacility={selectedFacility} />
              
              {/* Verification sidebar overlay on map */}
              <AnimatePresence>
                {selectedFacility && (
                  <VerificationSidebar facility={selectedFacility} onClose={() => setSelectedFacility(null)} />
                )}
              </AnimatePresence>
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
        <div className="hidden w-96 border-l border-border lg:block">
          <ChatConsole />
        </div>
      </div>
    </div>
  );
};

export default Index;
