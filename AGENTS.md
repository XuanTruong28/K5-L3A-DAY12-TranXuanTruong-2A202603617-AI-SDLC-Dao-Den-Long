# AGENTS.md — Hướng Dẫn Dành Cho AI Agent (Harness)

Dự án: **Đảo Đèn Lồng (Day 12 - AI SDLC)**  
Giai đoạn: **Phase 2 (Ticket-02 — "Ba hòn đảo", Test Contract v1.1)**

## 1. Thông Tin Cố Định & Lệnh
- **Ngôn ngữ:** JavaScript (ESM, Node.js 18+).
- **Lệnh cài đặt:** `npm install`
- **Lệnh test:** `npm test` (sử dụng Node test runner tích hợp `node --test tests/*.test.js`)
- **Lệnh chạy giao diện 3D:** `npm run dev`
- **Lệnh build:** `npm run build`
- **Lệnh chạy headless:** `node src/cli/headless.js --seed <int> --night <1|2|3> [--scenario <file.json>] [--inputs <file.json>] --ticks <int> --out <file.jsonl> [--snapshot-every <int>]`

## 2. Kiến Trúc Dự Án
- `src/core/`: Toàn bộ logic mô phỏng trò chơi chuẩn hóa (Contract v1.1):
  - `constants.js`: Số liệu chuẩn bắt buộc, bản đồ 3 Đêm (Đảo Bến, Đảo Cau, Đảo Chuông), tọa độ đèn, điểm sinh.
  - `math.js`: Hàm toán học 3D, mặt phẳng XZ, biến đổi góc camera, làm tròn 3 chữ số.
  - `prng.js`: Bộ sinh số giả ngẫu nhiên tất định Mulberry32.
  - `simulation.js`: Vòng lặp mô phỏng 60Hz tuân thủ đúng thứ tự 12 bước (xử lý pause, giảm bộ đếm, di chuyển Mây/lướt/bục nhảy/gió, nhặt đom đóm/bùa, tương tác đèn, vùng an toàn, tỏa sáng, di chuyển bóng mực/gió lạc, va chạm, sinh theo lịch, xét thắng/thua, snapshot v1.1).
  - **TUYỆT ĐỐI KHÔNG** import Three.js, DOM, window, document vào `src/core/`.
- `src/cli/headless.js`: CLI runner tuân thủ nghiêm ngặt Test Contract v1.1. Nhận `--night 1|2|3`, xử lý `dash` và `pause`, ghi snapshot và event đầy đủ.
- `src/render/`: Three.js hiển thị đồ họa 3D mỹ thuật phong cách *Sky: Children of the Light*, mô hình Mây nón lá tà áo bay bổng, tháp đèn lồng pagoda chuyển sáng mượt mà, bộ tổng hợp âm thanh Web Audio Synthesizer, camera góc nhìn thứ 3 mượt mà.
- `tests/`: Bộ test tự động kiểm chứng 100% tính năng mới của Phase 2, hồi quy Phase 1, tính tất định trên cả 3 Đêm và kiểm thử hiệu năng full 21.600 tick.
- `docs/notes/`: Đặc tả tính năng Phần 3 (`phase-2-spec.md`), nhật ký giả định (`phase-2-assumptions.md`), nhật ký AI (`ai_log.md`).
- `docs/proof/phase-2/`: Lưu trữ bằng chứng kiểm chứng của Phase 2.

## 3. Quy Ước Bắt Buộc (Contract v1.1)
- **Tính tất định (Deterministic):** Cùng seed, cùng scenario, cùng inputs phải cho ra output JSONL giống hệt nhau. Sử dụng PRNG (Mulberry32), không dùng `Math.random()`.
- **Tọa độ:** Trục Y hướng lên; tọa độ xuất ra JSON làm tròn đúng 3 chữ số thập phân (`round3`).
- **Tần số mô phỏng:** Cố định 60 tick/giây (1 tick = 1/60s).
- **Trạng thái Bóng Mực:** Phải dùng đúng các tên: `spawning`, `wander`, `chase`, `recoil`, `stunned`.
- **Hiệu năng headless:** Một Đêm đầy đủ (21.600 tick) hoàn thành trong $\le 30$ giây.
- **Quy tắc sửa code:** Không được làm hỏng Test Contract. Mọi thay đổi logic phải được kiểm chứng lại bằng `npm test`.
