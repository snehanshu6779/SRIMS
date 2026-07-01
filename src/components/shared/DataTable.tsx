"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  pageSize?: number;
  pagination?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  emptyMessage?: string;
  compact?: boolean;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  pageSize = 10,
  pagination = true,
  emptyMessage = "No data available",
  compact = false,
  onRowClick,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const paginatedRows = pagination
    ? sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedRows;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "text-table-header uppercase tracking-table-header text-text-secondary whitespace-nowrap",
                    compact ? "px-3 py-2" : "px-4 py-3",
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-text-primary"
                    >
                      {col.header}
                      <ArrowUpDown size={12} className="opacity-40" />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-[14px] text-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-border last:border-b-0 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-gray-50"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "text-table-cell text-text-primary whitespace-nowrap",
                        compact ? "px-3 py-2" : "px-4 py-3",
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                      )}
                    >
                      {col.render ? col.render(row, idx) : (row[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-[13px] text-text-secondary">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="rounded p-1.5 text-text-secondary hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded p-1.5 text-text-secondary hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "min-w-[32px] rounded px-2 py-1 text-[13px] font-medium",
                    currentPage === page
                      ? "bg-brand-primary text-white"
                      : "text-text-secondary hover:bg-gray-100"
                  )}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded p-1.5 text-text-secondary hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="rounded p-1.5 text-text-secondary hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
