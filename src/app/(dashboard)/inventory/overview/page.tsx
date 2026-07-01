"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/shared/StatCard";
import StatusPill from "@/components/shared/StatusPill";
import ItemIcon from "@/components/icons/items/ItemIcon";
import { getStockStatus } from "@/lib/data/mock-data";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency } from "@/lib/utils";
import { StatusVariant } from "@/types";
import {
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  ArrowUpFromLine,
  Package,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const stockStatusToVariant: Record<string, StatusVariant> = {
  IN_STOCK: "inStock",
  LOW: "low",
  CRITICAL: "critical",
  OUT_OF_STOCK: "outOfStock",
};

export default function StockOverviewPage() {
  const router = useRouter();
  const { stockItems, stockTransactions, categories } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const perPage = 8;

  // Compute stats
  const itemsWithStatus = useMemo(
    () => stockItems.map((i) => ({ ...i, stockStatus: getStockStatus(i) })),
    [stockItems]
  );

  const totalItems = stockItems.length;
  const totalStock = stockItems.reduce((s, i) => s + i.currentStock, 0);
  const totalValue = stockItems.reduce((s, i) => s + i.currentStock * i.unitPrice, 0);
  const lowStockCount = itemsWithStatus.filter((i) => i.stockStatus === "LOW").length;
  const criticalCount = itemsWithStatus.filter((i) => i.stockStatus === "CRITICAL").length;
  const outOfStockCount = itemsWithStatus.filter((i) => i.stockStatus === "OUT_OF_STOCK").length;
  const inStockCount = itemsWithStatus.filter((i) => i.stockStatus === "IN_STOCK").length;

  // Donut data
  const donutData = [
    { name: "In Stock", value: inStockCount, color: "#059669" },
    { name: "Low Stock", value: lowStockCount, color: "#D97706" },
    { name: "Critical", value: criticalCount, color: "#DC2626" },
    { name: "Out of Stock", value: outOfStockCount, color: "#9CA3AF" },
  ];

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = itemsWithStatus;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      result = result.filter((i) => i.categoryId === categoryFilter);
    }
    if (statusFilter) {
      result = result.filter((i) => i.stockStatus === statusFilter);
    }
    return result;
  }, [itemsWithStatus, searchQuery, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredItems.length / perPage);
  const paginated = filteredItems.slice((page - 1) * perPage, page * perPage);

  const lowStockItems = itemsWithStatus
    .filter((i) => i.stockStatus === "LOW" || i.stockStatus === "CRITICAL")
    .slice(0, 4);
  const recentInward = stockTransactions
    .filter((t) => t.type === "INWARD")
    .slice(0, 3);

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Manage and track all stationery items and stock levels"
        actions={
          <Link
            href="/inventory/inward"
            className="flex items-center gap-1.5 rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover"
          >
            <Plus size={16} />
            Add Stock (Inward)
          </Link>
        }
      />

      {/* Stat Strip */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon="FolderOpen" iconTint="blue" label="Total Items" value={totalItems} />
        <StatCard icon="Package" iconTint="green" label="Total Stock (Qty)" value={totalStock.toLocaleString("en-IN")} />
        <StatCard icon="Wallet" iconTint="blue" label="Total Value" value={formatCurrency(totalValue)} />
        <StatCard icon="AlertTriangle" iconTint="amber" label="Low Stock Items" value={lowStockCount + criticalCount} />
        <StatCard icon="XCircle" iconTint="red" label="Out of Stock" value={outOfStockCount} />
      </div>

      {/* Body Split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        {/* Left: Items Table */}
        <div className="lg:col-span-7">
          <div className="rounded-card border border-border bg-surface-card">
            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="w-full rounded-button border border-border py-2 pl-9 pr-3 text-[13px] placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="rounded-button border border-border px-3 py-2 text-[13px] text-text-secondary focus:border-brand-primary focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-button border border-border px-3 py-2 text-[13px] text-text-secondary focus:border-brand-primary focus:outline-none"
              >
                <option value="">Stock Status</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW">Low Stock</option>
                <option value="CRITICAL">Critical</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
              <button
                onClick={() => { setSearchQuery(""); setCategoryFilter(""); setStatusFilter(""); setPage(1); }}
                disabled={!searchQuery && !categoryFilter && !statusFilter}
                className="flex items-center gap-1 rounded-button border border-border px-3 py-2 text-[13px] font-medium text-text-secondary hover:bg-gray-50 disabled:opacity-40"
              >
                <SlidersHorizontal size={14} />
                Clear Filters
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Item</th>
                    <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Category</th>
                    <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Unit</th>
                    <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Current</th>
                    <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Min Level</th>
                    <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Status</th>
                    <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Unit Price</th>
                    <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Value</th>
                    <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((item) => (
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
                      <td className="px-4 py-3 text-[13px] text-text-secondary">{item.unit}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">{item.currentStock}</td>
                      <td className="px-4 py-3 text-right text-[13px] text-text-secondary">{item.minStockLevel}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusPill variant={stockStatusToVariant[item.stockStatus]} />
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] text-text-primary">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">
                        {formatCurrency(item.currentStock * item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                            className="rounded p-1 text-text-muted hover:bg-gray-100"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openMenuId === item.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border border-border bg-surface-card py-1 shadow-lg">
                                <button
                                  onClick={() => router.push(`/masters/items?edit=${item.id}`)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-text-primary hover:bg-gray-50"
                                >
                                  <Pencil size={14} className="text-text-secondary" />
                                  Edit Item
                                </button>
                                <button
                                  onClick={() => router.push(`/inventory/adjust?item=${item.id}`)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-text-primary hover:bg-gray-50"
                                >
                                  <Package size={14} className="text-text-secondary" />
                                  Adjust Stock
                                </button>
                                <button
                                  onClick={() => router.push(`/inventory/outward?item=${item.id}`)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-text-primary hover:bg-gray-50"
                                >
                                  <ArrowUpFromLine size={14} className="text-text-secondary" />
                                  Stock Outward
                                </button>
                              </div>
                            </>
                          )}
                        </div>
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
                  Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filteredItems.length)} of {filteredItems.length}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded p-1 disabled:opacity-30"><ChevronLeft size={16} /></button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                    <button key={i+1} onClick={() => setPage(i+1)} className={`min-w-[28px] rounded px-1.5 py-0.5 text-[12px] font-medium ${page === i+1 ? "bg-brand-primary text-white" : "text-text-secondary hover:bg-gray-100"}`}>{i+1}</button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded p-1 disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Donut + Alerts */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stock Summary Donut */}
          <div className="rounded-card border border-border bg-surface-card p-card-padding">
            <h3 className="mb-3 text-[14px] font-semibold text-text-primary">Stock Summary</h3>
            <div className="relative h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "6px", fontSize: "12px" }}
                    formatter={(value, name) => [`${value} items`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-bold text-text-primary">{totalItems}</span>
                <span className="text-[11px] text-text-muted">Total Items</span>
              </div>
            </div>
            {/* Legend */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[11px] text-text-secondary">
                    {d.name} ({d.value})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="rounded-card border border-border bg-surface-card p-card-padding">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-text-primary">Low Stock Alerts</h3>
              <Link href="/inventory/low-stock" className="text-[12px] font-medium text-brand-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 rounded-md bg-gray-50 p-2">
                  <ItemIcon iconKey={item.iconKey} itemId={item.id} size={24} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-text-primary truncate">{item.name}</div>
                    <div className="text-[10px] text-text-muted">
                      Current: {item.currentStock} | Min: {item.minStockLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Stock Inward */}
          <div className="rounded-card border border-border bg-surface-card p-card-padding">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-text-primary">Recent Stock Inward</h3>
              <Link href="/inventory/inward" className="text-[12px] font-medium text-brand-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-2">
              {recentInward.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between rounded-md bg-gray-50 p-2">
                  <div>
                    <div className="text-[12px] font-medium text-text-primary">{txn.referenceNo}</div>
                    <div className="text-[10px] text-text-muted">{txn.itemName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-medium text-green-600">+{txn.quantity}</div>
                    <div className="text-[10px] text-text-muted">{txn.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
