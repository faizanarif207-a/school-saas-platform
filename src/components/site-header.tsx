"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmersonLogo } from "@/components/emerson-logo";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-500"
      style={{
        backgroundColor: scrolled ? "rgba(253, 253, 251, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid var(--zb-border)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Emerson logo (3 colored bars + wordmark) */}
          <Link
            href="/"
            className="flex items-center group"
            aria-label="Emerson — SchoolSaaS home"
          >
            <EmersonLogo size={22} />
            <span
              className="ml-3 pl-3 border-l transition-colors"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "16px",
                letterSpacing: "-0.02em",
                color: "var(--zb-text-muted)",
                borderColor: "var(--zb-border)",
              }}
            >
              SchoolSaaS
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-8"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium hover:opacity-70 transition-opacity relative group"
                style={{ color: "var(--zb-text-dark)" }}
              >
                {link.name}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full"
                  style={{ background: "var(--zb-green)" }}
                />
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/unified-login"
              className="hidden md:inline-flex text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: "var(--zb-text-dark)", fontFamily: "var(--font-body)" }}
            >
              Sign In
            </Link>
            <Link
              href="/pricing"
              className="zb-btn-green hidden md:inline-flex"
            >
              Get Started
            </Link>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              style={{ color: "var(--zb-text-dark)" }}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{
            background: "var(--zb-bg)",
            borderColor: "var(--zb-border)",
            padding: "20px 24px",
          }}
        >
          <nav className="flex flex-col gap-3" style={{ fontFamily: "var(--font-body)" }}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium py-2"
                style={{ color: "var(--zb-text-dark)" }}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t flex flex-col gap-2" style={{ borderColor: "var(--zb-border)" }}>
              <Link
                href="/unified-login"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium py-2"
                style={{ color: "var(--zb-text-dark)" }}
              >
                Sign In
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className="zb-btn-green text-center"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

