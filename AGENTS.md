# AGENTS.md — Hướng Dẫn Dành Cho AI Agent (Harness)

Dự án: **Đảo Đèn Lồng (Day 12 - AI SDLC)**

## 1. Thông Tin Cố Định & Lệnh
- **Ngôn ngữ:** JavaScript (ESM, Node.js 18+).
- **Lệnh cài đặt:** `npm install`
- **Lệnh test:** `npm test` (sử dụng Node test runner tích hợp `node --test tests/*.test.js`)
- **Lệnh chạy giao diện 3D:** `npm run dev`
- **Lệnh chạy headless:** `node src/cli/headless.js [args]`

## 2. Kiến Trúc Dự Án
- `src/core/`: Toàn bộ logic trò chơi thuần túy (Mây, đom đóm, lồng đèn, bóng mực, va chạm, tính điểm, tất định). **TUYỆT ĐỐI KHÔNG** import Three.js, DOM, window, document vào thư mục này để đảm bảo headless 100% không phụ thuộc đồ họa.
- `src/cli/`: Headless runner tuân thủ nghiêm ngặt Test Contract v1.0. Nhận CLI args (`--seed`, `--night`, `--ticks`, `--out`, v.v.), xuất JSONL định dạng chuẩn.
- `src/render/`: Three.js hiển thị đồ họa 3D, camera góc nhìn thứ 3, âm thanh, hiệu ứng.
- `tests/`: Bộ test tự động kiểm chứng logic, kịch bản scenario và tính tất định.
- `docs/notes/`: Ghi chú giả định, nhật ký AI và retro.
- `docs/proof/`: Lưu trữ bằng chứng kiểm chứng của từng phase.

## 3. Quy Ước Bắt Buộc
- **Tính tất định (Deterministic):** Cùng seed, cùng scenario, cùng inputs phải cho ra output JSONL giống hệt nhau. Sử dụng PRNG (Mulberry32 hoặc xorshift32), không dùng `Math.random()`.
- **Tọa độ:** Trục Y hướng lên; mặt đất ở Y = 0; người chơi xuất phát tại `(0, 0, 0)`. Tọa độ xuất ra JSON làm tròn đúng 3 chữ số thập phân (`.toFixed(3)`).
- **Tần số mô phỏng:** Cố định 60 tick/giây (1 tick = 1/60s).
- **Quy tắc sửa code:** Không được làm hỏng Test Contract. Mọi thay đổi logic phải được kiểm chứng lại bằng `npm test`.
