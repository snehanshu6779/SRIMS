"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/shared/StatCard";
import StatusPill from "@/components/shared/StatusPill";
import ItemIcon from "@/components/icons/items/ItemIcon";
import { useAppStore } from "@/stores/app-store";
import { getStockStatus } from "@/lib/data/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusVariant } from "@/types";
import { Calendar, ChevronDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type TrendPeriod = "This Month" | "Last Month" | "Last 3 Months" | "This Year";

// ─── Synthetic trend datasets per period (illustrative — not derived from live transactional history) ───
const trendDatasets: Record<TrendPeriod, { date: string; requisitions: number; issued: number }[]> = {
  "This Month": [
    { date: "01 Jun", requisitions: 12, issued: 8 },
    { date: "04 Jun", requisitions: 18, issued: 10 },
    { date: "07 Jun", requisitions: 25, issued: 15 },
    { date: "10 Jun", requisitions: 22, issued: 18 },
    { date: "13 Jun", requisitions: 35, issued: 22 },
    { date: "16 Jun", requisitions: 42, issued: 30 },
    { date: "19 Jun", requisitions: 50, issued: 40 },
    { date: "22 Jun", requisitions: 55, issued: 45 },
    { date: "25 Jun", requisitions: 65, issued: 55 },
    { date: "29 Jun", requisitions: 80, issued: 68 },
  ],
  "Last Month": [
    { date: "01 May", requisitions: 10, issued: 6 },
    { date: "05 May", requisitions: 20, issued: 14 },
    { date: "10 May", requisitions: 28, issued: 20 },
    { date: "15 May", requisitions: 38, issued: 32 },
    { date: "20 May", requisitions: 48, issued: 40 },
    { date: "25 May", requisitions: 58, issued: 50 },
    { date: "31 May", requisitions: 70, issued: 60 },
  ],
  "Last 3 Months": [
    { date: "Week 1", requisitions: 35, issued: 28 },
    { date: "Week 3", requisitions: 52, issued: 44 },
    { date: "Week 5", requisitions: 68, issued: 55 },
    { date: "Week 7", requisitions: 60, issued: 50 },
    { date: "Week 9", requisitions: 75, issued: 62 },
    { date: "Week 11", requisitions: 90, issued: 78 },
    { date: "Week 13", requisitions: 105, issued: 92 },
  ],
  "This Year": [
    { date: "Jan", requisitions: 180, issued: 150 },
    { date: "Feb", requisitions: 210, issued: 175 },
    { date: "Mar", requisitions: 245, issued: 200 },
    { date: "Apr", requisitions: 230, issued: 195 },
    { date: "May", requisitions: 280, issued: 235 },
    { date: "Jun", requisitions: 310, issued: 260 },
  ],
};

const trendYDomain: Record<TrendPeriod, [number, number]> = {
  "This Month": [0, 100],
  "Last Month": [0, 80],
  "Last 3 Months": [0, 120],
  "This Year": [0, 350],
};

const statusToVariant: Record<string, StatusVariant> = {
  DRAFT: "draft", PENDING: "pending", APPROVED: "approved",
  REJECTED: "rejected", ISSUED: "issued", PARTIAL: "partial",
};

const stockStatusToVariant: Record<string, StatusVariant> = {
  IN_STOCK: "inStock", LOW: "low", CRITICAL: "critical", OUT_OF_STOCK: "outOfStock",
};

const txnTypeToVariant: Record<string, StatusVariant> = {
  INWARD: "inward", OUTWARD: "outward", ADJUSTMENT: "partial",
};

export default function DashboardPage() {
  const router = useRouter();
  const { requisitions, stockItems, stockTransactions, currentUser } = useAppStore();
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>("This Month");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedRange, setAppliedRange] = useState<{ from: string; to: string } | null>(null);

  // Normal employees don't get a Dashboard — redirect straight to their
  // own requisitions instead. Covers direct URL visits, not just nav clicks.
  useEffect(() => {
    if (currentUser.role === "USER") {
      router.replace("/requisitions/my");
    }
  }, [currentUser.role, router]);

  // ─── Live stat cards ───
  const totalRequisitions = requisitions.length;
  const pendingCount = requisitions.filter((r) => r.status === "PENDING").length;
  const approvedCount = requisitions.filter((r) => r.status === "APPROVED").length;
  const issuedCount = requisitions.filter((r) => r.status === "ISSUED" || r.status === "PARTIAL").length;

  const itemsWithStatus = useMemo(
    () => stockItems.map((i) => ({ ...i, stockStatus: getStockStatus(i) })),
    [stockItems]
  );
  const lowStockCount = itemsWithStatus.filter((i) => i.stockStatus === "LOW" || i.stockStatus === "CRITICAL").length;

  // ─── Live Low Stock Alerts (top 4) ───
  const lowStockItems = useMemo(
    () => itemsWithStatus
      .filter((i) => i.stockStatus === "LOW" || i.stockStatus === "CRITICAL")
      .slice(0, 4),
    [itemsWithStatus]
  );

  // ─── Live Recent Requisitions (top 5, newest first, optionally date-filtered) ───
  const recentRequisitions = useMemo(() => {
    let filtered = [...requisitions];
    if (appliedRange) {
      const fromTime = new Date(appliedRange.from).getTime();
      const toTime = new Date(appliedRange.to).getTime() + 86400000; // include the whole "to" day
      filtered = filtered.filter((r) => {
        const t = new Date(r.createdAt).getTime();
        return t >= fromTime && t <= toTime;
      });
    }
    return filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [requisitions, appliedRange]);

  // ─── Live Recent Stock Transactions (top 5, newest first, optionally date-filtered) ───
  const recentTransactions = useMemo(() => {
    let filtered = stockTransactions;
    if (appliedRange) {
      const fromTime = new Date(appliedRange.from).getTime();
      const toTime = new Date(appliedRange.to).getTime() + 86400000;
      filtered = filtered.filter((t) => {
        const tt = new Date(t.date).getTime();
        return tt >= fromTime && tt <= toTime;
      });
    }
    return filtered.slice(0, 5);
  }, [stockTransactions, appliedRange]);

  const iconKeyFor = (itemId: string) => stockItems.find((i) => i.id === itemId)?.iconKey;

  const dateRangeLabel = appliedRange
    ? `${formatDate(appliedRange.from)} – ${formatDate(appliedRange.to)}`
    : "All Time";

  const handleApplyRange = () => {
    if (dateFrom && dateTo) {
      setAppliedRange({ from: dateFrom, to: dateTo });
    }
    setShowDatePicker(false);
  };

  const handleClearRange = () => {
    setAppliedRange(null);
    setDateFrom("");
    setDateTo("");
    setShowDatePicker(false);
  };

  // All hooks above have run unconditionally, satisfying the Rules of
  // Hooks; it's only safe to branch on role for the render output itself
  // starting here. The useEffect above handles the actual redirect.
  if (currentUser.role === "USER") {
    return null;
  }

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Overview of stationery requisitions and inventory"
        actions={
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-[13px] text-text-secondary hover:bg-gray-50"
            >
              <Calendar size={14} />
              <span>{dateRangeLabel}</span>
              <ChevronDown size={14} />
            </button>
            {showDatePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-card border border-border bg-surface-card p-4 shadow-lg">
                  <p className="mb-3 text-[12px] font-semibold text-text-primary">
                    Filter Recent Requisitions &amp; Transactions
                  </p>
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-text-secondary">From</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full rounded-button border border-border px-2 py-1.5 text-[12px] focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-text-secondary">To</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full rounded-button border border-border px-2 py-1.5 text-[12px] focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleClearRange}
                      className="rounded-button border border-border px-3 py-1.5 text-[12px] text-text-secondary hover:bg-gray-50"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleApplyRange}
                      disabled={!dateFrom || !dateTo}
                      className="rounded-button bg-brand-primary px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        }
      />

      {/* Row 1: Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon="Archive" iconTint="blue" label="Total Requisitions" value={totalRequisitions} />
        <StatCard icon="Hourglass" iconTint="amber" label="Pending Approvals" value={pendingCount} />
        <StatCard icon="CheckCircle2" iconTint="green" label="Approved" value={approvedCount} />
        <StatCard icon="PackageCheck" iconTint="purple" label="Issued" value={issuedCount} />
        <StatCard icon="AlertTriangle" iconTint="red" label="Low Stock Items" value={lowStockCount} />
      </div>

      {/* Row 2: Chart + Low Stock Alerts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Requisition Trend Chart */}
        <div className="col-span-1 rounded-card border border-border bg-surface-card p-card-padding lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-text-primary">Requisition Trend</h3>
            <div className="relative">
              <button
                onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[12px] text-text-secondary hover:bg-gray-50"
              >
                {trendPeriod}
                <ChevronDown size={12} />
              </button>
              {showPeriodMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPeriodMenu(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-border bg-surface-card py-1 shadow-lg">
                    {(Object.keys(trendDatasets) as TrendPeriod[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => { setTrendPeriod(p); setShowPeriodMenu(false); }}
                        className={`block w-full px-3 py-1.5 text-left text-[12px] hover:bg-gray-50 ${
                          trendPeriod === p ? "font-semibold text-brand-primary" : "text-text-primary"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendDatasets[trendPeriod]} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  domain={trendYDomain[trendPeriod]}
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line
                  type="monotone"
                  dataKey="requisitions"
                  name="Requisitions"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="issued"
                  name="Issued"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="col-span-1 rounded-card border border-border bg-surface-card p-card-padding lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-text-primary">Low Stock Alerts</h3>
            <Link href="/inventory/low-stock" className="text-[13px] font-medium text-brand-primary hover:text-brand-primary-hover">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-table-header uppercase tracking-table-header text-text-secondary">Item</th>
                  <th className="pb-2 text-right text-table-header uppercase tracking-table-header text-text-secondary">Current</th>
                  <th className="pb-2 text-right text-table-header uppercase tracking-table-header text-text-secondary">Min Level</th>
                  <th className="pb-2 text-right text-table-header uppercase tracking-table-header text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.length === 0 ? (
                  <tr><td colSpan={4} className="py-6 text-center text-[12px] text-text-muted">All items sufficiently stocked 🎉</td></tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <ItemIcon iconKey={item.iconKey} itemId={item.id} size={24} />
                          <span className="text-[13px] font-medium text-text-primary">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right text-[13px] text-text-primary font-medium">{item.currentStock}</td>
                      <td className="py-2.5 text-right text-[13px] text-text-secondary">{item.minStockLevel}</td>
                      <td className="py-2.5 text-right">
                        <StatusPill variant={stockStatusToVariant[item.stockStatus]} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Requisitions + Recent Stock Transactions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Requisitions */}
        <div className="rounded-card border border-border bg-surface-card p-card-padding">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-text-primary">Recent Requisitions</h3>
            <Link href="/requisitions/my" className="text-[13px] font-medium text-brand-primary hover:text-brand-primary-hover">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-table-header uppercase tracking-table-header text-text-secondary">REQ No.</th>
                  <th className="pb-2 text-left text-table-header uppercase tracking-table-header text-text-secondary">Requested By</th>
                  <th className="pb-2 text-left text-table-header uppercase tracking-table-header text-text-secondary">Date</th>
                  <th className="pb-2 text-right text-table-header uppercase tracking-table-header text-text-secondary">Amount</th>
                  <th className="pb-2 text-right text-table-header uppercase tracking-table-header text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequisitions.map((req) => (
                  <tr key={req.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="py-2.5">
                      <Link href="/requisitions/my" className="text-[13px] font-medium text-brand-primary hover:underline">
                        {req.id}
                      </Link>
                    </td>
                    <td className="py-2.5 text-[13px] text-text-primary">{req.userName}</td>
                    <td className="py-2.5 text-[13px] text-text-secondary">{formatDate(req.createdAt)}</td>
                    <td className="py-2.5 text-right text-[13px] text-text-primary font-medium">
                      {formatCurrency(req.totalAmount)}
                    </td>
                    <td className="py-2.5 text-right">
                      <StatusPill variant={statusToVariant[req.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Stock Transactions */}
        <div className="rounded-card border border-border bg-surface-card p-card-padding">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-text-primary">Recent Stock Transactions</h3>
            <Link href="/inventory/transactions" className="text-[13px] font-medium text-brand-primary hover:text-brand-primary-hover">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-table-header uppercase tracking-table-header text-text-secondary">Type</th>
                  <th className="pb-2 text-left text-table-header uppercase tracking-table-header text-text-secondary">Item</th>
                  <th className="pb-2 text-right text-table-header uppercase tracking-table-header text-text-secondary">Qty</th>
                  <th className="pb-2 text-left text-table-header uppercase tracking-table-header text-text-secondary">Date</th>
                  <th className="pb-2 text-left text-table-header uppercase tracking-table-header text-text-secondary">Reference</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-border last:border-0">
                    <td className="py-2.5">
                      <StatusPill variant={txnTypeToVariant[txn.type]} label={txn.type.charAt(0) + txn.type.slice(1).toLowerCase()} />
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <ItemIcon iconKey={iconKeyFor(txn.itemId)} itemId={txn.itemId} size={20} />
                        <span className="text-[13px] text-text-primary">{txn.itemName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-[13px] text-text-primary font-medium">
                      {txn.quantity}
                    </td>
                    <td className="py-2.5 text-[13px] text-text-secondary">{formatDate(txn.date)}</td>
                    <td className="py-2.5 text-[13px] text-text-secondary">{txn.referenceNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
