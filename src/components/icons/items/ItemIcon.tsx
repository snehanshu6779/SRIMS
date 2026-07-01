import React from "react";

interface ItemIconProps {
  /** Preferred lookup key — matches MockItem.iconKey (e.g. "pen-blue") */
  iconKey?: string;
  /** Legacy fallback — some older call sites still pass an item ID directly */
  itemId?: string;
  size?: number;
  className?: string;
}

type IconRenderer = React.FC<{ size: number }>;

const itemIcons: Record<string, IconRenderer> = {
  "pen-blue": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="10" y="2" width="4" height="16" rx="1" fill="#3B82F6" />
      <polygon points="10,18 14,18 12,23" fill="#1F2937" />
      <rect x="9.5" y="5" width="5" height="1.5" rx="0.5" fill="#60A5FA" opacity="0.5" />
      <circle cx="12" cy="3.5" r="0.5" fill="#93C5FD" />
    </svg>
  ),
  "pen-red": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="10" y="2" width="4" height="16" rx="1" fill="#EF4444" />
      <polygon points="10,18 14,18 12,23" fill="#1F2937" />
      <rect x="9.5" y="5" width="5" height="1.5" rx="0.5" fill="#FCA5A5" opacity="0.5" />
      <circle cx="12" cy="3.5" r="0.5" fill="#FECACA" />
    </svg>
  ),
  "pen-black": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="10" y="2" width="4" height="16" rx="1" fill="#1F2937" />
      <polygon points="10,18 14,18 12,23" fill="#374151" />
      <rect x="9.5" y="5" width="5" height="1.5" rx="0.5" fill="#6B7280" opacity="0.5" />
      <circle cx="12" cy="3.5" r="0.5" fill="#9CA3AF" />
    </svg>
  ),
  marker: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="14" rx="1.5" fill="#1F2937" />
      <rect x="9" y="8" width="6" height="2" fill="#FFFFFF" opacity="0.3" />
      <rect x="10.5" y="16" width="3" height="5" rx="0.5" fill="#374151" />
      <polygon points="10.5,21 13.5,21 12,23.5" fill="#1F2937" />
    </svg>
  ),
  "marker-wb": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="14" rx="1.5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.6" />
      <rect x="9" y="8" width="6" height="2" fill="#2563EB" />
      <rect x="10.5" y="16" width="3" height="5" rx="0.5" fill="#2563EB" />
      <polygon points="10.5,21 13.5,21 12,23.5" fill="#1D4ED8" />
    </svg>
  ),
  pencil: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="10" y="2" width="4" height="15" rx="0.5" fill="#F59E0B" />
      <rect x="10" y="2" width="4" height="3" rx="0.5" fill="#78716C" />
      <polygon points="10,17 14,17 12,22" fill="#FDE68A" />
      <polygon points="11,20 13,20 12,22" fill="#1F2937" />
    </svg>
  ),
  highlighter: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="14" rx="2" fill="#FDE047" />
      <rect x="10.5" y="16" width="3" height="4" rx="0.5" fill="#FBBF24" />
      <rect x="10.5" y="20" width="3" height="2" rx="0.5" fill="#F59E0B" />
      <rect x="9" y="2" width="6" height="3" rx="2" fill="#FACC15" />
    </svg>
  ),
  correction: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="6" width="6" height="14" rx="1.5" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="0.6" />
      <rect x="10.5" y="3" width="3" height="4" rx="0.5" fill="#9CA3AF" />
      <rect x="9" y="11" width="6" height="2" fill="#FFFFFF" />
      <circle cx="12" cy="15" r="1.6" fill="#E5E7EB" />
    </svg>
  ),
  "stapler-pins": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="8" width="16" height="4" rx="1" fill="#9CA3AF" />
      <rect x="6" y="12" width="12" height="2" rx="0.5" fill="#6B7280" />
      <rect x="7" y="10" width="1" height="4" fill="#D1D5DB" />
      <rect x="10" y="10" width="1" height="4" fill="#D1D5DB" />
      <rect x="13" y="10" width="1" height="4" fill="#D1D5DB" />
      <rect x="16" y="10" width="1" height="4" fill="#D1D5DB" />
    </svg>
  ),
  stapler: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="14" width="18" height="4" rx="1" fill="#374151" />
      <path d="M4 8C4 6.9 4.9 6 6 6H18C19.1 6 20 6.9 20 8V14H4V8Z" fill="#4B5563" />
      <rect x="4" y="6" width="16" height="2" rx="1" fill="#6B7280" />
    </svg>
  ),
  scissors: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="6" r="2.5" fill="none" stroke="#6B7280" strokeWidth="1.6" />
      <circle cx="6" cy="18" r="2.5" fill="none" stroke="#6B7280" strokeWidth="1.6" />
      <line x1="8" y1="7.5" x2="20" y2="20" stroke="#9CA3AF" strokeWidth="1.6" />
      <line x1="8" y1="16.5" x2="20" y2="4" stroke="#D1D5DB" strokeWidth="1.6" />
    </svg>
  ),
  tape: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#FDE68A" opacity="0.6" />
      <circle cx="12" cy="12" r="10" fill="none" stroke="#D97706" strokeWidth="1" />
      <circle cx="12" cy="12" r="4.5" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="0.6" />
    </svg>
  ),
  envelope: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="14" rx="1.5" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="0.6" />
      <path d="M2 7L12 14L22 7" fill="none" stroke="#9CA3AF" strokeWidth="1" />
    </svg>
  ),
  calculator: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2" width="14" height="20" rx="1.5" fill="#374151" />
      <rect x="7" y="4.5" width="10" height="4" rx="0.5" fill="#A7F3D0" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2].map((col) => (
          <rect key={`${row}-${col}`} x={7 + col * 3.5} y={10.5 + row * 2.7} width="2.5" height="2" rx="0.4" fill="#9CA3AF" />
        ))
      )}
    </svg>
  ),
  "rubber-bands": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="9" rx="7" ry="4" fill="none" stroke="#FCA5A5" strokeWidth="2" />
      <ellipse cx="12" cy="14" rx="7" ry="4" fill="none" stroke="#F87171" strokeWidth="2" />
    </svg>
  ),
  glue: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="8" y="9" width="8" height="13" rx="1.5" fill="#A855F7" />
      <rect x="9" y="3" width="6" height="6" rx="1" fill="#D8B4FE" />
      <rect x="9.5" y="13" width="5" height="2" fill="#FFFFFF" opacity="0.3" />
    </svg>
  ),
  "arch-file": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="1" fill="#2563EB" />
      <rect x="4" y="2" width="5" height="20" fill="#1D4ED8" />
      <circle cx="14" cy="6" r="1.3" fill="#DBEAFE" />
      <circle cx="18" cy="6" r="1.3" fill="#DBEAFE" />
    </svg>
  ),
  organizer: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="9" width="18" height="12" rx="1" fill="#FB923C" />
      <rect x="5" y="3" width="4" height="9" rx="0.5" fill="#FDBA74" />
      <rect x="10" y="5" width="4" height="7" rx="0.5" fill="#FDBA74" />
      <rect x="15" y="4" width="4" height="8" rx="0.5" fill="#FDBA74" />
    </svg>
  ),
  usb: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="7" y="8" width="10" height="13" rx="1.5" fill="#475569" />
      <rect x="10" y="2" width="4" height="7" rx="0.8" fill="#94A3B8" />
      <rect x="9" y="12" width="6" height="3" rx="0.5" fill="#22D3EE" />
    </svg>
  ),
  "paper-a4": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2" width="14" height="20" rx="1" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="0.5" />
      <line x1="8" y1="7" x2="16" y2="7" stroke="#D1D5DB" strokeWidth="0.8" />
      <line x1="8" y1="10" x2="16" y2="10" stroke="#D1D5DB" strokeWidth="0.8" />
      <line x1="8" y1="13" x2="14" y2="13" stroke="#D1D5DB" strokeWidth="0.8" />
      <line x1="8" y1="16" x2="16" y2="16" stroke="#D1D5DB" strokeWidth="0.8" />
    </svg>
  ),
  notebook: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="6" y="2" width="14" height="20" rx="1" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.5" />
      <circle cx="7" cy="5" r="1.2" fill="none" stroke="#9CA3AF" strokeWidth="0.8" />
      <circle cx="7" cy="9" r="1.2" fill="none" stroke="#9CA3AF" strokeWidth="0.8" />
      <circle cx="7" cy="13" r="1.2" fill="none" stroke="#9CA3AF" strokeWidth="0.8" />
      <circle cx="7" cy="17" r="1.2" fill="none" stroke="#9CA3AF" strokeWidth="0.8" />
      <line x1="10" y1="7" x2="17" y2="7" stroke="#E5E7EB" strokeWidth="0.6" />
      <line x1="10" y1="10" x2="17" y2="10" stroke="#E5E7EB" strokeWidth="0.6" />
      <line x1="10" y1="13" x2="17" y2="13" stroke="#E5E7EB" strokeWidth="0.6" />
    </svg>
  ),
  "sticky-notes": ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="6" y="6" width="13" height="13" rx="1" fill="#FDE047" transform="rotate(-4 12.5 12.5)" />
      <rect x="5" y="5" width="13" height="13" rx="1" fill="#FACC15" />
    </svg>
  ),
  folder: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 7C3 6.44772 3.44772 6 4 6H9L11 8H20C20.5523 8 21 8.44772 21 9V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V7Z" fill="#F59E0B" />
      <path d="M3 9H21V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V9Z" fill="#FBBF24" />
    </svg>
  ),
  clips: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M8 12V6a4 4 0 118 0v12a3 3 0 11-6 0V9" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  eraser: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="10" width="16" height="8" rx="2" fill="#F9A8D4" />
      <rect x="4" y="10" width="6" height="8" rx="2" fill="#F472B6" />
      <rect x="4" y="14" width="16" height="1" fill="#FFFFFF" opacity="0.2" />
    </svg>
  ),
};

