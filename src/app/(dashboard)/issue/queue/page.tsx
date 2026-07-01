"use client";

import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import StatusPill from "@/components/shared/StatusPill";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function IssueQueuePage() {
  const { requisitions } = useAppStore();
  const queue = requisitions.filter((r) => r.status === "APPROVED");

  return (
    <div>
      <PageHeader
        title="Issue Queue"
        subtitle="Approved requisitions awaiting stock issuance"
      />

      <div className="rounded-card border border-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">REQ No.</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Requested By</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Department</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Approved On</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Items</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Amount</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Status</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[14px] text-text-muted">
                    No requisitions in the issue queue
                  </td>
                </tr>
              ) : (
                queue.map((req) => (
                  <tr key={req.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-[13px] font-medium text-brand-primary">{req.id}</td>
                    <td className="px-4 py-3 text-[13px] text-text-primary">{req.userName}</td>
                    <td className="px-4 py-3 text-[13px] text-text-secondary">{req.departmentName}</td>
                    <td className="px-4 py-3 text-[13px] text-text-secondary">{req.approvedAt ? formatDate(req.approvedAt) : "—"}</td>
                    <td className="px-4 py-3 text-right text-[13px] text-text-primary">{req.items.length}</td>
                    <td className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">{formatCurrency(req.totalAmount)}</td>
                    <td className="px-4 py-3 text-center"><StatusPill variant="approved" /></td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href="/issue/items"
                        className="inline-flex items-center gap-1 rounded-button bg-brand-primary px-3 py-1.5 text-[12px] font-medium text-white hover:bg-brand-primary-hover"
                      >
                        Issue
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
