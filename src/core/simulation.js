import { DEFAULT_TUNING, DEFAULT_LANTERNS, ISLAND_RADIUS } from './constants.js';
import { PRNG } from './prng.js';
import { round3, formatPos, distXZ, distSqXZ, transformMove } from './math.js';

export class Simulation {
  constructor(options = {}) {
    this.tuning = { ...DEFAULT_TUNING, ...(options.tuning || {}) };
    this.tuning.score = { ...DEFAULT_TUNING.score, ...(options.tuning?.score || {}) };
    this.seed = options.seed ?? 12345;
    this.prng = new PRNG(this.seed);

    this.sim_tick = 0;
    this.state = 'playing'; // 'playing' | 'won' | 'lost'
    this.score = 0;
    this.time_left_s = this.tuning.night1_duration_s;
    this.game_over_reason = null;

    // Player state
    this.player = {
      pos: [0.0, 0.0, 0.0],
      flames: this.tuning.flames,
      carried: 0,
      invuln_ticks: 0,
      pulse_cooldown_ticks: 0
    };

    // Lanterns map (L1..L5)
    this.lanterns = DEFAULT_LANTERNS.map(l => ({ ...l, pos: [...l.pos] }));

    // Entities
    this.motes = [];
    this.shades = [];

    // Internal state tracking
    this.prevButtons = {
      interact: false,
      pulse: false,
      jump: false,
      dash: false
    };

    this.events = [];
    this.snapshots = [];

    // Apply scenario if provided
    if (options.scenario) {
      this.applyScenario(options.scenario);
    } else {
      this.spawnInitialMotes(25);
      this.spawnInitialShades(3);
    }
  }

  applyScenario(scenario) {
    if (scenario.time_left_s !== undefined) {
      this.time_left_s = scenario.time_left_s;
    }

    if (scenario.player) {
      if (scenario.player.pos) this.player.pos = [...scenario.player.pos];
      if (scenario.player.carried !== undefined) this.player.carried = scenario.player.carried;
      if (scenario.player.flames !== undefined) this.player.flames = scenario.player.flames;
    }

    if (scenario.lanterns) {
      for (const sl of scenario.lanterns) {
        const target = this.lanterns.find(l => l.id === sl.id);
        if (target) {
          if (sl.pos) target.pos = [...sl.pos];
          if (sl.lit !== undefined) target.lit = sl.lit;
          if (sl.deposited !== undefined) target.deposited = sl.deposited;
        } else {
          this.lanterns.push({
            id: sl.id,
            pos: sl.pos ? [...sl.pos] : [0, 0, 0],
            lit: sl.lit || false,
            deposited: sl.deposited || 0
          });
        }
      }
    }

    // Motes
    if (scenario.motes) {
      this.motes = scenario.motes.map((m, idx) => {
        const pos = Array.isArray(m) ? m : m.pos;
        const id = m.id || `M${idx + 1}`;
        return { id, pos: [...pos], active: true };
      });
    } else if (scenario.random_motes !== false) {
      this.spawnInitialMotes(25);
    }

    // Shades
    if (scenario.shades) {
      this.shades = scenario.shades.map((s, idx) => ({
        id: s.id || `S${idx + 1}`,
        pos: [...s.pos],
        state: s.state || 'chase',
        stun_ticks: s.stun_ticks || 0
      }));
    } else if (scenario.random_shades !== false) {
      this.spawnInitialShades(3);
    }
  }

  spawnInitialMotes(count = 25) {
    for (let i = 1; i <= count; i++) {
      const angle = this.prng.next() * Math.PI * 2;
      const r = Math.sqrt(this.prng.next()) * (ISLAND_RADIUS - 3);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      this.motes.push({
        id: `M${i}`,
        pos: [x, 0.0, z],
        active: true
      });
    }
  }

  spawnInitialShades(count = 3) {
    for (let i = 1; i <= count; i++) {
      const angle = (i / count) * Math.PI * 2 + this.prng.next() * 0.5;
      const r = 20 + this.prng.next() * 10;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      this.shades.push({
        id: `S${i}`,
        pos: [x, 0.0, z],
        state: 'chase',
        stun_ticks: 0
      });
    }
  }

