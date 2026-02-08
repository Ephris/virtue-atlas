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
    <div className="border-t border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Resource Planning</h3>
          <p className="text-[11px] text-muted-foreground">
            Drag resources onto the map to plan deployments
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={handleSavePlan}>
          <Save className="h-3.5 w-3.5" />
          Save Plan
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {draggableResources.map((r) => (
          <div
            key={r.id}
            draggable
            onDragStart={(e) => handleDragStart(e, r.id)}
            className="resource-draggable flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2"
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
            <span className="text-base">{r.icon}</span>
            <span className="text-xs font-medium text-foreground">{r.label}</span>
          </div>
        ))}
      </div>

      {savedPlans > 0 && (
        <p className="mt-2 text-[11px] text-teal">
          ✓ {savedPlans} plan{savedPlans > 1 ? "s" : ""} saved
        </p>
      )}
    </div>
  );
};

export default PlanningPanel;
