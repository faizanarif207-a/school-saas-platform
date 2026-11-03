import Link from "next/link";
import { EmersonLogo, EmersonMark } from "@/components/emerson-logo";

const footerSections = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "Get Started", href: "/pricing" },
      { name: "Demo", href: "/contact" },
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
    title: "Login As",
    links: [
      { name: "Super Admin", href: "/login" },
      { name: "School Admin", href: "/school/login" },
      { name: "Teacher", href: "/teacher/login" },
      { name: "Parent", href: "/parent/login" },
      { name: "Student", href: "/student/login" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <EmersonLogo size={26} variant="light" />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
              We Build Digital Products That Move Business Forward. Multi-tenant
              school management platform — manage students, fees, attendance,
              and parents from one place.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <EmersonMark size={14} />
              <span>Engineering Digital Excellence</span>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-muted-foreground">
            © 2026 Emerson Technology. All rights reserved.
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            emersontechnology.com
          </div>
        </div>
      </div>
    </footer>
  );
}
