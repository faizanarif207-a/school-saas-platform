import Link from "next/link";
import { EmersonLogo } from "@/components/emerson-logo";

const footerSections = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "Get Started", href: "/pricing" },
      { name: "Request a Demo", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Brand Kit", href: "/about" },
    ],
  },
  {
    title: "Portals",
    links: [
      { name: "Sign In (All Roles)", href: "/unified-login" },
      { name: "Request Access", href: "/request-access" },
      { name: "School Admin", href: "/school/login" },
      { name: "Teacher", href: "/teacher/login" },
      { name: "Parent", href: "/parent/login" },
      { name: "Student", href: "/student/login" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      style={{
        backgroundColor: "var(--zb-ink)",
        color: "var(--zb-text-on-dark)",
        borderTop: "1px solid var(--zb-border-dark)",
      }}
    >
      {/* Top CTA strip */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
        <div className="grid md:grid-cols-2 gap-10 items-end border-b pb-16" style={{ borderColor: "rgba(253, 253, 251, 0.1)" }}>
          <div>
            <div className="zb-eyebrow mb-4" style={{ color: "var(--zb-mint)" }}>
              Get Started Today
            </div>
            <h2
              className="zb-headline-on-dark"
              style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
            >
              Bring your school
              <br />
              into the future.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/pricing" className="zb-btn-green">
              Start Free Trial
            </Link>
            <Link href="/contact" className="zb-btn-outline-on-dark">
              Talk to Us
            </Link>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand column — Emerson logo */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <EmersonLogo size={26} variant="dark" />
            </Link>
            <p
              className="zb-body-on-dark max-w-xs"
              style={{ fontSize: "14px", opacity: 0.8 }}
            >
              The multi-tenant school management platform built for Pakistani
              schools. Engineered by Emerson Technology.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--zb-mint)", animation: "zb-ping-slow 2s infinite" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  color: "var(--zb-forest-text)",
                }}
              >
                All systems operational
              </span>
            </div>
          </div>

          {/* Link sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <div
                className="zb-eyebrow mb-4"
                style={{ color: "var(--zb-forest-text)" }}
              >
                {section.title}
              </div>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="zb-body-on-dark hover:opacity-70 transition-opacity"
                      style={{ fontSize: "14px" }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t"
          style={{
            borderColor: "rgba(253, 253, 251, 0.1)",
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--zb-forest-text)",
          }}
        >
          <span>© 2026 SchoolSaaS · Emerson Technology. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:opacity-70 transition-opacity">
              Privacy
            </Link>
            <Link href="/about" className="hover:opacity-70 transition-opacity">
              Terms
            </Link>
            <Link href="/contact" className="hover:opacity-70 transition-opacity">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

