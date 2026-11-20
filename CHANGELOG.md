# Changelog — Đảo Đèn Lồng

Toàn bộ lịch sử phát triển dự án qua 4 giai đoạn (Phase 1 → Phase 4), tuân thủ nghiêm ngặt Test Contract v1.0, v1.1, v1.2 và v1.3.

---

## [1.0.0] - 2026-11-20 (Phase 4 — Ticket-04: "Bình minh: phát hành v1.0.0")

### Added
- **Test Contract v1.3 (`game.contract.json`):** Bổ sung trường `contract_version: "1.3"`, các lệnh `bench_cmd`, `soak_cmd`, `leaderboard_cmd`.
- **Benchmark Mode (`src/cli/bench.js`):**
  - Khởi chạy cảnh benchmark chuẩn: 1280×720, Night 1, 200 Bóng Mực ở trạng thái `wander` (seed 42), 100 đom đóm, 3 đèn L1–L3 thắp sáng với fuel 100.
  - Tắt sinh thực thể, sát thương, nhặt đom đóm, hao dầu và điều kiện kết thúc đêm.
  - Mây đứng yên tại `(0, 0, 0)`, camera bay vòng tròn bán kính 30m, độ cao Y = 15m, luôn nhìn vào `(0, 0, 0)`, xuất phát tại góc 0° `(30, 15, 0)`, quay CCW 15s/vòng.
  - Khởi động 3s warmup, đo đạc `--duration` giây, xuất `bench.json` chuẩn (`avg_fps >= 60`, `p1_low_fps >= 30`, `load_ms <= 10000`).
- **Soak Test (`src/cli/soak.js`):**
  - Chạy headless 10 Đêm liên tiếp trong cùng một tiến trình (vòng lặp Đêm 1 → 2 → 3), mỗi đêm dùng seed `7 + i`.
  - Input giả lập ngẫu nhiên: mỗi 30 tick đổi hướng, xác suất 5% nhảy, 3% lướt, 2% tỏa sáng, 10% tương tác.
  - Xuất `soak.json`: kiểm tra `crashes === 0` và `mem_end_mb <= 1.2 * mem_start_mb`.
- **Bảng Xếp Hạng Cục Bộ (Local Leaderboard):**
  - Lưu trữ top 10 điểm cao nhất, lưu bền vững trên đĩa (`localStorage` trên Web và JSON file trên CLI).
  - Quy tắc sắp xếp: Điểm giảm dần (`score` desc), bằng điểm thì ai đạt trước đứng trên (`achieved_at` asc).
  - Validation tên người chơi: 3–12 ký tự `[A-Za-z0-9_]` (hỗ trợ tiếng Việt).
  - CLI Export: `node src/cli/leaderboard.js --export-leaderboard out.json` và `node src/cli/headless.js --export-leaderboard out.json`.
- **Tính Năng Tiếp Cận Toàn Diện (Accessibility):**
  - Đổi phím (Key Rebinding): Đổi phím 4 hướng di chuyển, nhảy, lướt, tương tác, tỏa sáng, tạm dừng; tự động phát hiện trùng phím và cảnh báo; có nút "Khôi phục mặc định".
  - Phụ đề & Chỉ báo hình ảnh (Subtitles & Visual Alerts): Cảnh báo Mây Đen xuất hiện và đuổi theo kèm mũi tên chỉ hướng mép màn hình, gió Đảo Chuông sắp thổi, 10 giây cuối trước bình minh, đèn lồng có dầu < 30%.
  - Giảm chuyển động (Reduce Motion): Tắt rung camera và chớp màn hình.
  - Phóng to cỡ chữ (Large Text Mode): Tối thiểu 18px ở 1280×720, tùy chọn phóng to 1.25x.
- **Bộ Test Mới (`tests/phase4_features.test.js`):** 6 test kiểm thử toàn bộ tính năng Phase 4, nâng tổng số test tự động lên 33/33 pass.
- **Tài liệu Retro (`docs/notes/phase-4-retro.md`):** Tổng kết chi tiết quá trình phối hợp AI qua cả 4 phase.

---

## [0.3.0] - 2026-11-20 (Phase 3 — Ticket-03: "Đèn cạn dầu")

