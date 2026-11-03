// src/app/page.tsx — root redirect
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const user = await getSession();
  if (user?.role === "SUPER_ADMIN") {
    redirect("/admin");
  }
  if (user?.role === "SCHOOL_ADMIN" && user.schoolId) {
    redirect("/school");
  }
  redirect("/login");
}
