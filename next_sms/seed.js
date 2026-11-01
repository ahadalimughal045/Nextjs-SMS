const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial school data...');
  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Settings
  const defaultSettings = [
    { type: 'system_name', description: 'CJ Inspired Academy' },
    { type: 'system_title', description: 'School Management System' },
    { type: 'current_session', description: '2026-2027' },
    { type: 'term_ends', description: '15/12/2026' },
    { type: 'next_term_begins', description: '10/01/2027' },
    { type: 'phone', description: '+234 801 234 5678' },
    { type: 'system_email', description: 'info@cjinspired.edu' },
    { type: 'address', description: 'Plot 14, Academy Boulevard, Victoria Island' },
  ];

  for (const s of defaultSettings) {
    const existing = await prisma.settings.findFirst({ where: { type: s.type } });
    if (!existing) {
      await prisma.settings.create({ data: s });
    }
  }

  // 2. Class Types
  const classTypes = [
    { name: 'Nursery', code: 'NUR' },
    { name: 'Primary', code: 'PRY' },
    { name: 'Junior Secondary', code: 'JSS' },
    { name: 'Senior Secondary', code: 'SSS' },
  ];

  const createdClassTypes = [];
  for (const ct of classTypes) {
    const existing = await prisma.class_types.findFirst({ where: { code: ct.code } });
    if (!existing) {
      const created = await prisma.class_types.create({ data: ct });
      createdClassTypes.push(created);
    } else {
      createdClassTypes.push(existing);
    }
  }

  // 3. Blood Groups
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  for (const bg of bloodGroups) {
    const existing = await prisma.blood_groups.findFirst({ where: { name: bg } });
    if (!existing) {
      await prisma.blood_groups.create({ data: { name: bg } });
    }
  }

  // 4. Grades Scale
  const defaultGrades = [
    { name: 'A', mark_from: 70, mark_to: 100, remark: 'Distinction' },
    { name: 'B', mark_from: 60, mark_to: 69, remark: 'Very Good' },
    { name: 'C', mark_from: 50, mark_to: 59, remark: 'Good' },
    { name: 'D', mark_from: 45, mark_to: 49, remark: 'Fair' },
    { name: 'E', mark_from: 40, mark_to: 44, remark: 'Pass' },
    { name: 'F', mark_from: 0, mark_to: 39, remark: 'Fail' },
  ];

  for (const g of defaultGrades) {
    const existing = await prisma.grades.findFirst({
      where: { name: g.name, mark_from: g.mark_from },
    });
    if (!existing) {
      await prisma.grades.create({ data: g });
    }
  }

  // 5. Dormitories
  const dorms = [
    { name: 'Nelson Mandela Hall', description: 'Senior Boys Residential Hostel' },
    { name: 'Queen Amina Hall', description: 'Senior Girls Residential Hostel' },
  ];

  for (const d of dorms) {
    const existing = await prisma.dorms.findFirst({ where: { name: d.name } });
    if (!existing) {
      await prisma.dorms.create({ data: d });
    }
  }

  // 6. Users: Admin, Teachers, Parent
  const admin = await prisma.users.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@school.com',
      username: 'admin',
      code: 'ADM-001',
      user_type: 'super_admin',
      password: defaultPassword,
    },
  });

  const teacher1 = await prisma.users.upsert({
    where: { email: 'teacher@school.com' },
    update: {},
    create: {
      name: 'Mr. David Okon',
      email: 'teacher@school.com',
      username: 'teacher',
      code: 'TEA-001',
      user_type: 'teacher',
      phone: '08022223333',
      password: defaultPassword,
    },
  });

  const parent1 = await prisma.users.upsert({
    where: { email: 'parent@school.com' },
    update: {},
    create: {
      name: 'Chief Johnson Adebayo',
      email: 'parent@school.com',
      username: 'parent',
      code: 'PAR-001',
      user_type: 'parent',
      phone: '08055556666',
      password: defaultPassword,
    },
  });

  // 7. Classes & Sections
  const jssType = createdClassTypes.find((t) => t.code === 'JSS') || createdClassTypes[0];

  const classNames = ['JSS 1', 'JSS 2', 'JSS 3'];
  for (const cName of classNames) {
    let cls = await prisma.my_classes.findFirst({ where: { name: cName } });
    if (!cls) {
      cls = await prisma.my_classes.create({
        data: {
          name: cName,
          class_type_id: jssType?.id || null,
        },
      });

      // Sections
      await prisma.sections.create({
        data: {
          name: 'A',
          my_class_id: cls.id,
          teacher_id: teacher1.id,
          active: 1,
        },
      });

      await prisma.sections.create({
        data: {
          name: 'B',
          my_class_id: cls.id,
          teacher_id: teacher1.id,
          active: 1,
        },
      });
    }
  }

  // 8. Subjects
  const class1 = await prisma.my_classes.findFirst({ where: { name: 'JSS 1' } });
  if (class1) {
    const subjects = [
      { name: 'Mathematics', slug: 'maths' },
      { name: 'English Language', slug: 'english' },
      { name: 'Basic Science', slug: 'basic-sci' },
      { name: 'Social Studies', slug: 'social-std' },
    ];

    for (const sub of subjects) {
      const existing = await prisma.subjects.findFirst({
        where: { name: sub.name, my_class_id: class1.id },
      });
      if (!existing) {
        await prisma.subjects.create({
          data: {
            name: sub.name,
            slug: sub.slug,
            my_class_id: class1.id,
            teacher_id: teacher1.id,
          },
        });
      }
    }
  }

  // 9. Exams
  const existingExam = await prisma.exams.findFirst({
    where: { term: 1, year: '2026-2027' },
  });
  if (!existingExam) {
    await prisma.exams.create({
      data: {
        name: 'First Term Examination 2026-2027',
        term: 1,
        year: '2026-2027',
      },
    });
  }

  // 10. Student & Student Record
  const section1 = await prisma.sections.findFirst({
    where: { my_class_id: class1?.id, name: 'A' },
  });

  const studentUser = await prisma.users.upsert({
    where: { email: 'student@school.com' },
    update: {},
    create: {
      name: 'Michael Adebayo',
      email: 'student@school.com',
      username: 'student',
      code: 'STD-001',
      user_type: 'student',
      gender: 'Male',
      dob: '2012-05-14',
      phone: '08099998888',
      password: defaultPassword,
    },
  });

  const existingStudentRecord = await prisma.student_records.findFirst({
    where: { user_id: studentUser.id },
  });

  if (!existingStudentRecord && class1 && section1) {
    await prisma.student_records.create({
      data: {
        user_id: studentUser.id,
        my_class_id: class1.id,
        section_id: section1.id,
        adm_no: 'CJ/2026/001',
        my_parent_id: parent1.id,
        session: '2026-2027',
        age: 14,
        year_admitted: '2026',
        grad: 0,
      },
    });
  }

  // 11. Fee Structure
  const existingFee = await prisma.payments.findFirst({
    where: { title: 'First Term Tuition Fee' },
  });
  if (!existingFee && class1) {
    await prisma.payments.create({
      data: {
        title: 'First Term Tuition Fee',
        amount: 45000,
        ref_no: 'FEE-2026-001',
        method: 'cash',
        my_class_id: class1.id,
        description: 'First Term Academic & Tuition Fee',
        year: '2026-2027',
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
