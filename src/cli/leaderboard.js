#!/usr/bin/env node
import { exportLeaderboard, loadLeaderboard, addLeaderboardEntry } from '../core/leaderboard.js';

const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return null;
}

const exportPath = getArg('--export-leaderboard');

if (exportPath) {
  try {
    const result = exportLeaderboard(exportPath);
    console.log(`Leaderboard exported successfully to ${exportPath} (${result.entries.length} entries)`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to export leaderboard:', err);
    process.exit(1);
  }
} else {
  // Print current leaderboard
  const entries = loadLeaderboard();
  console.log('=== BẢNG XẾP HẠNG CỤC BỘ (TOP 10) ===');
  console.log('Hạng | Tên           | Điểm  | Đêm Thắng | Thời Điểm                 | Seed');
  console.log('-------------------------------------------------------------------------');
  entries.forEach((e, idx) => {
    const rank = String(idx + 1).padStart(4, ' ');
    const name = String(e.name).padEnd(13, ' ');
    const score = String(e.score).padStart(5, ' ');
    const nw = String(e.nights_won).padStart(9, ' ');
    const date = String(e.achieved_at).padEnd(25, ' ');
    console.log(`${rank} | ${name} | ${score} | ${nw} | ${date} | ${e.seed}`);
  });
}
