# AGENTS.md — Hướng Dẫn Dành Cho AI Agent (Harness)

Dự án: **Đảo Đèn Lồng (Day 12 - AI SDLC)**  
Giai đoạn: **Phase 4 (Ticket-04 — "Bình minh: phát hành v1.0.0", Test Contract v1.3)**

## 1. Thông Tin Cố Định & Lệnh
- **Ngôn ngữ:** JavaScript (ESM, Node.js 18+).
- **Lệnh cài đặt:** `npm install`
- **Lệnh test:** `npm test` (sử dụng Node test runner tích hợp `node --test tests/*.test.js`)
- **Lệnh chạy giao diện 3D:** `npm run dev`
- **Lệnh build:** `npm run build`
- **Lệnh chạy headless:** `node src/cli/headless.js --seed <int> --night <1|2|3> [--scenario <file.json>] [--inputs <file.json>] --ticks <int> --out <file.jsonl> [--snapshot-every <int>]`
- **Lệnh benchmark:** `node src/cli/bench.js --seed 42 --duration 30 --out bench.json`
- **Lệnh soak test:** `node src/cli/soak.js --seed 7 --nights 10 --out soak.json`
- **Lệnh xuất bảng xếp hạng:** `node src/cli/leaderboard.js --export-leaderboard <file.json>`

## 2. Kiến Trúc Dự Án
- `src/core/`: Toàn bộ logic mô phỏng trò chơi chuẩn hóa (Contract v1.3):
  - `constants.js`: Số liệu chuẩn bắt buộc Phase 3 & 4 (`CONTRACT_VERSION = '1.3'`, `fuel_max: 100`, `fuel_decay_per_s: 1.0`, `relight_cost: 5`, `win_ratio: 0.6`, `drain_per_s: 5`, `low_fuel_threshold: 30`, `capacity_max: 20`, thời gian Đêm 1/2/3: 240/270/300s, công thức điểm mới).
  - `math.js`: Hàm toán học 3D, mặt phẳng XZ, biến đổi góc camera, làm tròn 3 chữ số (`round3`), làm tròn 1 chữ số (`round1`).
  - `prng.js`: Bộ sinh số giả ngẫu nhiên tất định Mulberry32.
  - `leaderboard.js`: Quản lý Bảng Xếp Hạng Top 10, sắp xếp điểm giảm dần, tie-breaking theo thời gian, kiểm tra tên hợp lệ (3–12 ký tự `[A-Za-z0-9_]`).
  - `simulation.js`: Vòng lặp mô phỏng 60Hz tuân thủ đúng thứ tự 12 bước, hỗ trợ cờ `benchmark: true` để tắt sát thương, sinh quái và kết thúc đêm trong lúc benchmark.
  - **TUYỆT ĐỐI KHÔNG** import Three.js, DOM, window, document vào `src/core/`.
- `src/cli/`:
  - `headless.js`: CLI runner tuân thủ nghiêm ngặt Test Contract v1.3, xuất log JSONL và hỗ trợ `--export-leaderboard`.
  - `bench.js`: Runner đo hiệu năng chuẩn 1280×720, camera bay tròn 30m bán kính Y=15m CCW, xuất `bench.json`.
  - `soak.js`: Runner kiểm tra độ ổn định 10 đêm liên tiếp, xuất `soak.json` kiểm tra bộ nhớ không rò rỉ.
  - `leaderboard.js`: Runner xuất bảng xếp hạng cục bộ sang tệp JSON.
- `src/render/`: Three.js hiển thị đồ họa 3D mỹ thuật phong cách *Sky: Children of the Light*, thanh đo dầu 3D trên đèn lồng, đèn tắt xẹp 20% và rách giấy, đèn < 30 dầu nhấp nháy 1 Hz, phụ đề hình ảnh, đổi phím tự do, chế độ chữ lớn và chế độ mù màu.
- `tests/`: Bộ test tự động kiểm chứng 100% tính năng Phase 1, 2, 3 và 4 (`tests/phase4_features.test.js`), tổng cộng 33 unit tests pass 100%.
- `docs/notes/`: Thiết kế kiến trúc ADR (`phase-3-adr.md`), đặc tả (`phase-3-spec.md`), nhật ký thay đổi (`phase-3-changelog.md`), bản hồi tưởng (`phase-4-retro.md`), nhật ký AI (`ai_log.md`).

## 3. Quy Ước Bắt Buộc (Contract v1.3)
- **Tính tất định (Deterministic):** Cùng seed, cùng scenario, cùng inputs phải cho ra output JSONL giống hệt nhau. Sử dụng PRNG (Mulberry32), không dùng `Math.random()`.
- **Tọa độ & Số liệu:** Trục Y hướng lên; tọa độ xuất ra JSON làm tròn đúng 3 chữ số thập phân (`round3`), nhiên liệu xuất ra làm tròn 1 chữ số thập phân (`round1`).
- **Nhiên liệu tính theo số nguyên:** Lưu trữ `fuel_sub` (60 sub-units = 1 đơn vị dầu) để triệt tiêu sai số số thực.
- **Tần số mô phỏng:** Cố định 60 tick/giây (1 tick = 1/60s).
- **Trạng thái Bóng Mực:** Phải dùng đúng các tên: `spawning`, `wander`, `chase`, `recoil`, `stunned`, `drain`.
- **Hiệu năng headless:** Một Đêm đầy đủ hoàn thành trong $\le 30$ giây.
- **Quy tắc sửa code:** Không được làm hỏng Test Contract. Mọi thay đổi logic phải được kiểm chứng lại bằng `npm test`.
- **Quy tắc Git:** Tuyệt đối không commit hoặc push khi chưa có lệnh rõ ràng từ người dùng.
