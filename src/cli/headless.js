#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { Simulation } from '../core/simulation.js';

function printUsageAndExit(code = 1, msg = '') {
  if (msg) console.error(`Error: ${msg}`);
  console.error('Usage: node src/cli/headless.js --seed <int> --night <1|2|3> [--scenario <file.json>] [--inputs <file.json>] --ticks <int> --out <file.jsonl> [--snapshot-every <int>]');
  process.exit(code);
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  seed: 12345,
  night: 1,
  scenarioPath: null,
  inputsPath: null,
  ticks: null,
  outPath: null,
  snapshotEvery: 10
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--seed') {
    options.seed = parseInt(args[++i], 10);
  } else if (arg === '--night') {
    options.night = parseInt(args[++i], 10);
  } else if (arg === '--scenario') {
    options.scenarioPath = args[++i];
  } else if (arg === '--inputs') {
    options.inputsPath = args[++i];
  } else if (arg === '--ticks') {
    options.ticks = parseInt(args[++i], 10);
  } else if (arg === '--out') {
    options.outPath = args[++i];
  } else if (arg === '--snapshot-every') {
    options.snapshotEvery = parseInt(args[++i], 10);
  }
}

if (options.ticks === null || isNaN(options.ticks) || options.ticks < 0) {
  printUsageAndExit(1, 'Missing or invalid --ticks');
}
if (!options.outPath) {
  printUsageAndExit(1, 'Missing --out parameter');
}
if (![1, 2, 3].includes(options.night)) {
  options.night = 1;
}

// 1. Read Scenario if provided
let scenario = null;
if (options.scenarioPath) {
  try {
    const raw = fs.readFileSync(options.scenarioPath, 'utf8');
    scenario = JSON.parse(raw);
  } catch (err) {
    console.error(`Invalid scenario file: ${err.message}`);
    process.exit(2);
  }
}

// 2. Read Inputs if provided
let inputFrames = [];
if (options.inputsPath) {
  try {
    const raw = fs.readFileSync(options.inputsPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.frames)) {
      throw new Error('inputs file must have a "frames" array');
    }
    inputFrames = parsed.frames;
    // Verify strictly increasing ticks
    for (let i = 1; i < inputFrames.length; i++) {
      if (inputFrames[i].tick <= inputFrames[i - 1].tick) {
        throw new Error('ticks in inputs file must strictly increase');
      }
    }
  } catch (err) {
    console.error(`Invalid inputs file: ${err.message}`);
    process.exit(2);
  }
}

// Setup input lookup map by tick
const inputMap = new Map();
for (const f of inputFrames) {
  inputMap.set(f.tick, f);
}

// Initialize simulation
const sim = new Simulation({
  seed: options.seed,
  night: options.night,
  scenario
});

const outLines = [];

// Snapshot tick 0
outLines.push(JSON.stringify(sim.getSnapshot(0)));

// Initial night_start event
outLines.push(JSON.stringify({
  type: 'event',
  tick: 0,
  name: 'night_start',
  data: { night: options.night }
}));

// Current input state (persistent across ticks until modified)
let currentInputState = {
  move: [0, 0],
  cam_yaw_deg: 0,
  jump: false,
  dash: false,
  interact: false,
  pulse: false,
  pause: false
};

const totalTicks = options.ticks;
let actualTicksRun = 0;

for (let k = 0; k < totalTicks; k++) {
  // Check if new input frame arrives at tick k
  if (inputMap.has(k)) {
    const frame = inputMap.get(k);
    if (frame.move !== undefined) currentInputState.move = [...frame.move];
    if (frame.cam_yaw_deg !== undefined) currentInputState.cam_yaw_deg = frame.cam_yaw_deg;
    if (frame.jump !== undefined) currentInputState.jump = !!frame.jump;
    if (frame.dash !== undefined) currentInputState.dash = !!frame.dash;
    if (frame.interact !== undefined) currentInputState.interact = !!frame.interact;
    if (frame.pulse !== undefined) currentInputState.pulse = !!frame.pulse;
    if (frame.pause !== undefined) currentInputState.pause = !!frame.pause;
  }

  // Step simulation forward (tick k -> tick k + 1)
  const events = sim.step(currentInputState);
  actualTicksRun++;

  // Record events immediately
  for (const ev of events) {
    outLines.push(JSON.stringify(ev));
  }

  // Record snapshot every snapshotEvery ticks
  if (actualTicksRun % options.snapshotEvery === 0) {
    outLines.push(JSON.stringify(sim.getSnapshot(actualTicksRun)));
  }

  // Stop if game ended (won or lost)
  if (sim.state === 'won' || (sim.state === 'lost' && sim.player.flames <= 0)) {
    break;
  }
}

// End line (required)
const endLine = {
  type: 'end',
  ticks: actualTicksRun,
  state: sim.state,
  score: sim.score
};
outLines.push(JSON.stringify(endLine));

// Ensure output directory exists and write output file
try {
  const outDir = path.dirname(options.outPath);
  if (outDir && !fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(options.outPath, outLines.join('\n') + '\n', 'utf8');
} catch (err) {
  console.error(`Failed to write output file: ${err.message}`);
  process.exit(1);
}

process.exit(0);
