# Nhật Ký Giả Định & Quyết Định Kỹ Thuật (Phase 2 Assumptions & Decisions)

**Dự án:** Đảo Đèn Lồng (Ticket-02 — "Ba hòn đảo")  
**Giai đoạn:** Phase 2  
**Hợp đồng kiểm thử:** Test Contract v1.1  

---

## 1. Giả Định Kiến Trúc & Thiết Kế
1. **Phân tách tuyệt đối giữa Core và Render:**
   - Mọi logic trò chơi (vật lý, va chạm, máy trạng thái Bóng Mực, Gió Lạc, Bùa Gió, bục nhảy, dốc, gió mạnh) nằm hoàn toàn trong `src/core/`.
   - `src/core/` tuyệt đối không import Three.js, DOM, `window`, hoặc `document` để đảm bảo chạy headless độc lập trên mọi hệ điều hành (Windows, Linux, macOS, Docker) với tốc độ cao.
2. **Hệ tọa độ & Góc đo:**
   - Trục $Y$ hướng lên trên; $Y = 0$ là mặt phẳng đáy đảo.
   - Góc đo bắt đầu từ trục $+X$, ngược chiều kim đồng hồ khi nhìn từ trên cao xuống: $x = r \cos\theta, z = r \sin\theta$.
   - Các tọa độ xuất trong snapshot JSONL làm tròn chính xác 3 chữ số thập phân (`.toFixed(3)`).
3. **Thứ tự 12 bước trong một tick:**
   - Tuân thủ nghiêm ngặt theo mục "Thứ tự xử lý trong một tick (bắt buộc)" tại Trang 4 của PDF Ticket-02.
   - Kiểm tra `pause` trước tiên; nếu vừa tạm dừng thì đóng băng ngay tick đó.
4. **Hiệu suất Headless:**
   - Thuật toán mô phỏng sử dụng các phép toán số học phẳng tối ưu, hoàn thành 21.600 tick (một Đêm đầy đủ) trong xấp xỉ ~210ms (nhanh gấp ~140 lần so với giới hạn 30 giây trong DoD).
5. **Đồ họa và Trải nghiệm Người Chơi (Sky: Children of the Light Inspiration):**
   - Nâng cấp mô hình nhân vật Mây: nón lá truyền thống với viền mây vàng và tua rua lụa đỏ, áo choàng uốn lượn theo chuyển động, bước chân gỗ nhịp nhàng, hiệu ứng bóng mờ lướt gió (dash ghost trails).
   - Tháp Đèn Lồng Pagoda: kiến trúc mái cong cổ kính, thắp sáng tự nhiên với quá trình chuyển màu mượt mà (smooth ramp), ánh sáng lay động tự nhiên, bầy đom đóm phát sáng mềm mại quanh đảo.
   - Hệ thống âm thanh Synthesizer thuần túy chạy trên Web Audio API, không cần tải bất kỳ file ngoài nào, hoạt động ổn định offline.
