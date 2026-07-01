"use client";

import React, { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useAppStore } from "@/stores/app-store";
import { Plus, Pencil, Trash2, X, Building2, Phone, MapPin } from "lucide-react";

export default function SuppliersPage() {
  const { suppliers, grns, addSupplier, updateSupplier, deleteSupplier } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");

  const grnCountForSupplier = (supplierId: string) => grns.filter((g) => g.supplierId === supplierId).length;

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setContact("");
    setAddress("");
    setShowModal(true);
  };

  const openEditModal = (id: string) => {
    const sup = suppliers.find((s) => s.id === id);
    if (!sup) return;
    setEditingId(id);
    setName(sup.name);
    setContact(sup.contact);
    setAddress(sup.address);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      updateSupplier(editingId, { name, contact, address });
    } else {
      addSupplier({ name, contact, address });
    }
    setShowModal(false);
  };

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle="Manage your stationery vendors and suppliers"
        actions={
          <button onClick={openAddModal} className="flex items-center gap-1.5 rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover">
            <Plus size={16} />
            Add Supplier
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((sup) => (
          <div key={sup.id} className="rounded-card border border-border bg-surface-card p-card-padding">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tint-blue-bg">
                  <Building2 size={18} className="text-tint-blue-icon" />
                </div>
                <div className="text-[14px] font-semibold text-text-primary">{sup.name}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEditModal(sup.id)} className="rounded p-1.5 text-text-secondary hover:bg-gray-100 hover:text-brand-primary"><Pencil size={14} /></button>
                <button onClick={() => setDeleteConfirmId(sup.id)} className="rounded p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="space-y-1.5 text-[12px] text-text-secondary">
              <div className="flex items-center gap-1.5"><Phone size={12} />{sup.contact}</div>
              <div className="flex items-center gap-1.5"><MapPin size={12} />{sup.address}</div>
            </div>
            <div className="mt-3 border-t border-border pt-2 text-[11px] text-text-muted">
              {grnCountForSupplier(sup.id)} GRN{grnCountForSupplier(sup.id) !== 1 ? "s" : ""} recorded
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-card bg-surface-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-text-primary">{editingId ? "Edit Supplier" : "Add Supplier"}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Supplier Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-button border border-border px-3 py-2 text-[14px] focus:border-brand-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Contact</label>
                <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+91 XXXXX XXXXX" className="w-full rounded-button border border-border px-3 py-2 text-[14px] placeholder:text-text-muted focus:border-brand-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Address</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full rounded-button border border-border px-3 py-2 text-[14px] focus:border-brand-primary focus:outline-none resize-none" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="rounded-button border border-border px-4 py-2 text-[13px] text-text-secondary hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={!name.trim()} className="rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-40">
                {editingId ? "Save Changes" : "Add Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-card bg-surface-card p-6 shadow-lg">
            <h3 className="mb-2 text-[15px] font-semibold text-text-primary">Delete supplier?</h3>
            <p className="mb-4 text-[13px] text-text-secondary">Existing GRN records referencing this supplier will keep their history.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirmId(null)} className="rounded-button border border-border px-4 py-2 text-[13px] text-text-secondary hover:bg-gray-50">Cancel</button>
              <button onClick={() => { deleteSupplier(deleteConfirmId); setDeleteConfirmId(null); }} className="rounded-button bg-red-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
