import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface WizardStep {
  number: number;
  label: string;
}

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
}

export default function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;
        const isPending = step.number > currentStep;

        return (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-2">
              {/* Circle */}
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold transition-colors",
                  isCompleted && "bg-brand-primary text-white",
                  isActive && "bg-brand-primary text-white",
                  isPending && "border-2 border-gray-300 text-text-muted"
                )}
              >
                {isCompleted ? <Check size={14} /> : step.number}
              </div>
              {/* Label */}
              <span
                className={cn(
                  "hidden text-[13px] font-medium sm:inline",
                  isActive ? "text-brand-primary" : isCompleted ? "text-text-primary" : "text-text-muted"
                )}
              >
                {step.label}
              </span>
            </div>
            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "mx-3 h-[2px] w-8 sm:w-12",
                  step.number < currentStep ? "bg-brand-primary" : "bg-gray-200"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
