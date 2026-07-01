"use client";

import React, { useState, useRef } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useAppStore } from "@/stores/app-store";
import {
  PenTool,
  FileText,
  Briefcase,
  Folder,
  Calculator,
  MoreHorizontal,
  Tag,
  Archive,
  Layers,
  Package2,
  Plus,
  Pencil,
  Trash2,
  X,
  CornerDownRight,
  Upload,
  type LucideIcon,
} from "lucide-react";

const iconOptions: Record<string, LucideIcon> = {
  PenTool, FileText, Briefcase, Folder, Calculator, MoreHorizontal, Tag, Archive, Layers, Package2,
};

const colorPresets = [
  { color: "#2563EB", bgColor: "#DBEAFE" },
  { color: "#D97706", bgColor: "#FEF3C7" },
  { color: "#059669", bgColor: "#D1FAE5" },
  { color: "#CA8A04", bgColor: "#FEF9C3" },
  { color: "#475569", bgColor: "#F1F5F9" },
  { color: "#6B7280", bgColor: "#F3F4F6" },
  { color: "#7C3AED", bgColor: "#EDE9FE" },
  { color: "#DC2626", bgColor: "#FEE2E2" },
];

/**
 * Renders a category's icon — either a preset Lucide icon (the normal
 * case, where `icon` is a key like "PenTool") or a custom-uploaded image
 * (where `icon` is a data URL, stored directly in the same field — no
 * separate schema field needed, mirroring the same trick used for item
 * icons in src/components/icons/items/ItemIcon.tsx).
 */
function CategoryIcon({ icon, size = 20, color }: { icon: string; size?: number; color?: string }) {
  if (icon.startsWith("data:image")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon} alt="" style={{ width: size, height: size, objectFit: "contain", borderRadius: 4 }} />;
  }
  const Icon = iconOptions[icon] || MoreHorizontal;
  return <Icon size={size} style={color ? { color } : undefined} />;
}

