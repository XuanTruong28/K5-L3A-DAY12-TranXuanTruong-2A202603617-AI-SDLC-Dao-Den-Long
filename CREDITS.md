# CREDITS — Đảo Đèn Lồng

Dự án phát triển trong khuôn khổ bài tập lớn: **Đảo Đèn Lồng (Day 12 — AI SDLC)**  
Phiên bản: **v1.0.0 (Phase 4 — Release)**

---

## 1. Thông Tin Tác Giả & Nhóm Phát Triển
- **Học viên:** Trần Xuân Trường
- **Mã số sinh viên (MSSV):** 2A202603617
- **Lớp:** K5-L3A
- **Khóa học:** AI Software Development Life Cycle (Day 12)

---

## 2. Công Cụ AI & Mô Hình Trợ Lý
Dự án được xây dựng và tối ưu theo quy trình AI SDLC với sự hỗ trợ của các mô hình và harness chuyên biệt:
- **Google DeepMind Antigravity Agent:** Thiết kế kiến trúc tổng thể, triển khai harness tự động (`AGENTS.md`), đồng bộ Test Contract v1.0 $\to$ v1.3, tối ưu hóa vòng lặp mô phỏng 60Hz.
- **Claude 3.5 Sonnet (Lab Evaluation):** Hỗ trợ phản biện kịch bản test và đối chiếu thông số quy chuẩn.

---

## 3. Thư Viện, Mã Nguồn Mở & Engine
- **Đồ họa 3D:** [Three.js](https://threejs.org/) (Phiên bản r170, MIT License) — Quản lý Scene 3D, Shaders, Ánh sáng, Shadow Map và Material.
- **Môi trường & Đóng gói Web:** [Vite](https://vitejs.dev/) (Phiên bản v6.x, MIT License) — Máy chủ phát triển HMR và đóng gói production bundle tối ưu.
- **Nền tảng thực thi:** [Node.js](https://nodejs.org/) (v18+) — Tích hợp sẵn `node:test` runner cho kiểm thử tự động không phụ thuộc thư viện thứ 3.
- **Bộ sinh số ngẫu nhiên tất định:** Thuật toán PRNG Mulberry32 (Public Domain).

---

## 4. Tài Nguyên Mỹ Thuật & Âm Thanh
- **Mô hình 3D & Cảnh quan:**
  - Toàn bộ cảnh quan 3D (Đảo Bến, Đảo Cau, Đảo Chuông 3 tầng, Cầu tre, Đèn lồng truyền thống Hội An, Cây anh đào Nhật Bản, Tháp chuông, Bệ phóng) được tạo hình thủ công bằng thuật toán hình học thủ tục (Procedural Three.js Geometries) theo phong cách Stylized / Low-poly tối giản, lấy cảm hứng từ kiệt tác *Sky: Children of the Light*.
  - Không sử dụng file mesh ngoài nặng nề, đảm bảo thời gian tải trang `< 1.5 giây` và hiệu năng mượt mà.
- **Âm thanh & Hiệu ứng âm thanh:**
  - Sử dụng bộ tổng hợp âm thanh thủ tục Web Audio API (`SoundSynth`): Tự động sinh sóng sin/tam giác cho tiếng nhặt đom đóm, tiếng nạp đèn, tiếng thắp sáng, tiếng lướt và kỹ năng Tỏa Sáng.
  - Hoàn toàn không phụ thuộc file MP3/WAV ngoại vi, không tốn băng thông mạng.

---

## 5. Giấy Phép (License)
Dự án được phát hành theo giấy phép **MIT License**. Chi tiết xem tại tệp [LICENSE](LICENSE).
