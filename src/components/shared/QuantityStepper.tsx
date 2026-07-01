"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 9999,
  size = "md",
}: QuantityStepperProps) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center rounded-md border border-border">
      <button
        onClick={decrease}
        disabled={value <= min}
        className={cn(
          "flex items-center justify-center rounded-l-md border-r border-border text-text-secondary hover:bg-gray-50 disabled:opacity-30",
          size === "sm" ? "h-7 w-7" : "h-8 w-8"
        )}
      >
        <Minus size={size === "sm" ? 12 : 14} />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
        }}
        className={cn(
          "w-12 border-none text-center text-text-primary focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          size === "sm" ? "h-7 text-[12px]" : "h-8 text-[13px]"
        )}
      />
      <button
        onClick={increase}
        disabled={value >= max}
        className={cn(
          "flex items-center justify-center rounded-r-md border-l border-border text-text-secondary hover:bg-gray-50 disabled:opacity-30",
          size === "sm" ? "h-7 w-7" : "h-8 w-8"
        )}
      >
        <Plus size={size === "sm" ? 12 : 14} />
      </button>
    </div>
  );
}
