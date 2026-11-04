// prisma/seed-r3.ts
// Seed Phase R3: Add default branch + mark school admin as OWNER subRole + add staff

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Phase R3 — Branches + Staff...')

  const school = await prisma.school.findFirst({
    where: { name: 'Beaconhouse School System' },
  })
  if (!school) throw new Error('Beaconhouse school not found.')

  // 1. Create default "Main Branch"
  let branch = await prisma.branch.findFirst({
    where: { schoolId: school.id, isMain: true },
  })
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        schoolId: school.id,
        name: 'Main Campus',
        city: school.city,
        isMain: true,
      },
    })
    console.log(`  ✓ Main Branch created: ${branch.name}`)
  } else {
    console.log(`  ✓ Main Branch exists: ${branch.name}`)
  }

  // 2. Mark existing School Admin as OWNER subRole + link to branch
  const schoolAdmin = await prisma.user.findUnique({
    where: { email: 'admin@beaconhouse.edu.pk' },
  })
  if (schoolAdmin) {
    await prisma.user.update({
      where: { id: schoolAdmin.id },
      data: { subRole: 'OWNER', branchId: branch.id },
    })
    console.log(`  ✓ School Admin marked as OWNER + linked to ${branch.name}`)
  }

  // 3. Link existing classes to this branch
  await prisma.class.updateMany({
    where: { schoolId: school.id, branchId: null },
    data: { branchId: branch.id },
  })
  console.log(`  ✓ Classes linked to ${branch.name}`)

  // 4. Add demo staff: Principal + Accountant
  const principalPass = await bcrypt.hash('principal123', 10)
  const principalEmail = 'principal@beaconhouse.edu.pk'
  let principal = await prisma.user.findUnique({ where: { email: principalEmail } })
  if (!principal) {
    principal = await prisma.user.create({
      data: {
        email: principalEmail,
        name: 'Ayesha Khan',
        passwordHash: principalPass,
        role: 'SCHOOL_ADMIN',
        subRole: 'PRINCIPAL',
        schoolId: school.id,
        branchId: branch.id,
        isActive: true,
      },
    })
    console.log(`  ✓ Principal created: ${principalEmail} / principal123`)
  } else {
    await prisma.user.update({
      where: { email: principalEmail },
      data: { subRole: 'PRINCIPAL', branchId: branch.id },
    })
    console.log(`  ✓ Principal updated: ${principalEmail}`)
  }

  const accountantPass = await bcrypt.hash('accountant123', 10)
  const accountantEmail = 'accountant@beaconhouse.edu.pk'
  let accountant = await prisma.user.findUnique({ where: { email: accountantEmail } })
  if (!accountant) {
    accountant = await prisma.user.create({
      data: {
        email: accountantEmail,
        name: 'Imran Sheikh',
        passwordHash: accountantPass,
        role: 'SCHOOL_ADMIN',
        subRole: 'ACCOUNTANT',
        schoolId: school.id,
        branchId: branch.id,
        isActive: true,
      },
    })
    console.log(`  ✓ Accountant created: ${accountantEmail} / accountant123`)
  } else {
    await prisma.user.update({
      where: { email: accountantEmail },
      data: { subRole: 'ACCOUNTANT', branchId: branch.id },
    })
    console.log(`  ✓ Accountant updated: ${accountantEmail}`)
  }

  console.log('\n✅ Phase R3 seed complete!')
  console.log('\n🔑 New Staff Logins:')
  console.log(`   Principal:  ${principalEmail} / principal123`)
  console.log(`   Accountant: ${accountantEmail} / accountant123`)
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
