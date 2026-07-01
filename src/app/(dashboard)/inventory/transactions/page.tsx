"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/layout/PageHeader";
import StatusPill from "@/components/shared/StatusPill";
import ItemIcon from "@/components/icons/items/ItemIcon";
import { useAppStore } from "@/stores/app-store";
import { formatDateTime } from "@/lib/utils";
import { StatusVariant } from "@/types";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const typeToVariant: Record<string, StatusVariant> = {
  INWARD: "inward",
  OUTWARD: "outward",
  ADJUSTMENT: "partial",
};

export default function AllStockTransactionsPage() {
  const { stockTransactions, stockItems } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const iconKeyFor = (itemId: string) => stockItems.find((i) => i.id === itemId)?.iconKey;

  const filtered = useMemo(() => {
    return stockTransactions.filter((t) => {
      if (typeFilter && t.type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return t.itemName.toLowerCase().includes(q) || t.referenceNo.toLowerCase().includes(q);
      }
      return true;
    });
  }, [stockTransactions, typeFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <PageHeader
        title="All Stock Transactions"
        subtitle="Complete ledger of inward, outward, and adjustment movements"
      />

      <div className="rounded-card border border-border bg-surface-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by item or reference..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full rounded-button border border-border py-2 pl-9 pr-3 text-[13px] placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="rounded-button border border-border px-3 py-2 text-[13px] text-text-secondary focus:border-brand-primary focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="INWARD">Inward</option>
            <option value="OUTWARD">Outward</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Type</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Item</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Quantity</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Reference</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[14px] text-text-muted">No transactions found</td></tr>
              ) : (
                paginated.map((txn) => (
                  <tr key={txn.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <StatusPill variant={typeToVariant[txn.type]} label={txn.type.charAt(0) + txn.type.slice(1).toLowerCase()} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ItemIcon iconKey={iconKeyFor(txn.itemId)} itemId={txn.itemId} size={24} />
                        <span className="text-[13px] text-text-primary">{txn.itemName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-[13px] font-medium">
                      <span className={txn.type === "OUTWARD" ? "text-red-600" : txn.quantity < 0 ? "text-red-600" : "text-green-600"}>
                        {txn.type === "OUTWARD" ? "-" : txn.quantity > 0 ? "+" : ""}{txn.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-text-secondary">{txn.referenceNo}</td>
                    <td className="px-4 py-3 text-[13px] text-text-secondary">{formatDateTime(txn.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-[12px] text-text-secondary">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded p-1.5 text-text-secondary hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                <button key={i + 1} onClick={() => setPage(i + 1)} className={`min-w-[28px] rounded px-1.5 py-0.5 text-[12px] font-medium ${page === i + 1 ? "bg-brand-primary text-white" : "text-text-secondary hover:bg-gray-100"}`}>{i + 1}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded p-1.5 text-text-secondary hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
