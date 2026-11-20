import * as THREE from 'three';
import { Simulation } from '../core/simulation.js';
import { ISLAND_RADIUS } from '../core/constants.js';

// Setup DOM elements
const canvas = document.getElementById('game-canvas');
const flamesDisplay = document.getElementById('flames-display');
const motesDisplay = document.getElementById('motes-display');
const lanternsDisplay = document.getElementById('lanterns-display');
const timerDisplay = document.getElementById('timer-display');
const scoreDisplay = document.getElementById('score-display');
const dialogOverlay = document.getElementById('dialog-overlay');
const dialogTitle = document.getElementById('dialog-title');
const dialogMsg = document.getElementById('dialog-msg');
const btnReplay = document.getElementById('btn-replay');

// Initialize Three.js Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0c16);
scene.fog = new THREE.FogExp2(0x0a0c16, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lights
const ambientLight = new THREE.AmbientLight(0x283250, 1.2);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(0x6b8cce, 1.5);
moonLight.position.set(20, 40, -20);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 1024;
moonLight.shadow.mapSize.height = 1024;
scene.add(moonLight);

// Island Ground Mesh
const islandGroup = new THREE.Group();
const groundGeo = new THREE.CylinderGeometry(ISLAND_RADIUS, ISLAND_RADIUS * 0.92, 4, 48);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x1b2838,
  roughness: 0.85,
  metalness: 0.1
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.position.y = -2;
ground.receiveShadow = true;
islandGroup.add(ground);

// Island Rim Glow
const rimGeo = new THREE.TorusGeometry(ISLAND_RADIUS, 0.4, 16, 64);
const rimMat = new THREE.MeshBasicMaterial({ color: 0x2ec4b6, transparent: true, opacity: 0.4 });
const rim = new THREE.Mesh(rimGeo, rimMat);
rim.rotation.x = Math.PI / 2;
rim.position.y = 0.05;
islandGroup.add(rim);

// Sea of Clouds below
const cloudGeo = new THREE.PlaneGeometry(300, 300, 32, 32);
const cloudMat = new THREE.MeshStandardMaterial({
  color: 0x12172b,
  roughness: 0.9,
  transparent: true,
  opacity: 0.8
});
const clouds = new THREE.Mesh(cloudGeo, cloudMat);
clouds.rotation.x = -Math.PI / 2;
clouds.position.y = -6;
islandGroup.add(clouds);

scene.add(islandGroup);

// Game State & Simulation
let sim = new Simulation({ seed: Date.now() });

// Player 3D Representation (Mây with Nón Lá and small lantern)
const playerGroup = new THREE.Group();

// Body
const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.1, 16);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x48cae4, roughness: 0.7 });
const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
bodyMesh.position.y = 0.55;
bodyMesh.castShadow = true;
playerGroup.add(bodyMesh);

// Head
const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
const headMat = new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.6 });
const headMesh = new THREE.Mesh(headGeo, headMat);
headMesh.position.y = 1.35;
playerGroup.add(headMesh);

// Conical Hat (Nón Lá)
const hatGeo = new THREE.ConeGeometry(0.7, 0.35, 24);
const hatMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.9 });
const hatMesh = new THREE.Mesh(hatGeo, hatMat);
hatMesh.position.y = 1.6;
playerGroup.add(hatMesh);

// Small lantern hanging from hat
const smallLanternGroup = new THREE.Group();
smallLanternGroup.position.set(0.5, 1.4, 0.2);
const sLanternGeo = new THREE.BoxGeometry(0.15, 0.2, 0.15);
const sLanternMat = new THREE.MeshBasicMaterial({ color: 0xffbe0b });
const sLanternMesh = new THREE.Mesh(sLanternGeo, sLanternMat);
smallLanternGroup.add(sLanternMesh);

const playerPointLight = new THREE.PointLight(0xffbe0b, 2.5, 8);
smallLanternGroup.add(playerPointLight);
playerGroup.add(smallLanternGroup);

scene.add(playerGroup);

// Lanterns 3D meshes map
const lanternMeshes = new Map();
const lanternLightMap = new Map();

