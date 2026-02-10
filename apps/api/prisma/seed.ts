/**
 * Database Seed Script
 * Seeds roles, permissions, and default admin users
 * 
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_METADATA,
} from '../src/common/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ─────────────────────────────────────────────────────────────────
  // 1. Seed Permissions
  // ─────────────────────────────────────────────────────────────────
  console.log('Creating permissions...');
  
  for (const meta of PERMISSION_METADATA) {
    await prisma.permission.upsert({
      where: { code: meta.code },
      update: {
        module: meta.module,
        action: meta.action,
        scope: meta.scope,
        description: meta.description,
      },
      create: {
        code: meta.code,
        module: meta.module,
        action: meta.action,
        scope: meta.scope,
        description: meta.description,
      },
    });
  }
  console.log(`✅ Created ${PERMISSION_METADATA.length} permissions`);

  // ─────────────────────────────────────────────────────────────────
  // 2. Seed Roles
  // ─────────────────────────────────────────────────────────────────
  console.log('Creating roles...');

  const roleData = [
    { name: ROLES.SUPER_ADMIN, displayName: 'Super Admin', description: 'Toàn quyền hệ thống (IT/Dev)', isSystem: true },
    { name: ROLES.HR_ADMIN, displayName: 'HR Admin', description: 'Quản trị nghiệp vụ HR (Phòng TCCB)', isSystem: true },
    { name: ROLES.CONTENT_ADMIN, displayName: 'Content Admin', description: 'Quản lý nội dung CMS (Ban biên tập)', isSystem: true },
    { name: ROLES.MANAGER, displayName: 'Manager', description: 'Trưởng đơn vị', isSystem: true },
    { name: ROLES.EMPLOYEE, displayName: 'Employee', description: 'Nhân viên', isSystem: true },
  ];

  for (const role of roleData) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        displayName: role.displayName,
        description: role.description,
      },
      create: role,
    });
  }
  console.log(`✅ Created ${roleData.length} roles`);

  // ─────────────────────────────────────────────────────────────────
  // 3. Seed Role-Permission Mappings
  // ─────────────────────────────────────────────────────────────────
  console.log('Mapping permissions to roles...');

  for (const [roleName, permissionCodes] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) continue;

    // Remove existing mappings
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    // Create new mappings
    for (const code of permissionCodes) {
      const permission = await prisma.permission.findUnique({ where: { code } });
      if (permission) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }

    console.log(`  → ${roleName}: ${permissionCodes.length} permissions`);
  }
  console.log('✅ Role permissions mapped');

  // ─────────────────────────────────────────────────────────────────
  // 4. Seed Default Users
  // ─────────────────────────────────────────────────────────────────
  console.log('Creating default users...');

  const defaultUsers = [
    {
      email: 'admin@sgu.edu.vn',
      password: 'Admin@123',
      roleName: ROLES.SUPER_ADMIN,
    },
    {
      email: 'hr@sgu.edu.vn',
      password: 'Hr@12345',
      roleName: ROLES.HR_ADMIN,
    },
  ];

  for (const userData of defaultUsers) {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { passwordHash },
      create: {
        email: userData.email,
        passwordHash,
        isActive: true,
      },
    });

    // Assign role
    const role = await prisma.role.findUnique({ where: { name: userData.roleName } });
    if (role) {
      // Check if role mapping already exists
      const existingUserRole = await prisma.userRole.findFirst({
        where: {
          userId: user.id,
          roleId: role.id,
        },
      });

      if (!existingUserRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });
      }
    }

    console.log(`  → ${userData.email} (${userData.roleName})`);
  }
  console.log('✅ Default users created');

  // ─────────────────────────────────────────────────────────────────
  // 5. Seed Master Data (Ethnicities, Religions, Ranks)
  // ─────────────────────────────────────────────────────────────────
  console.log('Creating master data...');

  // Ethnicities
  const ethnicities = ['Kinh', 'Tày', 'Thái', 'Mường', 'Khmer', 'Hoa', 'Nùng', 'H\'Mông', 'Dao', 'Gia Rai'];
  for (const name of ethnicities) {
    await prisma.ethnicity.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Religions
  const religions = ['Không', 'Phật giáo', 'Công giáo', 'Tin lành', 'Hồi giáo', 'Cao đài', 'Hòa hảo'];
  for (const name of religions) {
    await prisma.religion.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Civil Servant Ranks (sample)
  const ranks = [
    { code: 'V.07.01.01', name: 'Giảng viên cao cấp', rankGroup: 'A0' as const },
    { code: 'V.07.01.02', name: 'Giảng viên chính', rankGroup: 'A1' as const },
    { code: 'V.07.01.03', name: 'Giảng viên', rankGroup: 'A2' as const },
    { code: 'V.01.01.01', name: 'Chuyên viên cao cấp', rankGroup: 'A1' as const },
    { code: 'V.01.01.02', name: 'Chuyên viên chính', rankGroup: 'A2' as const },
    { code: 'V.01.01.03', name: 'Chuyên viên', rankGroup: 'A3' as const },
    { code: 'V.01.02.03', name: 'Cán sự', rankGroup: 'B' as const },
    { code: 'V.01.03.03', name: 'Nhân viên', rankGroup: 'C' as const },
  ];

  for (const rank of ranks) {
    await prisma.civilServantRank.upsert({
      where: { code: rank.code },
      update: { name: rank.name, rankGroup: rank.rankGroup },
      create: rank,
    });
  }
  console.log('✅ Master data created');

  // ─────────────────────────────────────────────────────────────────
  // 6. Seed Default Organization Unit (Root)
  // ─────────────────────────────────────────────────────────────────
  console.log('Creating root organization...');

  await prisma.unit.upsert({
    where: { code: 'SGU' },
    update: {},
    create: {
      code: 'SGU',
      name: 'Trường Đại học Sài Gòn',
      shortName: 'SGU',
      unitType: 'TRUONG',
      status: 'ACTIVE',
      path: 'sgu',
      level: 0,
      sortOrder: 0,
    },
  });
  console.log('✅ Root organization created');

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\nDefault Accounts:');
  console.log('  Admin: admin@sgu.edu.vn / Admin@123');
  console.log('  HR:    hr@sgu.edu.vn / Hr@12345');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