// Default icon for unknown items
const DefaultIcon: IconRenderer = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="4" width="16" height="16" rx="2" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="0.5" />
    <circle cx="12" cy="12" r="3" fill="#9CA3AF" />
  </svg>
);

// Legacy itemId → iconKey map, for old call sites that still pass an item ID
const legacyItemIdToKey: Record<string, string> = {
  "ITM-0001": "pen-blue",
  "ITM-0002": "pen-red",
  "ITM-0003": "marker",
  "ITM-0004": "pencil",
  "ITM-0005": "highlighter",
  "ITM-0006": "stapler-pins",
  "ITM-0007": "paper-a4",
  "ITM-0008": "notebook",
  "ITM-0009": "folder",
  "ITM-0010": "eraser",
  "ITM-0011": "pen-black",
  "ITM-0012": "marker-wb",
  "ITM-0013": "sticky-notes",
  "ITM-0014": "clips",
  "ITM-0015": "stapler",
  "ITM-0016": "scissors",
  "ITM-0017": "tape",
  "ITM-0018": "envelope",
  "ITM-0019": "correction",
  "ITM-0020": "calculator",
  "ITM-0021": "rubber-bands",
  "ITM-0022": "glue",
  "ITM-0023": "arch-file",
  "ITM-0024": "organizer",
  "ITM-0025": "usb",
};

