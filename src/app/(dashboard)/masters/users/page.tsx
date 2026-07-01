"use client";

import React, { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useAppStore } from "@/stores/app-store";
import { departments } from "@/lib/data/mock-data";
import { UserRole } from "@/types";
import { Plus, Pencil, Trash2, X, ShieldAlert } from "lucide-react";

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrator",
  USER: "Employee",
  APPROVER: "Approver",
  INVENTORY_MGR: "Inventory Manager",
};

const roleBadgeColors: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  USER: "bg-blue-100 text-blue-700",
  APPROVER: "bg-green-100 text-green-700",
  INVENTORY_MGR: "bg-amber-100 text-amber-700",
};

export default function UsersPage() {
  const { allUsers, currentUser, addUser, updateUser, toggleUserActive, deleteUser } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [departmentId, setDepartmentId] = useState(departments[0].id);

  if (currentUser.role !== "ADMIN") {
    return (
      <div>
        <PageHeader title="Users" subtitle="Manage system users" />
        <div className="rounded-card border border-border bg-surface-card p-8 text-center">
          <ShieldAlert size={36} className="mx-auto mb-3 text-text-muted" />
          <h3 className="text-[16px] font-semibold text-text-primary mb-1">Access restricted</h3>
          <p className="text-[13px] text-text-secondary">Only Administrators can manage users.</p>
        </div>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("USER");
    setDepartmentId(departments[0].id);
    setShowModal(true);
  };

  const openEditModal = (id: string) => {
    const u = allUsers.find((u) => u.id === id);
    if (!u) return;
    setEditingId(id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setDepartmentId(u.departmentId);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name.trim() || !email.trim()) return;
    const dept = departments.find((d) => d.id === departmentId);
    if (editingId) {
      updateUser(editingId, { name, email, role, departmentId, departmentName: dept?.name || "" });
    } else {
      addUser({
        name, email, role, departmentId, departmentName: dept?.name || "",
        passwordHash: "Welcome@123", approverId: null, isActive: true,
      });
    }
    setShowModal(false);
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage system users and role assignments"
        actions={
          <button onClick={openAddModal} className="flex items-center gap-1.5 rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover">
            <Plus size={16} />
            Add User
          </button>
        }
      />

      <div className="rounded-card border border-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Name</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Email</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Department</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Role</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Active</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-[10px] font-semibold text-white">
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="text-[13px] font-medium text-text-primary">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-text-secondary">{u.email}</td>
                  <td className="px-4 py-3 text-[13px] text-text-secondary">{u.departmentName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${roleBadgeColors[u.role]}`}>
                      {roleLabels[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleUserActive(u.id)}
                      className={`relative h-5 w-9 rounded-full transition-colors ${u.isActive ? "bg-brand-primary" : "bg-gray-300"}`}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${u.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEditModal(u.id)} className="rounded p-1.5 text-text-secondary hover:bg-gray-100 hover:text-brand-primary"><Pencil size={14} /></button>
                      <button
                        onClick={() => setDeleteConfirmId(u.id)}
                        disabled={u.id === currentUser.id}
                        className="rounded p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-card bg-surface-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-text-primary">{editingId ? "Edit User" : "Add User"}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Full Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-button border border-border px-3 py-2 text-[14px] focus:border-brand-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-button border border-border px-3 py-2 text-[14px] focus:border-brand-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Role *</label>
                <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full rounded-button border border-border px-3 py-2 text-[14px] focus:border-brand-primary focus:outline-none">
                  {(Object.keys(roleLabels) as UserRole[]).map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Department *</label>
                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full rounded-button border border-border px-3 py-2 text-[14px] focus:border-brand-primary focus:outline-none">
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              {!editingId && (
                <div className="rounded-md bg-tint-blue-bg p-2.5 text-[12px] text-tint-blue-icon">
                  A temporary password (Welcome@123) will be assigned. The user should change it on first login.
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="rounded-button border border-border px-4 py-2 text-[13px] text-text-secondary hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={!name.trim() || !email.trim()} className="rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-40">
                {editingId ? "Save Changes" : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-card bg-surface-card p-6 shadow-lg">
            <h3 className="mb-2 text-[15px] font-semibold text-text-primary">Delete user?</h3>
            <p className="mb-4 text-[13px] text-text-secondary">This will permanently remove their account access.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirmId(null)} className="rounded-button border border-border px-4 py-2 text-[13px] text-text-secondary hover:bg-gray-50">Cancel</button>
              <button onClick={() => { deleteUser(deleteConfirmId); setDeleteConfirmId(null); }} className="rounded-button bg-red-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
