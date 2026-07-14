import type { Metadata } from "next";
import type { ReactNode } from "react";
import AdminShell from "./AdminShell";
import AdminAccessGuard from "./AdminAccessGuard";

interface AdminLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "Administration | Khao Lak Insider",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <AdminAccessGuard>
      <AdminShell>{children}</AdminShell>
    </AdminAccessGuard>
  );
}
