"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-app p-4">
      <div className="w-full max-w-[400px] rounded-card border border-border bg-surface-card p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary">
            <ShoppingCart size={24} className="text-white" />
          </div>
          <h1 className="text-[20px] font-bold text-text-primary">Reset your password</h1>
          <p className="mt-1 text-center text-[13px] text-text-secondary">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {submitted ? (
          <div className="rounded-md bg-tint-green-bg p-4 text-center">
            <Mail size={24} className="mx-auto mb-2 text-tint-green-icon" />
            <p className="text-[13px] text-text-primary">
              If an account exists for <span className="font-medium">{email}</span>, a reset link has been sent.
            </p>
            <p className="mt-2 text-[12px] text-text-secondary">
              Running this app without a connected database? There&apos;s nowhere to send a real
              email yet — use the demo credentials shown on the login screen instead.
            </p>
          </div>
        ) : (
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
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-button bg-brand-primary px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-[13px] text-brand-primary hover:underline"
        >
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
