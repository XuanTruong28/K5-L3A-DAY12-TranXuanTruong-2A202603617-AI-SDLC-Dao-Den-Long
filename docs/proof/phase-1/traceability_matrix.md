# Bảng Truy Vết Yêu Cầu và Bằng Chứng (Traceability Matrix) — Phase 1

| STT | Yêu cầu cốt lõi (PRD-0 & Contract v1.0) | Cách kiểm chứng | File bằng chứng | Kết quả |
|---|---|---|---|---|
| 1 | Màn chơi Đêm 1: Đảo tròn bán kính 35m, 5 Đèn Lồng Lớn (L1..L5) | Kiểm tra cấu hình `game.contract.json` và khởi tạo entity | `tests/simulation.test.js` | ĐẠT |
| 2 | Nhân vật di chuyển XZ, biến đổi theo `cam_yaw_deg` | Unit test vector toán học `transformMove` với góc $0^\circ, 90^\circ$ | `tests/simulation.test.js` | ĐẠT |
| 3 | Gom đom đóm trong bán kính $1.5\text{ m}$, giới hạn sức chứa $5$ | Scenario gom đom đóm, kiểm tra `carried` và sự kiện `mote_picked` | `tests/simulation.test.js` | ĐẠT |
| 4 | Nạp ánh sáng vào đèn ($3$ đom đóm/đèn), thắp đủ 5 đèn thì Thắng (`all_lit`) | Headless scenario nạp đèn cuối cùng, phát sinh `deposit`, `lantern_lit`, `game_over` (`won`) | `docs/proof/phase-1/scenario_win.jsonl` | ĐẠT |
| 5 | Bóng Mực đuổi theo người chơi, va chạm gây mất mạng (`flames`), rơi đom đóm | Headless scenario bóng mực va chạm người chơi còn 1 máu $\rightarrow$ Thua (`no_flames`) | `docs/proof/phase-1/scenario_loss.jsonl` | ĐẠT |
| 6 | Kỹ năng Tỏa sáng (Pulse): làm choáng và đẩy lùi Bóng Mực, tốn 1 đom đóm | Unit test kích hoạt `pulse: true`, kiểm tra trạng thái `stunned` và khoảng cách đẩy lùi | `tests/simulation.test.js` | ĐẠT |
| 7 | Chế độ headless CLI theo chuẩn Test Contract v1.0 | Chạy `node src/cli/headless.js` với các tham số kịch bản, kiểm tra định dạng snapshot/event/end | `tests/contract_headless.test.js` | ĐẠT |
| 8 | Tính tất định (Determinism): cùng seed và input phải cho kết quả giống hệt | Chạy 2 lần độc lập cùng seed và so sánh mã băm SHA256 | `docs/proof/phase-1/scenario_determinism.txt` | ĐẠT |
| 9 | Xử lý lỗi đầu vào sai định dạng (exit code 2) | Test cấp phát file inputs có tick không tăng nghiêm ngặt | `tests/contract_headless.test.js` | ĐẠT |
| 10 | Giao diện đồ họa 3D Three.js chơi được, có HUD, có thể chơi lại | Chạy `npm run dev` / `npm run build` | `dist/index.html` | ĐẠT |
