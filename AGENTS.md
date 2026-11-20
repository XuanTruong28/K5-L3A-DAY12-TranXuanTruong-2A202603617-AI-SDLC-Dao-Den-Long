# AGENTS.md — Hướng Dẫn Dành Cho AI Agent (Harness)

Dự án: **Đảo Đèn Lồng (Day 12 - AI SDLC)**  
Giai đoạn: **Phase 3 (Ticket-03 — "Đèn cạn dầu", Test Contract v1.2)**

## 1. Thông Tin Cố Định & Lệnh
- **Ngôn ngữ:** JavaScript (ESM, Node.js 18+).
- **Lệnh cài đặt:** `npm install`
- **Lệnh test:** `npm test` (sử dụng Node test runner tích hợp `node --test tests/*.test.js`)
- **Lệnh chạy giao diện 3D:** `npm run dev`
- **Lệnh build:** `npm run build`
- **Lệnh chạy headless:** `node src/cli/headless.js --seed <int> --night <1|2|3> [--scenario <file.json>] [--inputs <file.json>] --ticks <int> --out <file.jsonl> [--snapshot-every <int>]`

## 2. Kiến Trúc Dự Án
- `src/core/`: Toàn bộ logic mô phỏng trò chơi chuẩn hóa (Contract v1.2):
  - `constants.js`: Số liệu chuẩn bắt buộc Phase 3 (`CONTRACT_VERSION = '1.2'`, `fuel_max: 100`, `fuel_decay_per_s: 1.0`, `relight_cost: 5`, `win_ratio: 0.6`, `drain_per_s: 5`, `low_fuel_threshold: 30`, `capacity_max: 20`, thời gian Đêm 1/2/3: 240/270/300s, công thức điểm mới).
  - `math.js`: Hàm toán học 3D, mặt phẳng XZ, biến đổi góc camera, làm tròn 3 chữ số (`round3`), làm tròn 1 chữ số (`round1`).
  - `prng.js`: Bộ sinh số giả ngẫu nhiên tất định Mulberry32.
  - `simulation.js`: Vòng lặp mô phỏng 60Hz tuân thủ đúng thứ tự 12 bước:
    - Bước 2: Trừ dầu đèn sáng (-1 sub-unit/tick), trừ dầu bị Bóng Mực hút (-5 sub-unit/tick, phát sự kiện `fuel_drain` mỗi 60 tick). Ngay sau Bước 2: đèn `fuel <= 0` chuyển sang tắt, phát `lantern_out`.
    - Bước 4: Sức chứa tăng dần theo `capacity = min(20, 10 + 2 * successful_lights)`.
    - Bước 5: Tương tác chọn đèn chưa sáng hoặc sáng nhưng chưa đầy dầu (`fuel < 100`). Châm dầu phát `refuel`, thắp phát `lantern_lit { relight: true|false }`, đẩy quái ra mép vùng 6m khi fuel $\ge 30$.
    - Bước 6: Chỉ đèn sáng có `fuel >= 30` mới có vùng an toàn.
    - Bước 7: Tỏa Sáng stun quái (+5 điểm, hoặc +15 nếu quái đang `drain`).
    - Bước 8: Quái `wander` ưu tiên đèn yếu (`fuel < 30`) gần nhất để chuyển sang `drain` khi $\le 2$m.
    - Bước 11: Luật thắng mới tại bình minh `dawn_survived` khi số đèn sáng $\ge \lceil 0.6 \times \text{tổng đèn}\rceil$. Không còn thắng sớm `all_lit`.
  - **TUYỆT ĐỐI KHÔNG** import Three.js, DOM, window, document vào `src/core/`.
- `src/cli/headless.js`: CLI runner tuân thủ nghiêm ngặt Test Contract v1.2. Nhận `--night 1|2|3`, ghi snapshot và event đầy đủ.
- `src/render/`: Three.js hiển thị đồ họa 3D mỹ thuật phong cách *Sky: Children of the Light*, thanh đo dầu 3D trên đèn lồng, đèn tắt xẹp 20% và rách giấy, đèn < 30 dầu nhấp nháy 1 Hz, chế độ mù màu (Bảng màu dễ phân biệt `#00B3FF` và cảnh báo `#FFFFFF` + `⚠`).
- `tests/`: Bộ test tự động kiểm chứng 100% tính năng mới của Phase 3 (`tests/phase3_features.test.js`), hồi quy Phase 1 & 2, Contract v1.2.
- `docs/notes/`: Thiết kế kiến trúc ADR (`phase-3-adr.md`), đặc tả (`phase-3-spec.md`), nhật ký thay đổi phá vỡ tương thích (`phase-3-changelog.md`), nhật ký AI (`ai_log.md`).
- `docs/proof/phase-3/`: Lưu trữ bằng chứng kiểm chứng của Phase 3.

## 3. Quy Ước Bắt Buộc (Contract v1.2)
- **Tính tất định (Deterministic):** Cùng seed, cùng scenario, cùng inputs phải cho ra output JSONL giống hệt nhau. Sử dụng PRNG (Mulberry32), không dùng `Math.random()`.
- **Tọa độ & Số liệu:** Trục Y hướng lên; tọa độ xuất ra JSON làm tròn đúng 3 chữ số thập phân (`round3`), nhiên liệu xuất ra làm tròn 1 chữ số thập phân (`round1`).
- **Nhiên liệu tính theo số nguyên:** Lưu trữ `fuel_sub` (60 sub-units = 1 đơn vị dầu) để triệt tiêu sai số số thực.
- **Tần số mô phỏng:** Cố định 60 tick/giây (1 tick = 1/60s).
- **Trạng thái Bóng Mực:** Phải dùng đúng các tên: `spawning`, `wander`, `chase`, `recoil`, `stunned`, `drain`.
- **Hiệu năng headless:** Một Đêm đầy đủ hoàn thành trong $\le 30$ giây.
- **Quy tắc sửa code:** Không được làm hỏng Test Contract. Mọi thay đổi logic phải được kiểm chứng lại bằng `npm test`.
