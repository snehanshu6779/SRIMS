"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import StatusPill from "@/components/shared/StatusPill";
import RequisitionDetailModal from "@/components/shared/RequisitionDetailModal";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MockRequisition } from "@/lib/data/mock-data";
import { Plus, Pencil, Trash2, Send, Eye } from "lucide-react";

export default function DraftsPage() {
  const router = useRouter();
  const { requisitions, currentUser, updateRequisitionStatus, deleteRequisition } = useAppStore();
  const [viewingRequisition, setViewingRequisition] = useState<MockRequisition | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const drafts = requisitions.filter(
    (r) => r.status === "DRAFT" && (currentUser.role === "ADMIN" || r.userId === currentUser.id)
  );

  const handleSubmit = (reqId: string) => {
    updateRequisitionStatus(reqId, "PENDING");
  };

  const handleEdit = (reqId: string) => {
    router.push(`/requisitions/new?edit=${reqId}`);
  };

  const handleDelete = (reqId: string) => {
    deleteRequisition(reqId);
    setDeleteConfirmId(null);
  };

  return (
    <div>
      <PageHeader
        title="Drafts"
        subtitle="Manage your saved requisition drafts"
        actions={
          <Link
            href="/requisitions/new"
            className="flex items-center gap-1.5 rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover"
          >
            <Plus size={16} />
            New Requisition
          </Link>
        }
      />

      <div className="rounded-card border border-border bg-surface-card">
        {drafts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-[40px] mb-3">📝</div>
            <h3 className="text-[16px] font-semibold text-text-primary mb-1">No drafts</h3>
            <p className="text-[13px] text-text-secondary mb-4">
              You don&apos;t have any saved drafts. Start a new requisition to save one.
            </p>
            <Link
              href="/requisitions/new"
              className="inline-flex items-center gap-1.5 rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover"
            >
              <Plus size={14} />
              New Requisition
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">REQ No.</th>
                  <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Purpose</th>
                  <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Items</th>
                  <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Amount</th>
                  <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Created</th>
                  <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((req) => (
                  <tr key={req.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-[13px] font-medium text-brand-primary">{req.id}</td>
                    <td className="px-4 py-3 text-[13px] text-text-primary">{req.purpose || "—"}</td>
                    <td className="px-4 py-3 text-right text-[13px] text-text-primary">{req.items.length}</td>
                    <td className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">{formatCurrency(req.totalAmount)}</td>
                    <td className="px-4 py-3 text-[13px] text-text-secondary">{formatDate(req.createdAt)}</td>
                    <td className="px-4 py-3 text-center"><StatusPill variant="draft" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingRequisition(req)}
                          className="rounded p-1.5 text-text-secondary hover:bg-gray-100 hover:text-brand-primary"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleEdit(req.id)}
                          className="rounded p-1.5 text-text-secondary hover:bg-gray-100 hover:text-brand-primary"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleSubmit(req.id)}
                          disabled={req.items.length === 0}
                          className="rounded p-1.5 text-text-secondary hover:bg-green-50 hover:text-green-600 disabled:opacity-30"
                          title="Submit"
                        >
                          <Send size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(req.id)}
                          className="rounded p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600"
                          title="Delete"
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
        )}
      </div>

      <RequisitionDetailModal requisition={viewingRequisition} onClose={() => setViewingRequisition(null)} />

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-card bg-surface-card p-6 shadow-lg">
            <h3 className="mb-2 text-[15px] font-semibold text-text-primary">Delete draft?</h3>
            <p className="mb-4 text-[13px] text-text-secondary">This draft and its items will be permanently removed. This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirmId(null)} className="rounded-button border border-border px-4 py-2 text-[13px] text-text-secondary hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="rounded-button bg-red-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
