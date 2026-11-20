# Nhật Ký Sử Dụng AI & Đánh Giá SDLC (AI Log)

## Phase 1: PRD-0 & Test Contract v1.0

### 1. Phân Tích & Kế Hoạch
- **Đầu vào:** PRD-0 và Test Contract v1.0 từ tài liệu lab.
- **Quyết định kiến trúc:**
  - Tách triệt để Logic Simulation (`src/core/`) khỏi Renderer (`src/render/`) để đảm bảo CLI runner chạy headless với tốc độ tối đa, không phụ thuộc WebGL/Canvas hay GPU.
  - Xây dựng thuật toán số học tất định (PRNG Mulberry32) để đảm bảo cùng seed + kịch bản luôn ra cùng output.
  - Sử dụng Three.js cho giao diện 3D trên Web, giúp giảng viên có thể kiểm tra trực tiếp trên macOS, Linux, Windows mà không lo thiếu dependencies.

### 2. Ước Tính Token & Chi Phí
- Lập kế hoạch theo module nhỏ, kiểm thử tự động sớm để hạn chế sửa lỗi lặp lại.
- Context được tinh gọn qua `AGENTS.md` (ngắn gọn, tập trung vào contracts).
- Ước tính token sử dụng Phase 1: ~15,000 - 25,000 tokens.

### 3. Ghi Nhận Lỗi Của AI & Cách Khắc Phục
- *Lỗi tiềm ẩn 1:* Math.random() trong game làm hỏng tính tất định $\rightarrow$ Khắc phục: Ép buộc dùng Mulberry32 PRNG với hạt giống `seed`.
- *Lỗi tiềm ẩn 2:* Thứ tự tính tick snapshot khác với hợp đồng $\rightarrow$ Khắc phục: Snapshot tick 0 ghi nhận trạng thái sau dựng scenario trước khi xử lý input. Tick $k+1$ xử lý input tick $k$.


## Phase 2: Ticket-02 "Ba hòn đảo" & Test Contract v1.1

### 1. Phân Tích & Kế Hoạch
- **Đầu vào:** `artidact dlc 2.pdf` (Ticket-02 — "Ba hòn đảo", Test Contract v1.1).
- **Quyết định kiến trúc:**
  - Đồng bộ số liệu chuẩn (Tốc độ 6.0 m/s, Nhảy 7.0 m/s, Lướt 14.0 m/s, Sức chứa đom đóm 10, Đèn 10 đom đóm).
  - Triển khai đầy đủ bản đồ 3 Đêm: Đêm 1 (Đảo Bến), Đêm 2 (Đảo Cau với 2 đảo bán kính 28m, cầu tre, bục nhảy), Đêm 3 (Đảo Chuông với 3 tầng độ cao Y=0, Y=3, Y=6, 2 dốc 30° và 150°, tháp chuông r=2m, gió mạnh chu kỳ 30s).
  - Thực thể mới: Gió Lạc (Drifter) cướp đom đóm, Bùa Gió (Charm) tăng tốc và lướt không hồi chiêu.
  - Cơ chế Tạm dừng (Pause): đóng băng `sim_tick`, thời gian và cooldowns.
  - Tuân thủ thứ tự 12 bước trong 1 tick theo đúng tài liệu.
  - Nâng cấp đồ họa 3D mỹ thuật cao phong cách *Sky: Children of the Light*: mô hình Mây nón lá tà áo bay, tháp đèn lồng Pagoda thắp sáng tự nhiên mượt mà, đom đóm phát sáng mềm mại, bộ tổng hợp âm thanh Web Audio API thuần túy.

### 2. Ước Tính Token & Chi Phí
- Sử dụng các kiểm thử tích hợp và kiểm thử hồi quy để phát hiện sớm các điểm lệch so với Contract v1.1.
- Ước tính token sử dụng Phase 2: ~30,000 - 40,000 tokens.

### 3. Ghi Nhận Lỗi & Cách Khắc Phục
- *Lỗi 1 (Va chạm vách tầng 2 trên Đêm 3):* Ban đầu điều kiện va chạm vách tầng 2 kiểm tra bán kính $r \le 8$ mà không kiểm tra vị trí trước đó ngoài hay trong vách, khiến nhân vật xuất phát tại $(0, 0, 0)$ bị chặn di chuyển. $\rightarrow$ Khắc phục: Phân biệt rõ ranh giới leo vách từ bên ngoài vào (`rCur > 8.0 && nextR <= 8.0`) so với di chuyển bên trong hoặc bước ra ngoài để rơi xuống tầng dưới.
- *Lỗi 2 (Khởi tạo hướng lướt):* Ban đầu hướng mặt `facing_dir` lưu vector 3D `[0, 0, 1]` dẫn đến trục Z lấy nhầm phần tử Y. $\rightarrow$ Khắc phục: Chuẩn hóa `facing_dir` và `dash_dir` trên mặt phẳng XZ `[dx, dz]`.
- *Lỗi 3 (Thắp sáng đèn lồng quá nhanh):* Thắp sáng đèn từng chuyển trạng thái ngay lập tức làm mất độ mượt mà. $\rightarrow$ Khắc phục: Thêm biến suy giảm chuyển đổi ánh sáng `lightProgress` tăng dần trong 0.8s kết hợp hiệu ứng chập chờn ngọn lửa $\sin(18t)$ và luồng hạt đom đóm bay lên.

