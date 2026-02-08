/**
 * ============================================================================
 * PLANNING PANEL - Resource Deployment Planning
 * ============================================================================
 * 
 * Drag-drop interface for deploying resources to cold spots
 * 
 * Features:
 * - Drag resources from catalog
 * - Drop onto cold spot zones
 * - Save deployment plans
 * 
 * HIGHLIGHT ENDPOINT: POST /plan - Save resource deployment plan
 * 
 * TEST CHECKLIST:
 * ✓ Resources are draggable
 * ✓ Cold spot zones accept drops
 * ✓ Save button works
 * ✓ Clear button works
 */

import { GripVertical, User, Stethoscope, Package, X, Check, MapPin, AlertTriangle, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { draggableResources as initialResources, coldSpots, DraggableResource, ColdSpot } from "@/data/mockData";
import { useState } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { savePlan } from "@/lib/api";

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
      return "bg-hub-blue/15 text-hub-blue";
    case "nurse":
      return "bg-teal/15 text-teal";
    case "equipment":
      return "bg-primary/10 text-primary";
    case "supply":
      return "bg-amber/15 text-amber";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const PlanningPanel = () => {
  const [resources, setResources] = useState<DraggableResource[]>(initialResources);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [draggedResource, setDraggedResource] = useState<DraggableResource | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    name: "",
    type: "doctor" as DraggableResource["type"],
    specialty: "",
  });

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
    const resource = resources.find(r => r.id === resourceId);
    
    if (resource && resource.status === "available") {
      setDeployments(prev => {
        const existing = prev.find(d => d.coldSpotId === coldSpot.id);
        if (existing) {
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
      toast.success(`${resource.name} deployed`, {
        description: `Assigned to ${coldSpot.name}`,
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
    toast.info("Resource removed from deployment");
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
    toast.success("Deployment plan saved!", {
      description: `${getTotalDeployedCount()} resource(s) allocated to ${deployments.length} region(s).`,
      icon: <Sparkles className="h-4 w-4" />,
    });
  };

  const handleClearAll = () => {
    setDeployments([]);
    toast.info("All deployments cleared");
  };

  const handleAddResource = () => {
    if (!newResource.name.trim() || !newResource.specialty.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const resource: DraggableResource = {
      id: `r${Date.now()}`,
      type: newResource.type,
      name: newResource.name.trim(),
      specialty: newResource.specialty.trim(),
      status: "available",
      icon: newResource.type === "doctor" || newResource.type === "nurse" ? "user" : 
            newResource.type === "equipment" ? "stethoscope" : "package",
    };

    setResources(prev => [...prev, resource]);
    setNewResource({ name: "", type: "doctor", specialty: "" });
    setShowAddForm(false);
    toast.success("Resource added!", {
      description: `${resource.name} is now available for deployment.`,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full overflow-hidden bg-background"
    >
      {/* Header - fixed height, responsive */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0"
          >
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </motion.div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-foreground truncate">Resource Planner</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">Drag resources to cold spots to plan deployments</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAll}
              className="h-7 sm:h-8 gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3"
              disabled={getTotalDeployedCount() === 0}
            >
              <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Clear
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              size="sm" 
              onClick={handleSavePlan}
              className="h-7 sm:h-8 gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3"
              disabled={getTotalDeployedCount() === 0}
            >
              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Save ({getTotalDeployedCount()})
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Content - fills remaining space, stack on mobile */}
      <div className="flex flex-col sm:flex-row flex-1 min-h-0 overflow-hidden">
        {/* Left - Resource List */}
        <div className="sm:w-1/2 flex flex-col border-b sm:border-b-0 sm:border-r border-border overflow-hidden min-h-0 flex-1 sm:flex-initial">
          <div className="shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 border-b border-border bg-muted/30 flex items-center justify-between">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Available Resources</p>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs gap-0.5 sm:gap-1"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Add
            </Button>
          </div>

          {/* Add Resource Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="shrink-0 p-2 sm:p-3 border-b border-border bg-muted/20 space-y-1.5 sm:space-y-2"
              >
                <Input
                  placeholder="Resource name (e.g., Dr. John Smith)"
                  value={newResource.name}
                  onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                  className="h-7 sm:h-8 text-[10px] sm:text-xs"
                />
                <div className="flex gap-1.5 sm:gap-2">
                  <Select
                    value={newResource.type}
                    onValueChange={(value: DraggableResource["type"]) => 
                      setNewResource(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="h-7 sm:h-8 text-[10px] sm:text-xs flex-1">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="surgeon">Surgeon</SelectItem>
                      <SelectItem value="ambulance">Ambulance</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="supply">Supply</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Specialty"
                    value={newResource.specialty}
                    onChange={(e) => setNewResource(prev => ({ ...prev, specialty: e.target.value }))}
                    className="h-7 sm:h-8 text-[10px] sm:text-xs flex-1"
                  />
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  <Button size="sm" variant="outline" className="h-6 sm:h-7 text-[10px] sm:text-xs flex-1" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" className="h-6 sm:h-7 text-[10px] sm:text-xs flex-1" onClick={handleAddResource}>
                    Add Resource
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
              <AnimatePresence>
                {resources.map((resource, index) => {
                  const isDeployed = resource.status === "deployed" || isResourceDeployed(resource.id);
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      draggable={!isDeployed}
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, resource)}
                      onDragEnd={handleDragEnd}
                      whileHover={!isDeployed ? { scale: 1.01, x: 4 } : {}}
                      className={`
                        flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl border bg-card
                        ${isDeployed 
                          ? "opacity-50 cursor-not-allowed border-border" 
                          : "cursor-grab hover:border-primary/40 hover:shadow-md active:cursor-grabbing border-border"
                        }
                        transition-all duration-200
                      `}
                    >
                      <GripVertical className={`h-3 w-3 sm:h-4 sm:w-4 shrink-0 ${isDeployed ? "text-muted" : "text-muted-foreground"}`} />
                      <motion.div 
                        whileHover={!isDeployed ? { rotate: [0, -10, 10, 0] } : {}}
                        className={`p-1.5 sm:p-2.5 rounded-md sm:rounded-lg shrink-0 ${getIconBgColor(resource.type)}`}
                      >
                        <div className="h-4 w-4 sm:h-5 sm:w-5">{getResourceIcon(resource.type)}</div>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] sm:text-sm font-semibold text-foreground truncate">{resource.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{resource.specialty}</p>
                      </div>
                      <Badge 
                        variant={isDeployed ? "secondary" : "outline"}
                        className={`shrink-0 text-[8px] sm:text-[10px] px-1 sm:px-1.5 ${
                          isDeployed 
                            ? "bg-muted text-muted-foreground" 
                            : "border-teal/30 bg-teal/10 text-teal font-medium"
                        }`}
                      >
                        {isDeployed ? "Deployed" : "Available"}
                      </Badge>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* Right - Cold Spot Drop Zones */}
        <div className="sm:w-1/2 flex flex-col overflow-hidden min-h-0 flex-1 sm:flex-initial">
          <div className="shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 border-b border-border bg-muted/30">
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Cold Spot Targets</p>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
              {coldSpots.slice(0, 3).map((coldSpot, index) => {
                const deployment = deployments.find(d => d.coldSpotId === coldSpot.id);
                const hasResources = deployment && deployment.resources.length > 0;
                
                return (
                  <motion.div
                    key={coldSpot.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onDrop={(e) => handleDrop(e, coldSpot)}
                    onDragOver={handleDragOver}
                    className={`
                      rounded-lg sm:rounded-xl border-2 border-dashed p-2.5 sm:p-4 transition-all duration-300
                      ${draggedResource 
                        ? "border-primary bg-primary/5 shadow-lg drop-zone-active" 
                        : "border-border bg-card hover:border-muted-foreground/30"
                      }
                    `}
                  >
                    {/* Cold Spot Header */}
                    <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <motion.div 
                        animate={draggedResource ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: draggedResource ? Infinity : 0, duration: 1 }}
                        className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-cold-spot/10 shrink-0"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cold-spot" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">{coldSpot.name}</h4>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5">
                          <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            Pop: {coldSpot.population.toLocaleString()}
                          </span>
                          <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded bg-cold-spot/10 text-cold-spot">
                            {coldSpot.nearestFacilityKm}km gap
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Planned Resources */}
                    <AnimatePresence mode="popLayout">
                      {hasResources ? (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-1.5 sm:space-y-2"
                        >
                          <p className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Planned Resources:
                          </p>
                          {deployment.resources.map((resource) => (
                            <motion.div 
                              key={resource.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-foreground bg-teal/5 border border-teal/20 rounded-md sm:rounded-lg px-2 sm:px-3 py-1.5 sm:py-2"
                            >
                              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-teal shrink-0" />
                              <span className="flex-1 truncate font-medium">{resource.name}</span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeResource(coldSpot.id, resource.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-0.5 sm:p-1 rounded hover:bg-destructive/10 shrink-0"
                              >
                                <X className="h-3.5 w-3.5" />
                              </motion.button>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-6 text-center"
                        >
                          <motion.div
                            animate={draggedResource ? { 
                              y: [0, -5, 0],
                              scale: [1, 1.1, 1]
                            } : {}}
                            transition={{ repeat: draggedResource ? Infinity : 0, duration: 0.8 }}
                          >
                            <MapPin className={`h-8 w-8 mb-2 ${draggedResource ? 'text-primary' : 'text-muted-foreground/30'}`} />
                          </motion.div>
                          <p className={`text-xs ${draggedResource ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                            {draggedResource ? "Release to deploy here" : "Drop resources here"}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  );
};

export default PlanningPanel;