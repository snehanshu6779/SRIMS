"use client";

import React, { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import StatusPill from "@/components/shared/StatusPill";
import RequisitionDetailModal from "@/components/shared/RequisitionDetailModal";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MockRequisition } from "@/lib/data/mock-data";
import { Search, MessageSquareWarning, Eye } from "lucide-react";

export default function RejectedRequisitionsPage() {
  const { requisitions } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewingRequisition, setViewingRequisition] = useState<MockRequisition | null>(null);

  const rejected = requisitions
    .filter((r) => r.status === "REJECTED")
    .filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return r.id.toLowerCase().includes(q) || r.userName.toLowerCase().includes(q);
    });

  return (
    <div>
      <PageHeader
        title="Rejected Requisitions"
        subtitle="Read-only record of all rejected requisitions and reasons"
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
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Rejected By</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Date</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Amount</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Status</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody>
              {rejected.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[14px] text-text-muted">No rejected requisitions found</td></tr>
              ) : (
                rejected.map((req) => (
                  <React.Fragment key={req.id}>
                    <tr
                      className="border-b border-border last:border-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    >
                      <td className="px-4 py-3 text-[13px] font-medium text-brand-primary">{req.id}</td>
                      <td className="px-4 py-3 text-[13px] text-text-primary">{req.userName}</td>
                      <td className="px-4 py-3 text-[13px] text-text-secondary">{req.approvedByName || "—"}</td>
                      <td className="px-4 py-3 text-[13px] text-text-secondary">{formatDate(req.createdAt)}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">{formatCurrency(req.totalAmount)}</td>
                      <td className="px-4 py-3 text-center"><StatusPill variant="rejected" /></td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingRequisition(req);
                          }}
                          className="rounded p-1.5 text-text-secondary hover:bg-gray-100 hover:text-brand-primary"
                          title="View rejected items"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                    {expandedId === req.id && req.rejectedReason && (
                      <tr className="bg-red-50">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="flex items-start gap-2 text-[13px] text-red-800">
                            <MessageSquareWarning size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                            <div>
                              <span className="font-medium">Rejection reason: </span>
                              {req.rejectedReason}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
