# ĐẶC TẢ TÍNH NĂNG CHI TIẾT — PHASE 3 (TICKET-03)
## "ĐÈN CẠN DẦU" — TEST CONTRACT V1.2

---

## 1. Mục Tiêu & Trải Nghiệm Người Chơi
Chuyển đổi trải nghiệm từ chạy đua "thắp nhanh để thắng sớm" sang **chiến thuật giữ lửa sinh tồn đến bình minh**:
- Người chơi phải liên tục cân đối giữa việc khám phá mở rộng thắp đèn mới, quay lại các ngọn đèn đã sáng để châm thêm dầu, và bảo vệ các ngọn đèn sắp cạn trước sự rình rập của Bóng Mực.
- Cảm giác căng thẳng đẩy lên cao trào ở những giây phút cuối cùng trước bình minh khi nhiên liệu cạn kiệt và Bóng Mực ùa vào hút dầu.

---

## 2. Đặc Tả Chi Tiết Các Cơ Chế

### 2.1. Quản Lý Nhiên Liệu & Cơ Chế Châm Dầu
| Thông số | Giá trị chuẩn v1.2 | Mô tả chi tiết |
|---|---|---|
| `fuel_max` | 100.0 | Nhiên liệu tối đa của đèn |
| `fuel_decay_per_s` | 1.0 | Tự tiêu hao 1.0 đơn vị/giây (1/60 mỗi tick) khi đang sáng |
| `relight_cost` | 5 | Đèn đã từng sáng (`ever_lit: true`) chỉ cần 5 đom đóm |
| `lantern_cost` | 10 | Đèn chưa từng sáng cần 10 đom đóm |
| `fuel_per_mote` | 10.0 | Mỗi đom đóm nạp tăng 10 đơn vị dầu |
| `low_fuel_threshold` | 30.0 | Ngưỡng dầu thấp: mất an toàn và bị hút dầu |

### 2.2. Trạng Thái Bóng Mực & Cơ Chế Hút Dầu
1. **Tìm kiếm mục tiêu (`wander`):**
   - Bóng Mực ưu tiên đèn sáng có $\text{fuel} < 30$ gần nhất theo khoảng cách trên mặt phẳng XZ.
   - Nếu không có đèn yếu, quay về tìm đèn tắt gần nhất.
2. **Hút dầu (`drain`):**
   - Khi khoảng cách tới đèn yếu $\le 2.0\text{m}$, chuyển sang `drain`.
   - Đứng yên tại chỗ, hút liên tục 5.0 đơn vị/giây (cộng dồn nếu nhiều con).
   - Phát sự kiện `fuel_drain { lantern_id, shade_id, fuel }` đúng mỗi 60 tick.
3. **Phản xạ khi bị kích thích:**
   - Mây vào vùng 6.0m: chuyển sang `chase` truy đuổi Mây.
   - Trúng Tỏa Sáng: chuyển sang `stunned`, thưởng +15 điểm.
   - Đèn được châm dầu $\ge 30$: bị đẩy ra mép 6.0m trong 30 tick và không gây sát thương.

### 2.3. Sức Chứa Đom Đóm Tăng Dần (Dynamic Capacity)
- Khởi đầu đêm: `capacity = 10`.
- Sau mỗi lần thắp đèn thành công (cả thắp mới và thắp lại):
  $$\text{capacity} = \min(20, 10 + 2 \times \text{successful\_lights})$$
- HUD tự động hiển thị số lượng mang theo trên sức chứa tối đa hiện tại (`carried / capacity`).

### 2.4. Chế Độ Mù Màu & Mỹ Thuật Đồ Họa (Colorblind Accessibility)
1. **Màu sắc dễ phân biệt:**
   - Mắt và viền hào quang Bóng Mực chuyển từ tím `#7A3CFF` sang xanh thiên thanh `#00B3FF`.
   - Cảnh báo thời gian khẩn cấp chuyển từ đỏ `#FF5A5F` sang trắng sáng `#FFFFFF` kèm ký hiệu `⚠`.
2. **Hình dạng 3D không phụ thuộc màu:**
   - Đèn tắt bị xẹp 20% chiều cao (`scale.y = 0.8`), nón gỗ hạ thấp, chất liệu giấy sẫm màu với vết nứt rách.
   - Đèn sáng có thanh đo dầu 3D hiển thị tỷ lệ nhiên liệu phía trên ngọn đèn.
   - Đèn có $\text{fuel} < 30$ tự động nhấp nháy chậm với tần số 1 Hz.

---

## 3. Ma Trận Test & Truy Vết Yêu Cầu (Traceability Matrix)

| Mã yêu cầu | Mô tả yêu cầu | File kiểm thử tự động | Trạng thái |
|---|---|---|---|
| REQ-P3-01 | Tiêu hao nhiên liệu 1.0/s & sự kiện `lantern_out` | `tests/phase3_features.test.js` | PASS |
| REQ-P3-02 | Châm dầu đèn đang sáng & sự kiện `refuel` | `tests/phase3_features.test.js` | PASS |
| REQ-P3-03 | Thắp lại chỉ tốn 5 đom đóm & `relight: true` | `tests/phase3_features.test.js` | PASS |
| REQ-P3-04 | Sức chứa tăng dần $10 \to 20$ | `tests/phase3_features.test.js` | PASS |
| REQ-P3-05 | Quái hút dầu `drain` & sự kiện `fuel_drain` 60 tick | `tests/phase3_features.test.js` | PASS |
| REQ-P3-06 | Tỏa Sáng stun quái đang drain nhận +15 điểm | `tests/phase3_features.test.js` | PASS |
| REQ-P3-07 | Thắng sinh tồn bình minh `dawn_survived` ($\ge 60\%$) | `tests/phase3_features.test.js` | PASS |
| REQ-P3-08 | Cấu trúc Snapshot Contract v1.2 | `tests/phase3_features.test.js` & `tests/contract_headless.test.js` | PASS |
| REQ-P3-09 | Tính tất định & hiệu năng 21.600 tick $\le 30$s | `tests/contract_headless.test.js` | PASS |
| REQ-P3-10 | Chế độ mù màu, thanh dầu 3D, đèn tắt xẹp 20% | `src/render/main.js` & `index.html` | PASS |
