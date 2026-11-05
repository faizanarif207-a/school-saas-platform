"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EmersonLogo } from "@/components/emerson-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CalendarCheck,
  Trophy,
  CalendarClock,
  Bell,
  LogOut,
  BookOpen,
} from "lucide-react";

const navSections = [
  {
    label: "My Account",
    items: [
      { name: "Dashboard", href: "/student", icon: LayoutDashboard },
      { name: "Attendance", href: "/student/attendance", icon: CalendarCheck },
      { name: "Results", href: "/student/results", icon: Trophy },
      { name: "Homework", href: "/student/homework", icon: BookOpen },
    ],
  },
  {
    label: "School",
    items: [
      { name: "Timetable", href: "/student/timetable", icon: CalendarClock },
      { name: "Notices", href: "/student/notices", icon: Bell },
      { name: "My Profile", href: "/student/profile", icon: CalendarCheck },
    ],
  },
];

export function StudentSidebar({ studentName }: { studentName: string }) {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/student/login";
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-700" />
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <EmersonLogo size={22} variant="light" />
          <span className="text-lg">🧑‍🎓</span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400 font-bold mt-2 pl-1">
          Student Portal
        </div>
        <div className="text-xs text-foreground/70 font-medium mt-1 pl-1 truncate">
          {studentName}
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
                const active = pathname === item.href;
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
