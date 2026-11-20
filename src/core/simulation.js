import {
  DEFAULT_TUNING,
  getMapForNight
} from './constants.js';
import { PRNG } from './prng.js';
import { round3, formatPos, distXZ, distSqXZ, dist3D, clamp, transformMove } from './math.js';

export class Simulation {
  constructor(options = {}) {
    this.night = options.night ?? 1;
    this.map = getMapForNight(this.night);

    this.tuning = { ...DEFAULT_TUNING, ...(options.tuning || {}) };
    this.tuning.score = { ...DEFAULT_TUNING.score, ...(options.tuning?.score || {}) };

    this.seed = options.seed ?? 12345;
    this.prng = new PRNG(this.seed);

    this.tick = 0;       // Total ticks (increments even when paused)
    this.sim_tick = 0;   // Simulation ticks (freezes when paused)
    this.state = 'playing'; // 'playing' | 'paused' | 'won' | 'lost'
    this.is_paused = false;
    this.score = 0;
    this.time_left_s = this.map.duration_s;
    this.game_over_reason = null;

    // Wind status
    this.wind = {
      active: false,
      dir_deg: 0.0,
      gust_dir_deg: 0.0
    };

    // Player state
    this.player = {
      pos: [...this.map.start_pos],
      vel: [0.0, 0.0, 0.0],
      grounded: true,
      facing_dir: [0.0, 1.0], // [dx, dz] on XZ plane (+Z)
      flames: this.tuning.flames,
      carried: 0,
      invuln_ticks: 0,
      dash_ticks: 0,
      dash_cd_ticks: 0,
      dash_dir: [0.0, 1.0],
      pulse_cd_ticks: 0,
      charm_ticks: 0,
      in_launch: false,
      launch_vx: 0.0,
      launch_vz: 0.0,
      respawn_wait_ticks: 0
    };

    // Lanterns
    this.lanterns = this.map.lanterns.map(l => ({
      id: l.id,
      pos: [...l.pos],
      lit: l.lit || false,
      deposited: l.deposited || 0
    }));

    // Charms
    this.charms = (this.map.charms || []).map(c => ({
      id: c.id,
      pos: [...c.pos],
      available: c.available ?? true,
      respawn_ticks: c.respawn_ticks ?? 0
    }));

    // Entities
    this.motes = [];
    this.shades = [];
    this.drifters = [];

    this.nextMoteId = 1;
    this.nextShadeId = 1;
    this.nextDrifterId = 1;

    // Previous input buttons tracking
    this.prevButtons = {
      pause: false,
      jump: false,
      dash: false,
      interact: false,
      pulse: false
    };

    // Apply scenario if provided
    this.scenario = options.scenario || null;
    if (this.scenario) {
      this.applyScenario(this.scenario);
    } else {
      this.spawnInitialMotes(options.initial_motes ?? 20);
      if (options.initial_shades) {
        this.spawnInitialShades(options.initial_shades);
      }
    }
  }

