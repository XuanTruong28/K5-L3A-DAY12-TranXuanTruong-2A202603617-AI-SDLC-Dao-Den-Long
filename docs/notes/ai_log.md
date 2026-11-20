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
