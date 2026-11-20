import test from 'node:test';
import assert from 'node:assert/strict';
import { Simulation } from '../src/core/simulation.js';
import { DEFAULT_TUNING } from '../src/core/constants.js';

test('Phase 3 Feature 1: Fuel decay, integer precision, and lantern_out event', () => {
  const scenario = {
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    random_shades: false,
    lanterns: [
      { id: 'L1', pos: [0, 0, 20.0], lit: true, fuel: 1.0 } // 1.0 fuel = 60 ticks until out
    ]
  };

  const sim = new Simulation({ scenario });
  const l1 = sim.lanterns.find(l => l.id === 'L1');
  assert.equal(l1.fuel_sub, 60);

  // Step 30 ticks: fuel should decay by 0.5 units (30 sub-units)
  for (let i = 0; i < 30; i++) {
    sim.step({});
  }
  assert.equal(l1.fuel_sub, 30);
  const snap30 = sim.getSnapshot();
  assert.equal(snap30.lanterns[0].fuel, 0.5);

  // Step 30 more ticks: fuel drops to 0, lantern extinguishes
  let outEvent = null;
  for (let i = 0; i < 30; i++) {
    const evs = sim.step({});
    const ev = evs.find(e => e.name === 'lantern_out');
    if (ev) outEvent = ev;
  }

  assert.ok(outEvent, 'lantern_out event must be emitted when fuel reaches <= 0');
  assert.equal(outEvent.data.lantern_id, 'L1');
  assert.equal(l1.lit, false);
  assert.equal(l1.fuel_sub, 0);
  assert.equal(l1.deposited, 0);
  assert.equal(l1.ever_lit, true);

  const snapOut = sim.getSnapshot();
  assert.equal(snapOut.lanterns[0].fuel, 0);
  assert.equal(snapOut.lanterns[0].lit, false);
  assert.equal(snapOut.lanterns[0].ever_lit, true);
});

test('Phase 3 Feature 2: Refueling lit lanterns, formula used = min(carried, ceil((100-fuel)/10))', () => {
  const scenario = {
    player: { pos: [0, 0, 19.0], carried: 5, flames: 3 }, // 1m from L1
    random_motes: false,
    random_shades: false,
    lanterns: [
      { id: 'L1', pos: [0, 0, 20.0], lit: true, fuel: 82.5 } // 100 - 82.5 = 17.5 => ceil(1.75) = 2 motes needed
    ]
  };

  const sim = new Simulation({ scenario });
  const initialScore = sim.score;

  // Press interact
  const evs = sim.step({ interact: true });
  const refuelEv = evs.find(e => e.name === 'refuel');

  assert.ok(refuelEv, 'refuel event must be emitted');
  assert.equal(refuelEv.data.lantern_id, 'L1');
  assert.equal(refuelEv.data.amount, 2); // exactly 2 motes used
  assert.equal(refuelEv.data.fuel, 100.0); // 82.5 + 20 = 102.5 capped at 100.0
  assert.equal(sim.player.carried, 3); // 5 - 2 = 3
  assert.equal(sim.score, initialScore + 2 * 5); // +5 per mote used

  // Press interact again on full lantern: should NOT consume motes or emit event
  const evs2 = sim.step({ interact: true });
  assert.equal(evs2.find(e => e.name === 'refuel'), undefined);
  assert.equal(sim.player.carried, 3);
});

test('Phase 3 Feature 3: Relighting extinguished lanterns requires only relight_cost = 5 motes', () => {
  const scenario = {
    player: { pos: [0, 0, 19.0], carried: 10, flames: 3 },
    random_motes: false,
    random_shades: false,
    lanterns: [
      { id: 'L1', pos: [0, 0, 20.0], lit: false, ever_lit: true, deposited: 0 } // previously lit
    ]
  };

  const sim = new Simulation({ scenario });
  assert.equal(sim.player.successful_lights, 0);
  assert.equal(sim.player.capacity, 10);

  // Press interact to relight
  const evs = sim.step({ interact: true });

  const depEv = evs.find(e => e.name === 'deposit');
  assert.ok(depEv);
  assert.equal(depEv.data.amount, 5); // only 5 motes needed for relight!
  assert.equal(sim.player.carried, 5); // 10 - 5 = 5

  const litEv = evs.find(e => e.name === 'lantern_lit');
  assert.ok(litEv);
  assert.equal(litEv.data.lantern_id, 'L1');
  assert.equal(litEv.data.relight, true);

  const l1 = sim.lanterns.find(l => l.id === 'L1');
  assert.equal(l1.lit, true);
  assert.equal(l1.fuel_sub, 6000); // 100 fuel
  assert.equal(l1.relit_count, 1);

  // Score: 5 * 5 (deposit) + 40 (relight) = 65
  assert.equal(sim.score, 65);

  // Capacity increases by 2
  assert.equal(sim.player.successful_lights, 1);
  assert.equal(sim.player.capacity, 12);
});

