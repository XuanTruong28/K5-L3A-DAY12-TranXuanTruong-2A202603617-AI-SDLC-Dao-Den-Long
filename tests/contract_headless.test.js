import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const HEADLESS_PATH = path.resolve('src/cli/headless.js');
const TMP_DIR = path.resolve('tests/tmp');

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

test('Headless CLI executes scenario and produces valid JSONL', () => {
  const scenarioPath = path.join(TMP_DIR, 'scenario_sample.json');
  const outPath = path.join(TMP_DIR, 'output_sample.jsonl');

  const scenario = {
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    random_shades: false,
    motes: [[0, 0, 5]],
    shades: [{ pos: [10, 0, 0] }],
    lanterns: [{ id: "L1", pos: [0, 0, 25], deposited: 0 }],
    time_left_s: 300
  };
  fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2), 'utf8');

  execFileSync(process.execPath, [
    HEADLESS_PATH,
    '--seed', '42',
    '--night', '1',
    '--scenario', scenarioPath,
    '--ticks', '60',
    '--out', outPath,
    '--snapshot-every', '10'
  ], { encoding: 'utf8' });

  assert.ok(fs.existsSync(outPath));
  const lines = fs.readFileSync(outPath, 'utf8').trim().split('\n').map(l => JSON.parse(l));

  // First line must be snapshot at tick 0
  assert.equal(lines[0].type, 'snapshot');
  assert.equal(lines[0].tick, 0);
  assert.equal(lines[0].sim_tick, 0);

  // Last line must be 'end'
  const lastLine = lines[lines.length - 1];
  assert.equal(lastLine.type, 'end');
  assert.equal(lastLine.ticks, 60);
  assert.equal(lastLine.state, 'playing');
});

test('Determinism Test: Same seed and inputs produce identical output JSONL', () => {
  const out1 = path.join(TMP_DIR, 'det_out_1.jsonl');
  const out2 = path.join(TMP_DIR, 'det_out_2.jsonl');

  const inputsPath = path.join(TMP_DIR, 'inputs_sample.json');
  const inputs = {
    frames: [
      { tick: 0, move: [0, 1], cam_yaw_deg: 0 },
      { tick: 20, move: [1, 0], cam_yaw_deg: 45 },
      { tick: 50, pulse: true },
      { tick: 51, pulse: false }
    ]
  };
  fs.writeFileSync(inputsPath, JSON.stringify(inputs, null, 2), 'utf8');

  // Run 1
  execFileSync(process.execPath, [
    HEADLESS_PATH,
    '--seed', '9999',
    '--night', '1',
    '--inputs', inputsPath,
    '--ticks', '100',
    '--out', out1
  ]);

  // Run 2
  execFileSync(process.execPath, [
    HEADLESS_PATH,
    '--seed', '9999',
    '--night', '1',
    '--inputs', inputsPath,
    '--ticks', '100',
    '--out', out2
  ]);

  const content1 = fs.readFileSync(out1, 'utf8');
  const content2 = fs.readFileSync(out2, 'utf8');

  assert.equal(content1, content2, 'Deterministic check failed: outputs differ across identical runs!');
});

test('Error handling: Invalid inputs file returns exit code 2', () => {
  const badInputsPath = path.join(TMP_DIR, 'bad_inputs.json');
  // Non-strictly increasing ticks
  const badInputs = {
    frames: [
      { tick: 10, move: [0, 1] },
      { tick: 5, move: [1, 0] }
    ]
  };
  fs.writeFileSync(badInputsPath, JSON.stringify(badInputs), 'utf8');

  const outPath = path.join(TMP_DIR, 'bad_out.jsonl');

  assert.throws(() => {
    execFileSync(process.execPath, [
      HEADLESS_PATH,
      '--seed', '1',
      '--night', '1',
      '--inputs', badInputsPath,
      '--ticks', '30',
      '--out', outPath
    ]);
  }, (err) => {
    return err.status === 2;
  });
});
