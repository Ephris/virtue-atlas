import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from "react-leaflet";
import { Layers, Eye, EyeOff, ZoomIn, ZoomOut, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { facilities, coldSpots, type Facility } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

const facilityColors: Record<string, string> = {
  hospital: "#3B82F6",
  clinic: "#60A5FA",
  lab: "#818CF8",
  pharmacy: "#A78BFA",
};

const statusRadius: Record<string, number> = {
  verified: 8,
  unverified: 6,
  flagged: 7,
};

interface IntelligenceMapProps {
  onFacilityClick: (facility: Facility) => void;
  selectedFacility: Facility | null;
}

function DroppableMapLayer({
  onDrop,
}: {
  onDrop: (lat: number, lng: number, resourceId: string) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = "copy";
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const resourceId = e.dataTransfer!.getData("resourceId");
      if (!resourceId) return;

      const rect = container.getBoundingClientRect();
      const point = map.containerPointToLatLng([
        e.clientX - rect.left,
        e.clientY - rect.top,
      ]);
      onDrop(point.lat, point.lng, resourceId);
    };

    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("drop", handleDrop);
    return () => {
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("drop", handleDrop);
    };
  }, [map, onDrop]);

  return null;
}

function MapControls() {
  const map = useMap();

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className="absolute right-3 top-3 z-40 flex flex-col gap-1"
    >
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 bg-card shadow-md border-border hover:bg-muted"
        onClick={() => map.zoomIn()}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 bg-card shadow-md border-border hover:bg-muted"
        onClick={() => map.zoomOut()}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 bg-card shadow-md border-border hover:bg-muted"
        onClick={() => {
          map.setView([-1.94, 29.87], 8);
          toast.info("Map centered on Rwanda");
        }}
      >
        <LocateFixed className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

const IntelligenceMap = ({ onFacilityClick, selectedFacility }: IntelligenceMapProps) => {
  const [showColdSpots, setShowColdSpots] = useState(true);
  const [droppedResources, setDroppedResources] = useState<
    { lat: number; lng: number; resourceId: string }[]
  >([]);

  const handleDrop = (lat: number, lng: number, resourceId: string) => {
    setDroppedResources((prev) => [...prev, { lat, lng, resourceId }]);
    toast.success("Resource deployed on map", {
      description: "Location marked for deployment",
    });
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[-1.94, 29.87]}
        zoom={8}
        className="h-full w-full rounded-none"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <DroppableMapLayer onDrop={handleDrop} />
        <MapControls />

        {/* Facility markers */}
        {facilities.map((f) => (
          <CircleMarker
            key={f.id}
            center={[f.lat, f.lng]}
            radius={statusRadius[f.status]}
            pathOptions={{
              color:
                selectedFacility?.id === f.id
                  ? "#1a2744"
                  : f.status === "flagged"
                  ? "#D97706"
                  : facilityColors[f.type],
              fillColor:
                f.status === "flagged" ? "#FDE68A" : facilityColors[f.type],
              fillOpacity: selectedFacility?.id === f.id ? 1 : 0.7,
              weight: selectedFacility?.id === f.id ? 3 : 2,
            }}
            eventHandlers={{
              click: () => onFacilityClick(f),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{f.name}</p>
                <p className="text-muted-foreground capitalize">{f.type}</p>
                <p className="text-xs mt-1">
                  <span className={`font-medium ${f.status === 'verified' ? 'text-teal' : f.status === 'flagged' ? 'text-amber' : 'text-muted-foreground'}`}>
                    {f.status}
                  </span>
                  {" • "}
                  {(f.confidence * 100).toFixed(0)}% confidence
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Cold spot overlay */}
        <AnimatePresence>
          {showColdSpots &&
            coldSpots.map((cs, i) => (
              <Circle
                key={`cs-${i}`}
                center={[cs.lat, cs.lng]}
                radius={cs.intensity * 30000}
                pathOptions={{
                  color: "transparent",
                  fillColor: "#EF4444",
                  fillOpacity: cs.intensity * 0.25,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-cold-spot">Cold Spot</p>
                    <p className="font-medium">{cs.name}</p>
                    <p className="text-muted-foreground">Population: {cs.population.toLocaleString()}</p>
                    <p className="text-muted-foreground">Nearest facility: {cs.nearestFacilityKm}km</p>
                    <p className="text-cold-spot text-xs mt-1 font-medium">No surgical capacity</p>
                  </div>
                </Popup>
              </Circle>
            ))}
        </AnimatePresence>

        {/* Dropped resources */}
        {droppedResources.map((r, i) => (
          <CircleMarker
            key={`drop-${i}`}
            center={[r.lat, r.lng]}
            radius={10}
            pathOptions={{
              color: "#059669",
              fillColor: "#34D399",
              fillOpacity: 0.8,
              weight: 2,
            }}
          >
            <Popup>
              <p className="text-sm font-medium">Planned Resource Deployment</p>
              <p className="text-xs text-muted-foreground">Click to view details</p>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Map controls overlay - positioned top-left */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute left-3 top-3 z-40 flex flex-col gap-2"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            size="sm"
            variant={showColdSpots ? "default" : "outline"}
            className={`gap-1.5 shadow-md transition-all duration-200 ${
              showColdSpots 
                ? "bg-cold-spot text-white hover:bg-cold-spot/90" 
                : "bg-card text-foreground hover:bg-muted border border-border"
            }`}
            onClick={() => setShowColdSpots(!showColdSpots)}
          >
            {showColdSpots ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            <span className="text-xs font-medium">Cold Spots</span>
          </Button>
        </motion.div>

        {/* Legend */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm max-w-[180px]"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
            <Layers className="h-3.5 w-3.5 text-primary" />
            Map Legend
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-hub-blue shrink-0 shadow-sm" /> Hospital
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm" style={{ background: "#60A5FA" }} /> Clinic
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm" style={{ background: "#818CF8" }} /> Lab
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm" style={{ background: "#A78BFA" }} /> Pharmacy
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-cold-spot opacity-50 shrink-0" /> Cold Spot
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-teal shrink-0 shadow-sm" /> Deployed
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IntelligenceMap;
