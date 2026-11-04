// src/lib/role-themes.ts
// Role-specific visual themes — each role gets a distinct accent color

export type RoleTheme = {
  name: string;
  accentColor: string;       // primary color
  accentGradient: string;    // gradient for badges/banners
  badgeBg: string;           // badge background
  badgeText: string;         // badge text color
  glowColor: string;         // sidebar top glow
  emoji: string;             // role emoji for quick identification
};

export const roleThemes: Record<string, RoleTheme> = {
  SUPER_ADMIN: {
    name: "Super Admin",
    accentColor: "#0064C8",
    accentGradient: "from-[#0064C8] to-[#0A56A8]",
    badgeBg: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    badgeText: "text-blue-600",
    glowColor: "rgba(0, 100, 200, 0.15)",
    emoji: "👑",
  },
  SCHOOL_ADMIN_OWNER: {
    name: "School Owner",
    accentColor: "#6D28D9",
    accentGradient: "from-[#6D28D9] to-[#5B21B6]",
    badgeBg: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
    badgeText: "text-purple-600",
    glowColor: "rgba(109, 40, 217, 0.15)",
    emoji: "🏫",
  },
  SCHOOL_ADMIN_PRINCIPAL: {
    name: "Principal",
    accentColor: "#7C3AED",
    accentGradient: "from-[#7C3AED] to-[#6D28D9]",
    badgeBg: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
    badgeText: "text-violet-600",
    glowColor: "rgba(124, 58, 237, 0.15)",
    emoji: "🎓",
  },
  SCHOOL_ADMIN_ACCOUNTANT: {
    name: "Accountant",
    accentColor: "#D97706",
    accentGradient: "from-[#D97706] to-[#B45309]",
    badgeBg: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    badgeText: "text-amber-600",
    glowColor: "rgba(217, 119, 6, 0.15)",
    emoji: "💰",
  },
  SCHOOL_ADMIN_ADMISSION: {
    name: "Admission Officer",
    accentColor: "#2563EB",
    accentGradient: "from-[#2563EB] to-[#1D4ED8]",
    badgeBg: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    badgeText: "text-blue-600",
    glowColor: "rgba(37, 99, 235, 0.15)",
    emoji: "📋",
  },
  TEACHER: {
    name: "Teacher",
    accentColor: "#0891B2",
    accentGradient: "from-[#0891B2] to-[#0E7490]",
    badgeBg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400",
    badgeText: "text-cyan-600",
    glowColor: "rgba(8, 145, 178, 0.15)",
    emoji: "👩‍🏫",
  },
  PARENT: {
    name: "Parent Portal",
    accentColor: "#DB2777",
    accentGradient: "from-[#DB2777] to-[#BE185D]",
    badgeBg: "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400",
    badgeText: "text-pink-600",
    glowColor: "rgba(219, 39, 119, 0.15)",
    emoji: "👨‍👩‍👧",
  },
  STUDENT: {
    name: "Student Portal",
    accentColor: "#059669",
    accentGradient: "from-[#059669] to-[#047857]",
    badgeBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    badgeText: "text-emerald-600",
    glowColor: "rgba(5, 150, 105, 0.15)",
    emoji: "🧑‍🎓",
  },
};

export function getRoleTheme(role: string, subRole?: string | null): RoleTheme {
  if (role === "SUPER_ADMIN") return roleThemes.SUPER_ADMIN;
  if (role === "SCHOOL_ADMIN") {
    if (subRole === "OWNER") return roleThemes.SCHOOL_ADMIN_OWNER;
    if (subRole === "PRINCIPAL") return roleThemes.SCHOOL_ADMIN_PRINCIPAL;
    if (subRole === "ACCOUNTANT") return roleThemes.SCHOOL_ADMIN_ACCOUNTANT;
    if (subRole === "ADMISSION") return roleThemes.SCHOOL_ADMIN_ADMISSION;
    return roleThemes.SCHOOL_ADMIN_OWNER; // default to owner
  }
  if (role === "TEACHER") return roleThemes.TEACHER;
  if (role === "PARENT") return roleThemes.PARENT;
  if (role === "STUDENT") return roleThemes.STUDENT;
  return roleThemes.SUPER_ADMIN;
}
