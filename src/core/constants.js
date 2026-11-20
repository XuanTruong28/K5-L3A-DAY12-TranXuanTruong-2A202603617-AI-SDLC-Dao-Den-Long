// Constants and map definitions for Phase 3 (Ticket-03 - Contract v1.2)
import { round3 } from './math.js';

export const CONTRACT_VERSION = '1.2';

export const DEFAULT_TUNING = {
  player_speed: 6.0,
  jump_speed: 7.0,
  gravity: 20.0,
  dash_speed: 14.0,
  dash_duration_s: 0.2, // 12 ticks
  dash_cooldown_s: 1.5, // 90 ticks
  carry_capacity: 10,
  capacity_max: 20,
  lantern_cost: 10,
  relight_cost: 5,
  fuel_max: 100,
  fuel_decay_per_s: 1.0,
  fuel_per_mote: 10,
  win_ratio: 0.6,
  drain_per_s: 5,
  low_fuel_threshold: 30,
  lantern_count_night1: 5,
  lantern_count_night2: 6,
  lantern_count_night3: 7,
  pickup_radius_xz: 1.0,
  pickup_height_diff: 1.5,
  interact_radius: 2.0,
  safe_radius: 6.0,
  pulse_cost: 3,
  pulse_radius: 5.0,
  pulse_cd_s: 3.0,
  pulse_stun_ticks: 120,
  pulse_push_speed: 16.0,
  pulse_push_duration_ticks: 15, // 4m over 15 ticks
  pulse_push_m: 4.0,
  shade_speed: 4.0,
  shade_detect_radius: 12.0,
  shade_lose_radius: 18.0,
  shade_hit_radius_xz: 1.0,
  shade_hit_height_diff: 1.5,
  shade_recoil_dist: 2.0,
  shade_recoil_ticks: 60,
  night1_duration_s: 240,
  night2_duration_s: 270,
  night3_duration_s: 300,
  flames: 3,
  invuln_s: 1.5,
  invuln_ticks: 90,
  fall_y: -10.0,
  respawn_wait_ticks: 60,

  // Drifter (Gió Lạc)
  drifter_speed: 7.0,
  drifter_idle_speed: 2.0,
  drifter_detect_motes: 5,
  drifter_detect_radius: 15.0,
  drifter_hit_radius_xz: 1.2,
  drifter_steal_max: 3,
  drifter_flee_ticks: 240,

  // Charm (Bùa Gió)
  charm_duration_ticks: 600,
  charm_speed: 7.2,
  charm_respawn_ticks: 2700,

  // Strong wind (Night 3)
  wind_cycle_ticks: 1800, // 30s
  wind_duration_ticks: 300, // 5s
  wind_warning_ticks: 120, // 2s before
  wind_speed: 2.0,

  // Scoring (Ticket-03 Contract v1.2)
  score: {
    per_mote_deposited: 5,
    first_light: 100,
    relight: 40,
    per_stun: 5,
    per_stun_drain: 15,
    per_lit_lantern_at_dawn: 50,
    per_flame_left: 50
  }
};

// Helper to compute circle points [x, y, z] from angle in degrees:
// x = cx + r * cos(deg * PI / 180)
// z = cz + r * sin(deg * PI / 180)
function makeCirclePoint(cx, cy, cz, r, deg) {
  const rad = (deg * Math.PI) / 180.0;
  return [round3(cx + r * Math.cos(rad)), round3(cy), round3(cz + r * Math.sin(rad))];
}

