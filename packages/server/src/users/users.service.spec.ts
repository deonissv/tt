// FILEPATH: /mnt/sda2/repos/tt/packages/server/src/users/users.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { PrismaClient } from '@prisma/client';

describe('UsersModule', () => {
  let module: TestingModule;
  let prismaService: PrismaService;
  let prismaClient: PrismaClient;
  let container: StartedTestContainer;

  beforeAll(async () => {
    // Create a new container instance
    container = await new GenericContainer('postgres')
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_USER: 'test',
        POSTGRES_PASSWORD: 'test',
        POSTGRES_DB: 'testdb',
        POSTGRES_SERVER: 'localhost',
      })
      .start();

    const id = container.getId();
    const port = container.getMappedPort(5432);

    prismaService = new PrismaService({
      datasources: {
        db: {
          url: `postgresql://test:test@${id}:${port}/test`,
        },
      },
    });

    module = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [UsersService, { provide: PrismaService, useValue: prismaService }],
      controllers: [UsersController],
    }).compile();
  });

  it('should be defined', () => {
    const controller = module.get<UsersController>(UsersController);
    const service = module.get<UsersService>(UsersService);
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
    await container.stop();
  });
});
