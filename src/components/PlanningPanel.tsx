import { GripVertical, User, Stethoscope, Package, X, Check, MapPin, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { draggableResources, coldSpots, DraggableResource, ColdSpot } from "@/data/mockData";
import { useState } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Deployment {
  coldSpotId: string;
  resources: DraggableResource[];
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case "doctor":
    case "nurse":
      return <User className="h-5 w-5" />;
    case "equipment":
      return <Stethoscope className="h-5 w-5" />;
    case "supply":
      return <Package className="h-5 w-5" />;
    default:
      return <User className="h-5 w-5" />;
  }
};

const getIconBgColor = (type: string) => {
  switch (type) {
    case "doctor":
      return "bg-blue-100 text-blue-600";
    case "nurse":
      return "bg-emerald-100 text-emerald-600";
    case "equipment":
      return "bg-violet-100 text-violet-600";
    case "supply":
      return "bg-amber-100 text-amber-600";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const PlanningPanel = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [draggedResource, setDraggedResource] = useState<DraggableResource | null>(null);

  const handleDragStart = (e: React.DragEvent, resource: DraggableResource) => {
    e.dataTransfer.setData("resourceId", resource.id);
    e.dataTransfer.effectAllowed = "copy";
    setDraggedResource(resource);
  };

  const handleDragEnd = () => {
    setDraggedResource(null);
  };

  const handleDrop = (e: React.DragEvent, coldSpot: ColdSpot) => {
    e.preventDefault();
    const resourceId = e.dataTransfer.getData("resourceId");
    const resource = draggableResources.find(r => r.id === resourceId);
    
    if (resource && resource.status === "available") {
      setDeployments(prev => {
        const existing = prev.find(d => d.coldSpotId === coldSpot.id);
        if (existing) {
          // Check if already added
          if (existing.resources.some(r => r.id === resource.id)) {
            return prev;
          }
          return prev.map(d => 
            d.coldSpotId === coldSpot.id 
              ? { ...d, resources: [...d.resources, resource] }
              : d
          );
        }
        return [...prev, { coldSpotId: coldSpot.id, resources: [resource] }];
      });
    }
    setDraggedResource(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const removeResource = (coldSpotId: string, resourceId: string) => {
    setDeployments(prev => 
      prev.map(d => 
        d.coldSpotId === coldSpotId 
          ? { ...d, resources: d.resources.filter(r => r.id !== resourceId) }
          : d
      ).filter(d => d.resources.length > 0)
    );
  };

  const getTotalDeployedCount = () => {
    return deployments.reduce((acc, d) => acc + d.resources.length, 0);
  };

  const isResourceDeployed = (resourceId: string) => {
    return deployments.some(d => d.resources.some(r => r.id === resourceId));
  };

  const handleSavePlan = () => {
    if (getTotalDeployedCount() === 0) {
      toast.error("No resources to save", {
        description: "Drag resources to cold spots first.",
      });
      return;
    }
    toast.success("Deployment plan saved", {
      description: `${getTotalDeployedCount()} resource(s) allocated to ${deployments.length} region(s).`,
    });
  };

  const handleClearAll = () => {
    setDeployments([]);
    toast.info("All deployments cleared");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-primary/10">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Resource Planner</h2>
            <p className="text-xs text-muted-foreground">Drag resources to cold spots to plan deployments</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearAll}
            className="h-8 gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
          <Button 
            size="sm" 
            onClick={handleSavePlan}
            className="h-8 gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Save ({getTotalDeployedCount()})
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left - Resource List */}
        <div className="w-1/2 border-r border-border">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              {draggableResources.map((resource) => {
                const isDeployed = resource.status === "deployed" || isResourceDeployed(resource.id);
                return (
                  <div
                    key={resource.id}
                    draggable={!isDeployed}
                    onDragStart={(e) => handleDragStart(e, resource)}
                    onDragEnd={handleDragEnd}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border border-border bg-card
                      ${isDeployed 
                        ? "opacity-60 cursor-not-allowed" 
                        : "cursor-grab hover:border-primary/50 hover:shadow-sm active:cursor-grabbing"
                      }
                      transition-all duration-200
                    `}
                  >
                    <GripVertical className={`h-4 w-4 ${isDeployed ? "text-muted" : "text-muted-foreground"}`} />
                    <div className={`p-2 rounded-lg ${getIconBgColor(resource.type)}`}>
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{resource.name}</p>
                      <p className="text-xs text-muted-foreground">{resource.specialty}</p>
                    </div>
                    <Badge 
                      variant={isDeployed ? "secondary" : "outline"}
                      className={
                        isDeployed 
                          ? "bg-muted text-muted-foreground" 
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                      }
                    >
                      {isDeployed ? "Deployed" : "Available"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Right - Cold Spot Drop Zones */}
        <div className="w-1/2">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-3">
              {coldSpots.slice(0, 3).map((coldSpot) => {
                const deployment = deployments.find(d => d.coldSpotId === coldSpot.id);
                const hasResources = deployment && deployment.resources.length > 0;
                
                return (
                  <div
                    key={coldSpot.id}
                    onDrop={(e) => handleDrop(e, coldSpot)}
                    onDragOver={handleDragOver}
                    className={`
                      rounded-lg border-2 border-dashed p-4 transition-all duration-200
                      ${draggedResource 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-card"
                      }
                    `}
                  >
                    {/* Cold Spot Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-1.5 rounded bg-amber-100">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground">{coldSpot.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Pop: {coldSpot.population.toLocaleString()}  •  {coldSpot.nearestFacilityKm}km to care
                        </p>
                      </div>
                    </div>

                    {/* Planned Resources */}
                    {hasResources ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Planned Resources:</p>
                        {deployment.resources.map((resource) => (
                          <div 
                            key={resource.id}
                            className="flex items-center gap-2 text-sm text-foreground bg-background rounded px-2 py-1.5 border border-border"
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="flex-1 truncate">{resource.name}</span>
                            <button
                              onClick={() => removeResource(coldSpot.id, resource.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <MapPin className="h-6 w-6 text-muted-foreground/50 mb-1" />
                        <p className="text-xs text-muted-foreground">Drop resources here</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default PlanningPanel;
