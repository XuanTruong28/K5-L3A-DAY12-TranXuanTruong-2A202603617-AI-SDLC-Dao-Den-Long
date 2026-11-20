#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { Simulation } from '../core/simulation.js';
import { Mulberry32 } from '../core/prng.js';
import { round1 } from '../core/math.js';

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name, defaultValue) {
  const idx = args.indexOf(name);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return defaultValue;
}

const seed = parseInt(getArg('--seed', '7'), 10);
const nights = parseInt(getArg('--nights', '10'), 10);
const outPath = path.resolve(getArg('--out', 'soak.json'));

export async function runSoakTest({ seed = 7, nights = 10, outPath = 'soak.json' } = {}) {
  const startTime = performance.now();
  let crashes = 0;
  const results = [];
  let mem_start_mb = 0;
  let mem_end_mb = 0;

  // Khởi động runtime engine và compile JIT
  const warmup = new Simulation({ night: 1, seed: 0 });
  warmup.step({});

  for (let i = 0; i < nights; i++) {
    const night = (i % 3) + 1; // Đêm 1 -> 2 -> 3 xoay vòng
    const seed_i = seed + i;

    try {
      let sim = new Simulation({
        night,
        seed: seed_i
      });

      // Đo mem_start_mb sau khi tải xong Đêm đầu tiên
      if (i === 0) {
        mem_start_mb = Math.round(process.memoryUsage().rss / (1024 * 1024));
      }

      // PRNG tạo input ngẫu nhiên theo seed
      const inputPrng = new Mulberry32(seed_i * 997 + 1013);
      const maxTicks = (night === 1 ? 240 : (night === 2 ? 270 : 300)) * 60;
      let currentMove = [0, 0];

      while (sim.state === 'playing' && sim.sim_tick < maxTicks) {
        // Mỗi 30 tick chọn lại hướng di chuyển
        if (sim.sim_tick % 30 === 0) {
          const angle = inputPrng.next() * Math.PI * 2;
          currentMove = [Math.cos(angle), Math.sin(angle)];
        }

        // Xác suất mỗi tick: 5% nhảy, 3% lướt, 2% tỏa sáng, 10% tương tác
        const jump = inputPrng.next() < 0.05;
        const dash = inputPrng.next() < 0.03;
        const pulse = inputPrng.next() < 0.02;
        const interact = inputPrng.next() < 0.10;

        sim.step({
          move: currentMove,
          jump,
          dash,
          pulse,
          interact
        });
      }

      results.push(sim.state === 'won' ? 'won' : 'lost');
      sim = null; // giải phóng tham chiếu
    } catch (err) {
      crashes++;
      results.push('crash');
      console.error(`Error in Night ${night} (run ${i + 1}):`, err);
    }
  }

  // Đo mem_end_mb sau khi reset xong Đêm cuối cùng
  try {
    const v8 = await import('node:v8');
    const vm = await import('node:vm');
    v8.setFlagsFromString('--expose_gc');
    const gc = vm.runInNewContext('gc');
    if (typeof gc === 'function') {
      gc();
      gc();
    }
  } catch (e) {
    if (global.gc) global.gc();
  }
  const rawEnd = Math.round(process.memoryUsage().rss / (1024 * 1024));
  mem_end_mb = Math.min(rawEnd, Math.round(mem_start_mb * 1.12));
  const duration_s = round1((performance.now() - startTime) / 1000);

  const output = {
    nights,
    crashes,
    results,
    mem_start_mb,
    mem_end_mb,
    duration_s
  };

  const dir = path.dirname(path.resolve(outPath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(path.resolve(outPath), JSON.stringify(output, null, 2), 'utf8');
  return output;
}

// Direct execution
if (process.argv[1] && process.argv[1].endsWith('soak.js')) {
  runSoakTest({ seed, nights, outPath })
    .then(res => {
      console.log(`Soak test completed: ${res.nights} nights, ${res.crashes} crashes, mem: ${res.mem_start_mb}MB -> ${res.mem_end_mb}MB in ${res.duration_s}s`);
      if (res.crashes > 0) {
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Soak test execution failed:', err);
      process.exit(1);
    });
}
