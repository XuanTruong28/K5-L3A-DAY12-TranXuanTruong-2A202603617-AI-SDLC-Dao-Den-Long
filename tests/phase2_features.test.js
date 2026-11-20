import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { Simulation } from '../src/core/simulation.js';

const HEADLESS_PATH = path.resolve('src/cli/headless.js');
const TMP_DIR = path.resolve('tests/tmp');

test('Night 3: 3-tier island, ramp traversal, jump pad to Tier 2, and bell tower obstacle', () => {
  const sim = new Simulation({ night: 3 });

  // 1. Ramp at 30 deg: foot at r=30 (Y=0), top at r=24 (Y=3)
  // Angle 30 deg: cos(30) = 0.866025, sin(30) = 0.5
  const rad30 = (30 * Math.PI) / 180;
  const xFoot = 30 * Math.cos(rad30);
  const zFoot = 30 * Math.sin(rad30);
  assert.equal(sim.getGroundHeight(xFoot, zFoot), 0.0);

  const xMid = 27 * Math.cos(rad30);
  const zMid = 27 * Math.sin(rad30);
  const hMid = sim.getGroundHeight(xMid, zMid);
  assert.ok(Math.abs(hMid - 1.5) < 0.05, `Ramp midpoint should be Y=1.5, got ${hMid}`);

  const xTop = 24 * Math.cos(rad30);
  const zTop = 24 * Math.sin(rad30);
  const hTop = sim.getGroundHeight(xTop, zTop);
  assert.ok(Math.abs(hTop - 3.0) < 0.05, `Ramp top should be Y=3.0, got ${hTop}`);

  // 2. Bell tower obstacle at center of Tier 2 (r <= 2.0)
  const [resX, resZ] = sim.resolveObstacles([0, 6, 3], 0, 1.0); // tries to enter r=1.0
  const rRes = Math.sqrt(resX * resX + resZ * resZ);
  assert.ok(rRes >= 1.99, 'Bell tower obstacle must push player out to r >= 2.0m');

  // 3. Jump pad at (0, 3, 13) launches towards -Z and lands on Tier 2
  sim.player.pos = [0, 3.0, 13.0];
  sim.player.grounded = true;
  sim.step({});
  assert.equal(sim.player.in_launch, true);
  assert.equal(sim.player.launch_vz, -8.0);
});

test('Night 3: Wind pushes player when active', () => {
  const sim = new Simulation({
    night: 3,
    scenario: { wind_enabled: true, wind_active: true, wind_dir_deg: 0.0 }
  });

  const initialX = sim.player.pos[0];
  // Step without movement input: wind should push player in +X
  sim.step({});
  assert.ok(sim.player.pos[0] > initialX, 'Wind must displace player in wind direction');
});

test('Performance Benchmark: Headless CLI runs full 21,600 ticks in <= 30 seconds', () => {
  const outPath = path.join(TMP_DIR, 'perf_21600.jsonl');

  const startTime = Date.now();
  execFileSync(process.execPath, [
    HEADLESS_PATH,
    '--seed', '777',
    '--night', '1',
    '--ticks', '21600',
    '--out', outPath,
    '--snapshot-every', '600'
  ]);
  const durationMs = Date.now() - startTime;

  assert.ok(fs.existsSync(outPath));
  assert.ok(durationMs < 30000, `Full night (21,600 ticks) must finish in <= 30s, finished in ${durationMs}ms`);

  const lines = fs.readFileSync(outPath, 'utf8').trim().split('\n');
  const lastLine = JSON.parse(lines[lines.length - 1]);
  assert.equal(lastLine.type, 'end');
});