// ----------------- NIGHT 1 MAP: Đảo Bến -----------------
export const NIGHT1_MAP = {
  night: 1,
  name: 'Đảo Bến',
  radius: 40.0,
  duration_s: 240,
  start_pos: [0.0, 0.0, 0.0],
  start_facing: [0, 0, 1], // +Z
  lanterns: [
    { id: 'L1', pos: [0.0, 0.0, 25.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L2', pos: [23.8, 0.0, 7.7], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L3', pos: [14.7, 0.0, -20.2], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L4', pos: [-14.7, 0.0, -20.2], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L5', pos: [-23.8, 0.0, 7.7], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 }
  ],
  mote_spawns: [
    // 8 points on r = 12m (every 45 deg)
    ...[0, 45, 90, 135, 180, 225, 270, 315].map(deg => makeCirclePoint(0, 0, 0, 12, deg)),
    // 16 points on r = 33m (every 22.5 deg)
    ...Array.from({ length: 16 }, (_, i) => makeCirclePoint(0, 0, 0, 33, i * 22.5))
  ],
  shade_spawns: [
    // 12 points on r = 37m (15, 45, 75, ... 345 deg)
    ...Array.from({ length: 12 }, (_, i) => makeCirclePoint(0, 0, 0, 37, 15 + i * 30))
  ],
  shade_schedule: {
    first_tick: 300,
    first_count: 2,
    interval_ticks: 480, // 8s
    max_shades: 6,
    speed: 4.0
  },
  charms: [],
  jump_pads: []
};

// ----------------- NIGHT 2 MAP: Đảo Cau -----------------
export const NIGHT2_MAP = {
  night: 2,
  name: 'Đảo Cau',
  duration_s: 270,
  start_pos: [0.0, 0.0, 0.0],
  start_facing: [0, 0, 1], // +Z
  islands: [
    { center: [0.0, 0.0, 0.0], radius: 28.0 },
    { center: [70.0, 0.0, 0.0], radius: 28.0 }
  ],
  bridge: {
    x_min: 26.0,
    x_max: 44.0,
    z_min: -2.0,
    z_max: 2.0
  },
  lanterns: [
    { id: 'L1', pos: [0.0, 0.0, 20.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L2', pos: [17.0, 0.0, -10.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L3', pos: [-17.0, 0.0, -10.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L4', pos: [70.0, 0.0, 20.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L5', pos: [87.0, 0.0, -10.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L6', pos: [53.0, 0.0, -10.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 }
  ],
  jump_pads: [
    {
      id: 'JP1',
      pos: [20.0, 0.0, 18.0],
      radius: 1.0,
      target_center: [70.0, 0.0, 0.0],
      launch_vy: 14.0,
      launch_v_horiz: 24.0
    },
    {
      id: 'JP2',
      pos: [50.0, 0.0, -18.0],
      radius: 1.0,
      target_center: [0.0, 0.0, 0.0],
      launch_vy: 14.0,
      launch_v_horiz: 24.0
    }
  ],
  charms: [
    { id: 'C1', pos: [35.0, 0.0, 0.0], available: true, respawn_ticks: 0 }
  ],
  mote_spawns: [
    // Island A (center 0,0,0)
    ...[0, 90, 180, 270].map(deg => makeCirclePoint(0, 0, 0, 10, deg)),
    ...Array.from({ length: 8 }, (_, i) => makeCirclePoint(0, 0, 0, 22, i * 45)),
    // Island B (center 70,0,0)
    ...[0, 90, 180, 270].map(deg => makeCirclePoint(70, 0, 0, 10, deg)),
    ...Array.from({ length: 8 }, (_, i) => makeCirclePoint(70, 0, 0, 22, i * 45))
  ],
  shade_spawns: [
    // Island A
    ...Array.from({ length: 8 }, (_, i) => makeCirclePoint(0, 0, 0, 26, 22.5 + i * 45)),
    // Island B
    ...Array.from({ length: 8 }, (_, i) => makeCirclePoint(70, 0, 0, 26, 22.5 + i * 45))
  ],
  shade_schedule: {
    first_tick: 300,
    first_count: 2,
    interval_ticks: 420, // 7s
    max_shades: 8,
    speed: 4.0
  },
  drifter_schedule: {
    interval_ticks: 1200, // 20s
    max_drifters: 2
  }
};

// ----------------- NIGHT 3 MAP: Đảo Chuông -----------------
export const NIGHT3_MAP = {
  night: 3,
  name: 'Đảo Chuông',
  duration_s: 300,
  radius: 45.0,
  start_pos: [0.0, 6.0, 3.5], // Firmly on Tier 2 (Y=6.0) at Z=+3.5m, safely outside Bell Tower cylinder (r=2.0m)
  start_facing: [0, 0, 1], // +Z
  bell_tower: {
    center: [0.0, 6.0, 0.0],
    radius: 2.0,
    height: 8.0
  },
  tiers: [
    { level: 0, y: 0.0, radius: 45.0 },
    { level: 1, y: 3.0, r_inner: 12.0, r_outer: 24.0, z_min: 0.0 },
    { level: 2, y: 6.0, radius: 8.0 }
  ],
  ramps: [
    // 2 radial ramps at 30 deg and 150 deg, width 3m (half-width 1.5m), r from 30 down to 24 (y from 0 to 3)
    { angle_deg: 30.0, r_bottom: 30.0, r_top: 24.0, width: 3.0, y_bottom: 0.0, y_top: 3.0 },
    { angle_deg: 150.0, r_bottom: 30.0, r_top: 24.0, width: 3.0, y_bottom: 0.0, y_top: 3.0 }
  ],
  jump_pads: [
    {
      id: 'JP1',
      pos: [0.0, 3.0, 13.0],
      radius: 1.0,
      launch_vy: 12.0,
      launch_vx: 0.0,
      launch_vz: -8.0,
      target_tier: 2,
      target_y: 6.0
    }
  ],
  lanterns: [
    { id: 'L1', pos: [0.0, 6.0, 6.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L2', pos: [18.0, 3.0, 10.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L3', pos: [-18.0, 3.0, 10.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L4', pos: [35.0, 0.0, -10.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L5', pos: [-35.0, 0.0, -10.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L6', pos: [20.0, 0.0, -35.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 },
    { id: 'L7', pos: [-20.0, 0.0, -35.0], lit: false, deposited: 0, fuel: 0, ever_lit: false, relit_count: 0 }
  ],
  charms: [
    { id: 'C1', pos: [30.0, 0.0, 25.0], available: true, respawn_ticks: 0 },
    { id: 'C2', pos: [-30.0, 0.0, 25.0], available: true, respawn_ticks: 0 }
  ],
  mote_spawns: [
    // Tier 0: 18 points on r = 34m (every 20 deg from 0) at y = 0
    ...Array.from({ length: 18 }, (_, i) => makeCirclePoint(0, 0, 0, 34, i * 20)),
    // Tier 1: 8 points on r = 18m (20, 40, ..., 160 deg) at y = 3
    ...[20, 40, 60, 80, 100, 120, 140, 160].map(deg => makeCirclePoint(0, 3, 0, 18, deg)),
    // Tier 2: 4 points on r = 5m (45, 135, 225, 315 deg) at y = 6
    ...[45, 135, 225, 315].map(deg => makeCirclePoint(0, 6, 0, 5, deg))
  ],
  shade_spawns: [
    // 16 points on r = 43m (every 22.5 deg) at y = 0
    ...Array.from({ length: 16 }, (_, i) => makeCirclePoint(0, 0, 0, 43, i * 22.5))
  ],
  shade_schedule: {
    first_tick: 300,
    first_count: 2,
    interval_ticks: 360, // 6s
    max_shades: 10,
    speed: 4.5
  },
  drifter_schedule: {
    interval_ticks: 1200,
    max_drifters: 2
  }
};

// Map lookup helper
export function getMapForNight(night = 1) {
  if (night === 2) return NIGHT2_MAP;
  if (night === 3) return NIGHT3_MAP;
  return NIGHT1_MAP;
}

// Backward-compatible exports for Phase 1 code
export const ISLAND_RADIUS = 40.0;
export const DEFAULT_LANTERNS = NIGHT1_MAP.lanterns;
