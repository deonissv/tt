import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export async function acquireStackLock(
  projectName,
  { signal, timeoutMs = Number(process.env.VISUAL_LOCK_TIMEOUT_MS ?? 3_600_000) } = {},
) {
  signal?.throwIfAborted();
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('VISUAL_LOCK_TIMEOUT_MS must be a positive number.');
  }
  const target = path.join(os.tmpdir(), `${projectName}.lock`);
  const file = await fs.open(target, 'a+', 0o600);
  try {
    signal?.throwIfAborted();
    console.log(`[visual] Waiting for stack lock ${target}.`);
    await new Promise((resolve, reject) => {
      // fd 3 in flock refers to the same open file description as file.fd in
      // Node. The kernel lock survives flock's exit while Node keeps it open.
      const child = spawn('flock', ['-x', '-w', String(Math.ceil(timeoutMs / 1000)), '-E', '75', '3'], {
        signal,
        stdio: ['ignore', 'ignore', 'pipe', file.fd],
      });
      let errors = '';
      let failure;
      child.stderr.on('data', chunk => {
        errors += chunk;
      });
      child.on('error', error => {
        failure = error;
      });
      // Wait for close even on abort, so the child cannot retain a descriptor
      // and acquire the lock after this attempt has already failed.
      child.on('close', (code, exitSignal) => {
        if (failure?.code === 'ENOENT') {
          reject(new Error('Local visual tests require flock on PATH; install util-linux before running them.'));
        } else if (failure) reject(failure);
        else if (code === 0) resolve();
        else if (code === 75) reject(new Error(`Timed out waiting for visual stack lock ${target}.`));
        else reject(new Error(`flock failed (${exitSignal ?? code}): ${errors.trim()}`));
      });
    });
    signal?.throwIfAborted();
    // Never unlink the file: all owners must continue locking the same inode.
    // Process exit also closes the descriptor and releases the kernel lock.
    return () => file.close();
  } catch (error) {
    await file.close();
    throw error;
  }
}