  applyScenario(scenario) {
    if (scenario.time_left_s !== undefined) {
      this.time_left_s = scenario.time_left_s;
    }

    if (scenario.player) {
      if (scenario.player.pos) this.player.pos = [...scenario.player.pos];
      if (scenario.player.vel) this.player.vel = [...scenario.player.vel];
      if (scenario.player.grounded !== undefined) this.player.grounded = scenario.player.grounded;
      if (scenario.player.carried !== undefined) this.player.carried = scenario.player.carried;
      if (scenario.player.flames !== undefined) this.player.flames = scenario.player.flames;
      if (scenario.player.invuln_ticks !== undefined) this.player.invuln_ticks = scenario.player.invuln_ticks;
      if (scenario.player.dash_cd_ticks !== undefined) this.player.dash_cd_ticks = scenario.player.dash_cd_ticks;
      if (scenario.player.pulse_cd_ticks !== undefined) this.player.pulse_cd_ticks = scenario.player.pulse_cd_ticks;
      if (scenario.player.charm_ticks !== undefined) this.player.charm_ticks = scenario.player.charm_ticks;
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

    // Charms in scenario
    if (scenario.charms) {
      this.charms = scenario.charms.map(c => ({
        id: c.id,
        pos: c.pos ? [...c.pos] : [0, 0, 0],
        available: c.available ?? true,
        respawn_ticks: c.respawn_ticks ?? 0
      }));
    }

    // Motes
    if (scenario.motes) {
      this.motes = scenario.motes.map((m, idx) => {
        const pos = Array.isArray(m) ? m : m.pos;
        const id = m.id || `M${this.nextMoteId++}`;
        const kind = m.kind || 'random';
        const ttl_ticks = m.ttl_s !== undefined && m.ttl_s !== null ? Math.round(m.ttl_s * 60) : null;
        return {
          id,
          pos: [...pos],
          kind,
          ttl_ticks,
          active: true,
          created_tick: 0
        };
      });
    } else if (scenario.random_motes !== false) {
      this.spawnInitialMotes(20);
    }

    // Shades
    if (scenario.shades) {
      this.shades = scenario.shades.map((s, idx) => {
        const id = s.id || `S${this.nextShadeId++}`;
        const state = s.state || 'chase';
        const stun_ticks = s.state === 'stunned' ? (s.state_ticks_left ?? s.stun_ticks ?? 120) : 0;
        return {
          id,
          pos: [...s.pos],
          state,
          stun_ticks,
          recoil_ticks: 0,
          recoil_dir: [1, 0],
          push_ticks: 0,
          push_dir: [1, 0],
          push_speed: 0,
          lantern_push: null,
          wander_dir: [1, 0]
        };
      });
    }

    // Drifters in scenario
    if (scenario.drifters) {
      this.drifters = scenario.drifters.map(d => ({
        id: d.id || `D${this.nextDrifterId++}`,
        pos: [...d.pos],
        state: d.state || 'idle',
        stolen: d.stolen || 0,
        flee_ticks: d.flee_ticks || 0,
        wander_dir: [0, 1]
      }));
    }
  }

  // Spawn initial motes from map definition
  spawnInitialMotes(count = 20) {
    const spawns = this.map.mote_spawns || [];
    const available = spawns.slice();
    // Deterministic shuffle
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(this.prng.next() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }

    const n = Math.min(count, available.length);
    for (let i = 0; i < n; i++) {
      this.motes.push({
        id: `M${this.nextMoteId++}`,
        pos: [...available[i]],
        kind: 'random',
        ttl_ticks: null,
        active: true,
        created_tick: 0
      });
    }
  }

  // Spawn initial shades
  spawnInitialShades(count = 2) {
    const spawns = this.map.shade_spawns || [];
    const validSpawns = spawns.filter(sp => distXZ(sp, this.player.pos) >= 12.0);
    const pool = validSpawns.length > 0 ? validSpawns : spawns;
    for (let i = 0; i < count; i++) {
      if (pool.length > 0) {
        const pt = pool[i % pool.length];
        this.shades.push({
          id: `S${this.nextShadeId++}`,
          pos: [...pt],
          state: 'chase',
          stun_ticks: 0,
          recoil_ticks: 0,
          recoil_dir: [1, 0],
          push_ticks: 0,
          push_dir: [1, 0],
          push_speed: 0,
          lantern_push: null,
          wander_dir: [1, 0]
        });
      }
    }
  }

  // Calculate terrain height at (x, z)
  getGroundHeight(x, z) {
    if (this.night === 1) {
      const r = Math.sqrt(x * x + z * z);
      return r <= 40.0 ? 0.0 : -999.0;
    }

    if (this.night === 2) {
      const rA = Math.sqrt(x * x + z * z);
      const rB = Math.sqrt((x - 70.0) * (x - 70.0) + z * z);
      if (rA <= 28.0 || rB <= 28.0) return 0.0;
      // Bridge
      if (x >= 26.0 && x <= 44.0 && Math.abs(z) <= 2.0) return 0.0;
      return -999.0;
    }

    if (this.night === 3) {
      const r = Math.sqrt(x * x + z * z);
      if (r > 45.0) return -999.0;

      // Tier 2 (center disk r <= 8 at Y = 6)
      if (r <= 8.0) return 6.0;

      // Ramps at 30 deg and 150 deg (foot at r=30 Y=0, top at r=24 Y=3)
      for (const ramp of this.map.ramps) {
        const rad = (ramp.angle_deg * Math.PI) / 180.0;
        const cosR = Math.cos(rad);
        const sinR = Math.sin(rad);
        const dRad = x * cosR + z * sinR;
        const dLat = Math.abs(-x * sinR + z * cosR);
        if (dLat <= ramp.width / 2.0 && dRad >= ramp.r_top && dRad <= ramp.r_bottom) {
          // Linear height: at r_bottom (30) => 0, at r_top (24) => 3
          const t = (ramp.r_bottom - dRad) / (ramp.r_bottom - ramp.r_top);
          return round3(t * (ramp.y_top - ramp.y_bottom));
        }
      }

      // Tier 1 (ring 12 <= r <= 24 at z > 0, Y = 3)
      if (r >= 12.0 && r <= 24.0 && z > 0) return 3.0;

      // Tier 0 (whole island Y = 0)
      return 0.0;
    }

    return 0.0;
  }

  // Resolve obstacles (bell tower, cliffs)
  resolveObstacles(currentPos, nextX, nextZ) {
    if (this.night === 3) {
      const currentY = currentPos[1];

      // Bell tower cylinder at center of Tier 2 (Y >= 5.5): radius 2.0m, cannot enter
      if (currentY >= 5.5) {
        const rNext = Math.sqrt(nextX * nextX + nextZ * nextZ);
        if (rNext < 2.0) {
          if (rNext > 0.001) {
            nextX = (nextX / rNext) * 2.0;
            nextZ = (nextZ / rNext) * 2.0;
          } else {
            nextX = 2.0;
            nextZ = 0.0;
          }
        }
      }

      // Cliff wall collision when player is at lower elevation
      const rCur = Math.sqrt(currentPos[0] * currentPos[0] + currentPos[2] * currentPos[2]);
      const nextR = Math.sqrt(nextX * nextX + nextZ * nextZ);

      // Check Tier 1 cliff (Y = 3.0): if currentY < 2.5, cannot walk into Tier 1 from outside unless on ramp
      if (currentY < 2.5) {
        const inTier1Cur = rCur >= 12.0 && rCur <= 24.0 && currentPos[2] > 0;
        const inTier1Next = nextR >= 12.0 && nextR <= 24.0 && nextZ > 0;
        if (!inTier1Cur && inTier1Next) {
          let onRamp = false;
          for (const ramp of this.map.ramps) {
            const rad = (ramp.angle_deg * Math.PI) / 180.0;
            const cosR = Math.cos(rad);
            const sinR = Math.sin(rad);
            const dRad = nextX * cosR + nextZ * sinR;
            const dLat = Math.abs(-nextX * sinR + nextZ * cosR);
            if (dLat <= ramp.width / 2.0 && dRad >= ramp.r_top && dRad <= ramp.r_bottom) {
              onRamp = true;
              break;
            }
          }
          if (!onRamp) {
            // Blocked by cliff of Tier 1
            nextX = currentPos[0];
            nextZ = currentPos[2];
          }
        }
      }

      // Check Tier 2 cliff (Y = 6.0): if currentY < 5.5, cannot walk into Tier 2 from outside
      if (currentY < 5.5 && rCur > 8.0 && nextR <= 8.0) {
        nextX = currentPos[0];
        nextZ = currentPos[2];
      }
    }

    return [nextX, nextZ];
  }

  // Update wind system (Night 3)
  updateWind() {
    if (this.night !== 3 || this.scenario?.wind_enabled === false) {
      this.wind.active = false;
      this.wind.dir_deg = 0.0;
      return;
    }

    if (this.scenario?.wind_dir_deg !== undefined) {
      this.wind.active = this.scenario.wind_active ?? true;
      this.wind.dir_deg = this.scenario.wind_dir_deg;
      return;
    }

    // 1800 ticks cycle: ticks 0..299 active
    const cycleTick = this.sim_tick % this.tuning.wind_cycle_ticks;
    if (cycleTick === 0 || this.sim_tick === 1) {
      // Pick deterministic random direction for the new gust
      this.wind.gust_dir_deg = round3(this.prng.next() * 360.0);
    }

    if (cycleTick < this.tuning.wind_duration_ticks) {
      this.wind.active = true;
      this.wind.dir_deg = this.wind.gust_dir_deg;
    } else {
      this.wind.active = false;
      this.wind.dir_deg = 0.0;
    }
  }

  // Snapshot strictly conforming to Test Contract v1.1
  getSnapshot(tickNumber = this.tick) {
    const activeMotes = this.motes.filter(m => m.active);

    return {
      type: 'snapshot',
      tick: tickNumber,
      sim_tick: this.sim_tick,
      night: this.night,
      state: this.state,
      time_left_s: round3(this.time_left_s),
      score: this.score,
      wind: {
        active: this.wind.active,
        dir_deg: round3(this.wind.dir_deg)
      },
      player: {
        pos: formatPos(this.player.pos),
        vel: formatPos(this.player.vel),
        grounded: this.player.grounded,
        flames: this.player.flames,
        carried: this.player.carried,
        invuln: this.player.invuln_ticks > 0,
        dash_cd_s: round3(Math.max(0, this.player.dash_cd_ticks) / 60.0),
        pulse_cd_s: round3(Math.max(0, this.player.pulse_cd_ticks) / 60.0),
        charm_s: round3(Math.max(0, this.player.charm_ticks) / 60.0)
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
      motes: activeMotes.map(m => ({
        id: m.id,
        pos: formatPos(m.pos),
        kind: m.kind,
        ttl_s: m.ttl_ticks !== null ? round3(Math.max(0, m.ttl_ticks) / 60.0) : null
      })),
      drifters: this.drifters.filter(d => d.state !== 'removed').map(d => ({
        id: d.id,
        pos: formatPos(d.pos),
        state: d.state,
        stolen: d.stolen
      })),
      charms: this.charms.map(c => ({
        id: c.id,
        available: c.available,
        respawn_s: round3(Math.max(0, c.respawn_ticks) / 60.0)
      })),
      motes_active: activeMotes.length
    };
  }

  // Step 1 tick forward
  step(input = {}) {
    const stepEvents = [];
    this.tick++;

    // ----------------------------------------------------
    // 1. Đọc input (xử lý pause trước)
    // ----------------------------------------------------
    const pauseInput = !!input.pause;
    const pausePressed = pauseInput && !this.prevButtons.pause;
    this.prevButtons.pause = pauseInput;

    if (pausePressed) {
      if (!this.is_paused) {
        this.is_paused = true;
        this.state = 'paused';
        stepEvents.push({
          type: 'event',
          tick: this.tick,
          name: 'paused',
          data: {}
        });
        return stepEvents; // dừng bước ở đây
      } else {
        this.is_paused = false;
        this.state = 'playing';
        stepEvents.push({
          type: 'event',
          tick: this.tick,
          name: 'resumed',
          data: {}
        });
      }
    }

    if (this.is_paused) {
      return stepEvents;
    }

    if (this.state !== 'playing') {
      return stepEvents;
    }

    const currentTick = this.sim_tick + 1;

    const cam_yaw_deg = input.cam_yaw_deg ?? 0;
    const move = input.move || [0, 0];
    const jump = !!input.jump;
    const dash = !!input.dash;
    const interact = !!input.interact;
    const pulse = !!input.pulse;

    const jumpPressed = jump && !this.prevButtons.jump;
    const dashPressed = dash && !this.prevButtons.dash;
    const interactPressed = interact && !this.prevButtons.interact;
    const pulsePressed = pulse && !this.prevButtons.pulse;

    this.prevButtons.jump = jump;
    this.prevButtons.dash = dash;
    this.prevButtons.interact = interact;
    this.prevButtons.pulse = pulse;

    // ----------------------------------------------------
    // 2. Giảm các bộ đếm
    // ----------------------------------------------------
    this.sim_tick = currentTick;
    this.time_left_s = Math.max(0, this.time_left_s - 1.0 / 60.0);

    // Player cooldowns
    if (this.player.invuln_ticks > 0) this.player.invuln_ticks--;
    if (this.player.dash_cd_ticks > 0) this.player.dash_cd_ticks--;
    if (this.player.pulse_cd_ticks > 0) this.player.pulse_cd_ticks--;
    if (this.player.charm_ticks > 0) this.player.charm_ticks--;
    if (this.player.dash_ticks > 0) this.player.dash_ticks--;
    if (this.player.respawn_wait_ticks > 0) this.player.respawn_wait_ticks--;

    // Shade counters
    for (const shade of this.shades) {
      if (shade.state === 'stunned') {
        shade.stun_ticks--;
        if (shade.stun_ticks <= 0) {
          shade.state = distXZ(shade.pos, this.player.pos) <= this.tuning.shade_detect_radius ? 'chase' : 'wander';
        }
      } else if (shade.state === 'recoil') {
        shade.recoil_ticks--;
        if (shade.recoil_ticks <= 0) {
          shade.state = distXZ(shade.pos, this.player.pos) <= this.tuning.shade_detect_radius ? 'chase' : 'wander';
        }
      }
      if (shade.push_ticks > 0) shade.push_ticks--;
      if (shade.lantern_push) {
        shade.lantern_push.ticks_left--;
        if (shade.lantern_push.ticks_left <= 0) {
          shade.lantern_push = null;
        }
      }
    }

    // Charm respawn counters
    for (const charm of this.charms) {
      if (!charm.available) {
        charm.respawn_ticks--;
        if (charm.respawn_ticks <= 0) {
          charm.available = true;
          charm.respawn_ticks = 0;
        }
      }
    }

    // Dropped motes TTL
    for (const mote of this.motes) {
      if (mote.active && mote.ttl_ticks !== null) {
        mote.ttl_ticks--;
        if (mote.ttl_ticks <= 0) {
          mote.active = false;
        }
      }
    }

    // Drifter counters
    for (const drifter of this.drifters) {
      if (drifter.state === 'flee') {
        drifter.flee_ticks--;
        if (drifter.flee_ticks <= 0) {
          drifter.state = 'removed';
        }
      }
    }

    // ----------------------------------------------------
    // 3. Di chuyển Mây (nhảy, lướt, bục nhảy, gió) rồi kiểm tra rơi khỏi đảo
    // ----------------------------------------------------
    if (this.player.respawn_wait_ticks === 1) {
      // Complete respawn wait at tick 60
      this.player.pos = [...this.map.start_pos];
      this.player.vel = [0.0, 0.0, 0.0];
      this.player.invuln_ticks = this.tuning.invuln_ticks;
      this.player.grounded = true;
      this.player.in_launch = false;
    } else if (this.player.respawn_wait_ticks === 0) {
      // 3a. Dash activation check
      if (dashPressed && this.player.dash_ticks <= 0) {
        const canDash = this.player.charm_ticks > 0 || this.player.dash_cd_ticks <= 0;
        if (canDash) {
          this.player.dash_ticks = Math.round(this.tuning.dash_duration_s * 60); // 12 ticks
          this.player.dash_cd_ticks = this.player.charm_ticks > 0 ? 0 : Math.round(this.tuning.dash_cooldown_s * 60);

          if (move[0] !== 0 || move[1] !== 0) {
            const [mdx, mdz] = transformMove(move, cam_yaw_deg);
            this.player.dash_dir = [mdx, mdz];
          } else {
            this.player.dash_dir = [...this.player.facing_dir];
          }
          this.player.vel[1] = 0.0; // maintain height during dash
          stepEvents.push({
            type: 'event',
            tick: currentTick,
            name: 'dash',
            data: {}
          });
        }
      }

      // 3b. Jump pad trigger check
      if (this.player.grounded && (this.map.jump_pads || []).length > 0) {
        for (const pad of this.map.jump_pads) {
          const dPad = distXZ(this.player.pos, pad.pos);
          if (dPad <= pad.radius && Math.abs(this.player.pos[1] - pad.pos[1]) <= 0.5) {
            this.player.in_launch = true;
            this.player.grounded = false;
            this.player.vel[1] = pad.launch_vy;

            if (pad.target_center) {
              const dx = pad.target_center[0] - pad.pos[0];
              const dz = pad.target_center[2] - pad.pos[2];
              const len = Math.sqrt(dx * dx + dz * dz);
              this.player.launch_vx = (dx / len) * pad.launch_v_horiz;
              this.player.launch_vz = (dz / len) * pad.launch_v_horiz;
            } else {
              this.player.launch_vx = pad.launch_vx || 0;
              this.player.launch_vz = pad.launch_vz || 0;
            }
            break;
          }
        }
      }

      // 3c. Jump key
      if (jumpPressed && this.player.grounded && this.player.dash_ticks <= 0) {
        this.player.vel[1] = this.tuning.jump_speed;
        this.player.grounded = false;
      }

      // 3d. Calculate horizontal movement
      let dx = 0.0;
      let dz = 0.0;

      if (this.player.dash_ticks > 0) {
        // Dashing: 14 m/s in dash_dir
        const step = this.tuning.dash_speed / 60.0;
        dx = this.player.dash_dir[0] * step;
        dz = this.player.dash_dir[1] * step;
        this.player.facing_dir = [...this.player.dash_dir];
      } else if (this.player.in_launch) {
        // Jump pad launch trajectory
        dx = this.player.launch_vx / 60.0;
        dz = this.player.launch_vz / 60.0;
      } else {
        // Normal walking / air control
        const speed = this.player.charm_ticks > 0 ? this.tuning.charm_speed : this.tuning.player_speed;
        const [mdx, mdz] = transformMove(move, cam_yaw_deg);
        dx = mdx * (speed / 60.0);
        dz = mdz * (speed / 60.0);
        if (mdx !== 0 || mdz !== 0) {
          this.player.facing_dir = [mdx, mdz];
        }
      }

      // Wind push (Night 3)
      this.updateWind();
      if (this.wind.active) {
        const wRad = (this.wind.dir_deg * Math.PI) / 180.0;
        dx += Math.cos(wRad) * (this.tuning.wind_speed / 60.0);
        dz += Math.sin(wRad) * (this.tuning.wind_speed / 60.0);
      }

      // Resolve obstacles & cliffs
      let nextX = this.player.pos[0] + dx;
      let nextZ = this.player.pos[2] + dz;
      [nextX, nextZ] = this.resolveObstacles(this.player.pos, nextX, nextZ);
      this.player.pos[0] = nextX;
      this.player.pos[2] = nextZ;

      // 3e. Vertical physics
      if (this.player.dash_ticks > 0) {
        this.player.vel[1] = 0.0;
      } else {
        this.player.vel[1] -= this.tuning.gravity / 60.0;
        this.player.pos[1] += this.player.vel[1] / 60.0;

        const groundY = this.getGroundHeight(this.player.pos[0], this.player.pos[2]);
        if (this.player.pos[1] <= groundY) {
          this.player.pos[1] = groundY;
          this.player.vel[1] = 0.0;
          this.player.grounded = true;
          this.player.in_launch = false;
        } else {
          this.player.grounded = false;
        }
      }

      this.player.vel[0] = round3(dx * 60.0);
      this.player.vel[2] = round3(dz * 60.0);

      // 3f. Fall off island check (Y < -10)
      if (this.player.pos[1] < this.tuning.fall_y && this.player.respawn_wait_ticks <= 0) {
        this.player.flames--;
        const droppedAll = this.player.carried;
        this.player.carried = 0;
        this.player.respawn_wait_ticks = this.tuning.respawn_wait_ticks;
        this.player.in_launch = false;
        this.player.dash_ticks = 0;

        stepEvents.push({
          type: 'event',
          tick: currentTick,
          name: 'fall',
          data: {
            flames: this.player.flames,
            dropped: droppedAll
          }
        });

        if (this.player.flames <= 0) {
          this.state = 'lost';
          this.game_over_reason = 'no_flames';
          stepEvents.push({
            type: 'event',
            tick: currentTick,
            name: 'game_over',
            data: { result: 'lost', reason: 'no_flames' }
          });
          return stepEvents;
        }
      }
    }

    // ----------------------------------------------------
    // 4. Nhặt đom đóm và bùa
    // ----------------------------------------------------
    if (this.player.respawn_wait_ticks === 0) {
      // Motes collection
      for (const mote of this.motes) {
        if (mote.active && mote.created_tick !== currentTick && this.player.carried < this.tuning.carry_capacity) {
          const dXZ = distXZ(this.player.pos, mote.pos);
          const dY = Math.abs(this.player.pos[1] - mote.pos[1]);
          if (dXZ <= this.tuning.pickup_radius_xz && dY <= this.tuning.pickup_height_diff) {
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

      // Charms collection
      for (const charm of this.charms) {
        if (charm.available) {
          const dXZ = distXZ(this.player.pos, charm.pos);
          const dY = Math.abs(this.player.pos[1] - charm.pos[1]);
          if (dXZ <= this.tuning.pickup_radius_xz && dY <= this.tuning.pickup_height_diff) {
            charm.available = false;
            charm.respawn_ticks = this.tuning.charm_respawn_ticks;
            this.player.charm_ticks = this.tuning.charm_duration_ticks;
            stepEvents.push({
              type: 'event',
              tick: currentTick,
              name: 'charm_picked',
              data: { charm_id: charm.id, charm_ticks: this.tuning.charm_duration_ticks }
            });
          }
        }
      }
    }

    // ----------------------------------------------------
    // 5. Tương tác với đèn
    // ----------------------------------------------------
    if (interactPressed && this.player.carried > 0 && this.player.respawn_wait_ticks === 0) {
      // Filter unlit lanterns within interact_radius (2.0m)
      const nearbyUnlit = this.lanterns
        .filter(l => !l.lit && distXZ(this.player.pos, l.pos) <= this.tuning.interact_radius)
        .map(l => ({ lantern: l, dist: distXZ(this.player.pos, l.pos) }))
        .sort((a, b) => a.dist - b.dist || a.lantern.id.localeCompare(b.lantern.id));

      if (nearbyUnlit.length > 0) {
        const target = nearbyUnlit[0].lantern;
        const needed = this.tuning.lantern_cost - target.deposited;
        const depositAmount = Math.min(this.player.carried, needed);

        if (depositAmount > 0) {
          this.player.carried -= depositAmount;
          target.deposited += depositAmount;

          stepEvents.push({
            type: 'event',
            tick: currentTick,
            name: 'deposit',
            data: {
              lantern_id: target.id,
              amount: depositAmount,
              deposited: target.deposited
            }
          });

          if (target.deposited >= this.tuning.lantern_cost) {
            target.lit = true;
            this.score += this.tuning.score.per_lantern;

            stepEvents.push({
              type: 'event',
              tick: currentTick,
              name: 'lantern_lit',
              data: { lantern_id: target.id }
            });

            // Repel any shade currently inside safe radius over max 30 ticks
            for (const shade of this.shades) {
              const d = distXZ(shade.pos, target.pos);
              if (d < this.tuning.safe_radius) {
                shade.lantern_push = {
                  center: [...target.pos],
                  ticks_left: 30
                };
              }
            }

            // Check Win Condition
            const allLit = this.lanterns.every(l => l.lit);
            if (allLit) {
              this.state = 'won';
              this.game_over_reason = 'all_lit';
              const remainingSecs = Math.max(0, Math.floor(this.time_left_s));
              this.score += remainingSecs * this.tuning.score.per_second_left + this.player.flames * this.tuning.score.per_flame_left;
              stepEvents.push({
                type: 'event',
                tick: currentTick,
                name: 'game_over',
                data: { result: 'won', reason: 'all_lit' }
              });
              return stepEvents;
            }
          }
        }
      }
    }

    // ----------------------------------------------------
    // 6. Cập nhật vùng an toàn
    // ----------------------------------------------------
    for (const shade of this.shades) {
      if (shade.lantern_push) {
        // Push outward towards 6.0m over 30 ticks
        const d = distXZ(shade.pos, shade.lantern_push.center);
        if (d < this.tuning.safe_radius) {
          const pushStep = (this.tuning.safe_radius - d) / Math.max(1, shade.lantern_push.ticks_left);
          let dirX = shade.pos[0] - shade.lantern_push.center[0];
          let dirZ = shade.pos[2] - shade.lantern_push.center[2];
          const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
          if (len > 0.001) {
            dirX /= len; dirZ /= len;
          } else {
            dirX = 1; dirZ = 0;
          }
          shade.pos[0] += dirX * pushStep;
          shade.pos[2] += dirZ * pushStep;
        }
      } else {
        // Lit lanterns repel shades from entering edge 6m
        for (const lantern of this.lanterns) {
          if (!lantern.lit) continue;
          const d = distXZ(shade.pos, lantern.pos);
          if (d < this.tuning.safe_radius) {
            let dirX = shade.pos[0] - lantern.pos[0];
            let dirZ = shade.pos[2] - lantern.pos[2];
            const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
            if (len > 0.001) {
              dirX /= len; dirZ /= len;
            } else {
              dirX = 1; dirZ = 0;
            }
            shade.pos[0] = lantern.pos[0] + dirX * this.tuning.safe_radius;
            shade.pos[2] = lantern.pos[2] + dirZ * this.tuning.safe_radius;
          }
        }
      }
    }

    // ----------------------------------------------------
    // 7. Tỏa Sáng (Pulse)
    // ----------------------------------------------------
    if (
      pulsePressed &&
      this.player.carried >= this.tuning.pulse_cost &&
      this.player.pulse_cd_ticks <= 0 &&
      this.state === 'playing'
    ) {
      this.player.carried -= this.tuning.pulse_cost;
      this.player.pulse_cd_ticks = Math.round(this.tuning.pulse_cd_s * 60);

      const pulseCenter = [this.player.pos[0], this.player.pos[1] + 0.8, this.player.pos[2]];
      const stunned_ids = [];

      // Pulse shades
      for (const shade of this.shades) {
        const shadeCenter = [shade.pos[0], shade.pos[1] + 0.8, shade.pos[2]];
        const d3D = dist3D(pulseCenter, shadeCenter);
        if (d3D <= this.tuning.pulse_radius) {
          shade.state = 'stunned';
          shade.stun_ticks = this.tuning.pulse_stun_ticks;

          let pDirX = shade.pos[0] - this.player.pos[0];
          let pDirZ = shade.pos[2] - this.player.pos[2];
          const pLen = Math.sqrt(pDirX * pDirX + pDirZ * pDirZ);
          if (pLen > 0.001) {
            pDirX /= pLen; pDirZ /= pLen;
          } else {
            pDirX = 1.0; pDirZ = 0.0; // trùng vị trí đẩy theo +X
          }
          shade.push_dir = [pDirX, pDirZ];
          shade.push_ticks = this.tuning.pulse_push_duration_ticks; // 15 ticks
          shade.push_speed = this.tuning.pulse_push_m / this.tuning.pulse_push_duration_ticks; // 4m over 15 ticks

          stunned_ids.push(shade.id);
          this.score += this.tuning.score.per_stun;
        }
      }

      // Pulse drifters
      for (const drifter of this.drifters) {
        const drifterCenter = [drifter.pos[0], drifter.pos[1] + 0.8, drifter.pos[2]];
        const d3D = dist3D(pulseCenter, drifterCenter);
        if (d3D <= this.tuning.pulse_radius) {
          if (drifter.state === 'chase') {
            drifter.state = 'flee';
            drifter.flee_ticks = this.tuning.drifter_flee_ticks;
          } else if (drifter.state === 'flee' && drifter.stolen > 0) {
            const count = drifter.stolen;
            drifter.stolen = 0;
            drifter.flee_ticks = 120; // disappears after 120 ticks
            for (let i = 0; i < count; i++) {
              this.motes.push({
                id: `M_drop_${this.nextMoteId++}`,
                pos: [...drifter.pos],
                kind: 'dropped',
                ttl_ticks: 480,
                active: true,
                created_tick: currentTick
              });
            }
            stepEvents.push({
              type: 'event',
              tick: currentTick,
              name: 'drifter_drop',
              data: { drifter_id: drifter.id, amount: count }
            });
          }
        }
      }

      stepEvents.push({
        type: 'event',
        tick: currentTick,
        name: 'pulse',
        data: { stunned_ids }
      });
    }

    // ----------------------------------------------------
    // 8. Di chuyển Bóng Mực và Gió Lạc
    // ----------------------------------------------------
    const shadeSpeedPerTick = (this.map.shade_schedule?.speed || this.tuning.shade_speed) / 60.0;
    for (const shade of this.shades) {
      if (shade.push_ticks > 0) {
        shade.pos[0] += shade.push_dir[0] * shade.push_speed;
        shade.pos[2] += shade.push_dir[1] * shade.push_speed;
      } else if (shade.state === 'recoil') {
        const recoilStep = this.tuning.shade_recoil_dist / this.tuning.shade_recoil_ticks;
        shade.pos[0] += shade.recoil_dir[0] * recoilStep;
        shade.pos[2] += shade.recoil_dir[1] * recoilStep;
      } else if (shade.state === 'chase') {
        const d = distXZ(shade.pos, this.player.pos);
        if (d > this.tuning.shade_lose_radius) {
          shade.state = 'wander';
        } else if (d > 0.001) {
          const dirX = (this.player.pos[0] - shade.pos[0]) / d;
          const dirZ = (this.player.pos[2] - shade.pos[2]) / d;
          shade.pos[0] += dirX * shadeSpeedPerTick;
          shade.pos[2] += dirZ * shadeSpeedPerTick;
        }
      } else if (shade.state === 'wander') {
        const d = distXZ(shade.pos, this.player.pos);
        if (d <= this.tuning.shade_detect_radius) {
          shade.state = 'chase';
        }
      }
    }

    // Drifters movement
    for (const drifter of this.drifters) {
      if (drifter.state === 'idle') {
        const d = distXZ(drifter.pos, this.player.pos);
        if (this.player.carried >= this.tuning.drifter_detect_motes && d <= this.tuning.drifter_detect_radius) {
          drifter.state = 'chase';
        } else {
          // Slow wander
          drifter.pos[0] += drifter.wander_dir[0] * (this.tuning.drifter_idle_speed / 60.0);
          drifter.pos[2] += drifter.wander_dir[1] * (this.tuning.drifter_idle_speed / 60.0);
        }
      } else if (drifter.state === 'chase') {
        const d = distXZ(drifter.pos, this.player.pos);
        if (this.player.carried < this.tuning.drifter_detect_motes || d > this.tuning.drifter_detect_radius) {
          drifter.state = 'idle';
        } else if (d > 0.001) {
          const dirX = (this.player.pos[0] - drifter.pos[0]) / d;
          const dirZ = (this.player.pos[2] - drifter.pos[2]) / d;
          drifter.pos[0] += dirX * (this.tuning.drifter_speed / 60.0);
          drifter.pos[2] += dirZ * (this.tuning.drifter_speed / 60.0);
        }
      } else if (drifter.state === 'flee') {
        const d = distXZ(drifter.pos, this.player.pos);
        let dirX = 1.0, dirZ = 0.0;
        if (d > 0.001) {
          dirX = (drifter.pos[0] - this.player.pos[0]) / d;
          dirZ = (drifter.pos[2] - this.player.pos[2]) / d;
        }
        drifter.pos[0] += dirX * (this.tuning.drifter_speed / 60.0);
        drifter.pos[2] += dirZ * (this.tuning.drifter_speed / 60.0);
      }
    }

    // ----------------------------------------------------
    // 9. Chạm: Gió Lạc cướp trước, rồi Bóng Mực gây hit
    // ----------------------------------------------------
    // Drifters steal first (sorted by id ascending)
    const sortedDrifters = [...this.drifters].sort((a, b) => a.id.localeCompare(b.id));
    for (const drifter of sortedDrifters) {
      if (drifter.state === 'chase' && distXZ(drifter.pos, this.player.pos) <= this.tuning.drifter_hit_radius_xz) {
        const stolen = Math.min(this.tuning.drifter_steal_max, this.player.carried);
        drifter.stolen = stolen;
        this.player.carried -= stolen;
        drifter.state = 'flee';
        drifter.flee_ticks = this.tuning.drifter_flee_ticks;

        stepEvents.push({
          type: 'event',
          tick: currentTick,
          name: 'drifter_steal',
          data: {
            drifter_id: drifter.id,
            amount: stolen,
            carried: this.player.carried
          }
        });
      }
    }

    // Shades hit (sorted by id ascending)
    const sortedShades = [...this.shades].sort((a, b) => a.id.localeCompare(b.id));
    let hitOccurredThisTick = false;

    for (const shade of sortedShades) {
      const dXZ = distXZ(shade.pos, this.player.pos);
      const dY = Math.abs(shade.pos[1] - this.player.pos[1]);

      if (dXZ <= this.tuning.shade_hit_radius_xz && dY <= this.tuning.shade_hit_height_diff) {
        if (
          this.player.invuln_ticks <= 0 &&
          !hitOccurredThisTick &&
          this.player.respawn_wait_ticks === 0 &&
          (!shade.lantern_push || shade.lantern_push.ticks_left <= 0)
        ) {
          hitOccurredThisTick = true;
          this.player.flames--;
          this.player.invuln_ticks = this.tuning.invuln_ticks;

          const dropped = Math.floor(this.player.carried / 2);
          this.player.carried -= dropped;

          // Scatter dropped motes in a ring 1.5 - 2.5m around Mây
          if (dropped > 0) {
            for (let i = 0; i < dropped; i++) {
              const ang = (i / dropped) * Math.PI * 2;
              const r = 1.5 + (i % 2) * 1.0;
              this.motes.push({
                id: `M_drop_${this.nextMoteId++}`,
                pos: [
                  round3(this.player.pos[0] + Math.cos(ang) * r),
                  this.player.pos[1],
                  round3(this.player.pos[2] + Math.sin(ang) * r)
                ],
                kind: 'dropped',
                ttl_ticks: 480,
                active: true,
                created_tick: currentTick
              });
            }
          }

          // Shade recoil 2m over 60 ticks
          shade.state = 'recoil';
          shade.recoil_ticks = this.tuning.shade_recoil_ticks;
          let rDirX = shade.pos[0] - this.player.pos[0];
          let rDirZ = shade.pos[2] - this.player.pos[2];
          const rLen = Math.sqrt(rDirX * rDirX + rDirZ * rDirZ);
          if (rLen > 0.001) {
            rDirX /= rLen; rDirZ /= rLen;
          } else {
            rDirX = 1.0; rDirZ = 0.0;
          }
          shade.recoil_dir = [rDirX, rDirZ];

          stepEvents.push({
            type: 'event',
            tick: currentTick,
            name: 'player_hit',
            data: {
              by: 'shade',
              flames: this.player.flames,
              dropped,
              lost: true
            }
          });

          if (this.player.flames <= 0) {
            this.state = 'lost';
            this.game_over_reason = 'no_flames';
            stepEvents.push({
              type: 'event',
              tick: currentTick,
              name: 'game_over',
              data: { result: 'lost', reason: 'no_flames' }
            });
            return stepEvents;
          }
        }
      }
    }

    // ----------------------------------------------------
    // 10. Sinh đom đóm, Bóng Mực, Gió Lạc theo lịch
    // ----------------------------------------------------
    // Mote spawn every 240 ticks if active < 30
    if (this.scenario?.random_motes !== false && currentTick % 240 === 0) {
      const activeCount = this.motes.filter(m => m.active).length;
      if (activeCount < 30) {
        const spawns = this.map.mote_spawns || [];
        // Find empty spawn point
        for (const sp of spawns) {
          const occupied = this.motes.some(m => m.active && distXZ(m.pos, sp) < 1.0);
          if (!occupied) {
            this.motes.push({
              id: `M${this.nextMoteId++}`,
              pos: [...sp],
              kind: 'random',
              ttl_ticks: null,
              active: true,
              created_tick: currentTick
            });
            break;
          }
        }
      }
    }

    // Shade spawn schedule
    if (this.scenario?.random_shades !== false && this.map.shade_schedule) {
      const sched = this.map.shade_schedule;
      let shouldSpawnCount = 0;
      if (currentTick === sched.first_tick) {
        shouldSpawnCount = sched.first_count;
      } else if (currentTick > sched.first_tick && (currentTick - sched.first_tick) % sched.interval_ticks === 0) {
        shouldSpawnCount = 1;
      }

      if (shouldSpawnCount > 0 && this.shades.length < sched.max_shades) {
        const count = Math.min(shouldSpawnCount, sched.max_shades - this.shades.length);
        const spawns = this.map.shade_spawns || [];
        // Filter spawns >= 15m from player
        const validSpawns = spawns.filter(sp => distXZ(sp, this.player.pos) >= 15.0);
        for (let i = 0; i < count; i++) {
          if (validSpawns.length > 0) {
            const idx = Math.floor(this.prng.next() * validSpawns.length);
            const pt = validSpawns[idx];
            this.shades.push({
              id: `S${this.nextShadeId++}`,
              pos: [...pt],
              state: 'wander',
              stun_ticks: 0,
              recoil_ticks: 0,
              recoil_dir: [1, 0],
              push_ticks: 0,
              push_dir: [1, 0],
              push_speed: 0,
              lantern_push: null,
              wander_dir: [1, 0]
            });
          }
        }
      }
    }

    // Drifter spawn schedule (Night 2 and 3)
    if (this.scenario?.random_drifters !== false && this.map.drifter_schedule) {
      const sched = this.map.drifter_schedule;
      if (currentTick % sched.interval_ticks === 0) {
        const activeDrifters = this.drifters.filter(d => d.state !== 'removed');
        if (activeDrifters.length < sched.max_drifters) {
          const spawns = this.map.shade_spawns || [];
          if (spawns.length > 0) {
            const idx = Math.floor(this.prng.next() * spawns.length);
            this.drifters.push({
              id: `D${this.nextDrifterId++}`,
              pos: [...spawns[idx]],
              state: 'idle',
              stolen: 0,
              flee_ticks: 0,
              wander_dir: [1, 0]
            });
          }
        }
      }
    }

    // ----------------------------------------------------
    // 11. Xét thắng / thua
    // ----------------------------------------------------
    if (this.player.flames <= 0) {
      this.state = 'lost';
      this.game_over_reason = 'no_flames';
      stepEvents.push({
        type: 'event',
        tick: currentTick,
        name: 'game_over',
        data: { result: 'lost', reason: 'no_flames' }
      });
    } else if (this.lanterns.every(l => l.lit)) {
      this.state = 'won';
      this.game_over_reason = 'all_lit';
      const remainingSecs = Math.max(0, Math.floor(this.time_left_s));
      this.score += remainingSecs * this.tuning.score.per_second_left + this.player.flames * this.tuning.score.per_flame_left;
      stepEvents.push({
        type: 'event',
        tick: currentTick,
        name: 'game_over',
        data: { result: 'won', reason: 'all_lit' }
      });
    } else if (this.time_left_s <= 0) {
      this.state = 'lost';
      this.game_over_reason = 'dawn';
      stepEvents.push({
        type: 'event',
        tick: currentTick,
        name: 'game_over',
        data: { result: 'lost', reason: 'dawn' }
      });
    }

    return stepEvents;
  }
}
