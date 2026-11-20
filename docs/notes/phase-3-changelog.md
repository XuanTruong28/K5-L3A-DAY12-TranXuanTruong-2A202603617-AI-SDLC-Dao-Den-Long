# CHANGELOG — Phase 3 (Ticket-03: Change Request "Đèn Cạn Dầu")

Tất cả các thay đổi phá vỡ tương thích (`Breaking Changes`) từ Test Contract v1.1 sang Test Contract v1.2 được tổng hợp chi tiết dưới đây.

---

## 1. Các Thay Đổi Phá Vỡ Tương Thích (Breaking Changes)

### 1.1. Luật Thắng Thua
- **[THAY THẾ] Bỏ điều kiện thắng sớm `all_lit`:**
  - *Cũ:* Trò chơi thắng ngay lập tức khi tất cả đèn lồng được thắp sáng, phát `game_over { result: 'won', reason: 'all_lit' }`.
  - *Mới:* Thắp hết đèn không kết thúc Đêm. Người chơi phải duy trì các ngọn đèn sáng cho đến khi hết giờ (bình minh).
- **[MỚI] Điều kiện thắng tại bình minh `dawn_survived`:**
  - Tại tick cuối cùng khi `time_left_s <= 0`, trò chơi thắng nếu Mây còn sống (`flames > 0`) và số đèn sáng $\ge \lceil 0.6 \times \text{tổng đèn}\rceil$ (Đêm 1: 3/5; Đêm 2: 4/6; Đêm 3: 5/7). Lý do thắng: `dawn_survived`.
- **[THAY THẾ] Lý do thua khi hết giờ:**
  - *Cũ:* `dawn` khi hết giờ mà chưa thắp hết đèn.
  - *Mới:* `dawn` khi hết giờ mà số đèn sáng $< \lceil 0.6 \times \text{tổng đèn}\rceil$.

### 1.2. Cơ Chế Nhiên Liệu Đèn Lồng
- **[THAY THẾ] Đèn đã sáng tiếp tục nhận đom đóm:**
  - *Cũ:* Đèn lồng đã sáng vĩnh viễn không thể nhận thêm đom đóm.
  - *Mới:* Đèn lồng tự tiêu hao 1.0 nhiên liệu/giây (1/60 mỗi tick). Khi tương tác, người chơi có thể châm dầu:
    $$\text{used} = \min(\text{carried}, \lceil(100 - \text{fuel}) / 10\rceil)$$
    Mỗi đom đóm nạp thêm 10 nhiên liệu (tối đa 100).
- **[MỚI] Đèn hết dầu tắt (`lantern_out`):**
  - Khi `fuel <= 0`, đèn tắt, `deposited = 0`, ghi nhớ `ever_lit = true`, phát sự kiện `lantern_out`.
- **[MỚI] Chi phí thắp lại chỉ 5 đom đóm:**
  - Đèn `ever_lit === true` chỉ tốn 5 đom đóm để thắp lại (`relight_cost = 5`), phát `lantern_lit { lantern_id, relight: true }`.
  - Đèn chưa từng sáng cần 10 đom đóm, phát `lantern_lit { lantern_id, relight: false }`.

### 1.3. Hành Vi Của Bóng Mực & Trạng Thái `drain`
- **[THAY THẾ] Vùng an toàn của đèn sáng bị vô hiệu khi `fuel < 30`:**
  - *Cũ:* Đèn sáng luôn tạo vùng an toàn 6.0m đẩy lùi Bóng Mực.
  - *Mới:* Đèn có $\text{fuel} < 30.0$ mất hoàn toàn vùng an toàn.
- **[MỚI] Trạng thái `drain`:**
  - Bóng Mực ở trạng thái `wander` tìm đến đèn yếu ($\text{fuel} < 30$) gần nhất. Khi cách $\le 2\text{m}$, chuyển sang `drain`, đứng yên và hút 5 fuel/giây.
  - Phát sự kiện `fuel_drain { lantern_id, shade_id, fuel }` mỗi 60 tick.
- **[THAY THẾ] Trạng thái sau khi hết choáng:**
  - *Cũ:* Hết choáng xét khoảng cách tới Mây để sang `chase` hoặc `wander`.
  - *Mới:* Hết choáng luôn quay về `wander`.

### 1.4. Công Thức Điểm Số Mới
- **[THAY THẾ] Bỏ điểm khi nhặt đom đóm (+10 cũ) và bỏ điểm thời gian còn lại (+2/giây cũ):**
  - Điểm mới chỉ cộng khi tương tác và tại bình minh:
    - Nạp đom đóm vào đèn (thắp mới, thắp lại hoặc châm dầu): **+5 điểm/đom đóm**.
    - Thắp lần đầu thành công: **+100 điểm**.
    - Thắp lại thành công: **+40 điểm**.
    - Đánh choáng Bóng Mực thường: **+5 điểm**.
    - Đánh choáng Bóng Mực đang `drain`: **+15 điểm**.
    - Bình minh (chỉ khi thắng): mỗi đèn đang sáng nhận **+50 + floor(fuel)**.
    - Bình minh (chỉ khi thắng): mỗi Ngọn Lửa còn lại nhận **+50**.

### 1.5. Thời Lượng Các Đêm Rút Ngắn
- Đêm 1: từ 300s $\to$ **240s**.
- Đêm 2: từ 330s $\to$ **270s**.
- Đêm 3: từ 360s $\to$ **300s**.

### 1.6. Sức Chứa Tăng Dần (Dynamic Capacity)
- Sức chứa đom đóm ban đầu là 10, tăng thêm 2 sau mỗi lần thắp sáng thành công:
  $$\text{capacity} = \min(20, 10 + 2 \times \text{successful\_lights})$$

### 1.7. Test Contract v1.2 Schema
- Phiên bản: `"1.2"`.
- `Snapshot`:
  - `lanterns[i]`: thêm `fuel` (float 1 decimal, đèn tắt là 0), `ever_lit` (bool), `relit_count` (int).
  - `player`: thêm `capacity` (int).
  - `shades[i]`: thêm trạng thái `'drain'`.
- `Scenario`:
  - `lanterns[i]`: hỗ trợ `fuel`, `ever_lit`.
  - `player`: hỗ trợ `successful_lights`.
  - `shades[i]`: hỗ trợ `target_lantern_id`.
