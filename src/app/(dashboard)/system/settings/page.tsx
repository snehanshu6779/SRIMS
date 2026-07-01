"use client";

import React, { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [shortSupplyPolicy, setShortSupplyPolicy] = useState<"pending" | "closed">("pending");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [defaultMinStock, setDefaultMinStock] = useState(20);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="System-wide configuration and preferences" />

      <div className="max-w-2xl space-y-6">
        {/* Short Supply Policy */}
        <div className="rounded-card border border-border bg-surface-card p-card-padding">
          <h3 className="mb-1 text-[15px] font-semibold text-text-primary">Short-Supply Policy</h3>
          <p className="mb-4 text-[13px] text-text-secondary">
            How should partially issued line items be handled when stock is insufficient?
          </p>
          <div className="space-y-2">
            <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                checked={shortSupplyPolicy === "pending"}
                onChange={() => setShortSupplyPolicy("pending")}
                className="mt-0.5"
              />
              <div>
                <div className="text-[13px] font-medium text-text-primary">Mark Pending Stock</div>
                <div className="text-[12px] text-text-secondary">
                  Short-supplied lines remain open and will be fulfilled when stock is replenished.
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                checked={shortSupplyPolicy === "closed"}
                onChange={() => setShortSupplyPolicy("closed")}
                className="mt-0.5"
              />
              <div>
                <div className="text-[13px] font-medium text-text-primary">Close as Short Supplied</div>
                <div className="text-[12px] text-text-secondary">
                  Short-supplied lines are closed permanently; the user must raise a new requisition.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-card border border-border bg-surface-card p-card-padding">
          <h3 className="mb-4 text-[15px] font-semibold text-text-primary">Notifications</h3>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-[13px] font-medium text-text-primary">Email Notifications</div>
              <div className="text-[12px] text-text-secondary">
                Send email alerts for approvals, rejections, and low stock
              </div>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                emailNotifications ? "bg-brand-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  emailNotifications ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        </div>

        {/* Threshold Defaults */}
        <div className="rounded-card border border-border bg-surface-card p-card-padding">
          <h3 className="mb-1 text-[15px] font-semibold text-text-primary">Threshold Defaults</h3>
          <p className="mb-4 text-[13px] text-text-secondary">
            Default minimum stock level applied to newly created items
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={defaultMinStock}
              onChange={(e) => setDefaultMinStock(parseInt(e.target.value) || 0)}
              className="w-32 rounded-button border border-border px-3 py-2 text-[14px] focus:border-brand-primary focus:outline-none"
            />
            <span className="text-[13px] text-text-secondary">units</span>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-button bg-brand-primary px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-primary-hover"
          >
            <Save size={16} />
            Save Settings
          </button>
          {saved && <span className="text-[13px] text-green-600">✓ Settings saved</span>}
        </div>
      </div>
    </div>
  );
}
