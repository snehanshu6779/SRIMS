"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import StatusPill from "@/components/shared/StatusPill";
import ItemIcon from "@/components/icons/items/ItemIcon";
import { useAppStore } from "@/stores/app-store";
import { getStockStatus } from "@/lib/data/mock-data";
import { ArrowUpRight } from "lucide-react";

export default function LowStockAlertsPage() {
  const { stockItems } = useAppStore();

  const alertItems = useMemo(() => {
    return stockItems
      .map((i) => ({ ...i, stockStatus: getStockStatus(i) }))
      .filter((i) => i.stockStatus === "LOW" || i.stockStatus === "CRITICAL" || i.stockStatus === "OUT_OF_STOCK")
      .sort((a, b) => {
        const order: Record<string, number> = { OUT_OF_STOCK: 0, CRITICAL: 1, LOW: 2, IN_STOCK: 3 };
        return order[a.stockStatus] - order[b.stockStatus];
      });
  }, [stockItems]);

  const criticalCount = alertItems.filter((i) => i.stockStatus === "CRITICAL").length;
  const lowCount = alertItems.filter((i) => i.stockStatus === "LOW").length;
  const outCount = alertItems.filter((i) => i.stockStatus === "OUT_OF_STOCK").length;

  return (
    <div>
      <PageHeader
        title="Low Stock Alerts"
        subtitle="Items requiring immediate attention or restocking"
        actions={
          <Link
            href="/inventory/inward"
            className="flex items-center gap-1.5 rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover"
          >
            Restock Now
            <ArrowUpRight size={14} />
          </Link>
        }
      />

      {/* Summary strip */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-card border border-border bg-surface-card p-4 text-center">
          <div className="text-[24px] font-bold text-gray-600">{outCount}</div>
          <div className="text-[12px] text-text-secondary">Out of Stock</div>
        </div>
        <div className="rounded-card border border-border bg-surface-card p-4 text-center">
          <div className="text-[24px] font-bold text-red-600">{criticalCount}</div>
          <div className="text-[12px] text-text-secondary">Critical</div>
        </div>
        <div className="rounded-card border border-border bg-surface-card p-4 text-center">
          <div className="text-[24px] font-bold text-amber-600">{lowCount}</div>
          <div className="text-[12px] text-text-secondary">Low Stock</div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-card border border-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Item</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Category</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Current Stock</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Min. Level</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Shortfall</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Status</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody>
              {alertItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[14px] text-text-muted">
                    All items are sufficiently stocked 🎉
                  </td>
                </tr>
              ) : (
                alertItems.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ItemIcon iconKey={item.iconKey} itemId={item.id} size={28} />
                        <div>
                          <div className="text-[13px] font-medium text-text-primary">{item.name}</div>
                          <div className="text-[11px] text-text-muted">{item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-text-secondary">{item.categoryName}</td>
                    <td className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">{item.currentStock}</td>
                    <td className="px-4 py-3 text-right text-[13px] text-text-secondary">{item.minStockLevel}</td>
                    <td className="px-4 py-3 text-right text-[13px] font-semibold text-red-600">
                      {Math.max(0, item.minStockLevel - item.currentStock)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusPill
                        variant={
                          item.stockStatus === "OUT_OF_STOCK"
                            ? "outOfStock"
                            : item.stockStatus === "CRITICAL"
                            ? "critical"
                            : "low"
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href="/inventory/inward"
                        className="rounded-button border border-brand-primary px-3 py-1 text-[11px] font-medium text-brand-primary hover:bg-blue-50"
                      >
                        Reorder
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
