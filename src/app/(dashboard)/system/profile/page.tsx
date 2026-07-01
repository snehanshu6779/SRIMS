"use client";

import React, { useState, useRef } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useAppStore } from "@/stores/app-store";
import { Save, Eye, EyeOff, Camera, Trash2 } from "lucide-react";

export default function ProfilePage() {
  const { currentUser, updateUser } = useAppStore();
  const [name, setName] = useState(currentUser.name);
  const [email] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roleLabels: Record<string, string> = {
    ADMIN: "Administrator",
    USER: "Employee",
    APPROVER: "Manager / Approver",
    INVENTORY_MGR: "Inventory Manager",
  };

  const handleAvatarSelect = (file: File | undefined) => {
    if (!file) return;
    setAvatarError("");
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      updateUser(currentUser.id, { avatarUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(undefined);
    updateUser(currentUser.id, { avatarUrl: undefined });
  };

  const handleSave = () => {
    updateUser(currentUser.id, { name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account information and password" />

      <div className="max-w-2xl space-y-6">
        {/* Profile Info */}
        <div className="rounded-card border border-border bg-surface-card p-card-padding">
          <div className="mb-6 flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleAvatarSelect(e.target.files?.[0])}
            />
            <div className="group relative">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={currentUser.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-[22px] font-bold text-white">
                  {currentUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100"
                title="Change photo"
              >
                <Camera size={18} />
              </button>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-text-primary">{currentUser.name}</h3>
              <p className="text-[13px] text-text-secondary">
                {roleLabels[currentUser.role]} · {currentUser.departmentName}
              </p>
              <div className="mt-1.5 flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[12px] font-medium text-brand-primary hover:underline"
                >
                  Upload photo
                </button>
                {avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="flex items-center gap-1 text-[12px] font-medium text-red-600 hover:underline"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                )}
              </div>
              {avatarError && <p className="mt-1 text-[11px] text-red-600">{avatarError}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-button border border-border px-3 py-2 text-[14px] focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Email Address</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full rounded-button border border-border bg-gray-50 px-3 py-2 text-[14px] text-text-secondary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Department</label>
              <input
                type="text"
                value={currentUser.departmentName}
                readOnly
                className="w-full rounded-button border border-border bg-gray-50 px-3 py-2 text-[14px] text-text-secondary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Role</label>
              <input
                type="text"
                value={roleLabels[currentUser.role]}
                readOnly
                className="w-full rounded-button border border-border bg-gray-50 px-3 py-2 text-[14px] text-text-secondary"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-card border border-border bg-surface-card p-card-padding">
          <h3 className="mb-4 text-[15px] font-semibold text-text-primary">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-button border border-border px-3 py-2 pr-10 text-[14px] focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-primary">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-button border border-border px-3 py-2 text-[14px] focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-button border border-border px-3 py-2 text-[14px] focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-[12px] text-red-600">Passwords do not match</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-button bg-brand-primary px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-primary-hover"
          >
            <Save size={16} />
            Save Changes
          </button>
          {saved && <span className="text-[13px] text-green-600">✓ Profile updated</span>}
        </div>
      </div>
    </div>
  );
}
