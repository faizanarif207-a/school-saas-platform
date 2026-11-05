"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EmersonLogo } from "@/components/emerson-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Settings,
  Users,
  CalendarCheck,
  Wallet,
  Receipt,
  LogOut,
  Bell,
  Building2,
  UserPlus,
  ShieldCheck,
  FileText,
  User,
} from "lucide-react";

const navSections = [
  {
    label: "School",
    items: [
      { name: "Dashboard", href: "/school", icon: LayoutDashboard },
      { name: "Setup", href: "/school/setup", icon: Settings },
      { name: "Branches", href: "/school/branches", icon: Building2 },
      { name: "Staff", href: "/school/staff", icon: UserPlus },
      { name: "Notices", href: "/school/notices", icon: Bell },
      { name: "Settings", href: "/school/settings", icon: Settings },
      { name: "My Profile", href: "/school/profile", icon: User },
    ],
  },
  {
    label: "Academics",
    items: [
      { name: "Students", href: "/school/students", icon: Users },
      { name: "Attendance", href: "/school/attendance", icon: CalendarCheck },
      { name: "Exams", href: "/school/exams", icon: FileText },
      { name: "Principal", href: "/school/principal", icon: ShieldCheck },
    ],
  },
  {
    label: "Fees & Admissions",
    items: [
      { name: "Fee Plans", href: "/school/fees", icon: Wallet },
      { name: "Invoices", href: "/school/fees/invoices", icon: Receipt },
      { name: "Accountant", href: "/school/accountant", icon: Wallet },
      { name: "Admission CRM", href: "/school/admission", icon: UserPlus },
    ],
  },
];

export function SchoolAdminSidebar({ schoolName }: { schoolName: string }) {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/school/login";
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Role-specific top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-purple-500 to-purple-700" />
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <EmersonLogo size={22} variant="light" />
          <span className="text-lg">🏫</span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-purple-600 dark:text-purple-400 font-bold mt-2 pl-1">
          School Owner
        </div>
        <div className="text-xs text-foreground/70 font-medium mt-1 pl-1 truncate">
          {schoolName}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.13em] font-bold text-muted-foreground">
              {section.label}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/school" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          size="sm"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
