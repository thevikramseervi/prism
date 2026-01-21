import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Super Administrator with full system access',
    },
  });

  const labAdminRole = await prisma.role.upsert({
    where: { name: 'LAB_ADMIN' },
    update: {},
    create: {
      name: 'LAB_ADMIN',
      description: 'Lab Administrator with management access',
    },
  });

  const labMemberRole = await prisma.role.upsert({
    where: { name: 'LAB_MEMBER' },
    update: {},
    create: {
      name: 'LAB_MEMBER',
      description: 'Lab Member with read-only access to own data',
    },
  });

  console.log('✅ Roles created');

  // Create default super admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@seedlab.com' },
    update: {},
    create: {
      email: 'admin@seedlab.com',
      password_hash: hashedPassword,
      full_name: 'System Administrator',
      is_active: true,
    },
  });

  // Assign super admin role
  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: superAdmin.id,
        role_id: superAdminRole.id,
      },
    },
    update: {},
    create: {
      user_id: superAdmin.id,
      role_id: superAdminRole.id,
    },
  });

  console.log('✅ Super admin user created (admin@seedlab.com / admin123)');

  // Create payment bands
  const internLevel1 = await prisma.paymentBand.upsert({
    where: { name: 'Intern Level 1' },
    update: {},
    create: {
      name: 'Intern Level 1',
      description: 'Entry-level intern',
      monthly_base_salary: 10000,
      effective_from: new Date('2024-01-01'),
      is_active: true,
    },
  });

  const internLevel2 = await prisma.paymentBand.upsert({
    where: { name: 'Intern Level 2' },
    update: {},
    create: {
      name: 'Intern Level 2',
      description: 'Mid-level intern',
      monthly_base_salary: 15000,
      effective_from: new Date('2024-01-01'),
      is_active: true,
    },
  });

  console.log('✅ Payment bands created');

  // Create system settings
  const settings = [
    {
      key: 'FULL_DAY_MIN_HOURS',
      value: '8',
      data_type: 'FLOAT',
      description: 'Minimum hours for full-day attendance',
    },
    {
      key: 'HALF_DAY_MIN_HOURS',
      value: '4',
      data_type: 'FLOAT',
      description: 'Minimum hours for half-day attendance',
    },
    {
      key: 'ANNUAL_CASUAL_LEAVE_UNITS',
      value: '12',
      data_type: 'FLOAT',
      description: 'Annual casual leave units per lab member',
    },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ System settings created');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Default credentials:');
  console.log('   Email: admin@seedlab.com');
  console.log('   Password: admin123');
  console.log('\n⚠️  IMPORTANT: Change the default password in production!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
