"use client";

import React, { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/shared/StatCard";
import StatusPill from "@/components/shared/StatusPill";
import ItemIcon from "@/components/icons/items/ItemIcon";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { MockRequisition, departments } from "@/lib/data/mock-data";
import {
  Search,
  Eye,
  X,
  Check,
  Undo2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function PendingApprovalsPage() {
  const { requisitions, currentUser, updateRequisitionStatus } = useAppStore();
  const [selectedReq, setSelectedReq] = useState<MockRequisition | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const pendingReqs = requisitions
    .filter((r) => r.status === "PENDING")
    .filter((r) => departmentFilter ? r.departmentName === departmentFilter : true)
    .filter((r) => priorityFilter ? r.priority === priorityFilter : true)
    .filter((r) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.departmentName.toLowerCase().includes(q)
      );
    });

  const totalPages = Math.ceil(pendingReqs.length / perPage);
  const paginated = pendingReqs.slice((page - 1) * perPage, page * perPage);

  // Stats
  const todayReqs = pendingReqs.filter(
    (r) => new Date(r.createdAt).toDateString() === new Date().toDateString()
  ).length;
  const approvedThisMonth = requisitions.filter(
    (r) => r.status === "APPROVED" && r.approvedAt
  ).length;
  const rejectedThisMonth = requisitions.filter(
    (r) => r.status === "REJECTED"
  ).length;

  const handleApprove = (req: MockRequisition) => {
    updateRequisitionStatus(req.id, "APPROVED", {
      approvedById: currentUser.id,
      approvedByName: currentUser.name,
      approvedQty: Object.fromEntries(
        req.items.map((item) => [item.itemId, item.requestedQty])
      ),
    });
    setSelectedReq(null);
  };

  const handleReject = () => {
    if (!selectedReq || rejectComment.length < 10) return;
    updateRequisitionStatus(selectedReq.id, "REJECTED", {
      approvedById: currentUser.id,
      approvedByName: currentUser.name,
      rejectedReason: rejectComment,
    });
    setShowRejectModal(false);
    setRejectComment("");
    setSelectedReq(null);
  };

  const handleSendBack = (req: MockRequisition) => {
    updateRequisitionStatus(req.id, "DRAFT");
    setSelectedReq(null);
  };

  return (
    <div>
      <PageHeader
        title="Pending Approvals"
        subtitle="Review and take action on stationery requisitions"
      />

      {/* Stat Strip */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon="Hourglass" iconTint="amber" label="Pending Approvals" value={pendingReqs.length} />
        <StatCard icon="Calendar" iconTint="amber" label="Today's Received" value={todayReqs} />
        <StatCard icon="AlertTriangle" iconTint="red" label="Overdue" value="3" />
        <StatCard icon="CheckCircle2" iconTint="green" label="Approved (This Month)" value={approvedThisMonth} />
        <StatCard icon="XCircle" iconTint="red" label="Rejected (This Month)" value={rejectedThisMonth} />
      </div>

      {/* Body Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left: Requisition List */}
        <div className={selectedReq ? "lg:col-span-3" : "lg:col-span-5"}>
          <div className="rounded-card border border-border bg-surface-card">
            {/* Search bar */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search requisitions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-button border border-border py-2 pl-9 pr-3 text-[13px] placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <select
                value={departmentFilter}
                onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
                className="rounded-button border border-border px-3 py-2 text-[12px] text-text-secondary focus:border-brand-primary focus:outline-none"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                className="rounded-button border border-border px-3 py-2 text-[12px] text-text-secondary focus:border-brand-primary focus:outline-none"
              >
                <option value="">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">REQ No.</th>
                    <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Requested By</th>
                    <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Department</th>
                    <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Date</th>
                    <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Items</th>
                    <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Amount</th>
                    <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Status</th>
                    <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((req) => (
                    <tr
                      key={req.id}
                      className={`border-b border-border last:border-0 cursor-pointer transition-colors ${
                        selectedReq?.id === req.id ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedReq(req)}
                    >
                      <td className="px-4 py-3">
                        <span className="text-[13px] font-medium text-brand-primary">{req.id}</span>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-text-primary">{req.userName}</td>
                      <td className="px-4 py-3 text-[13px] text-text-secondary">{req.departmentName}</td>
                      <td className="px-4 py-3">
                        <div className="text-[13px] text-text-primary">{formatDate(req.createdAt)}</div>
                        <div className="text-[11px] text-text-muted">
                          {new Date(req.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] text-text-primary">{req.items.length}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">{formatCurrency(req.totalAmount)}</td>
                      <td className="px-4 py-3 text-center"><StatusPill variant="new" /></td>
                      <td className="px-4 py-3 text-center">
                        <button className="rounded p-1.5 text-text-secondary hover:bg-gray-100">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <span className="text-[12px] text-text-secondary">
                  Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, pendingReqs.length)} of {pendingReqs.length}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded p-1 text-text-secondary hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded p-1 text-text-secondary hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        {selectedReq && (
          <div className="lg:col-span-2">
            <div className="sticky top-[88px] rounded-card border border-border bg-surface-card p-card-padding">
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">{selectedReq.id}</h3>
                  <StatusPill variant="new" className="mt-1" />
                </div>
                <button onClick={() => setSelectedReq(null)} className="rounded p-1 text-text-muted hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>

              {/* Meta grid */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] uppercase text-text-muted">Requested By</span>
                  <p className="text-[13px] font-medium text-text-primary">{selectedReq.userName}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase text-text-muted">Department</span>
                  <p className="text-[13px] font-medium text-text-primary">{selectedReq.departmentName}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase text-text-muted">Requested On</span>
                  <p className="text-[13px] font-medium text-text-primary">{formatDateTime(selectedReq.createdAt)}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase text-text-muted">Required Date</span>
                  <p className="text-[13px] font-medium text-text-primary">{formatDate(selectedReq.requiredDate)}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase text-text-muted">Purpose</span>
                  <p className="text-[13px] font-medium text-text-primary">{selectedReq.purpose}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase text-text-muted">Priority</span>
                  <p className="text-[13px] font-medium text-text-primary">
                    {selectedReq.priority.charAt(0) + selectedReq.priority.slice(1).toLowerCase()}
                  </p>
                </div>
                {selectedReq.remarks && (
                  <div className="col-span-2">
                    <span className="text-[11px] uppercase text-text-muted">Remarks</span>
                    <p className="text-[13px] text-text-primary">{selectedReq.remarks}</p>
                  </div>
                )}
              </div>

              {/* Items sub-table */}
              <div className="mb-4">
                <h4 className="mb-2 text-[13px] font-semibold text-text-primary">
                  Items Requested ({selectedReq.items.length})
                </h4>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-border">
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Item</th>
                        <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Qty</th>
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Unit</th>
                        <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-text-secondary font-semibold">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReq.items.map((item) => (
                        <tr key={item.id} className="border-b border-border last:border-0">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <ItemIcon itemId={item.itemId} size={20} />
                              <span className="text-[12px] text-text-primary">{item.itemName}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right text-[12px] text-text-primary">{item.requestedQty}</td>
                          <td className="px-3 py-2 text-[12px] text-text-secondary">{item.unit}</td>
                          <td className="px-3 py-2 text-right text-[12px] font-medium text-text-primary">
                            {formatCurrency(item.unitPrice * item.requestedQty)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td className="px-3 py-2 text-[12px] font-semibold text-text-primary">Total</td>
                        <td className="px-3 py-2 text-right text-[12px] font-semibold text-text-primary">
                          {selectedReq.items.reduce((s, i) => s + i.requestedQty, 0)}
                        </td>
                        <td className="px-3 py-2" />
                        <td className="px-3 py-2 text-right text-[12px] font-bold text-brand-primary">
                          {formatCurrency(selectedReq.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Approval History */}
              <div className="mb-4">
                <h4 className="mb-2 text-[13px] font-semibold text-text-primary">Approval History</h4>
                <div className="rounded-md border border-border bg-gray-50 p-3 text-center text-[12px] text-text-muted">
                  No actions taken yet.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-button border border-red-300 px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <X size={14} />
                  Reject
                </button>
                <button
                  onClick={() => handleSendBack(selectedReq)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-button border border-brand-primary px-3 py-2 text-[13px] font-medium text-brand-primary hover:bg-blue-50 transition-colors"
                >
                  <Undo2 size={14} />
                  Send Back
                </button>
                <button
                  onClick={() => handleApprove(selectedReq)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-button bg-green-600 px-3 py-2 text-[13px] font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  <Check size={14} />
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-card bg-surface-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-text-primary">Reject Requisition</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>
            <p className="mb-3 text-[13px] text-text-secondary">
              Please provide a reason for rejection (minimum 10 characters).
            </p>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              rows={4}
              placeholder="Enter rejection reason..."
              className="w-full rounded-button border border-border px-3 py-2 text-[14px] placeholder:text-text-muted focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
            />
            <div className="mt-1 text-right text-[11px] text-text-muted">{rejectComment.length} / 10 min</div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setShowRejectModal(false); setRejectComment(""); }}
                className="rounded-button border border-border px-4 py-2 text-[13px] text-text-secondary hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectComment.length < 10}
                className="rounded-button bg-red-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