### Added
- **Test Contract v1.2:** Cập nhật các thông số chuẩn hóa: `fuel_max: 100`, `fuel_decay_per_s: 1.0`, `relight_cost: 5`, `win_ratio: 0.6`, `drain_per_s: 5`, `low_fuel_threshold: 30`, `capacity_max: 20`, thời lượng đêm: 240s / 270s / 300s.
- **Hệ Thống Nhiên Liệu Đèn Lồng:**
  - Nhiên liệu số nguyên nội bộ `fuel_sub` (60 sub-units = 1 đơn vị dầu) triệt tiêu sai số số thực.
  - Đèn hao hụt 1.0 đơn vị/s khi đang sáng; Bóng Mực hút dầu 5.0 đơn vị/s khi ở cự ly $\le 2$m.
  - Đèn hết dầu chuyển sang tắt, phát sự kiện `lantern_out`.
  - Châm dầu khi đèn đang sáng (`refuel`), thắp lại đèn đã tắt chỉ tốn 5 đom đóm (`relight_cost = 5`).
- **Sức Chứa Đom Đóm Tăng Dần:**
  - Khởi đầu 10 đom đóm, mỗi lần thắp sáng thành công một ngọn đèn tăng +2 sức chứa: $\text{capacity} = \min(20, 10 + 2 \times \text{successful\_lights})$.
- **Hành Vi Bóng Mực Mới:**
  - Trạng thái `drain`: Bóng Mực ưu tiên tìm đèn yếu (`fuel < 30`) gần nhất để hút dầu.
  - Tỏa Sáng (Pulse) trúng Bóng Mực đang hút dầu thưởng `+15` điểm (thay vì `+5`).
- **Luật Thắng Bình Minh Mới:**
  - Thắng tại bình minh `dawn_survived` khi số đèn sáng $\ge \lceil 0.6 \times \text{tổng đèn}\rceil$. Không còn thắng sớm `all_lit`.
- **Giao Diện & Tiếp Cận Mù Màu:**
  - Thanh đo dầu 3D hiển thị trực quan trên từng đèn lồng (đổi màu xanh $\to$ vàng $\to$ đỏ).
  - Đèn tắt xẹp 20% và rách giấy; đèn < 30% dầu nhấp nháy 1 Hz.
  - Chế độ mù màu (Colorblind Mode): Bảng màu dễ phân biệt (`#00B3FF`) và cảnh báo biểu tượng `⚠`.

---

## [0.2.0] - 2026-11-20 (Phase 2 — Ticket-02: "Hành trình ba đêm")

### Added
- **Test Contract v1.1:** Mở rộng kịch bản chơi qua 3 đêm liên tiếp.
- **Đêm 2 (Đảo Cau):** Bản đồ 2 đảo liên kết bởi cầu tre hẹp, bệ phóng nhảy cao đưa Mây vượt vực thẳm.
- **Đêm 3 (Đảo Chuông):** Bản đồ 3 tầng xếp chồng theo bậc thang, bệ phóng nhảy lên tầng cao nhất; chướng ngại tháp chuông.
- **Cơ Chế Gió Đảo Chuông (Night 3):** Gió giật theo chu kỳ, tác động lực đẩy vector lên Mây.
- **Kẻ Địch Mới & Cơ Chế Phụ Trợ:**
  - **Gió Lạc (Drifters):** Chuyên rình rập người chơi mang $\ge 5$ đom đóm, cướp đoạt và bỏ chạy.
  - **Bùa Gió (Charms):** Thu thập tăng tốc chạy lên 7.2 m/s và lướt không tốn hồi chiêu trong thời gian hiệu lực.

---

## [0.1.0] - 2026-11-20 (Phase 1 — Ticket-01: "Hạt giống ánh sáng")

### Added
- **Test Contract v1.0:** Kiến trúc tất định (Mulberry32 PRNG), mô phỏng 60Hz.
- **Đêm 1 (Đảo Bến):** 5 ngọn đèn lồng lớn `L1`–`L5`, đom đóm phát sáng ngẫu nhiên trên đảo.
- **Hệ Thống Điều Khiển Mây:** Di chuyển 4 hướng XZ, nhảy, lướt (dash), nhặt đom đóm, nạp đèn, tỏa sáng (pulse).
- **Bóng Mực Cơ Bản:** Di chuyển tuần tra (`wander`), phát hiện và truy đuổi (`chase`), đẩy lùi khi bị Tỏa Sáng (`recoil`).
- **Chế Độ Headless CLI (`src/cli/headless.js`):** Xuất log JSONL từng tick hoặc theo chu kỳ snapshot, phục vụ chấm điểm tự động.
- **Bộ Test Tự Động:** Kiểm chứng tính tất định, cấu trúc snapshot, cơ chế game play cơ bản.
