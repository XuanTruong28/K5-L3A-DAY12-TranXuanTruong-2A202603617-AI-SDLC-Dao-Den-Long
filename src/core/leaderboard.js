import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_PATH = path.resolve('data/leaderboard.json');

// Default initial high scores for demonstration and fallback
const SEED_ENTRIES = [
  { name: 'May_Master', score: 1450, nights_won: 3, achieved_at: '2026-11-20T18:00:00+07:00', seed: 42 },
  { name: 'Light_Keeper', score: 1280, nights_won: 3, achieved_at: '2026-11-20T18:15:00+07:00', seed: 101 },
  { name: 'Lantern_Hero', score: 980, nights_won: 2, achieved_at: '2026-11-20T19:00:00+07:00', seed: 777 },
  { name: 'Star_Wanderer', score: 820, nights_won: 2, achieved_at: '2026-11-20T19:30:00+07:00', seed: 12 },
  { name: 'Dawn_Seeker', score: 550, nights_won: 1, achieved_at: '2026-11-20T20:00:00+07:00', seed: 88 }
];

export function validatePlayerName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 12) return false;
  // Cho phép chữ cái, chữ số, dấu gạch dưới và tiếng Việt có dấu
  const regex = /^[A-Za-z0-9_À-ỹ\s]+$/u;
  return regex.test(trimmed);
}

export function sortLeaderboardEntries(entries) {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score; // Giảm dần theo điểm
    }
    // Bằng điểm: ai đạt trước đứng trên (thời gian nhỏ hơn)
    const tA = new Date(a.achieved_at || 0).getTime();
    const tB = new Date(b.achieved_at || 0).getTime();
    return tA - tB;
  }).slice(0, 10); // Giữ Top 10
}

export function loadLeaderboard(filePath = DEFAULT_PATH) {
  try {
    const resolved = path.resolve(filePath);
    if (fs.existsSync(resolved)) {
      const data = JSON.parse(fs.readFileSync(resolved, 'utf8'));
      if (Array.isArray(data)) {
        return sortLeaderboardEntries(data);
      }
      if (Array.isArray(data.entries)) {
        return sortLeaderboardEntries(data.entries);
      }
    }
  } catch (err) {
    console.error('Failed to load leaderboard from disk:', err);
  }
  return [...SEED_ENTRIES];
}

export function saveLeaderboard(entries, filePath = DEFAULT_PATH) {
  const sorted = sortLeaderboardEntries(entries);
  const resolved = path.resolve(filePath);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(resolved, JSON.stringify(sorted, null, 2), 'utf8');
  return sorted;
}

export function addLeaderboardEntry({ name, score, nights_won, seed, achieved_at }, filePath = DEFAULT_PATH) {
  if (!validatePlayerName(name)) {
    throw new Error('Tên người chơi không hợp lệ. Phải từ 3 đến 12 ký tự [A-Za-z0-9_].');
  }

  // Format timezone ISO 8601 nếu chưa có
  let isoDate = achieved_at;
  if (!isoDate) {
    const now = new Date();
    // Offset múi giờ +07:00
    const offsetMin = -now.getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');
    const tzStr = `${sign}${pad(offsetMin / 60)}:${pad(offsetMin % 60)}`;
    isoDate = now.toISOString().replace('Z', tzStr);
  }

  const current = loadLeaderboard(filePath);
  current.push({
    name: name.trim(),
    score: Math.round(score || 0),
    nights_won: Math.min(3, Math.max(0, parseInt(nights_won || 0, 10))),
    achieved_at: isoDate,
    seed: parseInt(seed || 0, 10)
  });

  return saveLeaderboard(current, filePath);
}

export function exportLeaderboard(outPath, filePath = DEFAULT_PATH) {
  const entries = loadLeaderboard(filePath);
  const result = { entries };
  const target = path.resolve(outPath);
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(target, JSON.stringify(result, null, 2), 'utf8');
  return result;
}

export class LeaderboardManager {
  constructor(filePath = null) {
    this.filePath = filePath;
    this.memoryEntries = [];
  }

  clear() {
    this.memoryEntries = [];
  }

  validateName(name) {
    return validatePlayerName(name);
  }

  addEntry(entry) {
    if (!this.validateName(entry.name)) {
      throw new Error('Invalid name');
    }
    this.memoryEntries.push({
      name: entry.name,
      score: entry.score,
      nights_won: entry.nights_won || 0,
      achieved_at: entry.achieved_at || new Date().toISOString(),
      seed: entry.seed || 0
    });
    this.memoryEntries = sortLeaderboardEntries(this.memoryEntries);
  }

  getEntries() {
    return this.memoryEntries;
  }
}
