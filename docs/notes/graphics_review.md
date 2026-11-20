# Đánh Giá Chuyên Sâu Game 3D — Đảo Đèn Lồng (Phase 1)

> Đánh giá bởi AI Senior Game Developer — Chuyên gia Three.js / WebGL

---

## I. ĐIỂM MẠNH

1. **Kiến trúc Core/Render tách biệt hoàn toàn** — rất tốt cho headless testing.
2. **Game loop cố định 60Hz (fixed timestep)** — đảm bảo determinism.
3. **HUD rõ ràng**, có interactive prompt khi đến gần đèn lồng.
4. **Lantern beacon beam** là ý tưởng tốt về visual feedback.

## II. ĐIỂM YẾU NGHIÊM TRỌNG

### A. Đồ Họa & Ánh Sáng (Vấn đề lớn nhất)

| Vấn đề | Mức độ | Chi tiết |
|---|---|---|
| Đảo trống trơn, không có cây cối/đá/cỏ | Nghiêm trọng | Chỉ có 1 cylinder phẳng, trông như sàn test, không có không khí game |
| Mặt đất đơn sắc tối đen | Cao | Dùng `0x1b2838` trông như metal, không giống cỏ/đất |
| Đom đóm là sphere vàng đặc | Cao | Không có glow, không có particle trail, không giống đom đóm |
| Bóng Mực là dodecahedron xoay | Trung bình | Thiếu hiệu ứng đe dọa (shadow, particle, pulsate) |
| Nhân vật Mây quá đơn giản | Trung bình | Cylinder + sphere + cone, không có tay chân, không có animation |
| Bầu trời đen phẳng | Cao | Không có sao, không có mây, không có gradient |
| Biển mây bên dưới là plane phẳng | Trung bình | Không chuyển động, không cuộn |

### B. Gameplay & Trải Nghiệm

| Vấn đề | Chi tiết |
|---|---|
| Không có âm thanh | Hoàn toàn im lặng, không có nhạc nền, SFX |
| Không có particle system | Mote pickup, pulse, lantern lit đều không có hiệu ứng hạt |
| Camera jerky | Không có lerp/smoothing, camera snap ngay lập tức |
| Không có cảm giác "thu thập" | Nhặt đom đóm chỉ biến mất, không có animation bay vào người chơi |

### C. Code & Performance

| Vấn đề | Chi tiết |
|---|---|
| Tạo `new THREE.Color()` mỗi frame | Trong vòng lặp lantern update, tạo object mỗi frame gây GC pressure |
| `Date.now()` trong render loop | Không đồng bộ với game clock, gây jitter trên animation |
| Shade material clone không cần thiết | Clone material lúc tạo nhưng lại gán lại mỗi frame |
| Không dispose geometry/material khi restart | Memory leak tiềm ẩn |

## III. KẾ HOẠCH CẢI TIẾN (Thứ tự ưu tiên)

1. **[P0] Thêm cây cối & thảm thực vật** — impact lớn nhất về visual
2. **[P0] Cải thiện mặt đất** — gradient cỏ/đất, terrain feel
3. **[P1] Particle system cho đom đóm** — glow + trail
4. **[P1] Bầu trời sao + gradient** — atmosphere
5. **[P1] Camera smoothing (lerp)** — polish
6. **[P2] Cải thiện nhân vật Mây** — bobbing animation
7. **[P2] Cải thiện Bóng Mực** — pulsate + shadow aura
8. **[P2] Fix memory/perf issues** — object pooling, pre-allocate colors

## IV. TRIỂN KHAI

Xem commit tiếp theo.
