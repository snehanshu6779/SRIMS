"use client";

import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useAppStore } from "@/stores/app-store";
import { ShieldAlert, Check, X } from "lucide-react";

const permissionMatrix = [
  { label: "Browse catalog & raise requisitions", ADMIN: true, USER: true, APPROVER: true, INVENTORY_MGR: false },
  { label: "View own requisitions only", ADMIN: false, USER: true, APPROVER: false, INVENTORY_MGR: false },
  { label: "View all requisitions (system-wide)", ADMIN: true, USER: false, APPROVER: false, INVENTORY_MGR: false },
  { label: "Approve / Reject / Send Back requisitions", ADMIN: true, USER: false, APPROVER: true, INVENTORY_MGR: false },
  { label: "Issue approved requisitions", ADMIN: true, USER: false, APPROVER: false, INVENTORY_MGR: true },
  { label: "Manage stock (inward / outward / adjust)", ADMIN: true, USER: false, APPROVER: false, INVENTORY_MGR: true },
  { label: "Set stock thresholds", ADMIN: true, USER: false, APPROVER: false, INVENTORY_MGR: true },
  { label: "Manage Categories / Items / Suppliers", ADMIN: true, USER: false, APPROVER: false, INVENTORY_MGR: true },
  { label: "Manage Users", ADMIN: true, USER: false, APPROVER: false, INVENTORY_MGR: false },
  { label: "View Audit Logs", ADMIN: true, USER: false, APPROVER: false, INVENTORY_MGR: false },
  { label: "Modify system Settings", ADMIN: true, USER: false, APPROVER: false, INVENTORY_MGR: false },
];

const roleColumns = [
  { key: "ADMIN" as const, label: "Admin" },
  { key: "USER" as const, label: "Normal User" },
  { key: "APPROVER" as const, label: "Approver" },
  { key: "INVENTORY_MGR" as const, label: "Inventory Manager" },
];

export default function RolesPermissionsPage() {
  const { currentUser } = useAppStore();

  if (currentUser.role !== "ADMIN") {
    return (
      <div>
        <PageHeader title="Roles & Permissions" subtitle="System role definitions" />
        <div className="rounded-card border border-border bg-surface-card p-8 text-center">
          <ShieldAlert size={36} className="mx-auto mb-3 text-text-muted" />
          <h3 className="text-[16px] font-semibold text-text-primary mb-1">Access restricted</h3>
          <p className="text-[13px] text-text-secondary">Only Administrators can view role permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Fixed system role definitions — RBAC is enforced server-side on every route"
      />

      <div className="rounded-card border border-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Permission</th>
                {roleColumns.map((r) => (
                  <th key={r.key} className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((row, idx) => (
                <tr key={idx} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-[13px] text-text-primary">{row.label}</td>
                  {roleColumns.map((r) => (
                    <td key={r.key} className="px-4 py-3 text-center">
                      {row[r.key] ? (
                        <Check size={16} className="mx-auto text-green-600" />
                      ) : (
                        <X size={16} className="mx-auto text-gray-300" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 rounded-md bg-tint-blue-bg p-3 text-[12px] text-tint-blue-icon">
        Roles are fixed in this version of SRIMS and cannot be customized. Every API route validates the
        session role server-side — no role information is ever trusted from the client.
      </div>
    </div>
  );
}
