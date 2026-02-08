import { Brain } from "lucide-react";
import { motion } from "framer-motion";
import { type ChainStep } from "@/data/mockData";

interface ChainOfThoughtStepperProps {
  steps: ChainStep[];
}

const ChainOfThoughtStepper = ({ steps }: ChainOfThoughtStepperProps) => {
  return (
    <div className="mt-3 rounded-lg border border-amber/30 bg-amber/5 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber">
        <Brain className="h-3.5 w-3.5" />
        AI Reasoning Trace
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="cot-step flex gap-2"
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  step.status === "complete"
                    ? "bg-teal text-primary-foreground"
                    : step.status === "active"
                    ? "bg-amber text-amber-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.step}
              </div>
              {i < steps.length - 1 && (
                <div className="mt-1 h-full w-px bg-border" />
              )}
            </div>
            <div className="pb-2">
              <p className="text-xs font-medium text-foreground">{step.title}</p>
              <p className="text-[11px] text-muted-foreground">{step.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChainOfThoughtStepper;
