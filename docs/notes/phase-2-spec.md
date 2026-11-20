# Đặc Tả Kỹ Thuật & Tiêu Chí Chấp Nhận (Phase 2 Spec & Acceptance Criteria)

**Dự án:** Đảo Đèn Lồng — Ticket-02 "Ba hòn đảo" (Phase 2)  
**Tác giả:** Trần Xuân Trường (2A202603617) · Lớp: K5-L3A · Test Contract v1.1  

---

## 1. Tiêu Chí Chấp Nhận Cho Từng Tính Năng Mới (Phần 3)

### 1.1. Gió Lạc (Drifter — Đêm 2 và 3)
- **AC-DR-01 (Sinh thực thể):** Tối đa 2 con cùng tồn tại; sinh tại các tick 1200, 2400,... tại điểm sương/bóng ngẫu nhiên (id D1, D2,...).
- **AC-DR-02 (Trạng thái AI):**
  - `idle`: Di chuyển chậm 2.0 m/s quanh đảo.
  - `idle -> chase`: Khi Mây mang $\ge 5$ đom đóm và khoảng cách XZ $\le 15$ m.
  - `chase -> idle`: Khi khoảng cách $> 15$ m hoặc Mây mang $< 5$ đom đóm.
- **AC-DR-03 (Hành vi cướp):** Khi chạm Mây (khoảng cách XZ $\le 1.2$ m), cướp ngay $\min(3, \text{đang mang})$ đom đóm, lập tức chuyển sang trạng thái `flee` bay xa 7.0 m/s trong 240 tick rồi biến mất cùng số đom đóm đã cướp.
- **AC-DR-04 (Tương tác Tỏa Sáng):**
  - Tỏa Sáng trúng Gió Lạc đang `chase` -> chuyển `flee` và không cướp được đồ.
  - Tỏa Sáng trúng Gió Lạc đang `flee` mang đồ -> thả toàn bộ số đom đóm đã cướp tại chỗ (thành đom đóm rơi với TTL 480 tick) và biến mất sau 120 tick.
- **AC-DR-05 (Quy tắc an toàn):** Gió Lạc không làm mất Ngọn Lửa, không bị chặn bởi vùng an toàn của đèn, và thời gian bất tử của Mây không ngăn cản việc bị cướp.

### 1.2. Bùa Gió (Charm)
- **AC-CH-01 (Vị trí & Nhặt):** Đêm 2 xuất hiện tại `(35, 0, 0)` trên cầu tre. Đêm 3 xuất hiện tại `(30, 0, 25)` và `(-30, 0, 25)`. Nhặt tự động theo luật tương tự đom đóm (XZ $\le 1.0$ m, $\Delta Y \le 1.5$ m).
- **AC-CH-02 (Hiệu ứng Buff):** Duy trì 600 tick (10 giây). Tăng tốc độ chạy lên 7.2 m/s. Hồi chiêu Lướt về 0 (infinite dash), nhưng không cho phép spam đè nút (phải nhả và nhấn lại; nhấn trong lúc đang lướt bị bỏ qua).
- **AC-CH-03 (Hồi sinh bùa):** Bùa xuất hiện lại sau 2700 tick (45 giây) kể từ khi được nhặt.

### 1.3. Chuỗi 3 Đêm (3-Night Progression)
- **AC-NT-01 (Luồng chơi):** Đêm 1 (Đảo Bến, 5 đèn, 300s) -> Đêm 2 (Đảo Cau, 6 đèn, 330s) -> Đêm 3 (Đảo Chuông, 7 đèn, 360s).
- **AC-NT-02 (Chuyển màn & Bình Minh):** Thắng một Đêm sẽ mở khóa Đêm tiếp theo. Thắng Đêm 3 hiển thị màn hình Bình Minh cùng tổng điểm tích lũy của cả 3 Đêm.
- **AC-NT-03 (Chơi lại khi thua):** Khi thua (hết Ngọn Lửa hoặc hết giờ), người chơi được chơi lại đúng Đêm hiện tại.

