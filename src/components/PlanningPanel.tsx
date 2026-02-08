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
    <div className="border-t border-border bg-card px-3 py-2 md:px-4 md:py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-xs font-semibold text-foreground">Resource Planning</h3>
            <p className="text-[10px] text-muted-foreground hidden sm:block">
              Drag onto map
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {draggableResources.map((r) => (
              <div
                key={r.id}
                draggable
                onDragStart={(e) => handleDragStart(e, r.id)}
                className="resource-draggable flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-1"
              >
                <GripVertical className="h-2.5 w-2.5 text-muted-foreground hidden sm:block" />
                <span className="text-sm">{r.icon}</span>
                <span className="text-[10px] font-medium text-foreground hidden md:inline">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedPlans > 0 && (
            <span className="text-[10px] text-teal">✓ {savedPlans} saved</span>
          )}
          <Button size="sm" className="gap-1 h-7 px-2" onClick={handleSavePlan}>
            <Save className="h-3 w-3" />
            <span className="text-[10px] hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanningPanel;