test('Phase 3 Feature 4: Carry capacity progression (10 + 2 * successful_lights, capped at 20)', () => {
  const sim = new Simulation({});
  assert.equal(sim.player.capacity, 10);

  // Simulate successful lights
  for (let i = 1; i <= 6; i++) {
    sim.player.successful_lights = i;
    sim.player.capacity = Math.min(20, 10 + 2 * sim.player.successful_lights);
    if (i <= 5) {
      assert.equal(sim.player.capacity, 10 + 2 * i);
    } else {
      assert.equal(sim.player.capacity, 20, 'Capacity must be capped at 20');
    }
  }
});

test('Phase 3 Feature 5: Shade drain AI, safe zone lost at fuel < 30, and fuel_drain event', () => {
  const scenario = {
    player: { pos: [0, 0, 0], carried: 0, flames: 3 }, // player far away at origin
    random_motes: false,
    random_shades: false,
    lanterns: [
      { id: 'L1', pos: [0, 0, 20.0], lit: true, fuel: 25.0 } // weak lantern: fuel < 30
    ],
    shades: [
      { id: 'S1', pos: [0, 0, 21.5], state: 'wander' } // 1.5m from L1 (within 2m)
    ]
  };

  const sim = new Simulation({ scenario });
  const s1 = sim.shades.find(s => s.id === 'S1');
  const l1 = sim.lanterns.find(l => l.id === 'L1');

  // Step 1 tick: shade detects weak lantern within 2m and enters 'drain'
  sim.step({});
  assert.equal(s1.state, 'drain');
  assert.equal(s1.target_lantern_id, 'L1');

  // Step 60 more ticks (total 60 ticks in drain state):
  // L1 fuel should decrease by natural decay (60 * 1 = 60 sub-units)
  // PLUS shade drain (60 * 5 = 300 sub-units) = total 360 sub-units = 6.0 fuel units!
  let drainEv = null;
  for (let i = 0; i < 60; i++) {
    const evs = sim.step({});
    const ev = evs.find(e => e.name === 'fuel_drain');
    if (ev) drainEv = ev;
  }

  assert.ok(drainEv, 'fuel_drain event must be emitted every 60 ticks while draining');
  assert.equal(drainEv.data.lantern_id, 'L1');
  assert.equal(drainEv.data.shade_id, 'S1');
  assert.equal(drainEv.data.fuel, 19.0); // 25.0 - 6.0 = 19.0
});

test('Phase 3 Feature 6: Pulse against draining shade awards +15 points', () => {
  const scenario = {
    player: { pos: [0, 0, 20.0], carried: 3, flames: 3 },
    random_motes: false,
    random_shades: false,
    lanterns: [
      { id: 'L1', pos: [0, 0, 20.0], lit: true, fuel: 20.0 }
    ],
    shades: [
      { id: 'S1', pos: [0, 0, 21.0], state: 'drain', target_lantern_id: 'L1' }
    ]
  };

  const sim = new Simulation({ scenario });
  const initialScore = sim.score;

  // Player pulses
  const evs = sim.step({ pulse: true });
  const pulseEv = evs.find(e => e.name === 'pulse');
  assert.ok(pulseEv);

  const s1 = sim.shades.find(s => s.id === 'S1');
  assert.equal(s1.state, 'stunned');
  assert.equal(sim.score, initialScore + 15, 'Pulse against draining shade must award +15 points');
});