### 1.4. Tạm Dừng (Pause System — Esc / P)
- **AC-PS-01 (Đóng băng mô phỏng):** Nhấn `Esc` hoặc `P` (cờ `pause: true` chuyển cạnh) dừng toàn bộ logic trò chơi. `sim_tick`, đồng hồ thời gian, hồi chiêu, spawn và TTL đom đóm đều đóng băng tuyệt đối; chỉ có `tick` tổng tăng.
- **AC-PS-02 (Giao diện & Sự kiện):** Snapshot ghi `state: "paused"`, phát sự kiện `paused` và `resumed`. Menu tạm dừng cho phép: Tiếp tục, Chơi lại Đêm, Chỉnh Cài Đặt, Chọn Đêm.

### 1.5. Cài Đặt (Settings & Persistence)
- **AC-ST-01 (Lưu trữ):** Mức âm lượng (0–100%) và độ nhạy chuột (0.2–2.0) được lưu trữ qua `localStorage` (`dao_den_long_vol`, `dao_den_long_sens`). Khôi phục chính xác khi tải lại trang.

### 1.6. Hệ Thống Âm Thanh (Web Audio Synthesizer)
- **AC-AU-01 (Tự sinh 100%):** Không phụ thuộc file âm thanh ngoài (.mp3/.wav). Khởi tạo qua Web Audio API khi có tương tác đầu tiên của người dùng.
- **AC-AU-02 (Đầy đủ hiệu ứng):** Có âm thanh riêng biệt cho: Nhặt đom đóm (chuông ngũ cung trong trẻo), Thắp đèn (chuông chùa ngân vang), Tỏa sáng (sóng xung kích âm học), Lướt (gió rít không khí), Nhảy (tiếng vút cao nhẹ nhàng), Bị đánh (trống trầm u uất).

### 1.7. HUD Đầy Đủ
- **AC-HD-01 (Bố cục chuẩn):**
  - Góc trên trái: 3 Ngọn Lửa (trái tim sáng rực).
  - Góc trên giữa: Đồng hồ `mm:ss` (chuyển đỏ và nhấp nháy khi thời gian $\le 30$ s).
  - Góc trên phải: Tiến độ đèn `🏮 k / n` và điểm số `🏆`.
  - Góc dưới giữa: Thanh túi 10 ô đom đóm hiển thị trạng thái phát sáng chân thực.
  - Góc dưới phải: Biểu tượng hồi chiêu Lướt và Tỏa Sáng có lớp phủ thời gian hồi.
  - Giữa màn hình: Nhắc nhở `E — Nạp ánh sáng (x/10)` khi đứng trong bán kính 2.0 m của đèn chưa sáng.
  - La bàn chỉ hướng: Mũi tên viền màn hình chỉ về phía ngọn đèn chưa sáng gần nhất khi đèn nằm ngoài góc nhìn camera.

### 1.8. Bảng Màu Chuẩn (Color Palette Compliance)
- Trời đêm / sương: `#0E1430` / `#1B2350`
- Cỏ / cát / gỗ / biển mây: `#2F5D50` / `#C9B48A` / `#6B4A2F` / `#12384A`
- Đèn sáng / lõi / đèn tắt: `#FFB347` / `#FFE9B0` / `#5B5F6E`
- Đom đóm lõi / quầng: `#FFF6C2` / `#FFE58A`
- Bóng Mực thân / viền / choáng: `#120A1A` / `#7A3CFF` / `#3A3450`
- Áo Mây / khăn Mây & Bùa Gió: `#E8E2D0` / `#C8102E`
- Viền vàng, điểm / Gió Lạc: `#F2C14E` / `#8FA3B8`
- UI nguy hiểm / chữ UI: `#FF5A5F` / `#F5F1E6`
- Độ sáng môi trường: $0.15 + 0.55 \times (\text{đèn sáng} / \text{tổng đèn})$.
