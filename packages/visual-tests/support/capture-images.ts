/** Let every capture finish before a failed group can be retried. */
export async function captureImages<T>(
  targets: readonly T[],
  capture: (target: T) => Promise<Buffer>,
): Promise<Buffer[]> {
  const captures = targets.map(capture);
  return Promise.all(captures).catch(async error => {
    await Promise.allSettled(captures);
    throw error;
  });
}
