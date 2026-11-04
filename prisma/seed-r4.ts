// prisma/seed-r4.ts
// Seed Phase R4: Admission officer + inquiries + leave requests

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Phase R4 — Admission + Inquiries + Leaves...')

  const school = await prisma.school.findFirst({
    where: { name: 'Beaconhouse School System' },
  })
  if (!school) throw new Error('School not found')

  const branch = await prisma.branch.findFirst({
    where: { schoolId: school.id, isMain: true },
  })
  if (!branch) throw new Error('Branch not found')

  // 1. Create Admission Officer
  const admPass = await bcrypt.hash('admission123', 10)
  const admEmail = 'admission@beaconhouse.edu.pk'
  let adm = await prisma.user.findUnique({ where: { email: admEmail } })
  if (!adm) {
    adm = await prisma.user.create({
      data: {
        email: admEmail,
        name: 'Fatima Sana',
        passwordHash: admPass,
        role: 'SCHOOL_ADMIN',
        subRole: 'ADMISSION',
        schoolId: school.id,
        branchId: branch.id,
        isActive: true,
      },
    })
    console.log(`  ✓ Admission Officer: ${admEmail} / admission123`)
  } else {
    await prisma.user.update({
      where: { email: admEmail },
      data: { subRole: 'ADMISSION', branchId: branch.id },
    })
    console.log(`  ✓ Admission Officer updated`)
  }

  // 2. Create demo inquiries
  const demoInquiries = [
    { parentName: 'Asad Mahmood', parentPhone: '+92 301 2233445', studentName: 'Ahmed Asad', desiredClass: 'Class 5', source: 'walk_in', stage: 'visit', followUpDate: new Date(Date.now() + 86400000), followUpAction: 'Send fee structure' },
    { parentName: 'Fariha Noor', parentPhone: '+92 302 5567890', studentName: 'Ayesha Fariha', desiredClass: 'Class 3', source: 'facebook', stage: 'form', followUpDate: new Date(Date.now() + 172800000), followUpAction: 'Schedule assessment' },
    { parentName: 'Kamran Ali', parentPhone: '+92 312 9988776', studentName: 'Hamza Kamran', desiredClass: 'Class 6', source: 'referral', stage: 'inquired', followUpDate: new Date(Date.now() + 86400000), followUpAction: 'Invite for campus visit' },
    { parentName: 'Rabia Shah', parentPhone: '+92 333 1122334', studentName: 'Zara Rabia', desiredClass: 'Class 1', source: 'walk_in', stage: 'interview', followUpDate: new Date(Date.now() + 43200000), followUpAction: 'Discount approval call' },
    { parentName: 'Sajid Iqbal', parentPhone: '+92 345 7788990', studentName: 'Bilal Sajid', desiredClass: 'Class 4', source: 'website', stage: 'admitted', notes: 'Admitted on 15 Oct' },
    { parentName: 'Nida Aslam', parentPhone: '+92 321 4455667', studentName: 'Sana Nida', desiredClass: 'Class 7', source: 'other', stage: 'lost', notes: 'Went to competitor — fee too high' },
  ]

  let inquiryCount = 0
  for (const inq of demoInquiries) {
    const existing = await prisma.inquiry.findFirst({
      where: { schoolId: school.id, parentName: inq.parentName },
    })
    if (!existing) {
      await prisma.inquiry.create({
        data: {
          schoolId: school.id,
          branchId: branch.id,
          ...inq,
          assignedTo: adm.id,
        },
      })
      inquiryCount++
    }
  }
  console.log(`  ✓ ${inquiryCount} demo inquiries created`)

  // 3. Create demo leave request from teacher
  const teacher = await prisma.user.findUnique({
    where: { email: 'sana@beaconhouse.edu.pk' },
  })
  if (teacher) {
    const existingLeave = await prisma.leaveRequest.findFirst({
      where: { userId: teacher.id, status: 'pending' },
    })
    if (!existingLeave) {
      await prisma.leaveRequest.create({
        data: {
          userId: teacher.id,
          schoolId: school.id,
          startDate: new Date(Date.now() + 3 * 86400000),
          endDate: new Date(Date.now() + 4 * 86400000),
          type: 'sick',
          reason: 'Medical appointment - need 2 days off',
          status: 'pending',
        },
      })
      console.log(`  ✓ Pending leave request from teacher`)
    }
  }

  console.log('\n✅ Phase R4 seed complete!')
  console.log('\n🔑 Admission Officer Login:')
  console.log(`   Email: ${admEmail}`)
  console.log(`   Password: admission123`)
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
