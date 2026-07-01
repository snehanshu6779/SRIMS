"use client";

import React, { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import StatusPill from "@/components/shared/StatusPill";
import RequisitionDetailModal from "@/components/shared/RequisitionDetailModal";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MockRequisition } from "@/lib/data/mock-data";
import { Search, Eye } from "lucide-react";

export default function ApprovedRequisitionsPage() {
  const { requisitions } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingRequisition, setViewingRequisition] = useState<MockRequisition | null>(null);

  const approved = requisitions
    .filter((r) => ["APPROVED", "ISSUED", "PARTIAL"].includes(r.status))
    .filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return r.id.toLowerCase().includes(q) || r.userName.toLowerCase().includes(q);
    });

  return (
    <div>
      <PageHeader
        title="Approved Requisitions"
        subtitle="Read-only record of all approved requisitions"
      />

      <div className="rounded-card border border-border bg-surface-card">
        <div className="border-b border-border px-4 py-3">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search requisitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-button border border-border py-2 pl-9 pr-3 text-[13px] placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">REQ No.</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Requested By</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Approved By</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Approved On</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Amount</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Status</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody>
              {approved.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[14px] text-text-muted">No approved requisitions found</td></tr>
              ) : (
                approved.map((req) => (
                  <tr key={req.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button onClick={() => setViewingRequisition(req)} className="text-[13px] font-medium text-brand-primary hover:underline">
                        {req.id}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-text-primary">{req.userName}</td>
                    <td className="px-4 py-3 text-[13px] text-text-secondary">{req.approvedByName || "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-text-secondary">{req.approvedAt ? formatDate(req.approvedAt) : "—"}</td>
                    <td className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">{formatCurrency(req.totalAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusPill variant={req.status === "ISSUED" ? "issued" : req.status === "PARTIAL" ? "partial" : "approved"} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setViewingRequisition(req)} className="rounded p-1.5 text-text-secondary hover:bg-gray-100 hover:text-brand-primary"><Eye size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RequisitionDetailModal requisition={viewingRequisition} onClose={() => setViewingRequisition(null)} />
    </div>
  );
}
