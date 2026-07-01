import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "SRIMS — Stationery Requisition & Inventory Management System",
  description: "Manage stationery requisitions, approvals, and inventory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
