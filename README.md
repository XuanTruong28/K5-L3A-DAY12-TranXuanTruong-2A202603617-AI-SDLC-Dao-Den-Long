# Đảo Đèn Lồng — Game 3D (Day 12 AI SDLC)

> **Học viên:** Trần Xuân Trường · **MSSV:** 2A202603617 · **Lớp:** K5-L3A  
> **Demo Video:** [Link Demo Video](docs/demo/demo.mp4) *(sẽ cập nhật bản quay trong Phase 4 / Release v1.0.0)*

---

## 1. Cài đặt và Chạy (Tối đa 3 lệnh)

Yêu cầu môi trường: **Node.js (v18+)** trên macOS, Linux hoặc Windows.

```bash
# 1. Cài đặt thư viện
npm install

# 2. Chạy toàn bộ kiểm thử tự động (Unit test, Headless contract, Tính tất định)
npm test

# 3. Mở game 3D trực tiếp trên trình duyệt
npm run dev
```

---

## 2. Điều Khiển Game

- **Di chuyển:** `W, A, S, D` hoặc các phím mũi tên.
- **Thắp Đèn Lồng:** `E` hoặc `Space` khi đứng gần Đèn Lồng Lớn.
- **Tỏa Sáng (Pulse):** `F` hoặc `Q` (tiêu tốn 1 đom đóm, làm choáng và đẩy lùi Bóng Mực).
- **Xoay Camera:** Giữ chuột phải và kéo chuột.
- **Chơi lại (Restart):** Phím `R` hoặc bấm nút trên màn hình thông báo.

---

## 3. Cơ Chế & Cách Tính Điểm

- **Mục tiêu:** Điều khiển Mây thu thập các đốm sáng (đom đóm, tối đa 5 đốm) và mang về thắp sáng 5 Đèn Lồng Lớn (`L1` đến `L5`). Mỗi đèn cần 3 đom đóm.
- **Bóng Mực (Shades):** Đuổi theo Mây trong bóng tối; va chạm làm mất 1 mạng (`flames`) và rơi rớt đom đóm. Mất hết mạng sẽ thua.
- **Cách tính điểm:**
  - Nhặt 1 đom đóm: `+10` điểm.
  - Thắp sáng 1 Đèn Lồng Lớn: `+200` điểm.
  - Làm choáng 1 Bóng Mực bằng chiêu Tỏa Sáng (Pulse): `+30` điểm.
  - Khi chiến thắng: `+5` điểm cho mỗi giây còn lại, `+100` điểm cho mỗi mạng (`flames`) còn lại.

---

## 4. Chế Độ Headless (Test Contract v1.0)

Game hỗ trợ chế độ chạy không giao diện (headless) chuẩn xác 100%, phục vụ việc chấm tự động theo hợp đồng `game.contract.json`:

```bash
node src/cli/headless.js --seed 42 --night 1 --ticks 300 --out output.jsonl --snapshot-every 10
```

Hỗ trợ kịch bản test và chuỗi input tùy chọn:

```bash
node src/cli/headless.js --seed 123 --night 1 --scenario scenario.json --inputs inputs.json --ticks 600 --out result.jsonl
```

---

## 5. Cấu Trúc Dự Án

- `game.contract.json`: Khai báo hợp đồng kiểm thử tự động của bài nộp.
- `AGENTS.md`: Chỉ dẫn vận hành cho AI Agent.
- `src/core/`: Mô phỏng logic game thuần túy, tất định (deterministic), không phụ thuộc GPU.
- `src/cli/`: CLI runner chạy chế độ headless xuất file JSONL.
- `src/render/`: Giao diện 3D sử dụng Three.js và Vite.
- `tests/`: Bộ test tự động kiểm thử logic và Test Contract.
- `docs/notes/`: Giả định thiết kế, nhật ký AI SDLC.
- `docs/proof/`: Bằng chứng kiểm chứng cho từng phase.
- `CREDITS.md` & `LICENSE`: Nguồn gốc tài nguyên và giấy phép mã nguồn mở.
