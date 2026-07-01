"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageHeader from "@/components/layout/PageHeader";
import StatusPill from "@/components/shared/StatusPill";
import { useAppStore } from "@/stores/app-store";
import { getStockStatus } from "@/lib/data/mock-data";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { StatusVariant } from "@/types";
import {
  Package,
  FileText,
  ScrollText,
  Download,
  FileDown,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";

type ReportType = "inventory" | "requisitions" | "audit" | null;

const stockStatusToVariant: Record<string, StatusVariant> = {
  IN_STOCK: "inStock", LOW: "low", CRITICAL: "critical", OUT_OF_STOCK: "outOfStock",
};

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadPdf(filename: string, title: string, head: string[], body: string[][]) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39); // text-primary
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128); // text-secondary
  doc.text(`SRIMS — Generated ${new Date().toLocaleString("en-IN")}`, 14, 22);

  autoTable(doc, {
    head: [head],
    body,
    startY: 28,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" }, // brand-primary
    alternateRowStyles: { fillColor: [249, 250, 251] }, // surface-app
  });

  doc.save(filename);
}

export default function ReportsPage() {
  const { stockItems, requisitions, auditLogs, currentUser } = useAppStore();
  const [activeReport, setActiveReport] = useState<ReportType>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const itemsWithStatus = useMemo(
    () => stockItems.map((i) => ({ ...i, stockStatus: getStockStatus(i) })),
    [stockItems]
  );

  const filteredRequisitions = useMemo(() => {
    return requisitions.filter((r) => {
      if (dateFrom && new Date(r.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(r.createdAt) > new Date(dateTo)) return false;
      return true;
    });
  }, [requisitions, dateFrom, dateTo]);

  const exportInventory = () => {
    downloadCsv("inventory-report.csv", [
      ["Item ID", "Name", "Category", "Current Stock", "Min Level", "Status", "Unit Price", "Value"],
      ...itemsWithStatus.map((i) => [
        i.id, i.name, i.categoryName, String(i.currentStock), String(i.minStockLevel),
        i.stockStatus, i.unitPrice.toFixed(2), (i.currentStock * i.unitPrice).toFixed(2),
      ]),
    ]);
  };

  const exportInventoryPdf = () => {
    downloadPdf(
      "inventory-report.pdf",
      "Inventory Report",
      ["Item", "Category", "Stock", "Min Level", "Status", "Value (₹)"],
      itemsWithStatus.map((i) => [
        i.name, i.categoryName, String(i.currentStock), String(i.minStockLevel),
        i.stockStatus.replace(/_/g, " "), (i.currentStock * i.unitPrice).toFixed(2),
      ])
    );
  };

  const exportRequisitions = () => {
    downloadCsv("requisition-history.csv", [
      ["REQ No.", "Requested By", "Department", "Date", "Purpose", "Amount", "Status"],
      ...filteredRequisitions.map((r) => [
        r.id, r.userName, r.departmentName, formatDate(r.createdAt), r.purpose, r.totalAmount.toFixed(2), r.status,
      ]),
    ]);
  };

  const exportRequisitionsPdf = () => {
    downloadPdf(
      "requisition-history.pdf",
      "Requisition History",
      ["REQ No.", "Requested By", "Department", "Date", "Amount (₹)", "Status"],
      filteredRequisitions.map((r) => [
        r.id, r.userName, r.departmentName, formatDate(r.createdAt), r.totalAmount.toFixed(2), r.status,
      ])
    );
  };

  const exportAuditTrail = () => {
    downloadCsv("audit-trail.csv", [
      ["Timestamp", "Actor", "Action", "Entity", "Entity ID", "Details"],
      ...auditLogs.map((l) => [formatDateTime(l.timestamp), l.actorName, l.action, l.entity, l.entityId, l.details]),
    ]);
  };

  const exportAuditTrailPdf = () => {
    downloadPdf(
      "audit-trail.pdf",
      "Audit Trail",
      ["Timestamp", "Actor", "Action", "Entity", "Details"],
      auditLogs.map((l) => [
        formatDateTime(l.timestamp), l.actorName, l.action.replace(/_/g, " "), `${l.entity} #${l.entityId}`, l.details,
      ])
    );
  };

  // ─── Landing view ───
  if (!activeReport) {
    return (
      <div>
        <PageHeader title="Reports" subtitle="Generate and export reports across the system" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => setActiveReport("inventory")}
            className="rounded-card border border-border bg-surface-card p-card-padding text-left hover:border-brand-primary hover:shadow-sm transition-all"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-tint-blue-bg">
              <Package size={20} className="text-tint-blue-icon" />
            </div>
            <h3 className="text-[15px] font-semibold text-text-primary mb-1">Inventory Reports</h3>
            <p className="text-[12px] text-text-secondary">Stock status, fast-moving items, and valuation</p>
          </button>

          <button
            onClick={() => setActiveReport("requisitions")}
            className="rounded-card border border-border bg-surface-card p-card-padding text-left hover:border-brand-primary hover:shadow-sm transition-all"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-tint-green-bg">
              <FileText size={20} className="text-tint-green-icon" />
            </div>
            <h3 className="text-[15px] font-semibold text-text-primary mb-1">Requisition History</h3>
            <p className="text-[12px] text-text-secondary">Filterable by date, department, user, or category</p>
          </button>

          <button
            onClick={() => setActiveReport("audit")}
            className="rounded-card border border-border bg-surface-card p-card-padding text-left hover:border-brand-primary hover:shadow-sm transition-all"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-tint-purple-bg">
              <ScrollText size={20} className="text-tint-purple-icon" />
            </div>
            <h3 className="text-[15px] font-semibold text-text-primary mb-1">Audit Trail</h3>
            <p className="text-[12px] text-text-secondary">Who did what, when, across the whole system</p>
          </button>

          {currentUser.role === "ADMIN" && (
            <Link
              href="/reports/requisition-analytics"
              className="rounded-card border border-border bg-surface-card p-card-padding text-left hover:border-brand-primary hover:shadow-sm transition-all"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-tint-amber-bg">
                <TrendingUp size={20} className="text-tint-amber-icon" />
              </div>
              <h3 className="text-[15px] font-semibold text-text-primary mb-1">Requisition Analytics</h3>
              <p className="text-[12px] text-text-secondary">Item demand patterns and per-user statistics — Admin only</p>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ─── Inventory Report ───
  if (activeReport === "inventory") {
    return (
      <div>
        <PageHeader
          title="Inventory Reports"
          subtitle="Stock status, valuation, and threshold breakdown"
          actions={
            <div className="flex gap-2">
              <button onClick={() => setActiveReport(null)} className="flex items-center gap-1.5 rounded-button border border-border px-3 py-2 text-[13px] text-text-secondary hover:bg-gray-50">
                <ArrowLeft size={14} />
                Back
              </button>
              <button onClick={exportInventory} className="flex items-center gap-1.5 rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover">
                <Download size={14} />
                Export CSV
              </button>
              <button onClick={exportInventoryPdf} className="flex items-center gap-1.5 rounded-button border border-brand-primary px-4 py-2 text-[13px] font-semibold text-brand-primary hover:bg-blue-50">
                <FileDown size={14} />
                Export PDF
              </button>
            </div>
          }
        />
        <div className="rounded-card border border-border bg-surface-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Item</th>
                  <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Category</th>
                  <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Stock</th>
                  <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Min Level</th>
                  <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Value</th>
                </tr>
              </thead>
              <tbody>
                {itemsWithStatus.map((i) => (
                  <tr key={i.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-[13px] font-medium text-text-primary">{i.name}</td>
                    <td className="px-4 py-3 text-[13px] text-text-secondary">{i.categoryName}</td>
                    <td className="px-4 py-3 text-right text-[13px] text-text-primary">{i.currentStock}</td>
                    <td className="px-4 py-3 text-right text-[13px] text-text-secondary">{i.minStockLevel}</td>
                    <td className="px-4 py-3 text-center"><StatusPill variant={stockStatusToVariant[i.stockStatus]} /></td>
                    <td className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">{formatCurrency(i.currentStock * i.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-gray-50">
                  <td colSpan={5} className="px-4 py-3 text-right text-[13px] font-semibold text-text-primary">Total Inventory Value</td>
                  <td className="px-4 py-3 text-right text-[14px] font-bold text-brand-primary">
                    {formatCurrency(itemsWithStatus.reduce((s, i) => s + i.currentStock * i.unitPrice, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ─── Requisition History Report ───
  if (activeReport === "requisitions") {
    return (
      <div>
        <PageHeader
          title="Requisition History"
          subtitle="Filterable record of all requisitions"
          actions={
            <div className="flex gap-2">
              <button onClick={() => setActiveReport(null)} className="flex items-center gap-1.5 rounded-button border border-border px-3 py-2 text-[13px] text-text-secondary hover:bg-gray-50">
                <ArrowLeft size={14} />
                Back
              </button>
              <button onClick={exportRequisitions} className="flex items-center gap-1.5 rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover">
                <Download size={14} />
                Export CSV
              </button>
              <button onClick={exportRequisitionsPdf} className="flex items-center gap-1.5 rounded-button border border-brand-primary px-4 py-2 text-[13px] font-semibold text-brand-primary hover:bg-blue-50">
                <FileDown size={14} />
                Export PDF
              </button>
            </div>
          }
        />
        <div className="mb-4 flex gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-text-primary">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-button border border-border px-3 py-2 text-[13px] focus:border-brand-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-text-primary">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-button border border-border px-3 py-2 text-[13px] focus:border-brand-primary focus:outline-none" />
          </div>
        </div>
        <div className="rounded-card border border-border bg-surface-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">REQ No.</th>
                  <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Requested By</th>
                  <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Department</th>
                  <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Date</th>
                  <th className="px-4 py-3 text-right text-table-header uppercase tracking-table-header text-text-secondary">Amount</th>
                  <th className="px-4 py-3 text-center text-table-header uppercase tracking-table-header text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequisitions.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-[14px] text-text-muted">No requisitions in this range</td></tr>
                ) : (
                  filteredRequisitions.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-[13px] font-medium text-brand-primary">{r.id}</td>
                      <td className="px-4 py-3 text-[13px] text-text-primary">{r.userName}</td>
                      <td className="px-4 py-3 text-[13px] text-text-secondary">{r.departmentName}</td>
                      <td className="px-4 py-3 text-[13px] text-text-secondary">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-medium text-text-primary">{formatCurrency(r.totalAmount)}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusPill variant={r.status.toLowerCase() as StatusVariant} />
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

  // ─── Audit Trail Report ───
  return (
    <div>
      <PageHeader
        title="Audit Trail"
        subtitle="Complete history of system actions"
        actions={
          <div className="flex gap-2">
            <button onClick={() => setActiveReport(null)} className="flex items-center gap-1.5 rounded-button border border-border px-3 py-2 text-[13px] text-text-secondary hover:bg-gray-50">
              <ArrowLeft size={14} />
              Back
            </button>
            <button onClick={exportAuditTrail} className="flex items-center gap-1.5 rounded-button bg-brand-primary px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-primary-hover">
              <Download size={14} />
              Export CSV
            </button>
            <button onClick={exportAuditTrailPdf} className="flex items-center gap-1.5 rounded-button border border-brand-primary px-4 py-2 text-[13px] font-semibold text-brand-primary hover:bg-blue-50">
              <FileDown size={14} />
              Export PDF
            </button>
          </div>
        }
      />
      <div className="rounded-card border border-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Timestamp</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Actor</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Action</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Entity</th>
                <th className="px-4 py-3 text-left text-table-header uppercase tracking-table-header text-text-secondary">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-[13px] text-text-secondary whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-text-primary">{log.actorName}</td>
                  <td className="px-4 py-3 text-[12px] text-text-secondary">{log.action.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-[13px] text-text-primary">{log.entity} #{log.entityId}</td>
                  <td className="px-4 py-3 text-[12px] text-text-secondary">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
