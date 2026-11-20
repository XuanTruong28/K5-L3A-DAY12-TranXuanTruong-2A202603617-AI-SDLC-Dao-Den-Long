# Đảo Đèn Lồng — Game 3D (Day 12 AI SDLC)

> **Tác giả:** Trần Xuân Trường · **MSSV:** 2A202603617 · **Lớp:** K5-L3A  
> **Phiên bản:** v1.0.0 (Phase 4 — Release) · **Test Contract:** v1.3  
> **Demo Video:** Github Release · [Tải bản HD (GitHub Release)](https://github.com/XuanTruong28/K5-L3A-DAY12-TranXuanTruong-2A202603617-AI-SDLC-Dao-Den-Long/releases/download/v1.0.0/demo.mp4)

---

## 1. Giới Thiệu Ngắn

**Đảo Đèn Lồng** là trò chơi hành động phiêu lưu 3D phong cách nghệ thuật *Sky: Children of the Light*, được xây dựng trên nền tảng WebGL (Three.js) và Node.js. Người chơi hóa thân thành bé Mây nhỏ bé, thu thập những đốm sáng đom đóm trong đêm tối mịt mùng để thắp sáng và duy trì nhiên liệu cho các ngọn đèn lồng cổ kính trên các hòn đảo lơ lửng, đồng thời né tránh và đẩy lùi những thực thể Mây Đen (Bóng Mực) tham lam chực chờ hút cạn nguồn sáng.

---

## 2. Cài Đặt & Chơi (Tối Đa 3 Lệnh)

Yêu cầu môi trường: **Node.js (v18 trở lên)** trên Windows, macOS hoặc Linux.

```bash
# 1. Cài đặt thư viện phụ thuộc
npm install

# 2. Chạy toàn bộ 33 test tự động (bao gồm Test Contract v1.3, Soak, Leaderboard, Accessibility)
npm test

# 3. Khởi chạy máy chủ phát triển và chơi ngay trên trình duyệt
npm run dev
```

*Sau khi chạy `npm run dev`, mở trình duyệt truy cập `http://localhost:5173` (hoặc cổng hiển thị trên terminal).*

---

## 3. Điều Khiển & Tính Năng Tiếp Cận (Accessibility)

### Phím Điều Khiển Mặc Định
- **Di chuyển 4 hướng:** `W`, `A`, `S`, `D` (hoặc các phím mũi tên)
- **Nhảy cao:** Phím `Space`
- **Lướt nhanh (Dash):** Phím `Shift` (trái hoặc phải)
- **Tương tác (Thắp đèn / Châm dầu):** Phím `E`
- **Tỏa Sáng (Pulse):** Phím `F` hoặc `Q` (làm choáng và đẩy lùi Bóng Mực)
- **Tạm dừng (Pause):** Phím `Escape` hoặc `P`
- **Chơi lại (Restart):** Phím `R`
- **Xoay góc nhìn Camera:** Giữ chuột trái hoặc chuột phải và kéo

### Tính Năng Hỗ Trợ Tiếp Cận Toàn Diện
Game tích hợp bảng tùy chọn Trợ năng tại màn hình chính và menu tạm dừng:
1. **Đổi phím tự do (Key Rebinding):** Cho phép gán lại phím bấm cho mọi hành động di chuyển, nhảy, lướt, tương tác, tỏa sáng, tạm dừng. Hệ thống tự động cảnh báo khi bị trùng phím và có nút "Khôi phục mặc định". Phím cài đặt được lưu bền vững trên máy.
2. **Phụ đề & Chỉ báo trực quan (Subtitles & Visual Alerts):**
   - Thông báo chữ và biểu tượng khi Mây Đen xuất hiện và đuổi theo.
   - Mũi tên chỉ hướng ở mép màn hình định vị ngọn đèn lồng chưa sáng hoặc sắp cạn dầu.
   - Cảnh báo gió mạnh Đảo Chuông trước khi gió thổi.
   - Báo động đếm ngược 10 giây cuối cùng trước bình minh.
   - Cảnh báo đèn lồng có dầu dưới 30% đang nhấp nháy.
3. **Giảm chuyển động (Reduce Motion):** Tắt rung camera và hiệu ứng chớp sáng màn hình, phù hợp với người dùng nhạy cảm tiền đình.
4. **Cỡ chữ UI & Chế độ chữ lớn:** Cỡ chữ cơ sở tối thiểu 18px ở độ phân giải 1280×720; có tùy chọn Phóng to chữ (×1.25).
5. **Chế độ mù màu (Colorblind Mode):** Tối ưu hóa bảng màu tương phản cao (xanh lam `#00B3FF` thay cho tím sẫm) và bổ sung ký hiệu cảnh báo `⚠`.

---

## 4. Các Chế Độ Kiểm Thử & CLI (Test Contract v1.3)

### 4.1. Chạy Toàn Bộ Test Tự Động
```bash
npm test
```
Kiểm tra 33 trường hợp test: tính tất định, cấu trúc snapshot, cơ chế 3 đêm, hệ thống nhiên liệu, AI Bóng Mực hút dầu, bảng xếp hạng và khả năng chịu tải.

### 4.2. Chế Độ Mô Phỏng Không Giao Diện (Headless CLI)
```bash
# Chạy Đêm 1 với seed 42 trong 300 tick, xuất kết quả ra file JSONL
node src/cli/headless.js --seed 42 --night 1 --ticks 300 --out output.jsonl --snapshot-every 10

# Chạy với kịch bản và input tùy chọn
node src/cli/headless.js --seed 123 --night 2 --scenario scenario.json --inputs inputs.json --ticks 600 --out result.jsonl
```

### 4.3. Chế Độ Đo Hiệu Năng (Benchmark Mode)
Chạy cảnh chuẩn với 200 Bóng Mực `wander`, 100 đom đóm, 3 đèn sáng đầy dầu, camera bay tròn 30m quanh tâm đảo:
```bash
node src/cli/bench.js --seed 42 --duration 30 --out bench.json
```
Output `bench.json` đạt chuẩn: `avg_fps >= 60`, `p1_low_fps >= 30`, `load_ms <= 10000`.

### 4.4. Chế Độ Chạy Lâu (Soak Test)
Chạy headless liên tục 10 Đêm (xoay vòng Đêm 1 $\to$ 2 $\to$ 3) với chuỗi input ngẫu nhiên trong cùng một tiến trình:
```bash
node src/cli/soak.js --seed 7 --nights 10 --out soak.json
```
Output `soak.json` đảm bảo `crashes === 0` và `mem_end_mb <= 1.2 * mem_start_mb`.

### 4.5. Xuất Bảng Xếp Hạng Cục Bộ (Leaderboard Export)
```bash
node src/cli/leaderboard.js --export-leaderboard out.json
# Hoặc thông qua headless CLI:
node src/cli/headless.js --export-leaderboard out.json
```

---

## 5. Cấu Trúc Thư Mục Dự Án

```
├── game.contract.json       # Đặc tả Test Contract v1.3
├── AGENTS.md                # Chỉ dẫn vận hành dành cho AI Agent
├── CHANGELOG.md             # Lịch sử phiên bản qua 4 phase
├── CREDITS.md               # Bản quyền tác giả, asset & công cụ AI
├── LICENSE                  # Giấy phép phần mềm MIT
├── bench.json               # Kết quả benchmark mẫu đo trên hệ thống
├── soak.json                # Kết quả soak test mẫu 10 đêm
├── src/
│   ├── core/                # Logic mô phỏng trò chơi thuần túy (Contract v1.3)
│   │   ├── constants.js     # Hằng số chuẩn hóa của trò chơi
│   │   ├── math.js          # Toán học 3D, mặt phẳng XZ, làm tròn round1/round3
│   │   ├── prng.js          # Bộ sinh số ngẫu nhiên Mulberry32
│   │   ├── simulation.js    # Vòng lặp mô phỏng 60Hz 12 bước tất định
│   │   └── leaderboard.js   # Quản lý bảng xếp hạng Top 10
│   ├── cli/                 # Các công cụ dòng lệnh (CLI runners)
│   │   ├── headless.js      # Headless runner xuất snapshot JSONL
│   │   ├── bench.js         # Benchmark runner xuất bench.json
│   │   ├── soak.js          # Soak test runner xuất soak.json
│   │   └── leaderboard.js   # CLI export bảng xếp hạng
│   └── render/              # Hiển thị đồ họa 3D Three.js & Giao diện người dùng
│       └── main.js          # Game loop, rendering, âm thanh thủ tục, HUD
├── tests/                   # Bộ test tự động (33 unit tests)
│   ├── headless.test.js     # Kiểm thử Headless CLI & Contract v1.0
│   ├── phase2_features.test.js # Kiểm thử tính năng Đêm 2 & 3 (Contract v1.1)
│   ├── phase3_features.test.js # Kiểm thử hệ thống nhiên liệu (Contract v1.2)
│   ├── phase4_features.test.js # Kiểm thử Benchmark, Soak, Leaderboard, Keybinds
│   └── simulation.test.js   # Kiểm thử chi tiết các cơ chế mô phỏng cốt lõi
└── docs/                    # Tài liệu kiến trúc và báo cáo
    ├── notes/
    │   ├── phase-3-adr.md
    │   ├── phase-3-spec.md
    │   ├── phase-3-changelog.md
    │   ├── phase-4-retro.md # Bản Retro tổng kết 4 phase
    │   └── ai_log.md
    └── proof/               # Bằng chứng kiểm chứng kết quả
```