  // Returns snapshot object at the given tick
  getSnapshot(tick) {
    const activeMotes = this.motes.filter(m => m.active);
    return {
      type: 'snapshot',
      tick,
      sim_tick: this.sim_tick,
      state: this.state,
      time_left_s: round3(this.time_left_s),
      score: this.score,
      player: {
        pos: formatPos(this.player.pos),
        flames: this.player.flames,
        carried: this.player.carried
      },
      lanterns: this.lanterns.map(l => ({
        id: l.id,
        pos: formatPos(l.pos),
        lit: l.lit,
        deposited: l.deposited
      })),
      shades: this.shades.map(s => ({
        id: s.id,
        pos: formatPos(s.pos),
        state: s.state
      })),
      motes_active: activeMotes.length
    };
  }

  // Execute 1 tick with the given input
  step(input = {}) {
    if (this.state !== 'playing') {
      return [];
    }

    const currentTick = this.sim_tick + 1;
    const stepEvents = [];

    const cam_yaw_deg = input.cam_yaw_deg ?? 0;
    const move = input.move || [0, 0];
    const interact = !!input.interact;
    const pulse = !!input.pulse;

    // Detect button rising edges
    const interactPressed = interact && !this.prevButtons.interact;
    const pulsePressed = pulse && !this.prevButtons.pulse;

    this.prevButtons.interact = interact;
    this.prevButtons.pulse = pulse;
    this.prevButtons.jump = !!input.jump;
    this.prevButtons.dash = !!input.dash;

    // 1. Move player
    const [dx, dz] = transformMove(move, cam_yaw_deg);
    const speedPerTick = this.tuning.player_speed / 60.0;
    this.player.pos[0] += dx * speedPerTick;
    this.player.pos[2] += dz * speedPerTick;

    // Island boundary clamp
    const playerDistFromCenter = Math.sqrt(
      this.player.pos[0] * this.player.pos[0] + this.player.pos[2] * this.player.pos[2]
    );
    if (!this.tuning.fall_enabled && playerDistFromCenter > ISLAND_RADIUS) {
      const scale = ISLAND_RADIUS / playerDistFromCenter;
      this.player.pos[0] *= scale;
      this.player.pos[2] *= scale;
    }

    // 2. Cooldowns & timers decrement
    if (this.player.invuln_ticks > 0) {
      this.player.invuln_ticks--;
    }
    if (this.player.pulse_cooldown_ticks > 0) {
      this.player.pulse_cooldown_ticks--;
    }

    // 3. Mote collection
    for (const mote of this.motes) {
      if (mote.active && this.player.carried < this.tuning.carry_capacity) {
        if (distXZ(this.player.pos, mote.pos) <= this.tuning.pickup_radius) {
          mote.active = false;
          this.player.carried++;
          this.score += this.tuning.score.per_mote;
          stepEvents.push({
            type: 'event',
            tick: currentTick,
            name: 'mote_picked',
            data: { carried: this.player.carried }
          });
        }
      }
    }

    // 4. Lantern interaction (deposit)
    if (interactPressed && this.player.carried > 0) {
      for (const lantern of this.lanterns) {
        if (!lantern.lit && distXZ(this.player.pos, lantern.pos) <= this.tuning.interact_radius) {
          const needed = this.tuning.lantern_cost - lantern.deposited;
          const depositAmount = Math.min(this.player.carried, needed);
          if (depositAmount > 0) {
            this.player.carried -= depositAmount;
            lantern.deposited += depositAmount;
            stepEvents.push({
              type: 'event',
              tick: currentTick,
              name: 'deposit',
              data: {
                lantern_id: lantern.id,
                amount: depositAmount,
                deposited: lantern.deposited
              }
            });

            if (lantern.deposited >= this.tuning.lantern_cost) {
              lantern.lit = true;
              this.score += this.tuning.score.per_lantern;
              stepEvents.push({
                type: 'event',
                tick: currentTick,
                name: 'lantern_lit',
                data: { lantern_id: lantern.id }
              });

              // Check Win Condition
              const allLit = this.lanterns.every(l => l.lit);
              if (allLit) {
                this.state = 'won';
                this.game_over_reason = 'all_lit';
                // Add remaining time and flames to score
                const remainingSecs = Math.max(0, Math.floor(this.time_left_s));
                this.score +=
                  remainingSecs * this.tuning.score.per_second_left +
                  this.player.flames * this.tuning.score.per_flame_left;

                stepEvents.push({
                  type: 'event',
                  tick: currentTick,
                  name: 'game_over',
                  data: { result: 'won', reason: 'all_lit' }
                });
                break;
              }
            }
          }
        }
      }
    }

    // 5. Pulse Skill
    if (
      pulsePressed &&
      this.player.carried >= this.tuning.pulse_cost &&
      this.player.pulse_cooldown_ticks <= 0 &&
      this.state === 'playing'
    ) {
      this.player.carried -= this.tuning.pulse_cost;
      this.player.pulse_cooldown_ticks = Math.round(this.tuning.pulse_cooldown_s * 60);

      const stunned_ids = [];
      for (const shade of this.shades) {
        const d = distXZ(this.player.pos, shade.pos);
        if (d <= this.tuning.pulse_radius) {
          shade.state = 'stunned';
          shade.stun_ticks = Math.round(this.tuning.pulse_stun_s * 60);

          // Push shade away from player
          if (d > 0.001) {
            const pushDirX = (shade.pos[0] - this.player.pos[0]) / d;
            const pushDirZ = (shade.pos[2] - this.player.pos[2]) / d;
            shade.pos[0] += pushDirX * this.tuning.pulse_push_m;
            shade.pos[2] += pushDirZ * this.tuning.pulse_push_m;
          } else {
            shade.pos[0] += this.tuning.pulse_push_m;
          }

          stunned_ids.push(shade.id);
          this.score += this.tuning.score.per_stun;
        }
      }

      stepEvents.push({
        type: 'event',
        tick: currentTick,
        name: 'pulse',
        data: { stunned_ids }
      });
    }

    // 6. Shades logic & collisions
    if (this.state === 'playing') {
      const shadeSpeedPerTick = this.tuning.shade_speed / 60.0;

      for (const shade of this.shades) {
        if (shade.state === 'stunned') {
          shade.stun_ticks--;
          if (shade.stun_ticks <= 0) {
            shade.state = 'chase';
          }
        } else if (shade.state === 'chase') {
          // Chase player
          const dPlayer = distXZ(shade.pos, this.player.pos);
          if (dPlayer > 0.001) {
            const dirX = (this.player.pos[0] - shade.pos[0]) / dPlayer;
            const dirZ = (this.player.pos[2] - shade.pos[2]) / dPlayer;
            shade.pos[0] += dirX * shadeSpeedPerTick;
            shade.pos[2] += dirZ * shadeSpeedPerTick;
          }

          // Enforce lantern safe radius
          for (const lantern of this.lanterns) {
            const dLantern = distXZ(shade.pos, lantern.pos);
            if (dLantern < this.tuning.safe_radius) {
              if (dLantern > 0.001) {
                const repulseX = (shade.pos[0] - lantern.pos[0]) / dLantern;
                const repulseZ = (shade.pos[2] - lantern.pos[2]) / dLantern;
                shade.pos[0] = lantern.pos[0] + repulseX * this.tuning.safe_radius;
                shade.pos[2] = lantern.pos[2] + repulseZ * this.tuning.safe_radius;
              } else {
                shade.pos[0] = lantern.pos[0] + this.tuning.safe_radius;
              }
            }
          }

          // Collision check with player
          const dHit = distXZ(shade.pos, this.player.pos);
          if (dHit <= this.tuning.shade_hit_radius && this.player.invuln_ticks <= 0) {
            this.player.flames--;
            this.player.invuln_ticks = Math.round(this.tuning.invuln_s * 60);

            const dropped = Math.floor(this.player.carried * this.tuning.hit_drop_ratio);
            this.player.carried -= dropped;

            stepEvents.push({
              type: 'event',
              tick: currentTick,
              name: 'player_hit',
              data: {
                by: 'shade',
                flames: this.player.flames,
                dropped
              }
            });

            // Check Lose Condition: no_flames
            if (this.player.flames <= 0) {
              this.state = 'lost';
              this.game_over_reason = 'no_flames';
              stepEvents.push({
                type: 'event',
                tick: currentTick,
                name: 'game_over',
                data: { result: 'lost', reason: 'no_flames' }
              });
              break;
            }
          }
        }
      }
    }

    // 7. Timer update
    this.sim_tick = currentTick;
    this.time_left_s = Math.max(0, this.tuning.night1_duration_s - this.sim_tick / 60.0);

    // Check Lose Condition: dawn (time up)
    if (this.time_left_s <= 0 && this.state === 'playing') {
      this.state = 'lost';
      this.game_over_reason = 'dawn';
      stepEvents.push({
        type: 'event',
        tick: currentTick,
        name: 'game_over',
        data: { result: 'lost', reason: 'dawn' }
      });
    }

    for (const ev of stepEvents) {
      this.events.push(ev);
    }

    return stepEvents;
  }
}
