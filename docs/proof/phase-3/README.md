# BẰNG CHỨNG KIỂM CHỨNG TỰ ĐỘNG — PHASE 3 (TICKET-03)
## Test Contract v1.2 Verification Proofs

Thư mục này lưu trữ các kịch bản kiểm chứng (`scenario`) và đầu ra log JSONL thực tế được chạy bởi Headless Runner (`src/cli/headless.js`) nhằm đáp ứng Định nghĩa Hoàn thành (DoD) của Phase 3.

---

## Danh Sách Bằng Chứng Kiểm Chứng

### 1. Cơ chế cạn dầu & tắt đèn (`lantern_out`)
- **Kịch bản:** `scenario_decay.json` (Đèn L1 có `fuel: 1.5` = 90 tick).
- **Lệnh chạy:** `node src/cli/headless.js --seed 42 --night 1 --scenario docs/proof/phase-3/scenario_decay.json --ticks 120 --out docs/proof/phase-3/decay_proof.jsonl --snapshot-every 30`
- **Kết quả:** Đúng tại tick 90, đèn hết dầu và phát sự kiện:
  ```json
  {"type":"event","tick":90,"name":"lantern_out","data":{"lantern_id":"L1"}}
  ```
- **File bằng chứng:** `decay_proof.jsonl`

### 2. Cơ chế châm dầu khi đang sáng (`refuel`)
- **Kịch bản:** `scenario_refuel.json` (L1 có `fuel: 85.0`, Mây mang 4 đom đóm).
- **Inputs:** `inputs_refuel.json` (nhấn `interact` tại tick 10).
- **Lệnh chạy:** `node src/cli/headless.js --seed 42 --night 1 --scenario docs/proof/phase-3/scenario_refuel.json --inputs docs/proof/phase-3/inputs_refuel.json --ticks 30 --out docs/proof/phase-3/refuel_proof.jsonl --snapshot-every 10`
- **Kết quả:** Tại tick 11, Mây tiêu tốn đúng $\lceil(100 - 85)/10\rceil = 2$ đom đóm, nạp đầy 100.0 dầu:
  ```json
  {"type":"event","tick":11,"name":"refuel","data":{"lantern_id":"L1","amount":2,"fuel":100}}
  ```
- **File bằng chứng:** `refuel_proof.jsonl`

### 3. Bóng Mực hút dầu & phát sự kiện mỗi 60 tick (`fuel_drain`)
- **Kịch bản:** `scenario_drain.json` (L1 có `fuel: 28.0` $< 30$ nên mất vùng an toàn; S1 ở khoảng cách 1.0m).
- **Lệnh chạy:** `node src/cli/headless.js --seed 42 --night 1 --scenario docs/proof/phase-3/scenario_drain.json --ticks 130 --out docs/proof/phase-3/drain_proof.jsonl --snapshot-every 30`
- **Kết quả:** Bóng Mực vào trạng thái `drain` và phát sự kiện `fuel_drain` chính xác mỗi 60 tick:
  ```json
  {"type":"event","tick":61,"name":"fuel_drain","data":{"lantern_id":"L1","shade_id":"S1","fuel":22}}
  {"type":"event","tick":121,"name":"fuel_drain","data":{"lantern_id":"L1","shade_id":"S1","fuel":16}}
  ```
- **File bằng chứng:** `drain_proof.jsonl`

### 4. Thắng sinh tồn bình minh (`dawn_survived`)
- **Kịch bản:** `scenario_dawn_win.json` (Đêm 1 có 5 đèn, 3 đèn sáng $\ge 60\%$, thời gian còn 1.0 giây = 60 tick).
- **Lệnh chạy:** `node src/cli/headless.js --seed 42 --night 1 --scenario docs/proof/phase-3/scenario_dawn_win.json --ticks 70 --out docs/proof/phase-3/dawn_win_proof.jsonl --snapshot-every 20`
- **Kết quả:** Tại tick 60 khi hết giờ, trò chơi kết thúc với chiến thắng sinh tồn:
  ```json
  {"type":"event","tick":60,"name":"game_over","data":{"result":"won","reason":"dawn_survived"}}
  ```
- **File bằng chứng:** `dawn_win_proof.jsonl`
