import { PrismaClient } from '@prisma/client';
import { permissions, roles } from './permitions';

let prisma: PrismaClient;

async function main() {
  prisma = new PrismaClient();
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

if (require.main === module) {
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async error => {
      // eslint-disable-next-line no-console
      console.log(error);
      await prisma.$disconnect();
    });
}
