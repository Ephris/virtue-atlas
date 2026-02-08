/**
 * ============================================================================
 * INTELLIGENCE MAP - Geospatial Visualization
 * ============================================================================
 * 
 * Interactive map showing health facilities and cold spots
 * 
 * Features:
 * - Blue markers for verified facilities (hubs)
 * - Red heatmap overlay for cold spots (high contrast)
 * - Click facility to open verification sidebar
 * - Drag-drop resources onto map for planning
 * - Map legend with clear visual hierarchy
 * 
 * HIGHLIGHT ENDPOINT: GET /facilities - Fetch all facilities for map
 * HIGHLIGHT ENDPOINT: GET /cold-spots - Fetch cold spot analysis
 * 
 * TEST CHECKLIST:
 * ✓ Blue hubs clearly visible
 * ✓ Red cold spots have high contrast with blue
 * ✓ Click facility opens sidebar
 * ✓ Drag-drop resources works
 * ✓ Legend is readable
 */

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from "react-leaflet";
import { Layers, Eye, EyeOff, ZoomIn, ZoomOut, LocateFixed, MapPin, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { facilities, coldSpots, type Facility } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

// Color palette for clear contrast
const facilityColors: Record<string, string> = {
  hospital: "#2563EB", // Blue-600 - primary hubs
  clinic: "#3B82F6",   // Blue-500
  lab: "#6366F1",      // Indigo-500
  pharmacy: "#8B5CF6", // Violet-500
};

const statusStyles: Record<string, { radius: number; strokeWidth: number }> = {
  verified: { radius: 10, strokeWidth: 2 },
  unverified: { radius: 7, strokeWidth: 1 },
  flagged: { radius: 9, strokeWidth: 3 },
};

interface IntelligenceMapProps {
  onFacilityClick: (facility: Facility) => void;
  selectedFacility: Facility | null;
}

// ============================================================================
// MAP RESIZER - Ensures map displays correctly when container changes
// ============================================================================
function MapResizer() {
  const map = useMap();
  
  useEffect(() => {
    // Force map to recalculate its size after mounting
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    // Also handle window resize
    const handleResize = () => {
      map.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);
  
  return null;
}

// ============================================================================
// DROPPABLE MAP LAYER - Resource Planning Integration
// ============================================================================
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

// ============================================================================
// MAP CONTROLS - Zoom, Center, etc.
// ============================================================================
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
        className="h-9 w-9 bg-card shadow-md border-border hover:bg-muted"
        onClick={() => map.zoomIn()}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        className="h-9 w-9 bg-card shadow-md border-border hover:bg-muted"
        onClick={() => map.zoomOut()}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        className="h-9 w-9 bg-card shadow-md border-border hover:bg-muted"
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

// ============================================================================
// MAIN MAP COMPONENT
// ============================================================================
const IntelligenceMap = ({ onFacilityClick, selectedFacility }: IntelligenceMapProps) => {
  const [showColdSpots, setShowColdSpots] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [droppedResources, setDroppedResources] = useState<
    { lat: number; lng: number; resourceId: string }[]
  >([]);

  // ============================================================================
  // HIGHLIGHT ENDPOINT: POST /plan - Save resource drop to plan
  // ============================================================================
  const handleDrop = (lat: number, lng: number, resourceId: string) => {
    setDroppedResources((prev) => [...prev, { lat, lng, resourceId }]);
    toast.success("Resource deployed", {
      description: `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    });
  };

  return (
    <div className="relative h-full w-full" style={{ minHeight: '400px' }}>
      <MapContainer
        center={[-1.94, 29.87]}
        zoom={8}
        className="h-full w-full"
        style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapResizer />
        <DroppableMapLayer onDrop={handleDrop} />
        <MapControls />

        {/* ============================================================================
         * FACILITY MARKERS - Blue hubs
         * HIGHLIGHT ENDPOINT: GET /facilities
         * ============================================================================ */}
        {showFacilities && facilities.map((f) => {
          const style = statusStyles[f.status];
          const isSelected = selectedFacility?.id === f.id;
          
          return (
            <CircleMarker
              key={f.id}
              center={[f.lat, f.lng]}
              radius={isSelected ? style.radius + 3 : style.radius}
              pathOptions={{
                color: isSelected
                  ? "#1E3A5F"
                  : f.status === "flagged"
                  ? "#D97706"
                  : facilityColors[f.type],
                fillColor:
                  f.status === "flagged" ? "#FDE68A" : facilityColors[f.type],
                fillOpacity: isSelected ? 0.9 : 0.7,
                weight: isSelected ? 4 : style.strokeWidth,
              }}
              eventHandlers={{
                click: () => onFacilityClick(f),
              }}
            >
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{f.name}</p>
                      <p className="text-muted-foreground capitalize">{f.type}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`font-medium capitalize ${
                        f.status === 'verified' ? 'text-teal' : 
                        f.status === 'flagged' ? 'text-amber' : 
                        'text-muted-foreground'
                      }`}>
                        {f.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{(f.confidence * 100).toFixed(0)}%</span>
                    </div>
                    {f.surgicalCapacity && (
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Surgical</span>
                        <span className="font-medium text-teal">Available</span>
                      </div>
                    )}
                  </div>
                  <button 
                    className="mt-2 w-full text-xs text-center text-primary hover:underline"
                    onClick={() => onFacilityClick(f)}
                  >
                    View details →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* ============================================================================
         * COLD SPOT OVERLAY - Red heatmap for contrast with blue hubs
         * HIGHLIGHT ENDPOINT: GET /cold-spots
         * ============================================================================ */}
        <AnimatePresence>
          {showColdSpots &&
            coldSpots.map((cs) => (
              <Circle
                key={cs.id}
                center={[cs.lat, cs.lng]}
                radius={cs.intensity * 35000}
                pathOptions={{
                  color: "#DC2626",
                  fillColor: "#EF4444",
                  fillOpacity: cs.intensity * 0.35,
                  weight: 2,
                  dashArray: "5, 5",
                }}
              >
                <Popup>
                  <div className="text-sm min-w-[200px]">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-cold-spot shrink-0" />
                      <div>
                        <p className="font-semibold text-cold-spot">Cold Spot</p>
                        <p className="font-medium text-foreground">{cs.name}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Population</span>
                        <span className="font-medium">{cs.population.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Nearest facility</span>
                        <span className="font-medium">{cs.nearestFacilityKm}km</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Intensity</span>
                        <span className="font-medium text-cold-spot">
                          {(cs.intensity * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] text-cold-spot font-medium">
                      ⚠️ No surgical capacity in this area
                    </p>
                  </div>
                </Popup>
              </Circle>
            ))}
        </AnimatePresence>

        {/* Dropped Resources */}
        {droppedResources.map((r, i) => (
          <CircleMarker
            key={`drop-${i}`}
            center={[r.lat, r.lng]}
            radius={12}
            pathOptions={{
              color: "#059669",
              fillColor: "#34D399",
              fillOpacity: 0.85,
              weight: 3,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-teal">Planned Deployment</p>
                <p className="text-xs text-muted-foreground">Resource ID: {r.resourceId}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Map Controls Overlay - Compact */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute left-2 top-2 z-40 flex flex-col gap-1.5"
      >
        {/* Layer Toggles - Compact icon buttons */}
        <div className="flex gap-1">
          <Button
            size="icon"
            variant={showColdSpots ? "default" : "outline"}
            className={`h-8 w-8 shadow-md transition-all ${
              showColdSpots 
                ? "bg-cold-spot text-white hover:bg-cold-spot/90" 
                : "bg-card text-foreground hover:bg-muted border border-border"
            }`}
            onClick={() => setShowColdSpots(!showColdSpots)}
            title={showColdSpots ? "Hide Cold Spots" : "Show Cold Spots"}
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
          
          <Button
            size="icon"
            variant={showFacilities ? "default" : "outline"}
            className={`h-8 w-8 shadow-md transition-all ${
              showFacilities 
                ? "bg-primary text-white hover:bg-primary/90" 
                : "bg-card text-foreground hover:bg-muted border border-border"
            }`}
            onClick={() => setShowFacilities(!showFacilities)}
            title={showFacilities ? "Hide Facilities" : "Show Facilities"}
          >
            <MapPin className="h-4 w-4" />
          </Button>

          {/* Legend Toggle Button */}
          <Button
            size="icon"
            variant="outline"
            className={`h-8 w-8 shadow-md bg-card border-border hover:bg-muted ${showLegend ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setShowLegend(!showLegend)}
            title={showLegend ? "Hide Legend" : "Show Legend"}
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>

        {/* Collapsible Legend */}
        <AnimatePresence>
          {showLegend && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-border bg-card/95 p-2 shadow-lg backdrop-blur-sm max-w-[160px] overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-1.5">
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3 text-primary" />
                  Legend
                </span>
                <button onClick={() => setShowLegend(false)} className="text-muted-foreground hover:text-foreground">
                  <ChevronUp className="h-3 w-3" />
                </button>
              </div>
              
              {/* Facilities - Compact */}
              <div className="space-y-0.5 text-[9px]">
                <p className="text-[8px] uppercase tracking-wide text-muted-foreground font-medium">Facilities</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  <span className="flex items-center gap-1 text-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: facilityColors.hospital }} /> Hospital
                  </span>
                  <span className="flex items-center gap-1 text-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: facilityColors.clinic }} /> Clinic
                  </span>
                  <span className="flex items-center gap-1 text-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: facilityColors.lab }} /> Lab
                  </span>
                  <span className="flex items-center gap-1 text-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: facilityColors.pharmacy }} /> Pharmacy
                  </span>
                </div>
              </div>
              
              <div className="my-1.5 border-t border-border" />
              
              {/* Status - Compact */}
              <div className="space-y-0.5 text-[9px]">
                <p className="text-[8px] uppercase tracking-wide text-muted-foreground font-medium">Status</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  <span className="flex items-center gap-1 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-amber" /> Flagged
                  </span>
                  <span className="flex items-center gap-1 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-cold-spot/50 border border-cold-spot" /> Cold Spot
                  </span>
                  <span className="flex items-center gap-1 text-foreground">
                    <span className="h-2 w-2 rounded-full bg-teal" /> Deployed
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-3 left-3 z-40 flex gap-2"
      >
        <div className="rounded-lg bg-card/95 backdrop-blur-sm border border-border px-3 py-2 shadow-lg">
          <div className="flex items-center gap-3 text-xs">
            <div className="text-center">
              <p className="font-bold text-primary">{facilities.length}</p>
              <p className="text-[9px] text-muted-foreground">Facilities</p>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="text-center">
              <p className="font-bold text-cold-spot">{coldSpots.length}</p>
              <p className="text-[9px] text-muted-foreground">Cold Spots</p>
            </div>
            {droppedResources.length > 0 && (
              <>
                <div className="h-6 w-px bg-border" />
                <div className="text-center">
                  <p className="font-bold text-teal">{droppedResources.length}</p>
                  <p className="text-[9px] text-muted-foreground">Deployed</p>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default IntelligenceMap;
