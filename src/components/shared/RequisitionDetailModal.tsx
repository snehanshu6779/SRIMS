"use client";

import React from "react";
import { X } from "lucide-react";
import StatusPill from "@/components/shared/StatusPill";
import ItemIcon from "@/components/icons/items/ItemIcon";
import { MockRequisition } from "@/lib/data/mock-data";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { StatusVariant } from "@/types";

const statusToVariant: Record<string, StatusVariant> = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ISSUED: "issued",
  PARTIAL: "partial",
};

interface RequisitionDetailModalProps {
  requisition: MockRequisition | null;
  onClose: () => void;
}

export default function RequisitionDetailModal({ requisition, onClose }: RequisitionDetailModalProps) {
  if (!requisition) return null;
  const req = requisition;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-card bg-surface-card shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="text-[18px] font-bold text-text-primary">{req.id}</h3>
            <StatusPill variant={statusToVariant[req.status] || "draft"} className="mt-1.5" />
          </div>
          <button onClick={onClose} className="rounded p-1 text-text-muted hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4">
          {/* Meta grid */}
          <div className="mb-5 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-3">
            <div>
              <span className="text-[11px] uppercase text-text-muted">Requested By</span>
              <p className="text-[13px] font-medium text-text-primary">{req.userName}</p>
            </div>
            <div>
              <span className="text-[11px] uppercase text-text-muted">Department</span>
              <p className="text-[13px] font-medium text-text-primary">{req.departmentName}</p>
            </div>
            <div>
              <span className="text-[11px] uppercase text-text-muted">Created On</span>
              <p className="text-[13px] font-medium text-text-primary">{formatDateTime(req.createdAt)}</p>
            </div>
            <div>
              <span className="text-[11px] uppercase text-text-muted">Required Date</span>
              <p className="text-[13px] font-medium text-text-primary">{req.requiredDate ? formatDate(req.requiredDate) : "—"}</p>
            </div>
            <div>
              <span className="text-[11px] uppercase text-text-muted">Purpose</span>
              <p className="text-[13px] font-medium text-text-primary">{req.purpose || "—"}</p>
            </div>
            <div>
              <span className="text-[11px] uppercase text-text-muted">Priority</span>
              <p className="text-[13px] font-medium text-text-primary">
                {req.priority.charAt(0) + req.priority.slice(1).toLowerCase()}
              </p>
            </div>
            {req.remarks && (
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[11px] uppercase text-text-muted">Remarks</span>
                <p className="text-[13px] text-text-primary">{req.remarks}</p>
              </div>
            )}
          </div>

          {/* Approval / rejection info */}
          {(req.approvedByName || req.rejectedReason) && (
            <div
              className={`mb-5 rounded-lg p-3 text-[13px] ${
                req.status === "REJECTED" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
              }`}
            >
              {req.status === "REJECTED" ? (
                <>
                  <span className="font-semibold">Rejected by {req.approvedByName}: </span>
                  {req.rejectedReason}
                </>
              ) : (
                <>
                  <span className="font-semibold">Approved by {req.approvedByName}</span>
                  {req.approvedAt && <> on {formatDateTime(req.approvedAt)}</>}
                </>
              )}
            </div>
          )}

          {/* Items table */}
          <h4 className="mb-2 text-[13px] font-semibold text-text-primary">
            Items ({req.items.length})
          </h4>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Item</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Req.</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Appr.</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Issued</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Amount</th>
                </tr>
              </thead>
              <tbody>
                {req.items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <ItemIcon itemId={item.itemId} size={22} />
                        <span className="text-[12px] text-text-primary">{item.itemName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-[12px] text-text-primary">{item.requestedQty}</td>
                    <td className="px-3 py-2 text-right text-[12px] text-text-secondary">{item.approvedQty || "—"}</td>
                    <td className="px-3 py-2 text-right text-[12px] text-text-secondary">{item.issuedQty || "—"}</td>
                    <td className="px-3 py-2 text-right text-[12px] font-medium text-text-primary">
                      {formatCurrency(item.unitPrice * item.requestedQty)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-3 py-2 text-right text-[12px] font-semibold text-text-primary">Total</td>
                  <td className="px-3 py-2 text-right text-[13px] font-bold text-brand-primary">{formatCurrency(req.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex justify-end border-t border-border px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-button border border-border px-4 py-2 text-[13px] font-medium text-text-secondary hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
