import React from "react";
import { cn } from "@/lib/utils";
import { StatusVariant } from "@/types";

const variantStyles: Record<StatusVariant, string> = {
  pending: "bg-status-pending-bg text-status-pending-text",
  approved: "bg-status-approved-bg text-status-approved-text",
  issued: "bg-status-issued-bg text-status-issued-text",
  rejected: "bg-status-rejected-bg text-status-rejected-text",
  new: "bg-status-new-bg text-status-new-text",
  low: "bg-status-low-bg text-status-low-text",
  critical: "bg-status-critical-bg text-status-critical-text",
  inStock: "bg-status-in-stock-bg text-status-in-stock-text",
  outOfStock: "bg-status-out-of-stock-bg text-status-out-of-stock-text",
  partial: "bg-status-partial-bg text-status-partial-text",
  draft: "bg-status-draft-bg text-status-draft-text",
  inward: "bg-status-approved-bg text-status-approved-text",
  outward: "bg-status-rejected-bg text-status-rejected-text",
};

const variantLabels: Record<StatusVariant, string> = {
  pending: "Pending Approval",
  approved: "Approved",
  issued: "Issued",
  rejected: "Rejected",
  new: "New",
  low: "Low Stock",
  critical: "Critical",
  inStock: "In Stock",
  outOfStock: "Out of Stock",
  partial: "Partial",
  draft: "Draft",
  inward: "Inward",
  outward: "Outward",
};

interface StatusPillProps {
  variant: StatusVariant;
  label?: string;
  className?: string;
}

export default function StatusPill({ variant, label, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-1 text-status-pill uppercase tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {label || variantLabels[variant]}
    </span>
  );
}
