// Math utilities on 3D and XZ plane (Y is up, island ground at Y = 0)

export function round3(val) {
  return Math.round(val * 1000) / 1000;
}

export function formatPos([x, y, z]) {
  return [round3(x), round3(y), round3(z)];
}

export function distXZ(p1, p2) {
  const dx = p1[0] - p2[0];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dz * dz);
}

export function distSqXZ(p1, p2) {
  const dx = p1[0] - p2[0];
  const dz = p1[2] - p2[2];
  return dx * dx + dz * dz;
}

export function dist3D(p1, p2) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Convert input move [x, z] and cam_yaw_deg into world direction vector [dx, dz]
export function transformMove(move, cam_yaw_deg = 0) {
  let [x, z] = move || [0, 0];
  x = clamp(x, -1, 1);
  z = clamp(z, -1, 1);

  const lenSq = x * x + z * z;
  if (lenSq > 1.0) {
    const len = Math.sqrt(lenSq);
    x /= len;
    z /= len;
  }

  if (x === 0 && z === 0) {
    return [0, 0];
  }

  const theta = (cam_yaw_deg * Math.PI) / 180.0;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  // x' = x * cos(theta) + z * sin(theta)
  // z' = -x * sin(theta) + z * cos(theta)
  const xPrime = x * cosT + z * sinT;
  const zPrime = -x * sinT + z * cosT;

  return [xPrime, zPrime];
}
