import test from 'node:test';
import assert from 'node:assert/strict';
import { Simulation } from '../src/core/simulation.js';
import { transformMove } from '../src/core/math.js';

test('transformMove calculates correct direction on XZ plane', () => {
  // When cam_yaw_deg = 0: move [0, 1] means forward (+Z)
  const [dx0, dz0] = transformMove([0, 1], 0);
  assert.equal(Math.round(dx0), 0);
  assert.equal(Math.round(dz0), 1);

  // When cam_yaw_deg = 90: move [0, 1] rotates to (+X)
  const [dx90, dz90] = transformMove([0, 1], 90);
  assert.equal(Math.round(dx90), 1);
  assert.equal(Math.round(dz90), 0);
});

test('Mote collection and carry capacity', () => {
  const scenario = {
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    random_shades: false,
    motes: [
      [0, 0, 1.0], // within pickup_radius 1.5
      [0, 0, 1.2],
      [0, 0, 1.4],
      [0, 0, 10.0] // far away
    ]
  };

  const sim = new Simulation({ scenario });
  // Step 1 tick without moving
  const events = sim.step({});

  assert.equal(sim.player.carried, 3);
  assert.equal(sim.score, 30); // 3 * 10
  assert.equal(events.length, 3);
  assert.equal(events[0].name, 'mote_picked');
});

test('Lantern deposit and win condition', () => {
  const scenario = {
    player: { pos: [0, 0, 24.0], carried: 5, flames: 3 }, // near L1 at [0, 0, 25]
    random_motes: false,
    random_shades: false,
    lanterns: [
      { id: "L1", pos: [0, 0, 25.0], lit: false, deposited: 0 },
      { id: "L2", pos: [20, 0, 0], lit: true, deposited: 3 },
      { id: "L3", pos: [15, 0, -20], lit: true, deposited: 3 },
      { id: "L4", pos: [-15, 0, -20], lit: true, deposited: 3 },
      { id: "L5", pos: [-20, 0, 0], lit: true, deposited: 3 }
    ],
    time_left_s: 200
  };

  const sim = new Simulation({ scenario });
  // Press interact
  const events = sim.step({ interact: true });

  const depositEv = events.find(e => e.name === 'deposit');
  assert.ok(depositEv);
  assert.equal(depositEv.data.lantern_id, 'L1');
  assert.equal(depositEv.data.amount, 3);

  const litEv = events.find(e => e.name === 'lantern_lit');
  assert.ok(litEv);

  const winEv = events.find(e => e.name === 'game_over');
  assert.ok(winEv);
  assert.equal(winEv.data.result, 'won');
  assert.equal(sim.state, 'won');
});

test('Pulse stuns and pushes shades', () => {
  const scenario = {
    player: { pos: [0, 0, 0], carried: 2, flames: 3 },
    random_motes: false,
    random_shades: false,
    shades: [
      { id: "S1", pos: [3.0, 0, 0], state: "chase" }
    ]
  };

  const sim = new Simulation({ scenario });
  const events = sim.step({ pulse: true });

  const pulseEv = events.find(e => e.name === 'pulse');
  assert.ok(pulseEv);
  assert.deepEqual(pulseEv.data.stunned_ids, ['S1']);

  const shade = sim.shades.find(s => s.id === 'S1');
  assert.equal(shade.state, 'stunned');
  assert.ok(shade.pos[0] > 5.9); // pushed by 3m from 3.0m
  assert.equal(sim.player.carried, 1); // cost 1 mote
});

test('Shade attacks player and lose condition on 0 flames', () => {
  const scenario = {
    player: { pos: [0, 0, 0], carried: 4, flames: 1 },
    random_motes: false,
    random_shades: false,
    shades: [
      { id: "S1", pos: [0.5, 0, 0], state: "chase" } // within shade_hit_radius 1.2
    ]
  };

  const sim = new Simulation({ scenario });
  const events = sim.step({});

  const hitEv = events.find(e => e.name === 'player_hit');
  assert.ok(hitEv);
  assert.equal(hitEv.data.flames, 0);
  assert.equal(hitEv.data.dropped, 2); // 50% of 4 is 2

  const gameOverEv = events.find(e => e.name === 'game_over');
  assert.ok(gameOverEv);
  assert.equal(gameOverEv.data.result, 'lost');
  assert.equal(gameOverEv.data.reason, 'no_flames');
  assert.equal(sim.state, 'lost');
});

test('Unlit lanterns do not repel shades, lit lanterns repel shades within safe_radius', () => {
  const scenario = {
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    random_shades: false,
    lanterns: [
      { id: "L1", pos: [10, 0, 0], lit: false, deposited: 0 },
      { id: "L2", pos: [0, 0, 25], lit: true, deposited: 3 }
    ],
    shades: [
      { id: "S1", pos: [11, 0, 0], state: "chase" }, // within safe_radius (4m) of unlit L1
      { id: "S2", pos: [0, 0, 26], state: "chase" }  // within safe_radius (4m) of lit L2
    ]
  };

  const sim = new Simulation({ scenario });
  sim.step({});

  const s1 = sim.shades.find(s => s.id === 'S1');
  const s2 = sim.shades.find(s => s.id === 'S2');

  // S1 was near unlit L1: should NOT be pushed out to 4m, it can stay near L1 and continue chasing towards player
  assert.ok(Math.abs(s1.pos[0] - 10) < 4.0);

  // S2 was near lit L2: MUST be repelled out to safe_radius (4m away from [0, 0, 25])
  const distL2 = Math.hypot(s2.pos[0] - 0, s2.pos[2] - 25);
  assert.ok(distL2 >= 3.99);
});
