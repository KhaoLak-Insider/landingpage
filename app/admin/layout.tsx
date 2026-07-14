import type { ReactNode } from "react";
import AdminShell from "./AdminShell";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}