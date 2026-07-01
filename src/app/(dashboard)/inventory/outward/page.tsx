"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ItemIcon from "@/components/icons/items/ItemIcon";
import RequisitionDetailModal from "@/components/shared/RequisitionDetailModal";
import { useAppStore } from "@/stores/app-store";
import { formatDateTime } from "@/lib/utils";
import { MockRequisition } from "@/lib/data/mock-data";
import { ArrowUpFromLine, Plus, Search } from "lucide-react";

export default function StockOutwardPage() {
  const searchParams = useSearchParams();
  const { stockItems, stockTransactions, requisitions, recordManualMovement } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [linkedRequisitionId, setLinkedRequisitionId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingRequisition, setViewingRequisition] = useState<MockRequisition | null>(null);

  // Deep-link support: /inventory/outward?item=ITM-0001 (used by Stock Overview's kebab menu)
  useEffect(() => {
    const itemParam = searchParams.get("item");
    if (itemParam) {
      setItemId(itemParam);
      setShowForm(true);
    }
  }, [searchParams]);

  const outwardHistory = stockTransactions.filter((t) => t.type === "OUTWARD");
  const selectedItem = stockItems.find((i) => i.id === itemId);

  // Only requisitions that have actually reached approval are realistic
  // things to attribute a stock write-off/internal-use entry to.
  const linkableRequisitions = useMemo(
    () => requisitions.filter((r) => ["APPROVED", "ISSUED", "PARTIAL"].includes(r.status)),
    [requisitions]
  );

  const findRequisition = (reqId?: string) =>
    reqId ? requisitions.find((r) => r.id === reqId) : undefined;

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return outwardHistory;
    const q = searchQuery.toLowerCase();
    return outwardHistory.filter(
      (t) =>
        t.itemName.toLowerCase().includes(q) ||
        t.referenceNo.toLowerCase().includes(q) ||
        (t.linkedRequisitionId || "").toLowerCase().includes(q)
    );
  }, [outwardHistory, searchQuery]);

  const handleSubmit = () => {
    if (!selectedItem || quantity <= 0) return;
    recordManualMovement({
      type: "OUTWARD",
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantity,
      unitPrice: selectedItem.unitPrice,
      referenceNo: referenceNo || `OUT-${Date.now().toString().slice(-6)}`,
      remarks: reason,
      linkedRequisitionId: linkedRequisitionId || undefined,
    });
    setShowForm(false);
    setItemId("");
    setQuantity(1);
    setReason("");
    setReferenceNo("");
    setLinkedRequisitionId("");
  };

  return (
    <div>
      <PageHeader
        title="Stock Outward"
        subtitle="Outward stock movements, referenced by requisition where applicable"
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover"
          >
            <Plus size={16} />
            Record Outward
          </button>
        }
      />

      {showForm && (
        <div className="mb-6 rounded-card border border-border bg-surface-card p-card-padding">
          <h3 className="mb-4 text-[15px] font-semibold text-text-primary">New Stock Outward Entry</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-text-primary">Item *</label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full rounded-button border border-border px-3 py-2 text-[13px] focus:border-brand-primary focus:outline-none"
              >
                <option value="">Select item...</option>
                {stockItems.map((i) => (
                  <option key={i.id} value={i.id}>{i.name} (Stock: {i.currentStock})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-text-primary">Quantity *</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={selectedItem?.currentStock || 9999}
                className="w-full rounded-button border border-border px-3 py-2 text-[13px] focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-[12px] font-medium text-text-primary">
                Link to Requisition <span className="text-text-muted">(optional)</span>
              </label>
              <select
                value={linkedRequisitionId}
                onChange={(e) => setLinkedRequisitionId(e.target.value)}
                className="w-full rounded-button border border-border px-3 py-2 text-[13px] focus:border-brand-primary focus:outline-none"
              >
                <option value="">No requisition — independent movement</option>
                {linkableRequisitions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.userName} ({r.departmentName})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-text-muted">
                Use this when stock is leaving because of a specific requisition that wasn&apos;t
                processed through Issue Items (e.g. a correction or backdated entry).
              </p>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-text-primary">Reference No.</label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="OUT-XXXXXX (auto if blank)"
                className="w-full rounded-button border border-border px-3 py-2 text-[13px] placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-text-primary">Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Damaged, Internal use, Write-off"
                className="w-full rounded-button border border-border px-3 py-2 text-[13px] placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
          {selectedItem && quantity > selectedItem.currentStock && (
            <p className="mt-2 text-[12px] text-red-600">Quantity exceeds available stock ({selectedItem.currentStock})</p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-button border border-border px-4 py-2 text-[13px] font-medium text-text-secondary hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!itemId || quantity <= 0 || (selectedItem ? quantity > selectedItem.currentStock : false)}
              className="rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-40"
            >
              Record Outward
            </button>
          </div>
        </div>
      )}

      <div className="rounded-card border border-border bg-surface-card">
        <div className="border-b border-border px-4 py-3">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by item, requisition, or reference..."
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
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Item</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Quantity</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Requisition</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Reference No.</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[14px] text-text-muted">No outward movements recorded</td></tr>
              ) : (
                filteredHistory.map((txn) => {
                  const linkedReq = findRequisition(txn.linkedRequisitionId);
                  return (
                    <tr key={txn.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ItemIcon iconKey={txn.itemId ? stockItems.find(i => i.id === txn.itemId)?.iconKey : undefined} itemId={txn.itemId} size={24} />
                          <span className="text-[13px] text-text-primary">{txn.itemName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-red-600">
                          <ArrowUpFromLine size={12} />
                          {txn.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {linkedReq ? (
                          <button
                            onClick={() => setViewingRequisition(linkedReq)}
                            className="text-[13px] font-medium text-brand-primary hover:underline"
                          >
                            {linkedReq.id}
                          </button>
                        ) : (
                          <span className="text-[13px] text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-text-secondary">{txn.referenceNo}</td>
                      <td className="px-4 py-3 text-[13px] text-text-secondary">{formatDateTime(txn.date)}</td>
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
