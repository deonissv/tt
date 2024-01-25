import { PrismaClient } from '@prisma/client';

export const roles = [
  {
    roleId: 1,
    name: 'Admin',
  },
  {
    roleId: 2,
    name: 'User',
  },
];

export const permissions = [
  {
    permissionId: 1,
    roleId: 1,
    action: 'manage',
    subject: 'all',
  },
  {
    permissionId: 2,
    roleId: 2,
    action: 'read',
    subject: 'Game',
  },
  {
    permissionId: 3,
    roleId: 2,
    action: 'read',
    subject: 'User',
    conditions: { authorId: '{{ userId }}' },
  },
  {
    permissionId: 4,
    roleId: 2,
    action: 'create',
    subject: 'User',
  },
  {
    permissionId: 5,
    roleId: 2,
    action: 'create',
    subject: 'Game',
  },
];

const prisma = new PrismaClient();

async function main() {
  for await (const role of roles) {
    await prisma.role.upsert({
      where: {
        roleId: role.roleId,
      },
      create: role,
      update: role,
    });
  }

  for await (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        permissionId: permission.permissionId,
      },
      create: permission,
      update: permission,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async error => {
    // eslint-disable-next-line no-console
    console.log(error);
    await prisma.$disconnect();
  });
