# Video Demo — Đảo Đèn Lồng (Release v1.0.0)

Video demo trực tiếp gameplay và bằng chứng kỹ thuật (dưới 5 phút) có thể được lưu trữ tại đường dẫn này: `docs/demo/demo.mp4` hoặc đính kèm trực tiếp trên GitHub Release v1.0.0 assets.

Nội dung video trình diễn:
1. Chơi trực tiếp trải nghiệm Đêm 1, Đêm 2 (Cầu tre, Bệ phóng), Đêm 3 (Đảo Chuông 3 tầng, Gió giật).
2. Kiểm chứng kỹ thuật tự động:
   - Chạy `npm test` (33/33 tests pass).
   - Chạy chế độ headless `node src/cli/headless.js`.
   - Chạy chế độ benchmark `node src/cli/bench.js --seed 42 --duration 30 --out bench.json`.
   - Chạy chế độ soak test `node src/cli/soak.js --seed 7 --nights 10 --out soak.json`.
3. Trình diễn tính năng trợ năng (Accessibility): Đổi phím tự do, phụ đề hình ảnh, phóng to chữ và chế độ mù màu.
