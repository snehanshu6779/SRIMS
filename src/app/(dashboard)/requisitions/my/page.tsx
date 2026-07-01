"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import StatusPill from "@/components/shared/StatusPill";
import RequisitionDetailModal from "@/components/shared/RequisitionDetailModal";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusVariant } from "@/types";
import { MockRequisition } from "@/lib/data/mock-data";
import { Plus, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";

const statusFilters = [
  { label: "All", value: null },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Issued", value: "ISSUED" },
  { label: "Partial", value: "PARTIAL" },
] as const;

const statusToVariant: Record<string, StatusVariant> = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ISSUED: "issued",
  PARTIAL: "partial",
};

export default function MyRequisitionsPage() {
  const { requisitions, currentUser } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewingRequisition, setViewingRequisition] = useState<MockRequisition | null>(null);
  const perPage = 8;

  const myRequisitions = useMemo(() => {
    let result = currentUser.role === "ADMIN"
      ? requisitions
      : requisitions.filter((r) => r.userId === currentUser.id);

    if (activeFilter) {
      result = result.filter((r) => r.status === activeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q) ||
          r.purpose.toLowerCase().includes(q)
      );
    }
    return result;
  }, [requisitions, currentUser, activeFilter, searchQuery]);

  const totalPages = Math.ceil(myRequisitions.length / perPage);
  const paginated = myRequisitions.slice((page - 1) * perPage, page * perPage);

  // Status counts
  const counts = useMemo(() => {
    const base = currentUser.role === "ADMIN"
      ? requisitions
      : requisitions.filter((r) => r.userId === currentUser.id);
    return {
      all: base.length,
      DRAFT: base.filter((r) => r.status === "DRAFT").length,
      PENDING: base.filter((r) => r.status === "PENDING").length,
      APPROVED: base.filter((r) => r.status === "APPROVED").length,
      REJECTED: base.filter((r) => r.status === "REJECTED").length,
      ISSUED: base.filter((r) => r.status === "ISSUED").length,
      PARTIAL: base.filter((r) => r.status === "PARTIAL").length,
    };
  }, [requisitions, currentUser]);

  return (
    <div>
      <PageHeader
        title="My Requisitions"
        subtitle="Track and manage your stationery requisitions"
        actions={
          <Link
            href="/requisitions/new"
            className="flex items-center gap-1.5 rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover transition-colors"
          >
            <Plus size={16} />
            New Requisition
          </Link>
        }
      />

      {/* Filter Pills */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map((f) => {
          const count = f.value ? counts[f.value as keyof typeof counts] : counts.all;
          return (
            <button
              key={f.label}
              onClick={() => {
                setActiveFilter(f.value);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                activeFilter === f.value
                  ? "border-brand-primary bg-brand-primary text-white"
                  : "border-border text-text-secondary hover:bg-gray-50"
              }`}
            >
              {f.label}
              <span
                className={`inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                  activeFilter === f.value ? "bg-white/20 text-white" : "bg-gray-100 text-text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Table */}
      <div className="rounded-card border border-border bg-surface-card">
        {/* Search */}
        <div className="border-b border-border px-4 py-3">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by REQ No., name, or purpose..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-button border border-border py-2 pl-9 pr-3 text-[13px] placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">
                  REQ No.
                </th>
                {currentUser.role === "ADMIN" && (
                  <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">
                    Requested By
                  </th>
                )}
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">
                  Purpose
                </th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[14px] text-text-muted">
                    No requisitions found
                  </td>
                </tr>
              ) : (
                paginated.map((req) => (
                  <tr key={req.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setViewingRequisition(req)}
                        className="text-[13px] font-medium text-brand-primary hover:underline"
                      >
                        {req.id}
                      </button>
                    </td>
                    {currentUser.role === "ADMIN" && (
                      <td className="px-4 py-3 text-[13px] text-text-primary">{req.userName}</td>
                    )}
                    <td className="px-4 py-3 text-[13px] text-text-secondary">{req.departmentName}</td>
                    <td className="px-4 py-3 text-[13px] text-text-secondary">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-text-secondary">{req.purpose}</td>
                    <td className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">
                      {formatCurrency(req.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusPill variant={statusToVariant[req.status] || "draft"} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setViewingRequisition(req)}
                        className="rounded p-1.5 text-text-secondary hover:bg-gray-100 hover:text-brand-primary"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-[12px] text-text-secondary">
              Showing {(page - 1) * perPage + 1} to{" "}
              {Math.min(page * perPage, myRequisitions.length)} of {myRequisitions.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded p-1.5 text-text-secondary hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`min-w-[28px] rounded px-1.5 py-0.5 text-[12px] font-medium ${
                    page === i + 1 ? "bg-brand-primary text-white" : "text-text-secondary hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded p-1.5 text-text-secondary hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <RequisitionDetailModal
        requisition={viewingRequisition}
        onClose={() => setViewingRequisition(null)}
      />
    </div>
  );
}
