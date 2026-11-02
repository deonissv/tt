type Matrix3 = readonly number[];

export function multiplyBases(left: Matrix3, right: Matrix3): Matrix3 {
  return Array.from({ length: 9 }, (_, index) => {
    const row = Math.floor(index / 3);
    const column = index % 3;
    return [0, 1, 2].reduce((sum, axis) => sum + left[row * 3 + axis] * right[axis * 3 + column], 0);
  });
}

// The public save format uses pitch, yaw, and roll in radians, in Y-X-Z order.
// These basis matrices measure orientation independently of the renderer.
export function orientationBasis([pitch, yaw, roll]: readonly number[]): Matrix3 {
  const [sx, sy, sz] = [pitch, yaw, roll].map(Math.sin);
  const [cx, cy, cz] = [pitch, yaw, roll].map(Math.cos);
  const x = [1, 0, 0, 0, cx, -sx, 0, sx, cx];
  const y = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
  const z = [cz, -sz, 0, sz, cz, 0, 0, 0, 1];
  return multiplyBases(multiplyBases(y, x), z);
}

export function basisDistanceRadians(left: Matrix3, right: Matrix3): number {
  const trace = left.reduce((sum, value, index) => sum + value * right[index], 0);
  return Math.acos(Math.max(-1, Math.min(1, (trace - 1) / 2)));
}

export function orientationDistanceRadians(expected: number[], actual: number[]): number {
  return basisDistanceRadians(orientationBasis(expected), orientationBasis(actual));
}
