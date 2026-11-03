// prisma/seed.ts
// Seed default platform plans and a Super Admin user

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEFAULT_PLANS = [
  {
    name: 'Starter',
    slug: 'starter',
    monthlyPrice: 5000,
    studentLimit: 300,
    features: JSON.stringify({
      modules: ['students', 'attendance', 'fees', 'receipts'],
      maxStaff: 5,
      sms: false,
      crm: false,
      payroll: false,
    }),
  },
  {
    name: 'Growth',
    slug: 'growth',
    monthlyPrice: 11000,
    studentLimit: 800,
    features: JSON.stringify({
      modules: ['students', 'attendance', 'fees', 'receipts', 'exams', 'results', 'parent_portal', 'sms'],
      maxStaff: 20,
      sms: true,
      crm: false,
      payroll: false,
    }),
  },
  {
    name: 'Pro',
    slug: 'pro',
    monthlyPrice: 22000,
    studentLimit: 2000,
    features: JSON.stringify({
      modules: ['students', 'attendance', 'fees', 'receipts', 'exams', 'results', 'parent_portal', 'sms', 'crm', 'payroll', 'multi_campus', 'biometric', 'library', 'transport'],
      maxStaff: -1, // unlimited
      sms: true,
      crm: true,
      payroll: true,
    }),
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    monthlyPrice: 50000,
    studentLimit: -1, // unlimited
    features: JSON.stringify({
      modules: ['all'],
      maxStaff: -1,
      sms: true,
      crm: true,
      payroll: true,
      canteen_pos: true,
      online_payments: true,
      white_label: true,
      dedicated_support: true,
    }),
  },
]

async function main() {
  console.log('🌱 Seeding School SaaS database...')

  // 1. Create plans (idempotent — update if exists)
  for (const plan of DEFAULT_PLANS) {
    await prisma.platformPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    })
    console.log(`  ✓ Plan: ${plan.name} (PKR ${plan.monthlyPrice}/mo)`)
  }

  // 2. Create Super Admin user
  const superAdminEmail = 'admin@schoolsaas.pk'
  const superAdminPassword = 'admin123' // change this in production!
  const passwordHash = await bcrypt.hash(superAdminPassword, 10)

  const existingAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  })

  if (existingAdmin) {
    await prisma.user.update({
      where: { email: superAdminEmail },
      data: { passwordHash, role: 'SUPER_ADMIN', isActive: true },
    })
    console.log(`  ✓ Super Admin updated: ${superAdminEmail}`)
  } else {
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: 'Super Admin',
        passwordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    })
    console.log(`  ✓ Super Admin created: ${superAdminEmail}`)
  }

  // 3. Create demo schools (for dashboard display)
  const starterPlan = await prisma.platformPlan.findUnique({ where: { slug: 'starter' } })
  const growthPlan = await prisma.platformPlan.findUnique({ where: { slug: 'growth' } })
  const proPlan = await prisma.platformPlan.findUnique({ where: { slug: 'pro' } })
  if (!starterPlan || !growthPlan || !proPlan) throw new Error('Plans missing')

  const demoSchools = [
    {
      name: 'Beaconhouse School System',
      city: 'Lahore',
      email: 'info@beaconhouse.edu.pk',
      phone: '+92 42 111 232 222',
      planId: growthPlan.id,
      status: 'active',
      studentCount: 542,
    },
    {
      name: 'The City School',
      city: 'Karachi',
      email: 'info@cityschool.edu.pk',
      phone: '+92 21 111 222 333',
      planId: proPlan.id,
      status: 'active',
      studentCount: 1250,
    },
    {
      name: 'Roots International',
      city: 'Islamabad',
      email: 'info@roots.edu.pk',
      phone: '+92 51 111 444 555',
      planId: starterPlan.id,
      status: 'trial',
      studentCount: 87,
    },
  ]

  for (const school of demoSchools) {
    const existing = await prisma.school.findFirst({ where: { name: school.name } })
    if (existing) {
      await prisma.school.update({
        where: { id: existing.id },
        data: school,
      })
    } else {
      await prisma.school.create({ data: school })
    }
  }
  console.log(`  ✓ ${demoSchools.length} demo schools created/updated`)

  // 4. Create subscriptions for demo schools
  const schools = await prisma.school.findMany({ include: { plan: true } })
  for (const school of schools) {
    const existingSub = await prisma.subscription.findFirst({
      where: { schoolId: school.id, status: 'active' },
    })
    if (!existingSub) {
      await prisma.subscription.create({
        data: {
          schoolId: school.id,
          planId: school.planId,
          startDate: new Date('2026-10-01'),
          endDate: new Date('2026-11-30'),
          status: 'active',
          amount: school.plan.monthlyPrice,
        },
      })
    }
  }
  console.log(`  ✓ Subscriptions created for ${schools.length} schools`)

  console.log('\n✅ Seed complete!')
  console.log(`\n🔑 Login credentials:`)
  console.log(`   Email: ${superAdminEmail}`)
  console.log(`   Password: ${superAdminPassword}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
