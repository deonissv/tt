import { CreateBox, PhysicsMotionType } from '@babylonjs/core';
import { ConsoleLogger } from '@nestjs/common';
import { ActorType } from '@tt/states';
import { WebSocket } from 'ws';
import { ServerBase } from '../src/simulation/actors';
import { Simulation } from '../src/simulation/simulation';
import { GenericContainer, Wait } from 'testcontainers';
import type { StartedTestContainer } from 'testcontainers';
import { POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER } from './testProviderKeys';

export const TEST_LOGGER = new ConsoleLogger('TestUtils');

export async function startContainer(): Promise<StartedTestContainer> {
  const container_name = 'postgres:14-alpine';

  const container = await new GenericContainer(container_name)
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_USER,
      POSTGRES_PASSWORD,
      POSTGRES_DB,
      POSTGRES_SERVER: 'localhost',
    })
    // Mount PG data dir in RAM — zero disk I/O for cluster init and all queries.
    .withTmpFs({ '/var/lib/postgresql/data': 'rw,size=512m' })
    // Disable durability guarantees — safe for tests, eliminates fsync overhead.
    .withCommand([
      'postgres',
      '-c',
      'fsync=off',
      '-c',
      'synchronous_commit=off',
      '-c',
      'full_page_writes=off',
      '-c',
      'max_connections=200',
    ])
    // The postgres image prints this message twice: once for the init temp server,
    // once for the final server. Wait for the second occurrence.
    .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections', 2))
    .withStartupTimeout(10_000)
    // Keep the container alive across runs when TESTCONTAINERS_REUSE_ENABLE=true.
    .withReuse()
    .start();

  return container;
}

export function getDatabaseUrl(host: string, port: number): string {
  return `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${host}:${port}/${POSTGRES_DB}`;
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

export async function wsConnect(url: string, protocol?: string | string[]): Promise<WebSocket> {
  const ws = new WebSocket(url, protocol);
  return new Promise((resolve, reject) => {
    ws.onopen = () => {
      resolve(ws);
    };
    ws.onerror = err => {
      reject(new Error(err.message));
    };
  });
}
