"use client";

import React, { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useAppStore } from "@/stores/app-store";
import { ShieldAlert, Zap, Save } from "lucide-react";

type Priority = "LOW" | "NORMAL" | "URGENT";

const priorityInfo: { key: Priority; label: string; description: string }[] = [
  { key: "LOW", label: "Low Priority", description: "Routine, non-urgent requisitions" },
  { key: "NORMAL", label: "Normal Priority", description: "Standard day-to-day requisitions" },
  { key: "URGENT", label: "Urgent Priority", description: "Time-sensitive requisitions — recommended to keep this manually reviewed" },
];

export default function AutoApprovalRulesPage() {
  const { currentUser, autoApprovalSettings, updateAutoApprovalSettings } = useAppStore();
  const [enabled, setEnabled] = useState(autoApprovalSettings.enabled);
  const [priorities, setPriorities] = useState<Priority[]>(autoApprovalSettings.priorities);
  const [saved, setSaved] = useState(false);

  const canManage = currentUser.role === "ADMIN" || currentUser.role === "INVENTORY_MGR";

  if (!canManage) {
    return (
      <div>
        <PageHeader title="Auto-Approval Rules" subtitle="Configure automatic approval for low-priority requisitions" />
        <div className="rounded-card border border-border bg-surface-card p-8 text-center">
          <ShieldAlert size={36} className="mx-auto mb-3 text-text-muted" />
          <h3 className="text-[16px] font-semibold text-text-primary mb-1">Access restricted</h3>
          <p className="text-[13px] text-text-secondary">
            Only Administrators and Inventory Managers can configure auto-approval rules.
          </p>
        </div>
      </div>
    );
  }

  const togglePriority = (p: Priority) => {
    setPriorities((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const handleSave = () => {
    updateAutoApprovalSettings({ enabled, priorities });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Auto-Approval Rules"
        subtitle="Automatically approve requisitions at submission, bypassing manual review"
      />

      <div className="max-w-2xl space-y-6">
        <div className="rounded-card border border-border bg-surface-card p-card-padding">
          <div className="mb-5 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-tint-amber-bg">
                <Zap size={20} className="text-tint-amber-icon" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-text-primary">Enable Auto-Approval</h3>
                <p className="text-[13px] text-text-secondary">
                  When on, requisitions matching the selected priorities below skip Pending Approvals
                  entirely and are marked Approved the moment they&apos;re submitted.
                </p>
              </div>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${enabled ? "bg-brand-primary" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className={`space-y-2 ${!enabled ? "opacity-40 pointer-events-none" : ""}`}>
            <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-text-muted">
              Auto-approve these priority levels
            </p>
            {priorityInfo.map((p) => (
              <label
                key={p.key}
                className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={priorities.includes(p.key)}
                  onChange={() => togglePriority(p.key)}
                  className="h-4 w-4 rounded border-border text-brand-primary focus:ring-brand-primary"
                />
                <div>
                  <div className="text-[13px] font-medium text-text-primary">{p.label}</div>
                  <div className="text-[12px] text-text-secondary">{p.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-md bg-tint-blue-bg p-3 text-[12px] text-tint-blue-icon">
          Auto-approved requisitions are attributed to &quot;Auto-Approval System&quot; in Audit Logs and
          Approved Requisitions, so there&apos;s always a clear record of which approvals were automatic
          versus manual.
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-button bg-brand-primary px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-primary-hover"
          >
            <Save size={16} />
            Save Rules
          </button>
          {saved && <span className="text-[13px] text-green-600">✓ Auto-approval rules updated</span>}
        </div>
      </div>
    </div>
  );
}
