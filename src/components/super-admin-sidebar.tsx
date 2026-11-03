"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EmersonLogo } from "@/components/emerson-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  School,
  Layers,
  DollarSign,
  ScrollText,
  Settings,
  Plus,
  LogOut,
} from "lucide-react";

const navSections = [
  {
    label: "Platform",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Schools", href: "/admin/schools", icon: School, badge: "all" },
      { name: "Plans", href: "/admin/plans", icon: Layers },
      { name: "Billing", href: "/admin/billing", icon: DollarSign, soon: true },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Add School", href: "/admin/schools/new", icon: Plus },
      { name: "Audit Logs", href: "/admin/audit", icon: ScrollText, soon: true },
      { name: "Settings", href: "/admin/settings", icon: Settings, soon: true },
    ],
  },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <EmersonLogo size={22} variant="light" />
        <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold mt-2 pl-1">
          Platform Admin
        </div>
      </div>

      {/* Nav */}
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
                  (item.href !== "/admin" && pathname.startsWith(item.href));
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
                    {item.badge && (
                      <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                        {item.badge}
                      </span>
                    )}
                    {item.soon && (
                      <span className="ml-auto text-[9px] uppercase font-bold text-muted-foreground/60">
                        soon
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
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
