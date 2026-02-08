import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import DashboardHeader from "@/components/DashboardHeader";
import StatsBar from "@/components/StatsBar";
import IntelligenceMap from "@/components/IntelligenceMap";
import ChatConsole from "@/components/ChatConsole";
import VerificationSidebar from "@/components/VerificationSidebar";
import PlanningPanel from "@/components/PlanningPanel";
import { type Facility } from "@/data/mockData";

const Index = () => {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <DashboardHeader />
      <StatsBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Map area */}
        <div className="relative flex flex-1 flex-col">
          <div className="flex-1">
            <IntelligenceMap onFacilityClick={setSelectedFacility} selectedFacility={selectedFacility} />
          </div>
          <PlanningPanel />

          {/* Verification sidebar overlay on map */}
          <AnimatePresence>
            {selectedFacility && (
              <VerificationSidebar facility={selectedFacility} onClose={() => setSelectedFacility(null)} />
            )}
          </AnimatePresence>
        </div>

        {/* Chat console */}
        <div className="hidden w-96 lg:block">
          <ChatConsole />
        </div>
      </div>
    </div>
  );
};

export default Index;
