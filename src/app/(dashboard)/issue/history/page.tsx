"use client";

import React, { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import StatusPill from "@/components/shared/StatusPill";
import RequisitionDetailModal from "@/components/shared/RequisitionDetailModal";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { MockRequisition } from "@/lib/data/mock-data";
import { Eye } from "lucide-react";

export default function IssuedHistoryPage() {
  const { issuances, requisitions } = useAppStore();
  const [viewingRequisition, setViewingRequisition] = useState<MockRequisition | null>(null);

  return (
    <div>
      <PageHeader
        title="Issued History"
        subtitle="Complete record of all stock issuances"
      />

      <div className="rounded-card border border-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Reference No.</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">REQ No.</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Issued To</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Issued On</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Items</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Value</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Status</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody>
              {issuances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[14px] text-text-muted">
                    No issuances recorded yet. Process requisitions from Issue Queue.
                  </td>
                </tr>
              ) : (
                issuances.map((iss) => {
                  const req = requisitions.find((r) => r.id === iss.requisitionId);
                  const value = iss.lines.reduce((s, l) => s + l.issuedQty * l.unitPrice, 0);
                  return (
                    <tr key={iss.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-[13px] font-medium text-brand-primary">{iss.referenceNo}</td>
                      <td className="px-4 py-3 text-[13px] text-text-primary">{iss.requisitionId}</td>
                      <td className="px-4 py-3 text-[13px] text-text-primary">{iss.issuedToName}</td>
                      <td className="px-4 py-3 text-[13px] text-text-secondary">{formatDateTime(iss.issueDate)}</td>
                      <td className="px-4 py-3 text-right text-[13px] text-text-primary">{iss.lines.length}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">{formatCurrency(value)}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusPill variant={req?.status === "PARTIAL" ? "partial" : "issued"} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => req && setViewingRequisition(req)}
                          disabled={!req}
                          className="rounded p-1.5 text-text-secondary hover:bg-gray-100 hover:text-brand-primary disabled:opacity-30"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RequisitionDetailModal requisition={viewingRequisition} onClose={() => setViewingRequisition(null)} />
    </div>
  );
}
