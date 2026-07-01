import React from "react";
import { cn } from "@/lib/utils";
import {
  PenTool,
  FileText,
  Briefcase,
  Folder,
  Calculator,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  PenTool,
  FileText,
  Briefcase,
  Folder,
  Calculator,
  MoreHorizontal,
};

interface CategoryTileProps {
  icon: string;
  color: string;
  bgColor: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function CategoryTile({
  icon,
  color,
  bgColor,
  label,
  active,
  onClick,
}: CategoryTileProps) {
  const IconComponent = categoryIcons[icon];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border-2 px-4 py-3 transition-all min-w-[100px]",
        active
          ? "border-brand-primary bg-tint-blue-bg"
          : "border-transparent bg-gray-50 hover:bg-gray-100"
      )}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: bgColor }}
      >
        {IconComponent && <IconComponent size={18} style={{ color }} />}
      </div>
      <span className="text-[11px] font-medium text-text-primary leading-tight text-center">
        {label}
      </span>
    </button>
  );
}
