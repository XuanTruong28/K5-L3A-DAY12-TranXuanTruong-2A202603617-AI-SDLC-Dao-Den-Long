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

test('Mote collection and carry capacity (Phase 3: score moved from pickup to deposit/refuel)', () => {
  const scenario = {
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    random_shades: false,
    motes: [
      [0, 0, 0.5], // within pickup_radius 1.0
      [0, 0, 0.8],
      [0, 0, 1.0],
      [0, 0, 10.0] // far away
    ]
  };

  const sim = new Simulation({ scenario });
  // Step 1 tick without moving
  const events = sim.step({});

  assert.equal(sim.player.carried, 3);
  // Ticket-03: Thưởng nhặt đom đóm cũ (+10/mote) đã bị THAY THẾ bằng +5/mote khi nạp vào đèn
  assert.equal(sim.score, 0);
  assert.equal(events.length, 3);
  assert.equal(events[0].name, 'mote_picked');
});

test('Lantern deposit and dawn win condition (Phase 3: no early win on all lit; win at dawn)', () => {
  const scenario = {
    player: { pos: [0, 0, 24.0], carried: 10, flames: 3 }, // near L1 at [0, 0, 25]
    random_motes: false,
    random_shades: false,
    lanterns: [
      { id: "L1", pos: [0, 0, 25.0], lit: false, deposited: 0 },
      { id: "L2", pos: [20, 0, 0], lit: true, deposited: 10, fuel: 100 },
      { id: "L3", pos: [15, 0, -20], lit: true, deposited: 10, fuel: 100 },
      { id: "L4", pos: [-15, 0, -20], lit: true, deposited: 10, fuel: 100 },
      { id: "L5", pos: [-20, 0, 0], lit: true, deposited: 10, fuel: 100 }
    ],
    time_left_s: 200
  };

  const sim = new Simulation({ scenario });
  // Press interact to light L1
  const events = sim.step({ interact: true });

  const depositEv = events.find(e => e.name === 'deposit');
  assert.ok(depositEv);
  assert.equal(depositEv.data.lantern_id, 'L1');
  assert.equal(depositEv.data.amount, 10);

  const litEv = events.find(e => e.name === 'lantern_lit');
  assert.ok(litEv);
  assert.equal(litEv.data.relight, false);

  // Ticket-03: Không còn thắng sớm khi thắp hết đèn! Game tiếp tục đến bình minh.
  assert.equal(sim.state, 'playing');

  // Cho thời gian trôi đến bình minh (time_left_s = 0)
  sim.time_left_s = 1.0 / 60.0;
  const dawnEvents = sim.step({});
  const winEv = dawnEvents.find(e => e.name === 'game_over');
  assert.ok(winEv);
  assert.equal(winEv.data.result, 'won');
  assert.equal(winEv.data.reason, 'dawn_survived');
  assert.equal(sim.state, 'won');
});

