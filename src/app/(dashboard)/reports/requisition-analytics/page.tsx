"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/shared/StatCard";
import ItemIcon from "@/components/icons/items/ItemIcon";
import { useAppStore } from "@/stores/app-store";
import { formatCurrency } from "@/lib/utils";
import { ShieldAlert, Search } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

type ItemSortField = "totalRequested" | "totalIssued" | "fulfillmentRate" | "requisitionCount";
type UserSortField = "requisitionCount" | "totalItemsRequested" | "totalValue";

export default function RequisitionAnalyticsPage() {
  const { currentUser, requisitions, stockItems } = useAppStore();
  const [itemSearch, setItemSearch] = useState("");
  const [itemSortField, setItemSortField] = useState<ItemSortField>("totalRequested");
  const [userSearch, setUserSearch] = useState("");
  const [userSortField, setUserSortField] = useState<UserSortField>("requisitionCount");

  const canView = currentUser.role === "ADMIN";

  // ─── Per-item demand stats, computed from every requisition line ever submitted ───
  const itemStats = useMemo(() => {
    const map = new Map<string, {
      itemId: string; itemName: string; iconKey?: string;
      totalRequested: number; totalIssued: number; requisitionCount: number;
    }>();

    for (const req of requisitions) {
      for (const line of req.items) {
        const existing = map.get(line.itemId);
        const stockItem = stockItems.find((s) => s.id === line.itemId);
        if (existing) {
          existing.totalRequested += line.requestedQty;
          existing.totalIssued += line.issuedQty;
          existing.requisitionCount += 1;
        } else {
          map.set(line.itemId, {
            itemId: line.itemId,
            itemName: line.itemName,
            iconKey: stockItem?.iconKey,
            totalRequested: line.requestedQty,
            totalIssued: line.issuedQty,
            requisitionCount: 1,
          });
        }
      }
    }

    return Array.from(map.values()).map((s) => ({
      ...s,
      fulfillmentRate: s.totalRequested > 0 ? Math.round((s.totalIssued / s.totalRequested) * 100) : 0,
    }));
  }, [requisitions, stockItems]);

  // ─── Per-user demand stats — scoped to users who have actually submitted
  // at least one requisition, so approvers/admins with zero submissions
  // don't trivially (and misleadingly) "win" the lowest-demand spot ───
  const userStats = useMemo(() => {
    const map = new Map<string, {
      userId: string; userName: string; departmentName: string;
      requisitionCount: number; totalItemsRequested: number; totalValue: number;
    }>();

    for (const req of requisitions) {
      const totalQty = req.items.reduce((s, i) => s + i.requestedQty, 0);
      const existing = map.get(req.userId);
      if (existing) {
        existing.requisitionCount += 1;
        existing.totalItemsRequested += totalQty;
        existing.totalValue += req.totalAmount;
      } else {
        map.set(req.userId, {
          userId: req.userId,
          userName: req.userName,
          departmentName: req.departmentName,
          requisitionCount: 1,
          totalItemsRequested: totalQty,
          totalValue: req.totalAmount,
        });
      }
    }
    return Array.from(map.values());
  }, [requisitions]);

  const highestDemandItem = useMemo(
    () => [...itemStats].sort((a, b) => b.totalRequested - a.totalRequested)[0],
    [itemStats]
  );
  const lowestDemandItem = useMemo(
    () => [...itemStats].filter((i) => i.totalRequested > 0).sort((a, b) => a.totalRequested - b.totalRequested)[0],
    [itemStats]
  );
  const topRequester = useMemo(
    () => [...userStats].sort((a, b) => b.requisitionCount - a.requisitionCount)[0],
    [userStats]
  );
  const lowestRequester = useMemo(
    () => [...userStats].sort((a, b) => a.requisitionCount - b.requisitionCount)[0],
    [userStats]
  );

  const chartItems = useMemo(
    () => [...itemStats].sort((a, b) => b.totalRequested - a.totalRequested).slice(0, 8),
    [itemStats]
  );
  const chartUsers = useMemo(
    () => [...userStats].sort((a, b) => b.requisitionCount - a.requisitionCount).slice(0, 8),
    [userStats]
  );

  const filteredItemStats = useMemo(() => {
    let result = itemStats;
    if (itemSearch) {
      const q = itemSearch.toLowerCase();
      result = result.filter((i) => i.itemName.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => b[itemSortField] - a[itemSortField]);
  }, [itemStats, itemSearch, itemSortField]);

  const filteredUserStats = useMemo(() => {
    let result = userStats;
    if (userSearch) {
      const q = userSearch.toLowerCase();
      result = result.filter(
        (u) => u.userName.toLowerCase().includes(q) || u.departmentName.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => b[userSortField] - a[userSortField]);
  }, [userStats, userSearch, userSortField]);

  if (!canView) {
    return (
      <div>
        <PageHeader title="Requisition Analytics" subtitle="Item demand patterns and user request statistics" />
        <div className="rounded-card border border-border bg-surface-card p-8 text-center">
          <ShieldAlert size={36} className="mx-auto mb-3 text-text-muted" />
          <h3 className="text-[16px] font-semibold text-text-primary mb-1">Access restricted</h3>
          <p className="text-[13px] text-text-secondary">
            Requisition Analytics is visible only to Administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Requisition Analytics"
        subtitle="Track item demand and individual user request patterns across the system"
      />

      {/* Highlight cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="TrendingUp"
          iconTint="green"
          label="Highest Demand Item"
          value={highestDemandItem ? highestDemandItem.itemName : "—"}
          delta={highestDemandItem ? `${highestDemandItem.totalRequested} units requested` : undefined}
          deltaTone="positive"
        />
        <StatCard
          icon="TrendingDown"
          iconTint="amber"
          label="Lowest Demand Item"
          value={lowestDemandItem ? lowestDemandItem.itemName : "—"}
          delta={lowestDemandItem ? `${lowestDemandItem.totalRequested} units requested` : undefined}
          deltaTone="negative"
        />
        <StatCard
          icon="Archive"
          iconTint="blue"
          label="Top Requester"
          value={topRequester ? topRequester.userName : "—"}
          delta={topRequester ? `${topRequester.requisitionCount} requisitions` : undefined}
          deltaTone="positive"
        />
        <StatCard
          icon="Package"
          iconTint="purple"
          label="Lowest Requester"
          value={lowestRequester ? lowestRequester.userName : "—"}
          delta={lowestRequester ? `${lowestRequester.requisitionCount} requisition${lowestRequester.requisitionCount !== 1 ? "s" : ""}` : undefined}
          deltaTone="negative"
        />
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-border bg-surface-card p-card-padding">
          <h3 className="mb-4 text-[15px] font-semibold text-text-primary">Top Items by Demand</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartItems} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="itemName"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
                <Tooltip
                  contentStyle={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" iconSize={8} />
                <Bar dataKey="totalRequested" name="Requested" fill="#2563EB" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="totalIssued" name="Issued" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-card border border-border bg-surface-card p-card-padding">
          <h3 className="mb-4 text-[15px] font-semibold text-text-primary">Requisitions by User</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartUsers} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="userName"
                  tick={{ fill: "#374151", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="requisitionCount" name="Requisitions" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {chartUsers.map((_, idx) => (
                    <Cell key={idx} fill={idx === 0 ? "#2563EB" : "#93C5FD"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Item demand table */}
      <div className="mb-6 rounded-card border border-border bg-surface-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h3 className="text-[14px] font-semibold text-text-primary">Item Demand Breakdown</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search items..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="w-44 rounded-button border border-border py-1.5 pl-8 pr-2 text-[12px] placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
              />
            </div>
            <select
              value={itemSortField}
              onChange={(e) => setItemSortField(e.target.value as ItemSortField)}
              className="rounded-button border border-border px-2 py-1.5 text-[12px] text-text-secondary focus:border-brand-primary focus:outline-none"
            >
              <option value="totalRequested">Sort: Total Requested</option>
              <option value="totalIssued">Sort: Total Issued</option>
              <option value="fulfillmentRate">Sort: Fulfillment Rate</option>
              <option value="requisitionCount">Sort: # Requisitions</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Item</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Total Requested</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Total Issued</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Fulfillment Rate</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary"># Requisitions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItemStats.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[13px] text-text-muted">No matching items</td></tr>
              ) : (
                filteredItemStats.map((item) => (
                  <tr key={item.itemId} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <ItemIcon iconKey={item.iconKey} itemId={item.itemId} size={22} />
                        <span className="text-[13px] text-text-primary">{item.itemName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-[13px] font-medium text-text-primary">{item.totalRequested}</td>
                    <td className="px-4 py-2.5 text-right text-[13px] text-text-secondary">{item.totalIssued}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`text-[13px] font-medium ${item.fulfillmentRate >= 90 ? "text-green-600" : item.fulfillmentRate >= 50 ? "text-amber-600" : "text-red-600"}`}>
                        {item.fulfillmentRate}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-[13px] text-text-secondary">{item.requisitionCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User demand table */}
      <div className="rounded-card border border-border bg-surface-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h3 className="text-[14px] font-semibold text-text-primary">
            User Demand Patterns
            <span className="ml-2 text-[11px] font-normal text-text-muted">
              (users with at least one requisition)
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-44 rounded-button border border-border py-1.5 pl-8 pr-2 text-[12px] placeholder:text-text-muted focus:border-brand-primary focus:outline-none"
              />
            </div>
            <select
              value={userSortField}
              onChange={(e) => setUserSortField(e.target.value as UserSortField)}
              className="rounded-button border border-border px-2 py-1.5 text-[12px] text-text-secondary focus:border-brand-primary focus:outline-none"
            >
              <option value="requisitionCount">Sort: # Requisitions</option>
              <option value="totalItemsRequested">Sort: Total Items</option>
              <option value="totalValue">Sort: Total Value</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">User</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Department</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary"># Requisitions</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Total Items Requested</th>
                <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredUserStats.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[13px] text-text-muted">No matching users</td></tr>
              ) : (
                filteredUserStats.map((u) => (
                  <tr key={u.userId} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-[13px] font-medium text-text-primary">{u.userName}</td>
                    <td className="px-4 py-2.5 text-[13px] text-text-secondary">{u.departmentName}</td>
                    <td className="px-4 py-2.5 text-right text-[13px] text-text-primary">{u.requisitionCount}</td>
                    <td className="px-4 py-2.5 text-right text-[13px] text-text-secondary">{u.totalItemsRequested}</td>
                    <td className="px-4 py-2.5 text-right text-[13px] font-medium text-text-primary">{formatCurrency(u.totalValue)}</td>
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