for (const l of sim.lanterns) {
  const lGroup = new THREE.Group();
  lGroup.position.set(l.pos[0], 0, l.pos[2]);

  // Pillar
  const pillarGeo = new THREE.CylinderGeometry(0.2, 0.25, 2.8, 12);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x58311e, roughness: 0.8 });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.y = 1.4;
  pillar.castShadow = true;
  lGroup.add(pillar);

  // Big Lantern Box / Sphere
  const lanternCageGeo = new THREE.SphereGeometry(0.7, 16, 16);
  const lanternCageMat = new THREE.MeshStandardMaterial({
    color: 0x3a1a10,
    roughness: 0.5,
    wireframe: false
  });
  const cage = new THREE.Mesh(lanternCageGeo, lanternCageMat);
  cage.position.y = 2.8;
  lGroup.add(cage);

  // Light
  const pLight = new THREE.PointLight(0xff9f1c, 0, 16);
  pLight.position.y = 2.8;
  lGroup.add(pLight);

  scene.add(lGroup);
  lanternMeshes.set(l.id, { group: lGroup, cage, mat: lanternCageMat });
  lanternLightMap.set(l.id, pLight);
}

// Motes 3D Meshes
const moteMeshes = new Map();
const moteGeo = new THREE.SphereGeometry(0.25, 12, 12);
const moteMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });

function syncMotes() {
  for (const m of sim.motes) {
    if (m.active) {
      if (!moteMeshes.has(m.id)) {
        const mesh = new THREE.Mesh(moteGeo, moteMat);
        mesh.position.set(m.pos[0], 0.8, m.pos[2]);
        scene.add(mesh);
        moteMeshes.set(m.id, mesh);
      } else {
        const mesh = moteMeshes.get(m.id);
        mesh.position.set(m.pos[0], 0.8 + Math.sin(Date.now() * 0.005 + m.pos[0]) * 0.2, m.pos[2]);
      }
    } else {
      if (moteMeshes.has(m.id)) {
        const mesh = moteMeshes.get(m.id);
        scene.remove(mesh);
        moteMeshes.delete(m.id);
      }
    }
  }
}

// Shades 3D Meshes
const shadeMeshes = new Map();
const shadeGeo = new THREE.DodecahedronGeometry(0.7, 1);
const shadeMatNormal = new THREE.MeshStandardMaterial({ color: 0x240046, roughness: 0.4 });
const shadeMatStunned = new THREE.MeshStandardMaterial({ color: 0x7b2cbf, roughness: 0.9, wireframe: true });

function syncShades() {
  for (const s of sim.shades) {
    if (!shadeMeshes.has(s.id)) {
      const mesh = new THREE.Mesh(shadeGeo, shadeMatNormal.clone());
      mesh.position.set(s.pos[0], 0.9, s.pos[2]);
      mesh.castShadow = true;
      scene.add(mesh);
      shadeMeshes.set(s.id, mesh);
    } else {
      const mesh = shadeMeshes.get(s.id);
      mesh.position.set(s.pos[0], 0.9, s.pos[2]);
      mesh.rotation.y += 0.03;
      mesh.material = s.state === 'stunned' ? shadeMatStunned : shadeMatNormal;
    }
  }
}

// Pulse FX ring
const pulseRingGeo = new THREE.RingGeometry(0.5, 1.0, 32);
const pulseRingMat = new THREE.MeshBasicMaterial({
  color: 0xffbe0b,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0
});
const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
pulseRing.rotation.x = -Math.PI / 2;
pulseRing.position.y = 0.1;
scene.add(pulseRing);

let pulseAnim = 0;
function triggerPulseVisual(pos) {
  pulseRing.position.set(pos[0], 0.1, pos[2]);
  pulseAnim = 1.0;
}

// Input Handling
const keys = {};
let camYaw = 0;
let isMouseDown = false;
let prevMouseX = 0;