// Exported for the icon-picker UI in Items Master
export const ITEM_ICON_OPTIONS: { key: string; label: string }[] = [
  { key: "pen-blue", label: "Blue Pen" },
  { key: "pen-red", label: "Red Pen" },
  { key: "pen-black", label: "Black Pen" },
  { key: "marker", label: "Marker" },
  { key: "marker-wb", label: "Whiteboard Marker" },
  { key: "pencil", label: "Pencil" },
  { key: "highlighter", label: "Highlighter" },
  { key: "correction", label: "Correction Pen" },
  { key: "stapler-pins", label: "Stapler Pins" },
  { key: "stapler", label: "Stapler" },
  { key: "scissors", label: "Scissors" },
  { key: "tape", label: "Tape" },
  { key: "envelope", label: "Envelope" },
  { key: "calculator", label: "Calculator" },
  { key: "rubber-bands", label: "Rubber Bands" },
  { key: "glue", label: "Glue Stick" },
  { key: "arch-file", label: "Lever Arch File" },
  { key: "organizer", label: "Desk Organizer" },
  { key: "usb", label: "USB Drive" },
  { key: "paper-a4", label: "A4 Paper" },
  { key: "notebook", label: "Notebook" },
  { key: "sticky-notes", label: "Sticky Notes" },
  { key: "folder", label: "File Folder" },
  { key: "clips", label: "Paper Clips" },
  { key: "eraser", label: "Eraser" },
];

export default function ItemIcon({ iconKey, itemId, size = 28, className }: ItemIconProps) {
  // A custom-uploaded icon is stored directly as a data URL in the same
  // `iconKey` field that normally holds a preset key (e.g. "pen-blue") —
  // no separate schema field needed. Render it as an image when present.
  if (iconKey && iconKey.startsWith("data:image")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconKey}
        alt=""
        className={className}
        style={{ width: size, height: size, objectFit: "contain", borderRadius: 4 }}
      />
    );
  }

  const resolvedKey = iconKey || (itemId ? legacyItemIdToKey[itemId] : undefined);
  const Icon = (resolvedKey && itemIcons[resolvedKey]) || DefaultIcon;
  return (
    <span className={className}>
      <Icon size={size} />
    </span>
  );
}
