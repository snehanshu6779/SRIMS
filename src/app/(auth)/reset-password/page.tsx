"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-app p-4">
        <div className="w-full max-w-[400px] rounded-card border border-border bg-surface-card p-8 text-center shadow-sm">
          <p className="text-[14px] text-text-primary">This reset link is missing its token.</p>
          <Link href="/forgot-password" className="mt-3 inline-block text-[13px] text-brand-primary hover:underline">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-app p-4">
      <div className="w-full max-w-[400px] rounded-card border border-border bg-surface-card p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary">
            <ShoppingCart size={24} className="text-white" />
          </div>
          <h1 className="text-[20px] font-bold text-text-primary">Set a new password</h1>
        </div>

        {success ? (
          <div className="rounded-md bg-tint-green-bg p-4 text-center">
            <CheckCircle2 size={24} className="mx-auto mb-2 text-tint-green-icon" />
            <p className="text-[13px] text-text-primary">Password updated. Redirecting to sign in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-primary">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-button border border-border px-3 py-2 text-[14px] focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            {error && (
              <div className="rounded-md bg-status-rejected-bg px-3 py-2 text-[13px] text-status-rejected-text">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-button bg-brand-primary px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
