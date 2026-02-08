import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from "react-leaflet";
import { Layers, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { facilities, coldSpots, type Facility } from "@/data/mockData";
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

const IntelligenceMap = ({ onFacilityClick, selectedFacility }: IntelligenceMapProps) => {
  const [showColdSpots, setShowColdSpots] = useState(true);
  const [droppedResources, setDroppedResources] = useState<
    { lat: number; lng: number; resourceId: string }[]
  >([]);

  const handleDrop = (lat: number, lng: number, resourceId: string) => {
    setDroppedResources((prev) => [...prev, { lat, lng, resourceId }]);
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
                <p className="text-muted-foreground">{f.type}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Cold spot overlay */}
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
                  <p>Population: {cs.population.toLocaleString()}</p>
                  <p>Nearest facility: {cs.nearestFacilityKm}km</p>
                  <p>Surgical capacity: None</p>
                </div>
              </Popup>
            </Circle>
          ))}

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
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Map controls overlay */}
      <div className="absolute left-3 top-3 z-[1000] flex flex-col gap-2">
        <Button
          size="sm"
          variant={showColdSpots ? "default" : "outline"}
          className="gap-1.5 bg-card text-foreground shadow-md hover:bg-muted border border-border"
          onClick={() => setShowColdSpots(!showColdSpots)}
        >
          {showColdSpots ? (
            <Eye className="h-3.5 w-3.5 text-cold-spot" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
          <span className="text-xs">Cold Spots</span>
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-lg border border-border bg-card/95 p-3 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-1 text-xs font-medium text-foreground mb-2">
          <Layers className="h-3.5 w-3.5" />
          Legend
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-hub-blue" /> Hospital
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#60A5FA" }} /> Clinic
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#818CF8" }} /> Lab
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#A78BFA" }} /> Pharmacy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cold-spot opacity-40" /> Cold Spot
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-teal" /> Deployed
          </span>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceMap;
