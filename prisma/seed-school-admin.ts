// prisma/seed-school-admin.ts
// Seed a school admin user (linked to a demo school) for Module 2 testing

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding School Admin user (Module 2)...')

  const passwordHash = await bcrypt.hash('school123', 10)

  // Link to Beaconhouse Lahore (the first demo school)
  const school = await prisma.school.findFirst({
    where: { name: 'Beaconhouse School System' },
  })
  if (!school) {
    throw new Error('Beaconhouse school not found. Run main seed first: bun run db:seed')
  }

  // Create School Admin user
  const schoolAdminEmail = 'admin@beaconhouse.edu.pk'
  const existing = await prisma.user.findUnique({
    where: { email: schoolAdminEmail },
  })

  if (existing) {
    await prisma.user.update({
      where: { email: schoolAdminEmail },
      data: {
        passwordHash,
        role: 'SCHOOL_ADMIN',
        schoolId: school.id,
        isActive: true,
        name: 'Ayesha Khan (Principal)',
      },
    })
    console.log(`  ✓ School Admin updated: ${schoolAdminEmail} → ${school.name}`)
  } else {
    await prisma.user.create({
      data: {
        email: schoolAdminEmail,
        name: 'Ayesha Khan (Principal)',
        passwordHash,
        role: 'SCHOOL_ADMIN',
        schoolId: school.id,
        isActive: true,
      },
    })
    console.log(`  ✓ School Admin created: ${schoolAdminEmail} → ${school.name}`)
  }

  // Also seed some demo data for this school:
  // 1. Academic Year 2024-25
  let ay = await prisma.academicYear.findFirst({
    where: { schoolId: school.id, year: '2024-25' },
  })
  if (!ay) {
    ay = await prisma.academicYear.create({
      data: {
        schoolId: school.id,
        year: '2024-25',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2025-05-31'),
        isActive: true,
      },
    })
    console.log('  ✓ Academic Year: 2024-25')
  }

  // 2. Subjects
  const subjectNames = ['Mathematics', 'English', 'Urdu', 'Science', 'Islamiat', 'Social Studies']
  for (const name of subjectNames) {
    const sub = await prisma.subject.findFirst({
      where: { schoolId: school.id, name },
    })
    if (!sub) {
      await prisma.subject.create({
        data: {
          schoolId: school.id,
          name,
          code: name.substring(0, 3).toUpperCase(),
        },
      })
    }
  }
  console.log(`  ✓ ${subjectNames.length} subjects`)

  // 3. Classes + Sections (Class 1 through Class 5, each with sections A, B)
  const classSections = [
    { className: 'Class 1', sections: ['A', 'B'] },
    { className: 'Class 2', sections: ['A', 'B'] },
    { className: 'Class 3', sections: ['A', 'B'] },
    { className: 'Class 4', sections: ['A', 'B'] },
    { className: 'Class 5', sections: ['A', 'B', 'C'] },
  ]

  let classCount = 0
  let sectionCount = 0
  for (const { className, sections } of classSections) {
    let cls = await prisma.class.findFirst({
      where: { schoolId: school.id, name: className },
    })
    if (!cls) {
      cls = await prisma.class.create({
        data: { schoolId: school.id, name: className },
      })
      classCount++
    }
    for (const sectionName of sections) {
      const sec = await prisma.section.findFirst({
        where: { classId: cls.id, name: sectionName },
      })
      if (!sec) {
        await prisma.section.create({
          data: { classId: cls.id, name: sectionName, capacity: 40 },
        })
        sectionCount++
      }
    }
  }
  console.log(`  ✓ ${classCount} classes, ${sectionCount} sections`)

  // 4. Fee plans per class
  const feePlanByClass = [
    { className: 'Class 1', title: 'Monthly Tuition', amount: 3500, frequency: 'monthly' },
    { className: 'Class 2', title: 'Monthly Tuition', amount: 3800, frequency: 'monthly' },
    { className: 'Class 3', title: 'Monthly Tuition', amount: 4200, frequency: 'monthly' },
    { className: 'Class 4', title: 'Monthly Tuition', amount: 4500, frequency: 'monthly' },
    { className: 'Class 5', title: 'Monthly Tuition', amount: 4800, frequency: 'monthly' },
  ]

  let feeCount = 0
  for (const fpc of feePlanByClass) {
    const cls = await prisma.class.findFirst({
      where: { schoolId: school.id, name: fpc.className },
    })
    if (!cls) continue
    const existingFee = await prisma.feePlan.findFirst({
      where: { schoolId: school.id, classId: cls.id, title: fpc.title },
    })
    if (!existingFee) {
      await prisma.feePlan.create({
        data: {
          schoolId: school.id,
          classId: cls.id,
          title: fpc.title,
          amount: fpc.amount,
          frequency: fpc.frequency,
        },
      })
      feeCount++
    }
  }
  console.log(`  ✓ ${feeCount} fee plans`)

  // 5. Demo students in Class 5-A
  const cls5 = await prisma.class.findFirst({
    where: { schoolId: school.id, name: 'Class 5' },
  })
  const sec5A = await prisma.section.findFirst({
    where: { classId: cls5?.id, name: 'A' },
  })
  if (cls5 && sec5A) {
    const demoStudents = [
      { name: 'Ali Hassan', fatherName: 'Hassan Mahmood', gender: 'male', rollNo: 1 },
      { name: 'Sara Imran', fatherName: 'Imran Sheikh', gender: 'female', rollNo: 2 },
      { name: 'Hamza Tariq', fatherName: 'Tariq Mehmood', gender: 'male', rollNo: 3 },
      { name: 'Zara Ahmed', fatherName: 'Ahmed Ali', gender: 'female', rollNo: 4 },
      { name: 'Bilal Khan', fatherName: 'Khan Sb', gender: 'male', rollNo: 5 },
      { name: 'Ayesha Noor', fatherName: 'Noor Hassan', gender: 'female', rollNo: 6 },
      { name: 'Usman Raza', fatherName: 'Raza Khan', gender: 'male', rollNo: 7 },
      { name: 'Fatima Sana', fatherName: 'Sanaullah', gender: 'female', rollNo: 8 },
    ]

    let studentCount = 0
    for (const ds of demoStudents) {
      const existing = await prisma.student.findFirst({
        where: { schoolId: school.id, name: ds.name, fatherName: ds.fatherName },
      })
      let student = existing
      if (!student) {
        student = await prisma.student.create({
          data: {
            schoolId: school.id,
            name: ds.name,
            fatherName: ds.fatherName,
            gender: ds.gender,
            status: 'active',
          },
        })
        studentCount++
      }
      // Enrollment in academic year
      const enrExisting = await prisma.enrollment.findFirst({
        where: { studentId: student.id, academicYearId: ay!.id, sectionId: sec5A.id },
      })
      if (!enrExisting) {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            academicYearId: ay!.id,
            sectionId: sec5A.id,
            rollNo: ds.rollNo,
          },
        })
      }
      // Guardian
      const guardianExisting = await prisma.guardian.findFirst({
        where: { studentId: student.id, name: ds.fatherName },
      })
      if (!guardianExisting) {
        await prisma.guardian.create({
          data: {
            studentId: student.id,
            name: ds.fatherName,
            phone: `+9230012345${10 + ds.rollNo}`,
            relation: 'father',
          },
        })
      }
    }
    console.log(`  ✓ ${studentCount} demo students in Class 5-A`)
  }

  console.log('\n✅ School Admin seed complete!')
  console.log('\n🔑 School Admin Login:')
  console.log(`   Email:    ${schoolAdminEmail}`)
  console.log('   Password: school123')
  console.log(`   School:   ${school.name} (${school.city})`)
}

main()
  .catch((e) => {
    console.error('[Seed failed]', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
