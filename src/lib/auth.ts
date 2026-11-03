// src/lib/auth.ts
// Simple session-based auth for Super Admin (Module 1)
// Will upgrade to NextAuth + Supabase Auth in Module 2

import { db } from './db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SESSION_COOKIE = 'school_saas_session'
const JWT_SECRET = process.env.AUTH_SECRET || 'fallback-secret-change-me'

export type SessionUser = {
  id: string
  email: string
  name: string | null
  role: string
  schoolId: string | null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function createToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies()
  const token = createToken(user)
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await getSession()
  if (!user || user.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: Super Admin access required')
  }
  return user
}

// Verify user against database (for protected API routes)
export async function verifyDbUser(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  if (!user || !user.isActive) return null

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return null

  // Update last login
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    schoolId: user.schoolId,
  }
}
