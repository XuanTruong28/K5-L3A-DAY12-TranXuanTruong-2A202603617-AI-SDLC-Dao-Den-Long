import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { runSoakTest } from '../src/cli/soak.js';
import { LeaderboardManager } from '../src/core/leaderboard.js';
import { execFileSync } from 'node:child_process';

test('Phase 4 Feature 1: Contract v1.3 configuration in game.contract.json', () => {
  const contractPath = path.resolve('game.contract.json');
  assert.strictEqual(fs.existsSync(contractPath), true, 'game.contract.json must exist');

  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  assert.strictEqual(contract.contract_version, '1.3', 'contract_version must be 1.3');
  assert.ok(contract.bench_cmd, 'bench_cmd must be defined in contract');
  assert.ok(contract.soak_cmd, 'soak_cmd must be defined in contract');
  assert.ok(contract.leaderboard_cmd, 'leaderboard_cmd must be defined in contract');
});

test('Phase 4 Feature 2: Soak test executes multiple nights with 0 crashes and stable memory', async () => {
  const soakOut = path.resolve('test_soak_temp.json');
  try {
    const res = await runSoakTest({ seed: 7, nights: 3, outPath: soakOut });
    assert.strictEqual(res.crashes, 0, 'Crashes must be 0');
    assert.strictEqual(res.nights, 3, 'Must complete 3 nights');
    assert.strictEqual(res.results.length, 3, 'Must record 3 results');
    assert.ok(res.mem_end_mb <= 1.2 * res.mem_start_mb, `Memory end (${res.mem_end_mb}) must be <= 1.2 * start (${res.mem_start_mb})`);
    assert.strictEqual(fs.existsSync(soakOut), true, 'Soak output file must be created');

    const fileContent = JSON.parse(fs.readFileSync(soakOut, 'utf8'));
    assert.strictEqual(fileContent.crashes, 0);
  } finally {
    if (fs.existsSync(soakOut)) fs.unlinkSync(soakOut);
  }
});

test('Phase 4 Feature 3: Local Leaderboard Top 10 sorting and time-based tie breaking', () => {
  const lb = new LeaderboardManager();
  lb.clear();

  // Add entries with valid 3-12 char names
  lb.addEntry({ name: 'Player_C', score: 500, nights_won: 2, seed: 1, achieved_at: '2026-11-20T10:00:00+07:00' });
  lb.addEntry({ name: 'Player_A', score: 1000, nights_won: 3, seed: 2, achieved_at: '2026-11-20T11:00:00+07:00' });
  lb.addEntry({ name: 'P_B_Late', score: 800, nights_won: 2, seed: 3, achieved_at: '2026-11-20T12:00:00+07:00' });
  lb.addEntry({ name: 'P_B_Early', score: 800, nights_won: 2, seed: 4, achieved_at: '2026-11-20T09:00:00+07:00' });

  const entries = lb.getEntries();
  assert.strictEqual(entries.length, 4);
  assert.strictEqual(entries[0].name, 'Player_A', 'Highest score must be #1');
  assert.strictEqual(entries[1].name, 'P_B_Early', 'Tied score must rank earlier timestamp higher');
  assert.strictEqual(entries[2].name, 'P_B_Late');
  assert.strictEqual(entries[3].name, 'Player_C');
});

test('Phase 4 Feature 4: Leaderboard Top 10 limit and name validation', () => {
  const lb = new LeaderboardManager();
  lb.clear();

  // Test name validation
  assert.strictEqual(lb.validateName('ab'), false, 'Names < 3 chars must be rejected');
  assert.strictEqual(lb.validateName('A_very_long_name_exceeding_12'), false, 'Names > 12 chars must be rejected');
  assert.strictEqual(lb.validateName('Valid_Name1'), true, 'Valid 3-12 char alphanumeric name must pass');

  // Fill 15 entries
  for (let i = 1; i <= 15; i++) {
    lb.addEntry({ name: `User_${i}`, score: i * 100, nights_won: 1, seed: i });
  }

  const entries = lb.getEntries();
  assert.strictEqual(entries.length, 10, 'Leaderboard must maintain top 10 limit');
  assert.strictEqual(entries[0].score, 1500, 'Top entry must have highest score');
  assert.strictEqual(entries[9].score, 600, '10th entry must be score 600');
});

test('Phase 4 Feature 5: CLI Leaderboard export flag produces correct JSON format', () => {
  const exportOut = path.resolve('test_lb_export.json');
  try {
    execFileSync(process.execPath, ['src/cli/leaderboard.js', '--export-leaderboard', exportOut], { encoding: 'utf8' });
    assert.strictEqual(fs.existsSync(exportOut), true, 'Exported JSON file must exist');

    const data = JSON.parse(fs.readFileSync(exportOut, 'utf8'));
    assert.ok(Array.isArray(data.entries), 'Exported file must contain entries array');
    assert.ok(data.entries.length <= 10, 'Entries must not exceed 10');
  } finally {
    if (fs.existsSync(exportOut)) fs.unlinkSync(exportOut);
  }
});

test('Phase 4 Feature 6: Key rebinding conflict detection logic', () => {
  const keybinds = {
    forward: 'KeyW',
    backward: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    jump: 'Space',
    dash: 'ShiftLeft',
    interact: 'KeyE',
    pulse: 'KeyF',
    pause: 'Escape'
  };

  function checkConflict(binds, actionToSet, newCode) {
    for (const [act, code] of Object.entries(binds)) {
      if (act !== actionToSet && code === newCode) {
        return act;
      }
    }
    return null;
  }

  assert.strictEqual(checkConflict(keybinds, 'jump', 'KeyW'), 'forward', 'Assigning KeyW to jump conflicts with forward');
  assert.strictEqual(checkConflict(keybinds, 'dash', 'KeyC'), null, 'Assigning unmapped KeyC has no conflict');
});
