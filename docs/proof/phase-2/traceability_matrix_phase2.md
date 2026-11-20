# Ma Trận Truy Vết Yêu Cầu Phase 2 (Traceability Matrix — Phase 2)

**Dự án:** Đảo Đèn Lồng (Ticket-02 — "Ba hòn đảo", Contract v1.1)  
**Sinh viên:** Trần Xuân Trường (2A202603617) · Lớp: K5-L3A  

| Mã Yêu Cầu | Nội Dung Yêu Cầu (Ticket-02) | File Triển Khai | Kiểm Thử / Bằng Chứng | Trạng Thái |
|:---|:---|:---|:---|:---:|
| **REQ-TUN-01** | Đồng bộ số liệu chuẩn (Tốc độ 6.0 m/s, Nhảy 7.0 m/s, Trọng lực -20 m/s², Đèn 10 đom đóm, Đom đóm nhặt XZ $\le 1.0$, $\Delta Y \le 1.5$, Sức chứa 10) | `src/core/constants.js`, `game.contract.json` | `tests/simulation.test.js` (Mote & Lantern tests) | ✅ Đạt |
| **REQ-DSH-01** | Lướt (Dash) 14 m/s trong 0.2s (12 ticks), hồi chiêu 1.5s (90 ticks), giữ độ cao trên không | `src/core/simulation.js` (Step 3a, 3d) | `tests/simulation.test.js` (Dash test) | ✅ Đạt |
| **REQ-MAP-01** | Chuẩn hóa Đêm 1 (Đảo Bến, R=40m, 5 đèn L1..L5, 24 điểm đom đóm, 12 điểm bóng mực) | `src/core/constants.js`, `src/core/simulation.js` | `docs/proof/phase-2/scenario_night1.jsonl` | ✅ Đạt |
| **REQ-MAP-02** | Bản đồ Đêm 2 (Đảo Cau, 2 đảo R=28m, cầu tre $x \in [26,44]$, 2 bục nhảy $V_y=14, V_h=24$, 6 đèn L1..L6) | `src/core/constants.js`, `src/core/simulation.js` | `tests/simulation.test.js` (Night 2 bridge & pad test), `docs/proof/phase-2/scenario_night2.jsonl` | ✅ Đạt |
| **REQ-MAP-03** | Bản đồ Đêm 3 (Đảo Chuông, 3 tầng Y=0, Y=3, Y=6, 2 dốc 30° và 150°, tháp chuông R=2m, bục nhảy lên tầng 2, 7 đèn L1..L7) | `src/core/constants.js`, `src/core/simulation.js` | `tests/phase2_features.test.js` (Tier, ramp, jump pad, bell tower test), `docs/proof/phase-2/scenario_night3.jsonl` | ✅ Đạt |
| **REQ-WND-01** | Gió mạnh Đêm 3 (chu kỳ 30s, kéo dài 5s, đẩy 2 m/s hướng ngẫu nhiên, cảnh báo 2s) | `src/core/simulation.js` (`updateWind()`) | `tests/phase2_features.test.js` (Wind test) | ✅ Đạt |
| **REQ-DRF-01** | Gió Lạc (Drifter Đêm 2 & 3, tốc độ 7 m/s, cướp $\min(3, \text{carried})$ khi XZ $\le 1.2$m, flee 240 tick, rơi đồ khi bị Pulse) | `src/core/simulation.js` (Step 7, 8, 9, 10) | `tests/simulation.test.js` (Drifter test) | ✅ Đạt |
| **REQ-CHM-01** | Bùa Gió (Charm C1/C2, tăng tốc 7.2 m/s, Lướt không hồi chiêu trong 600 tick, hồi sinh 2700 tick) | `src/core/simulation.js` (Step 3a, 4, 2) | `tests/simulation.test.js` (Charm test) | ✅ Đạt |
| **REQ-PAU-01** | Tạm dừng (Esc/P, đóng băng sim_tick và mọi bộ đếm, tick tổng tăng, phát event paused/resumed) | `src/core/simulation.js` (Step 1) | `tests/simulation.test.js` (Pause test), `docs/proof/phase-2/scenario_dash_charm.jsonl` | ✅ Đạt |
| **REQ-FLM-01** | Rơi khỏi đảo ($Y < -10$, trừ 1 Ngọn Lửa, mất sạch đom đóm, chờ 60 tick, hồi sinh bất tử 90 tick) | `src/core/simulation.js` (Step 3f) | `tests/simulation.test.js` (Fall test) | ✅ Đạt |
| **REQ-CTR-01** | Test Contract v1.1 Snapshot Schema (`night`, `wind`, `player.vel`, `grounded`, `motes[]`, `drifters[]`, `charms[]`) | `src/core/simulation.js` (`getSnapshot`) | `tests/contract_headless.test.js` | ✅ Đạt |
| **REQ-PRF-01** | Hiệu năng headless chạy 21.600 tick $\le 30$ giây | `src/cli/headless.js` | `tests/phase2_features.test.js` (Thực tế: ~210 ms) | ✅ Đạt |
| **REQ-3DR-01** | Đồ họa 3D mỹ thuật Sky Children (Mây nón lá tà áo bay, đèn pagoda thắp sáng tự nhiên, đom đóm phát sáng mềm) | `src/render/main.js`, `index.html` | Kiểm chứng `vite build` & `npm run dev` | ✅ Đạt |
| **REQ-AUD-01** | Web Audio Synthesizer (Âm thanh nhặt, thắp đèn, tỏa sáng, lướt, nhảy, bị đánh) | `src/render/main.js` (`SoundSynth`) | Kiểm chứng tương tác trình duyệt | ✅ Đạt |
