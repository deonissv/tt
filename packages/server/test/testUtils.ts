import { CreateBox, PhysicsMotionType } from '@babylonjs/core';
import { ConsoleLogger } from '@nestjs/common';
import { ServerBase } from '@server/src/simulation/actors';
import { Simulation } from '@server/src/simulation/simulation';
import { ActorType } from '@shared/dto/states';
import { execSync } from 'child_process';
import type { StartedTestContainer } from 'testcontainers';
import { GenericContainer } from 'testcontainers';

const logger = new ConsoleLogger('TestUtils');

const POSTGRES_USER = 'test';
const POSTGRES_PASSWORD = 'test';
const POSTGRES_DB = 'testdb';
const POSTGRES_SERVER = 'localhost';

// TODO: re-write this when Prisma.io gets a programmatic migration API
// https://github.com/prisma/prisma/issues/4703
export function prismaMigrate(databaseUrl: string): void {
  execSync('npx prisma db push --force-reset && npx prisma db seed', {
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}

export async function startContainer(): Promise<StartedTestContainer | null> {
  const container_name = 'postgres:14-alpine';
  logger.log(`Starting ${container_name} container...`);
  const container = await new GenericContainer(container_name)
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_USER: POSTGRES_USER,
      POSTGRES_PASSWORD: POSTGRES_PASSWORD,
      POSTGRES_DB: POSTGRES_DB,
      POSTGRES_SERVER: POSTGRES_SERVER,
    })
    .start()
    .catch(e => {
      logger.error('Failed to start container');
      logger.error(e);
      process.kill(process.pid, 'SIGTERM');
      return null;
    });
  logger.log('Container started successfully');
  return container;
}

export function getDatabaseUrl(host: string, port: number): string {
  return `postgresql://test:test@${host}:${port}/testdb`;
}

export function getPhSim() {
  const sim = new Simulation({
    actorStates: [],
  });
  sim.initPhysics();

  const ground = new ServerBase(
    { type: ActorType.ACTOR, guid: '#ground', name: '#ground', model: { meshURL: '' } },
    CreateBox('ground', { width: 200, height: 0.1, depth: 200 }),
  );
  ground.physicsBody?.setMotionType(PhysicsMotionType.ANIMATED);

  return sim;
}
