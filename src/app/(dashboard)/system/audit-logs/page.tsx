"use client";

import React, { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useAppStore } from "@/stores/app-store";
import { formatDateTime } from "@/lib/utils";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

const actionColors: Record<string, string> = {
  APPROVE: "text-green-600 bg-green-50",
  REJECT: "text-red-600 bg-red-50",
  ISSUE_COMPLETE: "text-blue-600 bg-blue-50",
  ISSUE_PARTIAL: "text-amber-600 bg-amber-50",
  STOCK_INWARD: "text-purple-600 bg-purple-50",
};

export default function AuditLogsPage() {
  const { auditLogs } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = auditLogs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.actorName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Complete trail of all system actions and changes"
      />

      <div className="rounded-card border border-border bg-surface-card">
        <div className="border-b border-border px-4 py-3">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by actor, action, or entity..."
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
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Timestamp</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Actor</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Action</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Entity</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Details</th>
                <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <React.Fragment key={log.id}>
                  <tr
                    className="border-b border-border last:border-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-3 text-[13px] text-text-secondary whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-text-primary">{log.actorName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${actionColors[log.action] || "text-text-secondary bg-gray-100"}`}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-text-primary">
                      {log.entity} <span className="text-text-muted">#{log.entityId}</span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-text-secondary truncate max-w-[300px]">{log.details}</td>
                    <td className="px-4 py-3 text-center text-text-muted">
                      {expandedId === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="rounded-md bg-white border border-border p-3 text-[12px] font-mono text-text-secondary">
                          {JSON.stringify(log, null, 2)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