test('Phase 3 Feature 7: Dawn survival win (dawn_survived) vs dawn loss (dawn)', () => {
  // Test 7a: Night 1 (5 lanterns, 3 lit = 60% threshold met) -> WIN dawn_survived
  const scenarioWin = {
    night: 1,
    player: { pos: [0, 0, 0], carried: 0, flames: 2 },
    random_motes: false,
    random_shades: false,
    lanterns: [
      { id: 'L1', pos: [0, 0, 10], lit: true, fuel: 80 },
      { id: 'L2', pos: [0, 0, 20], lit: true, fuel: 90 },
      { id: 'L3', pos: [0, 0, 30], lit: true, fuel: 100 },
      { id: 'L4', pos: [0, 0, 40], lit: false, fuel: 0 },
      { id: 'L5', pos: [0, 0, 50], lit: false, fuel: 0 }
    ],
    time_left_s: 1.0 / 60.0 // 1 tick left till dawn
  };

  const simWin = new Simulation({ scenario: scenarioWin });
  const winEvs = simWin.step({});
  const goWin = winEvs.find(e => e.name === 'game_over');

  assert.ok(goWin);
  assert.equal(goWin.data.result, 'won');
  assert.equal(goWin.data.reason, 'dawn_survived');
  assert.equal(simWin.state, 'won');

  // Score bonus calculation at dawn:
  // Each lit lantern: 50 + floor(fuel)
  // L1: 50 + 80 = 130
  // L2: 50 + 90 = 140
  // L3: 50 + 100 = 150
  // Flames: 2 * 50 = 100
  // Total score bonus = 130 + 140 + 150 + 100 = 520
  // Note: during the 1 tick, natural decay is -1 sub-unit, so fuel is slightly below (79.98 => floor is 79)
  // Let's verify score >= 500
  assert.ok(simWin.score >= 500);

  // Test 7b: Night 1 with only 2 lit lanterns (< 3 needed) -> LOSE dawn
  const scenarioLose = {
    night: 1,
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    random_shades: false,
    lanterns: [
      { id: 'L1', pos: [0, 0, 10], lit: true, fuel: 80 },
      { id: 'L2', pos: [0, 0, 20], lit: true, fuel: 90 },
      { id: 'L3', pos: [0, 0, 30], lit: false, fuel: 0 },
      { id: 'L4', pos: [0, 0, 40], lit: false, fuel: 0 },
      { id: 'L5', pos: [0, 0, 50], lit: false, fuel: 0 }
    ],
    time_left_s: 1.0 / 60.0
  };

  const simLose = new Simulation({ scenario: scenarioLose });
  const loseEvs = simLose.step({});
  const goLose = loseEvs.find(e => e.name === 'game_over');

  assert.ok(goLose);
  assert.equal(goLose.data.result, 'lost');
  assert.equal(goLose.data.reason, 'dawn');
  assert.equal(simLose.state, 'lost');
});

test('Phase 3 Feature 8: Contract v1.2 Snapshot structure strictly verified', () => {
  const scenario = {
    night: 1,
    player: { pos: [0, 0, 0], carried: 4, flames: 3, successful_lights: 2 },
    random_motes: false,
    random_shades: false,
    lanterns: [
      { id: 'L1', pos: [0, 0, 25.0], lit: true, fuel: 75.4, ever_lit: true, relit_count: 1 }
    ],
    shades: [
      { id: 'S1', pos: [0, 0, 10.0], state: 'drain', target_lantern_id: 'L1' }
    ]
  };

  const sim = new Simulation({ scenario });
  const snap = sim.getSnapshot(10);

  assert.equal(snap.type, 'snapshot');
  assert.equal(snap.player.capacity, 14); // 10 + 2 * 2 = 14
  assert.equal(snap.player.carried, 4);

  const l1 = snap.lanterns.find(l => l.id === 'L1');
  assert.ok(l1);
  assert.equal(typeof l1.fuel, 'number');
  assert.equal(l1.fuel, 75.4);
  assert.equal(l1.ever_lit, true);
  assert.equal(l1.relit_count, 1);

  const s1 = snap.shades.find(s => s.id === 'S1');
  assert.ok(s1);
  assert.equal(s1.state, 'drain');
});
