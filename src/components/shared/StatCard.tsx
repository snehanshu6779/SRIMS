import React from "react";
import { cn } from "@/lib/utils";
import { TintColor, DeltaTone } from "@/types";
import {
  Archive,
  Hourglass,
  CheckCircle2,
  PackageCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  Wallet,
  XCircle,
  FolderOpen,
  Calendar,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Archive,
  Hourglass,
  CheckCircle2,
  PackageCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  Wallet,
  XCircle,
  FolderOpen,
  Calendar,
};

const tintStyles: Record<TintColor, { bg: string; icon: string }> = {
  blue: { bg: "bg-tint-blue-bg", icon: "text-tint-blue-icon" },
  amber: { bg: "bg-tint-amber-bg", icon: "text-tint-amber-icon" },
  green: { bg: "bg-tint-green-bg", icon: "text-tint-green-icon" },
  purple: { bg: "bg-tint-purple-bg", icon: "text-tint-purple-icon" },
  red: { bg: "bg-tint-red-bg", icon: "text-tint-red-icon" },
};

interface StatCardProps {
  icon: string;
  iconTint: TintColor;
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: DeltaTone;
}

export default function StatCard({
  icon,
  iconTint,
  label,
  value,
  delta,
  deltaTone = "positive",
}: StatCardProps) {
  const IconComponent = iconMap[icon];
  const tint = tintStyles[iconTint];

  return (
    <div className="flex items-start gap-4 rounded-card border border-border bg-surface-card p-card-padding">
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
          tint.bg
        )}
      >
        {IconComponent && (
          <IconComponent size={20} className={tint.icon} />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-card-label text-text-secondary">{label}</p>
        <p className="mt-1 text-card-value text-text-primary">{value}</p>
        {delta && (
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-card-delta",
              deltaTone === "positive" ? "text-[#059669]" : "text-[#DC2626]"
            )}
          >
            {deltaTone === "positive" ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {delta}
          </p>
        )}
      </div>
    </div>
  );
}