## Phase 3: Ticket-03 Change Request "Đèn cạn dầu" & Test Contract v1.2

### 1. Phân Tích & Kế Hoạch
- **Đầu vào:** Ticket-03 — Change Request "Đèn cạn dầu", Test Contract v1.2.
- **Quyết định kiến trúc & Kỹ thuật:**
  - Chuyển đổi mô hình quản lý đèn từ trạng thái nhị phân (lit/unlit) sang mô hình nhiên liệu liên tục tích hợp:
    - Sử dụng đơn vị số nguyên `fuel_sub` (60 sub-units = 1 đơn vị dầu) để loại trừ triệt để sai số số thực trong môi trường JavaScript.
    - Đèn tiêu hao tự nhiên 1.0 đơn vị/giây, Bóng Mực hút 5.0 đơn vị/giây. Đèn hết dầu tự động tắt và phát `lantern_out`.
    - Đèn đã từng sáng `ever_lit` chỉ tốn 5 đom đóm để thắp lại (`relight_cost = 5`).
  - Nâng cấp trí tuệ nhân tạo (AI) Bóng Mực:
    - Thêm trạng thái `drain` khi tiếp cận đèn yếu ($\text{fuel} < 30.0$) trong bán kính $\le 2.0\text{m}$.
    - Phát sự kiện `fuel_drain` chính xác mỗi 60 tick khi đang hút.
    - Chuyển tiếp trạng thái chuẩn xác: sang `chase` khi Mây vào vùng 6m, sang `stunned` khi bị Tỏa Sáng, sang `wander` khi đèn tắt hoặc được nạp $\ge 30$.
  - Thay đổi luật thắng sinh tồn:
    - Loại bỏ hoàn toàn điều kiện thắng sớm `all_lit`.
    - Thắng bình minh `dawn_survived` khi Mây còn sống và số đèn sáng $\ge \lceil 0.6 \times \text{tổng đèn}\rceil$.
  - Sức chứa đom đóm tăng dần `capacity = min(20, 10 + 2 * successful_lights)`.
  - Hỗ trợ chế độ mù màu (Bảng màu dễ phân biệt) với mắt/viền Bóng Mực `#00B3FF`, cảnh báo `#FFFFFF` + `⚠`, đèn tắt xẹp 20% và đèn yếu nhấp nháy 1 Hz.

### 2. Ước Tính Token & Chi Phí
- Thực hiện kiểm thử toàn diện ngay từ đầu (`tests/phase3_features.test.js`) với 27 test tự động chạy chỉ trong ~0.7s.
- Ước tính token sử dụng Phase 3: ~35,000 - 45,000 tokens.

### 3. Ghi Nhận Lỗi & Cách Khắc Phục
- *Lỗi 1 (Sai số tích lũy số thực khi trừ dầu):* Nếu dùng `lantern.fuel -= 1.0 / 60.0`, phép cộng/trừ số thực trong IEEE 754 sẽ làm lệch `fuel` sau hàng ngàn tick. $\rightarrow$ Khắc phục: Dùng `fuel_sub` nguyên (6000 cho 100 fuel), trừ 1 mỗi tick, chỉ làm tròn khi xuất snapshot (`round1(fuel_sub / 60)`).
- *Lỗi 2 (Chu kỳ phát sự kiện `fuel_drain`):* Khi quái chuyển sang `drain`, nếu không reset `drain_ticks = 0` thì sự kiện `fuel_drain` sẽ bị lệch nhịp 60 tick. $\rightarrow$ Khắc phục: Khởi tạo `shade.drain_ticks = 0` khi vào `drain` và tăng đều mỗi tick, phát sự kiện khi `shade.drain_ticks % 60 === 0`.
- *Lỗi 3 (Đèn đầy dầu vẫn bị chọn tương tác):* Luật yêu cầu đèn đầy dầu không được chọn khi tương tác và không tốn đom đóm. $\rightarrow$ Khắc phục: Lọc danh sách ứng viên chỉ lấy đèn chưa sáng hoặc đèn sáng có `fuel_sub < 6000`.
