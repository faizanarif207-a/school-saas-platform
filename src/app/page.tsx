// src/app/page.tsx — Zohaib Butt-inspired editorial landing page
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollReveal } from "@/components/zb/scroll-reveal";
import { TiltCard } from "@/components/zb/tilt-card";
import { ParallaxImage } from "@/components/zb/parallax-image";
import { AnimatedCounter } from "@/components/zb/animated-counter";
import { Marquee } from "@/components/zb/marquee";
import { HeroWords } from "@/components/zb/hero-words";
import {
  ArrowRight,
  ArrowDownRight,
  Users,
  CalendarCheck,
  Wallet,
  Receipt,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Bell,
  BookOpen,
  TrendingUp,
} from "lucide-react";

// Real school images — searched via image-search service
// Each set covers a different aspect of school operations
const HERO_IMAGES = [
  "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5c9c81dea5c9.jpg",       // Students raising hands
  "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a998015f121d.jpeg",      // Playground children
  "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ca14c1bb7785.jpg",        // School building
  "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cd036b27290e.jpg",        // Principal office
  "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8d41827f2747.png",        // Parent teacher meeting
];

const SECTION_IMAGE_1 = "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9f0c12c6c1ee.jpeg"; // Classroom engaged
const SECTION_IMAGE_2 = "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/64c358ab60c3.jpg";   // Fees payment
const SECTION_IMAGE_3 = "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ef4751773020.jpg";    // Exam in progress

const CLIENT_LOGOS = [
  "Beaconhouse",
  "The City School",
  "Roots International",
  "Lahore Grammar",
  "Aitchison College",
  "Resource Academia",
  "SICAS",
  "BDC",
];

const STATS = [
  { value: 50, suffix: "+", label: "Schools onboarded" },
  { value: 12000, suffix: "+", label: "Students managed" },
  { value: 8, suffix: "", label: "Roles supported" },
  { value: 99.9, suffix: "%", label: "Uptime SLA" },
];

const FEATURES = [
  {
    number: "01",
    title: "Students, in one place",
    description:
      "Admission IDs auto-generated. Guardians linked. Enrollment, attendance, fees — all joined by design, not by luck.",
    icon: Users,
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5c9c81dea5c9.jpg",  // classroom engaged
  },
  {
    number: "02",
    title: "Fees that collect themselves",
    description:
      "Bulk-generate invoices by class. Track partial payments. Auto-flag defaulters. Send reminders. Print branded PDF receipts.",
    icon: Wallet,
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ccd68bcdc77e.jpg",  // fees counter
  },
  {
    number: "03",
    title: "Attendance in 30 seconds",
    description:
      "Per-section, per-day marking. Teachers tap once. Parents get an SMS. Principals see the trend on their dashboard.",
    icon: CalendarCheck,
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9517ad182052.jpg",  // teacher marking register
  },
  {
    number: "04",
    title: "Exams, marks, results",
    description:
      "Create exams, enter marks per subject, auto-calculate grades. Parents download result cards. Students see their own progress.",
    icon: GraduationCap,
    image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cc629ef445bd.jpg",  // students taking exam
  },
];

