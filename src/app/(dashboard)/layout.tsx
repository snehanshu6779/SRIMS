"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useAppStore } from "@/stores/app-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { currentUser, setCurrentUser, allUsers } = useAppStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const unreadCount = useAppStore((s) =>
    s.notifications.filter((n) => !n.isRead).length
  );

  // Sync the Zustand "currentUser" (drives all app data scoping) to whoever
  // actually authenticated via NextAuth, once per session.
  useEffect(() => {
    if (session?.user?.email) {
      const matched = allUsers.find(
        (u) => u.email.toLowerCase() === session.user.email!.toLowerCase()
      );
      if (matched && matched.id !== currentUser.id) {
        setCurrentUser(matched.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-app">
        <div className="text-[13px] text-text-secondary">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-app">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        userRole={currentUser.role}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Topbar
        user={currentUser}
        sidebarCollapsed={sidebarCollapsed}
        onMenuClick={() => setMobileOpen(!mobileOpen)}
        notificationCount={unreadCount}
        onSignOut={() => signOut({ callbackUrl: "/login" })}
      />
      <main
        className={cn(
          "pt-topbar transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[64px]" : "lg:ml-[240px]"
        )}
      >
        <div className="p-page-padding">{children}</div>
      </main>

      {/* Role Switcher (dev tool — previews app data as any of the 4 demo accounts.
          This does NOT bypass real auth; you must already be logged in to see this. */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition-colors"
          title="Switch Role (Dev)"
        >
          🔄
        </button>
        {showRoleSwitcher && (
          <div className="absolute bottom-12 right-0 w-56 rounded-card border border-border bg-surface-card p-2 shadow-xl">
            <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Preview as (dev only)
            </div>
            {allUsers.filter((u) => ["user-1", "user-2", "user-3", "user-4"].includes(u.id)).map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setCurrentUser(u.id);
                  setShowRoleSwitcher(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] transition-colors",
                  currentUser.id === u.id
                    ? "bg-brand-primary text-white"
                    : "text-text-primary hover:bg-gray-50"
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                    currentUser.id === u.id ? "bg-white/20 text-white" : "bg-gray-100 text-text-secondary"
                  )}
                >
                  {u.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className={cn("text-[10px]", currentUser.id === u.id ? "text-white/70" : "text-text-muted")}>
                    {u.role === "ADMIN" ? "Admin" : u.role === "USER" ? "Employee" : u.role === "APPROVER" ? "Approver" : "Inventory Manager"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
