# Architecture Decision Record (ADR-003): Mô Hình Quản Lý Nhiên Liệu Đèn & Luật Thắng Sống Sót Đến Bình Minh

- **Mã tài liệu:** ADR-003
- **Ngày:** 20/11/2026
- **Trạng thái:** Đã chấp thuận (Accepted)
- **Tác giả:** AI SDLC Engineer
- **Dự án:** Đảo Đèn Lồng — Phase 3 (Ticket-03, Test Contract v1.2)

---

## 1. Bối Cảnh (Context)
Trong Phase 1 và Phase 2, luật chơi quy định:
- Khi đèn lồng đã được nạp đủ 10 đom đóm, nó sẽ sáng vĩnh viễn và không nhận thêm đom đóm nào nữa.
- Khi người chơi thắp sáng toàn bộ đèn lồng trên đảo, trò chơi ngay lập tức kết thúc thắng (`won`, lý do `all_lit`).
- Bóng Mực không bao giờ dám tiếp cận vùng an toàn 6.0m của đèn lồng đang sáng.

### Vấn đề thực tế (Playtest feedback):
Người chơi có kỹ năng cao hoàn thành thắp toàn bộ đèn lồng chỉ trong khoảng 2 phút, dẫn đến việc đêm kết thúc quá sớm và thiếu đi cảm giác căng thẳng, thử thách sinh tồn về cuối Đêm. Nhà thiết kế yêu cầu chuyển đổi cốt lõi từ mục tiêu **"thắp hết đèn để thắng sớm"** sang **"giữ đảo sáng cho đến khi bình minh xuất hiện"** (survival mechanic).

---

## 2. Quyết Định Thiết Kế (Decision)

### 2.1. Mô Hình Nhiên Liệu Đèn Lồng (Lantern Fuel Model)
1. **Lưu trữ số nguyên (Integer Sub-units):**
   - Để tránh hoàn toàn sai số làm tròn số thực (`floating point precision issues`) gây sai lệch tính tất định (`determinism`) qua hàng chục nghìn tick, nhiên liệu đèn lồng được lưu trữ nội bộ bằng đơn vị nguyên `fuel_sub`:
     $$\text{fuel\_sub} = \text{round}(\text{fuel} \times 60)$$
     Trong đó, $60 \text{ sub-units} = 1.0 \text{ đơn vị nhiên liệu}$.
     Nhiên liệu tối đa: $100.0 \text{ đơn vị} = 6000 \text{ sub-units}$.
   - **Hao hụt tự nhiên khi đang sáng:** Trừ chính xác $1 \text{ sub-unit/tick}$ ($1.0 \text{ đơn vị/giây}$).
   - **Bị Bóng Mực hút:** Mỗi con đang `drain` trừ chính xác $5 \text{ sub-units/tick}$ ($5.0 \text{ đơn vị/giây}$).
   - **Đèn tắt:** Khi $\text{fuel\_sub} \le 0$, đèn tự động chuyển sang `lit = false`, phát sự kiện `lantern_out`, ghi nhớ `ever_lit = true`.

2. **Châm Dầu & Thắp Lại (Refuel & Relight):**
   - Đèn đang sáng nhận thêm dầu khi tương tác:
     $$\text{used} = \min(\text{carried}, \lceil(100 - \text{fuel}) / 10\rceil)$$
     Mỗi đom đóm bù 600 sub-units (10 đơn vị dầu), cộng 5 điểm, phát sự kiện `refuel`.
   - Đèn đã từng sáng (`ever_lit = true`) chỉ tốn 5 đom đóm để thắp lại (`relight_cost = 5`), cộng 40 điểm thưởng và phát `lantern_lit { relight: true }`.

### 2.2. Trạng Thái Mới Của Bóng Mực (`drain`) & Vùng An Toàn Động
1. **Mất vùng an toàn:** Đèn lồng có $\text{fuel} < 30.0$ mất toàn bộ vùng an toàn.
2. **Hành vi `wander` có mục tiêu:**
   - Ưu tiên 1: Đèn sáng có $\text{fuel} < 30$ gần nhất (bằng nhau chọn id nhỏ hơn).
   - Ưu tiên 2: Đèn tắt gần nhất.
3. **Trạng thái `drain`:**
   - Khi tiếp cận đèn yếu $\le 2.0\text{m}$, chuyển sang `drain`, đứng yên và hút 5 fuel/giây.
   - Phát sự kiện `fuel_drain` mỗi 60 tick.
   - Rời khỏi `drain`: sang `chase` khi Mây vào vùng 6m; sang `stunned` khi trúng Tỏa Sáng (+15 điểm); sang `wander` khi đèn tắt, đèn được nạp $\ge 30$, hoặc bị đẩy xa $> 2\text{m}$.
   - Khi hết choáng (`stun_ticks <= 0`), Bóng Mực quay về trạng thái `wander`.

### 2.3. Luật Thắng Sinh Tồn Mới (Survival Win Condition)
1. **Xóa bỏ thắng sớm:** Thắp đủ 100% số đèn không kết thúc đêm. Đêm tiếp tục chạy cho đến khi hết thời gian (`time_left_s <= 0`).
2. **Điều kiện thắng tại bình minh:**
   - Mây còn sống (`flames > 0`).
   - Tỷ lệ đèn sáng tại tick cuối $\ge 60\%$ tổng số đèn ($\lceil 0.6 \times \text{tổng đèn}\rceil$):
     - Đêm 1: cần $\ge 3 / 5$ đèn sáng.
     - Đêm 2: cần $\ge 4 / 6$ đèn sáng.
     - Đêm 3: cần $\ge 5 / 7$ đèn sáng.
   - Lý do kết thúc: `dawn_survived`.
3. **Điều kiện thua:**
   - Hết Ngọn Lửa (`flames <= 0`): thua ngay lập tức với lý do `no_flames`.
   - Hết giờ mà số đèn sáng $< 60\%$: thua với lý do `dawn`.

---

## 3. Hệ Quả & Tính Tương Thích (Consequences)
- **Tương thích Test Contract:** Nâng cấp lên Contract v1.2 (`contract_version = "1.2"`).
- **Snapshot v1.2:** Bổ sung `fuel` (làm tròn 1 chữ số), `ever_lit`, `relit_count` trên mỗi đèn; `capacity` trên người chơi; trạng thái `drain` của quái.
- **Tính tất định:** Đảm bảo 100% nhất quán nhờ PRNG Mulberry32 và số nguyên 60 sub-units/tick.
