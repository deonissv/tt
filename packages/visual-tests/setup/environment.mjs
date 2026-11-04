import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { acquireStackLock } from './stack-lock.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));

let starting;

export function setupEnvironment(environment) {
  // A second UI connection can request setup before the first one completes.
  starting ??= prepare(environment).finally(() => {
    starting = undefined;
  });
  return starting;
}

async function prepare(environment) {
  process.env.VISUAL_STACK_CONFIG = JSON.stringify(environment);
  const { mode } = environment;
  const attached = mode === 'dev' || mode === 'headed';
  let releaseStackLock;
  let ownsStack = false;
  let stopped = false;
  const cleanup = async () => {
    if (stopped) return;
    stopped = true;
    try {
      if (ownsStack) await teardown();
    } finally {
      await releaseStackLock?.();
    }
  };
  fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
  const startup = new AbortController();
  const interrupt = () => startup.abort();
  process.on('SIGINT', interrupt);
  process.on('SIGTERM', interrupt);
  try {
    process.env.VISUAL_ASSET_URL = environment.assetURL;
    if (attached) {
      process.env.VISUAL_API_URL = environment.apiURL;
      delete process.env.PW_TEST_CONNECT_WS_ENDPOINT;
      // Keep discovery and native UI watch available while local services start
      // or recover. Application readiness belongs to the selected test fixture.
      console.log(`[visual ${mode}] Frontend: ${environment.baseURL}; API/assets: ${environment.apiURL}.`);
      console.log('[visual] Start your normal Nginx/database, frontend and backend services before running tests.');
      if (mode === 'dev') {
        console.log('[visual dev] Click Run after application changes. Native watch follows test files and imports.');
      }
      return cleanup;
    }
    // Local runs of the same Compose project share a stack. CI isolates its
    // projects per run and must not wait for a host lock.
    if (!process.env.CI && !process.env.GITHUB_RUN_ID) {
      releaseStackLock = await acquireStackLock(environment.projectName, { signal: startup.signal });
    }
    startup.signal.throwIfAborted();
    ownsStack = true;
    await compose(['down', '--volumes', '--remove-orphans'], { signal: startup.signal });
    // CI loads images from its cached Bake step; local runs build the stack here.
    const skipBuild = process.env.VISUAL_SKIP_BUILD === '1';
    if (!skipBuild) await compose(['build'], { signal: startup.signal });
    await compose(['up', '--detach', '--wait', ...(skipBuild ? ['--no-build'] : [])], { signal: startup.signal });
    process.env.VISUAL_API_URL = await serviceURL('web', 8080);
    process.env.PW_TEST_CONNECT_WS_ENDPOINT = (await serviceURL('runner', 3000)).replace('http:', 'ws:');
    return cleanup;
  } catch (error) {
    // A setup that throws cannot return its cleanup function to Playwright.
    try {
      await cleanup();
    } catch (cleanupError) {
      console.error(cleanupError.message);
    }
    throw error;
  } finally {
    process.off('SIGINT', interrupt);
    process.off('SIGTERM', interrupt);
  }
}

async function teardown() {
  const { mode } = JSON.parse(process.env.VISUAL_STACK_CONFIG);
  const suffix = mode === 'canonical' ? '' : `-${mode}`;
  try {
    for (const service of ['web', 'database']) {
      const log = await compose(['logs', '--no-color', service], { capture: true });
      fs.writeFileSync(path.join(root, `test-results/visual-${service === 'web' ? 'app' : service}${suffix}.log`), log);
    }
  } finally {
    await compose(['down', '--volumes', '--remove-orphans']);
  }
}

function compose(args, { capture = false, signal } = {}) {
  const environment = JSON.parse(process.env.VISUAL_STACK_CONFIG);
  return docker(
    [
      'compose',
      '--file',
      path.join(root, 'packages/visual-tests/infra/docker-compose.yml'),
      '--project-name',
      environment.projectName,
      ...args,
    ],
    {
      capture,
      signal,
    },
  );
}

function docker(args, { capture = false, signal } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, {
      cwd: root,
      env: {
        ...process.env,
        VISUAL_APP_ORIGIN: 'http://web:8080',
        VISUAL_WEB_PORT: process.env.VISUAL_WEB_PORT ?? '0',
      },
      signal,
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });
    let output = '';
    let errors = '';
    child.stdout?.on('data', chunk => {
      output += chunk;
    });
    child.stderr?.on('data', chunk => {
      errors += chunk;
    });
    // Aborting reports an error before the process closes. Keep ownership
    // until Docker has actually stopped, before cleanup can release the lock.
    let failure;
    child.on('error', error => {
      failure = error;
    });
    child.on('close', (code, signal) => {
      if (failure) reject(failure);
      else if (code === 0) resolve(output);
      else reject(new Error(`docker ${args.join(' ')} failed (${signal ?? code}). ${errors}`));
    });
  });
}

export async function applicationStartedAt() {
  assertManagedApplication();
  const id = (await compose(['ps', '--quiet', 'web'], { capture: true })).trim();
  if (!/^[a-f0-9]+$/.test(id)) throw new Error('Expected one running application container');
  return (await docker(['inspect', '--format', '{{.State.StartedAt}}', id], { capture: true })).trim();
}

async function serviceURL(service, port) {
  const address = (await compose(['port', service, String(port)], { capture: true })).trim();
  if (!/^127\.0\.0\.1:\d+$/.test(address)) throw new Error(`Expected a loopback port for ${service}: ${address}`);
  return `http://${address}`;
}

export async function refreshAPIURL(fallback) {
  const configuration = process.env.VISUAL_STACK_CONFIG;
  if (configuration && !['dev', 'headed'].includes(JSON.parse(configuration).mode)) {
    const exited = (await compose(['ps', '--all', '--status', 'exited', '--quiet', 'web'], { capture: true })).trim();
    if (exited) {
      if (!/^[a-f0-9]+$/.test(exited)) throw new Error('Expected one exited application container');
      const { projectName } = JSON.parse(configuration);
      const logPath = path.join(root, 'test-results', `visual-recovery-${projectName}-${Date.now()}.log`);
      const log = await compose(['logs', '--no-color', 'web'], { capture: true });
      fs.writeFileSync(logPath, log);
      console.warn(`[visual] Previous application exited; preserving ${logPath} and recovering for the next test.`);
      // This runs before a new test, so the test that crashed the application still fails.
      await compose(['up', '--detach', '--wait', '--no-build', 'web']);
    }
    // New workers inherit the original port even after another worker restarts Docker.
    process.env.VISUAL_API_URL = await serviceURL('web', 8080);
  }
  return process.env.VISUAL_API_URL ?? fallback;
}

export async function restartApplication() {
  assertManagedApplication();
  await compose(['restart', 'web']);
  await compose(['up', '--detach', '--wait', 'web']);
  // Docker can reassign an ephemeral host port when the container restarts.
  process.env.VISUAL_API_URL = await serviceURL('web', 8080);
}

function assertManagedApplication() {
  const { mode } = JSON.parse(process.env.VISUAL_STACK_CONFIG);
  if (mode === 'dev' || mode === 'headed') {
    throw new Error(
      'Application lifecycle is user-owned in attached development; use the canonical suite for restart tests.',
    );
  }
}