const ROLES = [
  {
    title: "Super Admin",
    sub: "Platform owner",
    desc: "Manage all schools, plans, billing, audit logs.",
    color: "#0064C8",
  },
  {
    title: "School Owner",
    sub: "Multi-branch",
    desc: "Invite staff, approve access, see everything.",
    color: "#2A7CE8",
  },
  {
    title: "Principal",
    sub: "Branch head",
    desc: "Leaves, attendance trends, teacher performance.",
    color: "#0064C8",
  },
  {
    title: "Accountant",
    sub: "Fees & invoices",
    desc: "Bulk generate, collect, defaulters reports.",
    color: "#F5A800",
  },
  {
    title: "Admission Officer",
    sub: "CRM funnel",
    desc: "Inquiries → visits → forms → admitted.",
    color: "#0E9E56",
  },
  {
    title: "Teacher",
    sub: "Class operations",
    desc: "Attendance, marks, homework, leave requests.",
    color: "#0064C8",
  },
  {
    title: "Parent",
    sub: "Read-only portal",
    desc: "Attendance, results, fees, notices, leave.",
    color: "#0E9E56",
  },
  {
    title: "Student",
    sub: "Class 6+ portal",
    desc: "Own attendance, results, homework, timetable.",
    color: "#F5A800",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We moved 540 students from Excel to SchoolSaaS in a weekend. Fees collection went from 6 days to 6 hours.",
    name: "Ayesha Khan",
    role: "Principal, Beaconhouse Lahore",
  },
  {
    quote:
      "The parent portal alone saved us 20 hours a week. Parents see attendance and results without calling the office.",
    name: "Imran Sheikh",
    role: "Director, The City School",
  },
  {
    quote:
      "Defaulters dropped by 60% in the first term. The auto-reminders and portal-block did the work for us.",
    name: "Fatima Riaz",
    role: "Accountant, Roots International",
  },
];

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "var(--zb-bg)", color: "var(--zb-text-dark)" }}>
      <SiteHeader />

      {/* ════════════════════════════════════════════
          HERO — full-bleed editorial
         ════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: "var(--zb-ink)",
          color: "var(--zb-text-on-dark)",
          paddingTop: "120px",
          paddingBottom: "120px",
        }}
      >
        {/* Background floating blob */}
        <div
          aria-hidden
          className="zb-anim-blob"
          style={{
            position: "absolute",
            top: "-200px",
            right: "-200px",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245, 168, 0, 0.18) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          className="zb-anim-blob"
          style={{
            position: "absolute",
            bottom: "-300px",
            left: "-200px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0, 100, 200, 0.25) 0%, transparent 70%)",
            filter: "blur(60px)",
            animationDelay: "6s",
            pointerEvents: "none",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          {/* Eyebrow */}
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-10">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--zb-mint)" }}
              />
              <span
                className="zb-eyebrow"
                style={{ color: "var(--zb-mint)" }}
              >
                School Management Platform · Pakistan
              </span>
            </div>
          </ScrollReveal>

          {/* Headline */}
          <ScrollReveal delay={0.1}>
            <h1
              className="zb-headline-on-dark"
              style={{
                fontSize: "clamp(56px, 9vw, 120px)",
                marginBottom: "32px",
                maxWidth: "1100px",
              }}
            >
              Where great schools
              <br />
              run greater.
            </h1>
          </ScrollReveal>

          {/* Sub-headline */}
          <ScrollReveal delay={0.25}>
            <p
              className="zb-body-on-dark"
              style={{
                fontSize: "clamp(18px, 1.8vw, 22px)",
                maxWidth: "640px",
                marginBottom: "48px",
              }}
            >
              One platform. Eight roles. Every fee collected, every
              attendance marked, every result published — designed for what
              happens after the classroom bell.
            </p>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal delay={0.4}>
            <div className="flex flex-wrap gap-3 items-center">
              <Link
                href="/pricing"
                className="zb-btn-green inline-flex items-center gap-2"
              >
                Explore the platform
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/unified-login"
                className="zb-btn-outline-on-dark inline-flex items-center gap-2"
              >
                Sign in to your portal
                <ArrowDownRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Visual collage — 3 floating school images */}
          <ScrollReveal delay={0.5} y={50}>
            <div className="mt-24 grid grid-cols-3 gap-4 max-w-4xl">
              {[
                { src: HERO_IMAGES[0], alt: "Students engaged in classroom", span: "col-span-2 row-span-2 aspect-[4/3]" },
                { src: HERO_IMAGES[3], alt: "Principal's office", span: "aspect-square" },
                { src: HERO_IMAGES[2], alt: "School campus", span: "aspect-square" },
                { src: HERO_IMAGES[4], alt: "Parent-teacher meeting", span: "col-span-2 aspect-[2/1]" },
              ].map((img, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl group ${img.span}`}
                  style={{
                    border: "1px solid rgba(253, 253, 251, 0.1)",
                    background: "rgba(253, 253, 251, 0.03)",
                  }}
                >
                  <ParallaxImage
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full"
                    speed={0.15}
                    scale={1.08}
                  />
                  {/* Subtle overlay tint — Emerson blue */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(135deg, rgba(0, 100, 200, 0.12) 0%, rgba(245, 168, 0, 0.05) 100%)",
                      mixBlendMode: "overlay",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Stats row */}
          <ScrollReveal delay={0.55}>
            <div
              className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t"
              style={{ borderColor: "rgba(232, 248, 238, 0.1)" }}
            >
              {STATS.map((stat, i) => (
                <div key={i}>
                  <div
                    className="zb-headline-on-dark"
                    style={{ fontSize: "clamp(40px, 4vw, 56px)" }}
                  >
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix}
                    />
                  </div>
                  <div
                    className="zb-eyebrow mt-2"
                    style={{ color: "var(--zb-forest-text)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CLIENT MARQUEE
         ════════════════════════════════════════════ */}
      <section className="py-16" style={{ backgroundColor: "var(--zb-cream)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-10">
          <div className="zb-eyebrow text-center">
            Trusted by schools across Pakistan
          </div>
        </div>
        <Marquee speed={40}>
          {CLIENT_LOGOS.map((logo, i) => (
            <span
              key={i}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "24px",
                letterSpacing: "-0.01em",
                color: "var(--zb-text-dark)",
                opacity: 0.55,
                whiteSpace: "nowrap",
              }}
            >
              {logo}
            </span>
          ))}
        </Marquee>
      </section>

      {/* ════════════════════════════════════════════
          NUMBERED FEATURES (alternating dark/cream)
         ════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "var(--zb-bg)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
          {/* Section intro */}
          <ScrollReveal>
            <div className="max-w-3xl mb-20">
              <div className="zb-section-number mb-4">— THE FEATURES</div>
              <h2
                className="zb-headline"
                style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
              >
                Built for what
                <br />
                happens after the bell.
              </h2>
            </div>
          </ScrollReveal>

          {/* Feature rows */}
          <div className="space-y-32">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              const isReversed = i % 2 === 1;
              return (
                <div
                  key={feature.number}
                  className="grid lg:grid-cols-2 gap-12 items-center"
                >
                  {/* Image */}
                  <ScrollReveal
                    y={40}
                    delay={0.1}
                    className={isReversed ? "lg:order-2" : ""}
                  >
                    <TiltCard max={5} scale={1.01}>
                      <div
                        style={{
                          borderRadius: "20px",
                          overflow: "hidden",
                          aspectRatio: "4 / 3",
                          background: "var(--zb-cream)",
                          boxShadow: "0 30px 60px -30px rgba(7, 23, 17, 0.4)",
                        }}
                      >
                        <ParallaxImage
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full"
                          speed={0.2}
                        />
                      </div>
                    </TiltCard>
                  </ScrollReveal>

                  {/* Text */}
                  <ScrollReveal
                    y={40}
                    delay={0.05}
                    className={isReversed ? "lg:order-1" : ""}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <span className="zb-section-number">
                        {feature.number}
                      </span>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--zb-green) 0%, var(--zb-green-bright) 100%)",
                          boxShadow: "0 12px 28px -8px rgba(0, 100, 200, 0.4)",
                        }}
                      >
                        <Icon className="h-5 w-5" style={{ color: "#FFFFFF" }} />
                      </div>
                    </div>
                    <h3
                      className="zb-headline mb-5"
                      style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
                    >
                      {feature.title}
                    </h3>
                    <p className="zb-body" style={{ maxWidth: "500px" }}>
                      {feature.description}
                    </p>
                  </ScrollReveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ROLES — dark band with cards
         ════════════════════════════════════════════ */}
      <section
        className="py-32"
        style={{
          backgroundColor: "var(--zb-ink)",
          color: "var(--zb-text-on-dark)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl mb-20">
              <div
                className="zb-section-number mb-4"
                style={{ color: "var(--zb-mint)" }}
              >
                — THE ROLES
              </div>
              <h2
                className="zb-headline-on-dark"
                style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
              >
                Eight doors into
                <br />
                the same school.
              </h2>
              <p
                className="zb-body-on-dark mt-6"
                style={{ maxWidth: "500px" }}
              >
                Every role sees exactly what they need. Nothing more, nothing
                less. Permissions enforced at the database level.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((role, i) => (
              <ScrollReveal key={role.title} delay={i * 0.05}>
                <TiltCard max={4} scale={1.02}>
                  <div className="zb-role-card">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                      style={{ background: role.color }}
                    >
                      <span
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "16px",
                        }}
                      >
                        {role.title.charAt(0)}
                      </span>
                    </div>
                    <div
                      className="zb-eyebrow mb-2"
                      style={{ color: "var(--zb-mint)" }}
                    >
                      {role.sub}
                    </div>
                    <h3
                      className="zb-headline-on-dark mb-2"
                      style={{ fontSize: "20px" }}
                    >
                      {role.title}
                    </h3>
                    <p
                      className="zb-body-on-dark"
                      style={{ fontSize: "14px", lineHeight: 1.5 }}
                    >
                      {role.desc}
                    </p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PROCESS — numbered, cream
         ════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "var(--zb-cream)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
          <ScrollReveal>
            <div className="max-w-3xl mb-20">
              <div className="zb-section-number mb-4">— THE METHOD</div>
              <h2
                className="zb-headline"
                style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
              >
                Three steps. No
                <br />
                day-long setup calls.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Sign up & pay",
                desc: "Create your school account. Pick a plan. Pay online or by invoice. Get a school access code.",
                image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/64a5592ceab6.jpg", // school building
              },
              {
                num: "02",
                title: "Invite your staff",
                desc: "Set up classes, sections, subjects. Invite principal, accountant, teachers. They request access via portal link.",
                image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cd036b27290e.jpg", // principal office
              },
              {
                num: "03",
                title: "Run your school",
                desc: "Add students. Mark attendance. Generate invoices. Publish results. Parents see everything in real-time.",
                image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a998015f121d.jpeg", // playground
              },
            ].map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 0.1}>
                <div
                  style={{
                    background: "var(--zb-bg)",
                    borderRadius: "20px",
                    border: "1px solid var(--zb-border)",
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  {/* Image header */}
                  <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                    <ParallaxImage
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full"
                      speed={0.1}
                      scale={1.1}
                    />
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, transparent 0%, rgba(253, 253, 251, 0.9) 100%)",
                        pointerEvents: "none",
                      }}
                    />
                    {/* Step number floating over image */}
                    <div
                      className="zb-headline"
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        left: "20px",
                        fontSize: "48px",
                        color: "var(--zb-green)",
                        opacity: 0.85,
                        lineHeight: 1,
                        textShadow: "0 4px 20px rgba(253, 253, 251, 0.6)",
                      }}
                    >
                      {step.num}
                    </div>
                  </div>
                  {/* Body */}
                  <div style={{ padding: "28px" }}>
                    <h3
                      className="zb-headline mb-3"
                      style={{ fontSize: "24px" }}
                    >
                      {step.title}
                    </h3>
                    <p className="zb-body" style={{ fontSize: "15px" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TESTIMONIALS
         ════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "var(--zb-bg)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
          <ScrollReveal>
            <div className="max-w-3xl mb-20">
              <div className="zb-section-number mb-4">— THE PROOF</div>
              <h2
                className="zb-headline"
                style={{ fontSize: "clamp(40px, 5vw, 64px)" }}
              >
                What people say
                <br />
                afterwards.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <TiltCard max={3} scale={1.01}>
                  <div
                    style={{
                      padding: "32px",
                      borderRadius: "20px",
                      background: "var(--zb-cream)",
                      border: "1px solid var(--zb-border)",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "60px",
                        lineHeight: 0.7,
                        color: "var(--zb-green)",
                        marginBottom: "20px",
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                      }}
                    >
                      &ldquo;
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "17px",
                        lineHeight: 1.55,
                        color: "var(--zb-text-dark)",
                        marginBottom: "24px",
                      }}
                    >
                      {t.quote}
                    </p>
                    <div className="pt-4 border-t" style={{ borderColor: "var(--zb-border)" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          fontSize: "15px",
                          color: "var(--zb-text-dark)",
                        }}
                      >
                        {t.name}
                      </div>
                      <div
                        className="zb-eyebrow mt-1"
                      >
                        {t.role}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FINAL CTA
         ════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "var(--zb-ink)" }}
      >
        {/* Background image with dark overlay */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url('https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ca14c1bb7785.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            opacity: 0.12,
            filter: "saturate(0.4)",
          }}
        />
        {/* Amber glow blob */}
        <div
          aria-hidden
          className="zb-anim-blob"
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(245, 168, 0, 0.18) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        {/* Blue glow blob */}
        <div
          aria-hidden
          className="zb-anim-blob"
          style={{
            position: "absolute",
            bottom: "-200px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0, 100, 200, 0.22) 0%, transparent 70%)",
            filter: "blur(80px)",
            animationDelay: "4s",
            pointerEvents: "none",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32 relative">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto">
              <div
                className="zb-eyebrow mb-6"
                style={{ color: "var(--zb-mint)" }}
              >
                Start today
              </div>
              <h2
                className="zb-headline-on-dark"
                style={{ fontSize: "clamp(48px, 6vw, 80px)" }}
              >
                Your school,
                <br />
                but better.
              </h2>
              <p
                className="zb-body-on-dark mt-6 mx-auto"
                style={{ maxWidth: "500px" }}
              >
                30-day free trial. No credit card. We migrate your data, train
                your staff, and you go live in a week.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-10">
                <Link
                  href="/pricing"
                  className="zb-btn-green inline-flex items-center gap-2"
                >
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="zb-btn-outline-on-dark inline-flex items-center gap-2"
                >
                  Book a demo
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