export default function CategoriesPage() {
  const { categories, stockItems, addCategory, updateCategory, deleteCategory } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | "">("");
  const [icon, setIcon] = useState("PenTool");
  const [colorIdx, setColorIdx] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [iconError, setIconError] = useState("");
  const iconFileInputRef = useRef<HTMLInputElement>(null);

  const handleIconUpload = (file: File | undefined) => {
    if (!file) return;
    setIconError("");
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"].includes(file.type)) {
      setIconError("Please choose a JPG, PNG, WEBP, or SVG image.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setIconError("Icon image must be under 1MB — these render small, so a tiny file is plenty.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setIcon(reader.result as string);
    reader.readAsDataURL(file);
  };

  const itemCountByCategory = (catId: string) =>
    stockItems.filter((i) => i.categoryId === catId).length;

  const topLevel = categories.filter((c) => !c.parentId);
  const childrenOf = (parentCatId: string) => categories.filter((c) => c.parentId === parentCatId);

  const openAddModal = (defaultParentId?: string) => {
    setEditingId(null);
    setName("");
    setParentId(defaultParentId || "");
    setIcon("PenTool");
    setColorIdx(0);
    setIconError("");
    setShowModal(true);
  };

  const openEditModal = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    setEditingId(catId);
    setName(cat.name);
    setParentId(cat.parentId || "");
    setIcon(cat.icon);
    const idx = colorPresets.findIndex((p) => p.color === cat.color);
    setColorIdx(idx >= 0 ? idx : 0);
    setIconError("");
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const preset = colorPresets[colorIdx];
    const resolvedParentId = parentId === editingId ? null : (parentId || null); // guard against self-parenting
    if (editingId) {
      updateCategory(editingId, { name, parentId: resolvedParentId, icon, color: preset.color, bgColor: preset.bgColor });
    } else {
      addCategory({ name, parentId: resolvedParentId, icon, color: preset.color, bgColor: preset.bgColor });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    // Orphan any children up to top-level rather than cascading delete
    childrenOf(id).forEach((child) => updateCategory(child.id, { parentId: null }));
    deleteCategory(id);
    setDeleteConfirmId(null);
  };

  const renderCategoryCard = (cat: typeof categories[number], isChild = false) => {
    const count = itemCountByCategory(cat.id);
    return (
      <div
        key={cat.id}
        className={`rounded-card border border-border bg-surface-card p-card-padding ${isChild ? "border-dashed" : ""}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isChild && <CornerDownRight size={14} className="text-text-muted flex-shrink-0" />}
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: cat.bgColor }}
            >
              <CategoryIcon icon={cat.icon} size={20} color={cat.color} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-text-primary">{cat.name}</div>
              <div className="text-[12px] text-text-secondary">{count} item{count !== 1 ? "s" : ""}</div>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => openEditModal(cat.id)}
              className="rounded p-1.5 text-text-secondary hover:bg-gray-100 hover:text-brand-primary"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setDeleteConfirmId(cat.id)}
              className="rounded p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Manage item categories and sub-categories"
        actions={
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-1.5 rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover"
          >
            <Plus size={16} />
            Add Category
          </button>
        }
      />

      <div className="space-y-4">
        {topLevel.map((cat) => {
          const children = childrenOf(cat.id);
          return (
            <div key={cat.id}>
              {renderCategoryCard(cat)}
              {children.length > 0 && (
                <div className="ml-8 mt-2 space-y-2 border-l border-dashed border-border pl-4">
                  {children.map((child) => renderCategoryCard(child, true))}
                </div>
              )}
              <button
                onClick={() => openAddModal(cat.id)}
                className="ml-8 mt-2 flex items-center gap-1 pl-4 text-[12px] font-medium text-brand-primary hover:underline"
              >
                <Plus size={12} />
                Add sub-category under {cat.name}
              </button>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-card bg-surface-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-text-primary">
                {editingId ? "Edit Category" : "Add Category"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Writing Instruments"
                  className="w-full rounded-button border border-border px-3 py-2 text-[14px] placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Parent Category</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-button border border-border px-3 py-2 text-[14px] focus:border-brand-primary focus:outline-none"
                >
                  <option value="">None — Top Level</option>
                  {topLevel.filter((c) => c.id !== editingId).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-text-muted">Only one level of sub-categories is supported.</p>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-text-primary">
                  <CategoryIcon icon={icon} size={18} />
                  Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(iconOptions).map(([key, Icon]) => (
                    <button
                      key={key}
                      onClick={() => setIcon(key)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border-2 ${
                        icon === key ? "border-brand-primary bg-tint-blue-bg" : "border-border"
                      }`}
                    >
                      <Icon size={16} className="text-text-secondary" />
                    </button>
                  ))}
                </div>
                <input
                  ref={iconFileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => handleIconUpload(e.target.files?.[0])}
                />
                <button
                  onClick={() => iconFileInputRef.current?.click()}
                  className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-brand-primary hover:underline"
                >
                  <Upload size={12} />
                  Or upload a custom icon image
                </button>
                {iconError && <p className="mt-1 text-[11px] text-red-600">{iconError}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Color</label>
                <div className="flex gap-2">
                  {colorPresets.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setColorIdx(idx)}
                      className={`h-8 w-8 rounded-full border-2 ${colorIdx === idx ? "border-text-primary" : "border-transparent"}`}
                      style={{ backgroundColor: p.color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-button border border-border px-4 py-2 text-[13px] text-text-secondary hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-40"
              >
                {editingId ? "Save Changes" : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-card bg-surface-card p-6 shadow-lg">
            <h3 className="mb-2 text-[15px] font-semibold text-text-primary">Delete category?</h3>
            <p className="mb-4 text-[13px] text-text-secondary">
              Items already assigned will lose their classification. Any sub-categories will be promoted to top-level.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-button border border-border px-4 py-2 text-[13px] text-text-secondary hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-button bg-red-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
