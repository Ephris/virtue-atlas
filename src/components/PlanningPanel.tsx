import { GripVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { draggableResources } from "@/data/mockData";
import { useState } from "react";
import { toast } from "sonner";

const PlanningPanel = () => {
  const [savedPlans, setSavedPlans] = useState(0);

  const handleDragStart = (e: React.DragEvent, resourceId: string) => {
    e.dataTransfer.setData("resourceId", resourceId);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleSavePlan = () => {
    setSavedPlans((p) => p + 1);
    toast.success("Deployment plan saved", {
      description: "Resource allocation has been saved to backend.",
    });
  };

  return (
    <div className="border-t border-border bg-card p-3 md:p-4">
      <div className="mb-2 md:mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-foreground">Resource Planning</h3>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground">
            Drag resources onto the map
          </p>
        </div>
        <Button size="sm" className="gap-1.5 w-fit" onClick={handleSavePlan}>
          <Save className="h-3.5 w-3.5" />
          <span className="text-xs">Save Plan</span>
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {draggableResources.map((r) => (
          <div
            key={r.id}
            draggable
            onDragStart={(e) => handleDragStart(e, r.id)}
            className="resource-draggable flex items-center gap-1.5 md:gap-2 rounded-lg border border-border bg-muted px-2 md:px-3 py-1.5 md:py-2"
          >
            <GripVertical className="h-3 w-3 text-muted-foreground hidden sm:block" />
            <span className="text-sm md:text-base">{r.icon}</span>
            <span className="text-[10px] md:text-xs font-medium text-foreground">{r.label}</span>
          </div>
        ))}
      </div>

      {savedPlans > 0 && (
        <p className="mt-2 text-[10px] md:text-[11px] text-teal">
          ✓ {savedPlans} plan{savedPlans > 1 ? "s" : ""} saved
        </p>
      )}
    </div>
  );
};

export default PlanningPanel;