test('Pulse stuns and pushes shades (standard tuning cost 3, push 4m, stun 120 ticks)', () => {
  const scenario = {
    player: { pos: [0, 0, 0], carried: 3, flames: 3 },
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
  assert.equal(shade.stun_ticks, 120);
  assert.equal(sim.player.carried, 0); // consumed 3 motes

  // Push happens over 15 ticks
  for (let k = 0; k < 15; k++) {
    sim.step({});
  }
  assert.ok(shade.pos[0] >= 6.9); // pushed 4m from 3.0m
});

test('Shade attacks player and lose condition on 0 flames', () => {
  const scenario = {
    player: { pos: [0, 0, 0], carried: 4, flames: 1 },
    random_motes: false,
    random_shades: false,
    shades: [
      { id: "S1", pos: [0.5, 0, 0], state: "chase" }
    ]
  };

  const sim = new Simulation({ scenario });
  const events = sim.step({});

  const hitEv = events.find(e => e.name === 'player_hit');
  assert.ok(hitEv);
  assert.equal(hitEv.data.flames, 0);
  assert.equal(hitEv.data.dropped, 2); // floor(4 / 2) = 2

  const gameOverEv = events.find(e => e.name === 'game_over');
  assert.ok(gameOverEv);
  assert.equal(gameOverEv.data.result, 'lost');
  assert.equal(gameOverEv.data.reason, 'no_flames');
  assert.equal(sim.state, 'lost');
});

test('Unlit lanterns do not repel shades, lit lanterns repel shades within safe_radius', () => {
  // Test 1: Unlit lantern at (0,0,25) does NOT repel shade at (0,0,24)
  const scenarioUnlit = {
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    random_shades: false,
    lanterns: [{ id: "L1", pos: [0, 0, 25.0], lit: false, deposited: 0 }],
    shades: [{ id: "S1", pos: [0, 0, 24.0], state: "chase" }]
  };
  const sim1 = new Simulation({ scenario: scenarioUnlit });
  sim1.step({});
  const shadeUnlit = sim1.shades.find(s => s.id === 'S1');
  assert.ok(shadeUnlit.pos[2] < 24.5, 'Shade should not be repelled by unlit lantern');

  // Test 2: Lit lantern at (0,0,25) repels shade at (0,0,24) to edge 6m
  const scenarioLit = {
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    random_shades: false,
    lanterns: [{ id: "L1", pos: [0, 0, 25.0], lit: true, deposited: 10 }],
    shades: [{ id: "S1", pos: [0, 0, 24.0], state: "chase" }]
  };
  const sim2 = new Simulation({ scenario: scenarioLit });
  sim2.step({});
  const shadeLit = sim2.shades.find(s => s.id === 'S1');
  const distLit = Math.sqrt((shadeLit.pos[0] - 0)**2 + (shadeLit.pos[2] - 25)**2);
  assert.ok(distLit >= 5.99, `Lit lantern must repel shade to safe_radius 6.0m (got ${distLit})`);
});

test('Dash mechanic moves at 14 m/s for 12 ticks and sets 90 ticks cooldown', () => {
  const scenario = {
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    random_shades: false
  };

  const sim = new Simulation({ scenario });
  // Face +Z, press dash
  const events = sim.step({ dash: true });
  const dashEv = events.find(e => e.name === 'dash');
  assert.ok(dashEv, 'Dash event should be emitted');
  assert.equal(sim.player.dash_ticks, 12); // Activated in step 3, full 12 ticks
  assert.equal(sim.player.dash_cd_ticks, 90); // 90 ticks cooldown

  // Step 12 ticks of dash
  for (let i = 0; i < 12; i++) {
    sim.step({ dash: false });
  }

  // Total displacement should be 14 m/s * 0.2s = 2.8m in +Z
  assert.ok(Math.abs(sim.player.pos[2] - 2.8) < 0.05, `Expected pos[2] ~2.8m, got ${sim.player.pos[2]}`);
});

test('Pause and Resume toggles state and freezes timers', () => {
  const sim = new Simulation({ night: 1 });
  const timeInitial = sim.time_left_s;

  // Press pause
  const evsPause = sim.step({ pause: true });
  assert.equal(sim.state, 'paused');
  assert.ok(evsPause.find(e => e.name === 'paused'));

  // Step while paused: time_left_s and sim_tick must not change
  sim.step({ pause: false, move: [0, 1] });
  assert.equal(sim.time_left_s, timeInitial);
  assert.equal(sim.sim_tick, 0);
  assert.equal(sim.player.pos[2], 0); // did not move while paused

  // Press pause again to resume
  const evsResume = sim.step({ pause: true });
  assert.equal(sim.state, 'playing');
  assert.ok(evsResume.find(e => e.name === 'resumed'));
});

test('Night 2: Bamboo bridge traversal and jump pad launch', () => {
  const sim = new Simulation({ night: 2 });
  // Move player across bridge (x in [26, 44], z in [-2, 2])
  sim.player.pos = [35.0, 0.0, 0.0];
  sim.player.grounded = true;
  sim.step({});
  assert.equal(sim.player.grounded, true, 'Player should be grounded on bridge');

  // Trigger jump pad at (20, 0, 18)
  sim.player.pos = [20.0, 0.0, 18.0];
  sim.step({});
  assert.equal(sim.player.in_launch, true, 'Jump pad should launch player');
  assert.ok(sim.player.vel[1] > 13.0, 'Launch Vy should be around 14 m/s initially');
});

test('Drifter AI: chases player with >= 5 motes, steals motes, and drops on pulse', () => {
  const scenario = {
    night: 2,
    player: { pos: [0, 0, 0], carried: 6, flames: 3 },
    random_motes: false,
    random_shades: false,
    drifters: [
      { id: "D1", pos: [1.0, 0, 0], state: "chase" }
    ]
  };

  const sim = new Simulation({ night: 2, scenario });
  // Step 1: drifter touches player and steals min(3, carried) = 3
  const evs = sim.step({});
  const stealEv = evs.find(e => e.name === 'drifter_steal');
  assert.ok(stealEv);
  assert.equal(stealEv.data.amount, 3);
  assert.equal(sim.player.carried, 3);

  const d1 = sim.drifters.find(d => d.id === 'D1');
  assert.equal(d1.state, 'flee');
  assert.equal(d1.stolen, 3);

  // Give player 3 motes for pulse
  sim.player.carried = 3;
  d1.pos = [2.0, 0, 0]; // within pulse 5m
  const pulseEvs = sim.step({ pulse: true });

  const dropEv = pulseEvs.find(e => e.name === 'drifter_drop');
  assert.ok(dropEv, 'Drifter should drop stolen motes when hit by pulse');
  assert.equal(dropEv.data.amount, 3);
});

test('Charm (Bùa Gió) grants speed boost 7.2 m/s and infinite dash', () => {
  const scenario = {
    night: 2,
    player: { pos: [0, 0, 0], carried: 0, flames: 3 },
    random_motes: false,
    random_shades: false,
    charms: [
      { id: "C1", pos: [0.5, 0, 0], available: true }
    ]
  };

  const sim = new Simulation({ night: 2, scenario });
  const evs = sim.step({});
  const charmEv = evs.find(e => e.name === 'charm_picked');
  assert.ok(charmEv);
  assert.equal(sim.player.charm_ticks, 600);

  // Dash while charm is active: dash_cd_ticks should be 0!
  sim.step({ dash: true });
  assert.equal(sim.player.dash_cd_ticks, 0, 'Dash should have 0 cooldown with charm active');
});

test('Fall off island (Y < -10) causes flame loss and 60 ticks respawn wait', () => {
  const scenario = {
    night: 1,
    player: { pos: [50.0, -11.0, 0], carried: 5, flames: 2 }, // outside island radius 40m
    random_motes: false,
    random_shades: false
  };

  const sim = new Simulation({ scenario });
  const evs = sim.step({});

  const fallEv = evs.find(e => e.name === 'fall');
  assert.ok(fallEv, 'Fall event must be emitted');
  assert.equal(sim.player.flames, 1);
  assert.equal(sim.player.carried, 0); // loses all carried motes
  assert.equal(sim.player.respawn_wait_ticks, 60);
});
