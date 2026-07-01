"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-app p-4">
      <div className="w-full max-w-[400px] rounded-card border border-border bg-surface-card p-8 shadow-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary">
            <ShoppingCart size={24} className="text-white" />
          </div>
          <h1 className="text-[20px] font-bold text-text-primary">SRIMS</h1>
          <p className="mt-1 text-center text-[13px] text-text-secondary">
            Stationery Requisition & Inventory Management System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-text-primary">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@srims.com"
              required
              className="w-full rounded-button border border-border px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-text-primary">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-button border border-border px-3 py-2 pr-10 text-[14px] text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
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

          {error && (
            <div className="rounded-md bg-status-rejected-bg px-3 py-2 text-[13px] text-status-rejected-text">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-button bg-brand-primary px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-60 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-[13px] text-brand-primary hover:text-brand-primary-hover">
            Forgot Password?
          </Link>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-6 rounded-md bg-tint-blue-bg p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-tint-blue-icon">
            Demo Credentials
          </p>
          <div className="space-y-0.5 text-[11px] text-text-secondary">
            <p>Admin: rahul@srims.com / Admin@123</p>
            <p>User: priya@srims.com / User@123</p>
            <p>Approver: amit@srims.com / Approver@123</p>
            <p>Inventory: sandeep@srims.com / Inventory@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