window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === 'r') {
    restartGame();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

window.addEventListener('mousedown', (e) => {
  if (e.button === 0 || e.button === 2) {
    isMouseDown = true;
    prevMouseX = e.clientX;
  }
});

window.addEventListener('mouseup', (e) => {
  if (e.button === 0 || e.button === 2) isMouseDown = false;
});

window.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('mousemove', (e) => {
  if (isMouseDown) {
    const deltaX = e.clientX - prevMouseX;
    prevMouseX = e.clientX;
    camYaw += deltaX * 0.005;
  }
});

function restartGame() {
  sim = new Simulation({ seed: Date.now() });
  dialogOverlay.style.display = 'none';
  for (const [, mesh] of moteMeshes) scene.remove(mesh);
  for (const [, mesh] of shadeMeshes) scene.remove(mesh);
  moteMeshes.clear();
  shadeMeshes.clear();
}

btnReplay.addEventListener('click', restartGame);

// Update HUD
function updateHUD() {
  let hearts = '';
  for (let i = 0; i < 3; i++) {
    hearts += i < sim.player.flames ? '❤' : '🖤';
  }
  flamesDisplay.textContent = hearts;
  motesDisplay.textContent = `✨ ${sim.player.carried} / ${sim.tuning.carry_capacity}`;

  const litCount = sim.lanterns.filter(l => l.lit).length;
  lanternsDisplay.textContent = `🏮 ${litCount} / 5`;

  const mins = Math.floor(sim.time_left_s / 60);
  const secs = Math.floor(sim.time_left_s % 60);
  timerDisplay.textContent = `⏳ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  scoreDisplay.textContent = `🏆 ${sim.score}`;

  // Check Game Over Dialog
  if (sim.state === 'won') {
    dialogTitle.textContent = '🌟 Chiến Thắng!';
    dialogMsg.textContent = `Mây đã thắp sáng cả 5 Đèn Lồng Lớn và xua tan bóng tối! Tổng điểm: ${sim.score}`;
    dialogOverlay.style.display = 'flex';
  } else if (sim.state === 'lost') {
    dialogTitle.textContent = '💀 Thất Bại';
    const reasonText = sim.game_over_reason === 'dawn' ? 'Bình minh đã đến nhưng chưa thắp đủ đèn!' : 'Mây đã bị Bóng Mực nuốt trọn ánh sáng!';
    dialogMsg.textContent = `${reasonText} Tổng điểm: ${sim.score}`;
    dialogOverlay.style.display = 'flex';
  }
}

// Game Loop
const fixedDelta = 1 / 60;
let accumTime = 0;
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  accumTime += dt;

  while (accumTime >= fixedDelta) {
    accumTime -= fixedDelta;

    // Build input frame from keys
    let mx = 0;
    let mz = 0;
    if (keys['w'] || keys['arrowup']) mz += 1;
    if (keys['s'] || keys['arrowdown']) mz -= 1;
    if (keys['d'] || keys['arrowright']) mx += 1;
    if (keys['a'] || keys['arrowleft']) mx -= 1;

    const interact = !!(keys['e'] || keys[' ']);
    const pulse = !!(keys['f'] || keys['q']);

    const yawDeg = (camYaw * 180) / Math.PI;

    if (mx !== 0 || mz !== 0) {
      const moveAngle = Math.atan2(mx, mz);
      playerGroup.rotation.y = camYaw + moveAngle;
    }

    const events = sim.step({
      move: [mx, mz],
      cam_yaw_deg: yawDeg,
      interact,
      pulse
    });

    for (const ev of events) {
      if (ev.name === 'pulse') {
        triggerPulseVisual(sim.player.pos);
      }
    }
  }

  // Update 3D player position & orientation
  playerGroup.position.set(sim.player.pos[0], sim.player.pos[1], sim.player.pos[2]);

  // Pulse Ring visual animation
  if (pulseAnim > 0) {
    pulseAnim -= dt * 2.0;
    const currentR = (1 - pulseAnim) * sim.tuning.pulse_radius;
    pulseRing.scale.set(currentR, currentR, 1);
    pulseRingMat.opacity = Math.max(0, pulseAnim);
  }

  // Update Lanterns visual state
  for (const l of sim.lanterns) {
    const lData = lanternMeshes.get(l.id);
    const pLight = lanternLightMap.get(l.id);
    if (l.lit) {
      lData.mat.color.setHex(0xffaa00);
      lData.mat.emissive = new THREE.Color(0xff8800);
      pLight.intensity = 4.0;
    } else {
      lData.mat.color.setHex(0x3a1a10);
      lData.mat.emissive = new THREE.Color(0x000000);
      pLight.intensity = l.deposited > 0 ? (l.deposited / sim.tuning.lantern_cost) * 1.5 : 0;
    }
  }

  syncMotes();
  syncShades();
  updateHUD();

  // Camera follow player in Third Person
  const camDist = 9.0;
  const camHeight = 6.0;
  const camX = sim.player.pos[0] - Math.sin(camYaw) * camDist;
  const camZ = sim.player.pos[2] - Math.cos(camYaw) * camDist;
  camera.position.set(camX, sim.player.pos[1] + camHeight, camZ);
  camera.lookAt(sim.player.pos[0], sim.player.pos[1] + 1.2, sim.player.pos[2]);

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
