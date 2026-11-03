// prisma/seed-r2.ts
// Seed Teacher + Parent + Student users for Phase R2 testing

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Phase R2 users (Teacher, Parent, Student)...')

  // Get Beaconhouse school
  const school = await prisma.school.findFirst({
    where: { name: 'Beaconhouse School System' },
  })
  if (!school) throw new Error('Beaconhouse school not found. Run main seed first.')

  // Get academic year + Class 5-A
  const ay = await prisma.academicYear.findFirst({
    where: { schoolId: school.id, isActive: true },
  })
  if (!ay) throw new Error('Academic year not found')

  const class5 = await prisma.class.findFirst({
    where: { schoolId: school.id, name: 'Class 5' },
  })
  const section5A = await prisma.section.findFirst({
    where: { classId: class5?.id, name: 'A' },
  })
  if (!class5 || !section5A) throw new Error('Class 5-A not found')

  // ──────── 1. TEACHER USER ────────
  const teacherEmail = 'sana@beaconhouse.edu.pk'
  const teacherPass = 'teacher123'
  const teacherHash = await bcrypt.hash(teacherPass, 10)

  let teacher = await prisma.user.findUnique({ where: { email: teacherEmail } })
  if (!teacher) {
    teacher = await prisma.user.create({
      data: {
        email: teacherEmail,
        name: 'Sana Mir',
        passwordHash: teacherHash,
        role: 'TEACHER',
        schoolId: school.id,
        isActive: true,
      },
    })
    console.log(`  ✓ Teacher created: ${teacherEmail}`)
  } else {
    await prisma.user.update({
      where: { email: teacherEmail },
      data: { passwordHash: teacherHash, role: 'TEACHER', schoolId: school.id, isActive: true },
    })
    console.log(`  ✓ Teacher updated: ${teacherEmail}`)
  }

  // ──────── 2. PARENT USER ────────
  // Link to first student (Ali Hassan) in Class 5-A
  const ali = await prisma.student.findFirst({
    where: { schoolId: school.id, name: 'Ali Hassan' },
  })
  if (!ali) throw new Error('Ali Hassan student not found')

  // Ensure Ali has admission ID
  if (!ali.admissionId) {
    const schoolCode = (school.name || 'SCH').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X')
    const cityCode = (school.city || 'ISB').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X')
    const year = new Date().getFullYear()
    const yearPrefix = `${schoolCode}-${cityCode}-${year}-`
    const existingCount = await prisma.student.count({
      where: { schoolId: school.id, admissionId: { startsWith: yearPrefix } },
    })
    const seq = (existingCount + 1).toString().padStart(4, '0')
    await prisma.student.update({
      where: { id: ali.id },
      data: { admissionId: `${yearPrefix}${seq}` },
    })
    console.log(`  ✓ Ali admission ID set: ${yearPrefix}${seq}`)
  }

  const parentEmail = 'hassan@example.com'
  const parentPass = 'parent123'
  const parentHash = await bcrypt.hash(parentPass, 10)

  let parent = await prisma.user.findUnique({ where: { email: parentEmail } })
  if (!parent) {
    parent = await prisma.user.create({
      data: {
        email: parentEmail,
        name: 'Hassan Mahmood',
        passwordHash: parentHash,
        role: 'PARENT',
        schoolId: school.id,
        isActive: true,
      },
    })
    console.log(`  ✓ Parent created: ${parentEmail}`)
  } else {
    await prisma.user.update({
      where: { email: parentEmail },
      data: { passwordHash: parentHash, role: 'PARENT', schoolId: school.id, isActive: true },
    })
    console.log(`  ✓ Parent updated: ${parentEmail}`)
  }

  // Link parent to student via ParentStudent
  const existingLink = await prisma.parentStudent.findUnique({
    where: { parentId_studentId: { parentId: parent.id, studentId: ali.id } },
  })
  if (!existingLink) {
    await prisma.parentStudent.create({
      data: {
        parentId: parent.id,
        studentId: ali.id,
        relation: 'father',
      },
    })
    console.log(`  ✓ Parent linked to student: ${ali.name}`)
  }

  // ──────── 3. STUDENT USER (Ali — Class 5+ so eligible) ────────
  const studentEmail = 'ali@beaconhouse.edu.pk'
  const studentPass = 'student123'
  const studentHash = await bcrypt.hash(studentPass, 10)

  let studentUser = await prisma.user.findUnique({ where: { email: studentEmail } })
  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        email: studentEmail,
        name: 'Ali Hassan',
        passwordHash: studentHash,
        role: 'STUDENT',
        schoolId: school.id,
        isActive: true,
      },
    })
    console.log(`  ✓ Student created: ${studentEmail}`)
  } else {
    await prisma.user.update({
      where: { email: studentEmail },
      data: { passwordHash: studentHash, role: 'STUDENT', schoolId: school.id, isActive: true },
    })
    console.log(`  ✓ Student updated: ${studentEmail}`)
  }

  // ──────── 4. EXAM + MARKS DEMO ────────
  // Create a Mid-Term exam
  let exam = await prisma.exam.findFirst({
    where: { schoolId: school.id, name: 'Mid-Term' },
  })
  if (!exam) {
    exam = await prisma.exam.create({
      data: {
        schoolId: school.id,
        academicYearId: ay.id,
        name: 'Mid-Term',
        term: 'mid_term',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-15'),
        isActive: true,
      },
    })
    console.log(`  ✓ Exam created: Mid-Term`)
  }

  // Add marks for Ali (Mathematics)
  const math = await prisma.subject.findFirst({
    where: { schoolId: school.id, name: 'Mathematics' },
  })
  if (math && exam) {
    const existingMark = await prisma.examMark.findUnique({
      where: {
        examId_studentId_subjectId: {
          examId: exam.id,
          studentId: ali.id,
          subjectId: math.id,
        },
      },
    })
    if (!existingMark) {
      await prisma.examMark.create({
        data: {
          examId: exam.id,
          studentId: ali.id,
          subjectId: math.id,
          classId: class5.id,
          sectionId: section5A.id,
          marks: 88,
          totalMarks: 100,
          grade: 'A',
          enteredBy: teacher.id,
          status: 'approved',
        },
      })
      console.log(`  ✓ Ali's Math marks: 88/100 (A)`)
    }
  }

  // ──────── 5. ATTENDANCE FOR ALI (last 5 days) ────────
  const enr = await prisma.enrollment.findFirst({
    where: { studentId: ali.id, academicYearId: ay.id },
  })
  if (enr) {
    const today = new Date()
    for (let i = 0; i < 5; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      // Skip if already exists
      const existing = await prisma.attendance.findFirst({
        where: { enrollmentId: enr.id, date },
      })
      if (!existing) {
        // 80% chance present, 20% absent
        const status = i === 1 ? 'absent' : i === 3 ? 'late' : 'present'
        await prisma.attendance.create({
          data: {
            enrollmentId: enr.id,
            studentId: ali.id,
            date,
            status,
            markedBy: teacher.id,
          },
        })
      }
    }
    console.log(`  ✓ Attendance seeded for Ali (5 days)`)
  }

  console.log('\n✅ Phase R2 seed complete!')
  console.log('\n🔑 Login Credentials:')
  console.log(`   Teacher: ${teacherEmail} / ${teacherPass}`)
  console.log(`   Parent:  ${parentEmail} / ${parentPass}`)
  console.log(`   Student: ${studentEmail} / ${studentPass}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
