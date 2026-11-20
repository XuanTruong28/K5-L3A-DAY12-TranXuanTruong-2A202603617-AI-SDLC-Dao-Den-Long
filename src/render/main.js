import * as THREE from 'three';
import { Simulation } from '../core/simulation.js';
import { NIGHT1_MAP, NIGHT2_MAP, NIGHT3_MAP } from '../core/constants.js';

// ==========================================
// 1. PROCEDURAL WEB AUDIO SYNTHESIZER
// ==========================================
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.volume = parseFloat(localStorage.getItem('dao_den_long_vol') || '0.8');
    this.masterGain = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('dao_den_long_vol', this.volume.toString());
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  playMotePickup() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const freq = notes[Math.floor(Math.random() * notes.length)];
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.14);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playDeposit() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(392.00, now);
    osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.22);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playLanternIgnite() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.22, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 1.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 1.25);
    });
  }

  playPulse() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  playDash() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(450, now + 0.15);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playJump() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playHit() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.3);
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playCharm() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

const sound = new SoundSynth();

// ==========================================
// 2. DOM ELEMENTS & HUD HOOKS
// ==========================================
const canvas = document.getElementById('game-canvas');
const nightBadge = document.getElementById('night-badge');
const flamesDisplay = document.getElementById('flames-display');
const timerDisplay = document.getElementById('timer-display');
const lanternsDisplay = document.getElementById('lanterns-display');
const scoreDisplay = document.getElementById('score-display');
const moteSlots = document.querySelectorAll('.mote-slot');
const dashCdOverlay = document.getElementById('dash-cd-overlay');
const pulseCdOverlay = document.getElementById('pulse-cd-overlay');
const interactPrompt = document.getElementById('interact-prompt');
const offscreenIndicator = document.getElementById('offscreen-indicator');
const minimapCanvas = document.getElementById('minimap-canvas');
const minimapCtx = minimapCanvas.getContext('2d');

// Modals
const pauseModal = document.getElementById('pause-modal');
const btnResume = document.getElementById('btn-resume');
const btnRestartNight = document.getElementById('btn-restart-night');
const levelBtns = document.querySelectorAll('.level-btn');
const volumeSlider = document.getElementById('volume-slider');
const mouseSensSlider = document.getElementById('mouse-sens-slider');

const gameoverModal = document.getElementById('gameover-modal');
const goTitle = document.getElementById('go-title');
const goSubtitle = document.getElementById('go-subtitle');
const btnNextNight = document.getElementById('btn-next-night');
const btnRetryGo = document.getElementById('btn-retry-go');

let mouseSensitivity = parseFloat(localStorage.getItem('dao_den_long_sens') || '1.0');
mouseSensSlider.value = Math.round(mouseSensitivity * 100);
volumeSlider.value = Math.round(sound.volume * 100);

volumeSlider.addEventListener('input', (e) => {
  sound.init();
  sound.setVolume(e.target.value / 100);
});
mouseSensSlider.addEventListener('input', (e) => {
  mouseSensitivity = e.target.value / 100;
  localStorage.setItem('dao_den_long_sens', mouseSensitivity.toString());
});

// Colorblind Accessible Mode (Ticket-03)
const colorblindToggle = document.getElementById('colorblind-toggle');
let isColorblind = localStorage.getItem('dao_den_long_colorblind') === 'true';
if (colorblindToggle) {
  colorblindToggle.checked = isColorblind;
  colorblindToggle.addEventListener('change', (e) => {
    isColorblind = e.target.checked;
    localStorage.setItem('dao_den_long_colorblind', isColorblind ? 'true' : 'false');
    document.body.classList.toggle('colorblind-mode', isColorblind);
  });
}
document.body.classList.toggle('colorblind-mode', isColorblind);

// ==========================================
// 3. THREE.JS SCENE, CAMERA, RENDERER, LIGHTING
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1024); // Richer midnight blue
scene.fog = new THREE.FogExp2(0x0a1024, 0.011); // Softer fog for better island visibility

const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 400);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.16;

// Ambient Light (Sáng rõ hơn, thấy rõ cảnh quan đảo và đường đá)
const ambientLight = new THREE.AmbientLight(0x28385a, 0.44);
scene.add(ambientLight);

// Moon directional light (Ánh trăng bạc dịu sáng hơn)
const moonLight = new THREE.DirectionalLight(0xb2ccf0, 0.95);
moonLight.position.set(45, 80, -85);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 2048;
moonLight.shadow.mapSize.height = 2048;
moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 280;
moonLight.shadow.camera.left = -80;
moonLight.shadow.camera.right = 80;
moonLight.shadow.camera.top = 80;
moonLight.shadow.camera.bottom = -80;
moonLight.shadow.bias = -0.0003;
scene.add(moonLight);

// ----------------- GLOWING 3D MOON & MOON HALO -----------------
const moonGroup = new THREE.Group();
moonGroup.position.set(45, 85, -95);

const moonMesh = new THREE.Mesh(
  new THREE.SphereGeometry(7.5, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xfffaed })
);
moonGroup.add(moonMesh);

// Clean Glow Texture Generator (100% transparent canvas edges, circular clip, no rectangular artifacts)
function createCleanGlowTexture(colorHex = '#ffe58a') {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.2, colorHex);
  grad.addColorStop(0.55, 'rgba(255, 170, 50, 0.22)');
  grad.addColorStop(0.85, 'rgba(255, 120, 30, 0.04)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(c);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

const moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({
  map: createCleanGlowTexture('#cfe0ff'),
  color: 0xcfe0ff,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
  fog: false,
  blending: THREE.AdditiveBlending
}));
moonHalo.scale.set(42, 42, 1);
moonGroup.add(moonHalo);
scene.add(moonGroup);

// ----------------- STARFIELD -----------------
const starCount = 800;
const starGeo = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 0.9 + 0.1);
  const rad = 170 + Math.random() * 40;
  starPositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = rad * Math.cos(phi);
  starPositions[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({ color: 0xfff6c2, size: 1.6, transparent: true, opacity: 0.9 });
scene.add(new THREE.Points(starGeo, starMat));

// ----------------- CLOUD OCEAN BENEATH ISLAND -----------------
const cloudGeo = new THREE.PlaneGeometry(450, 450, 32, 32);
const cloudMat = new THREE.MeshStandardMaterial({
  color: 0x0a1c28,
  roughness: 0.95,
  metalness: 0.05,
  transparent: true,
  opacity: 0.92
});
const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
cloudMesh.rotation.x = -Math.PI / 2;
cloudMesh.position.y = -8.5;
cloudMesh.receiveShadow = true;
scene.add(cloudMesh);

// Glow Textures (Warm Golden Amber for lanterns)
const moteGlowTexture = createCleanGlowTexture('#ffe58a');
const lanternGlowTexture = createCleanGlowTexture('#ffaa33'); // Warm Golden Amber
const cyanGlowTexture = createCleanGlowTexture('#38bdf8');
const charmGlowTexture = createCleanGlowTexture('#ff3344');

// Procedural Rich Moss / Grass Texture Generator (Deep emerald midnight meadow)
function createGrassTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#164326'; // Darker emerald night tone
  ctx.fillRect(0, 0, 512, 512);

  // Soft moss blotches
  for (let i = 0; i < 3500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 5 + 1.5;
    ctx.fillStyle = Math.random() > 0.45 ? 'rgba(28, 76, 42, 0.45)' : 'rgba(14, 42, 22, 0.4)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Subtle golden moss highlights
  for (let i = 0; i < 700; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = 'rgba(220, 185, 60, 0.12)';
    ctx.beginPath();
    ctx.arc(x, y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  return tex;
}

const sharedGrassTex = createGrassTexture();
const sharedGrassMat = new THREE.MeshStandardMaterial({
  map: sharedGrassTex,
  roughness: 0.85,
  metalness: 0.05
});

// ==========================================
// 4. MÂY 3D CHARACTER MODEL WITH HANDHELD LANTERN
// ==========================================
function createMayCharacter() {
  const group = new THREE.Group();

  const tunicMat = new THREE.MeshStandardMaterial({ color: 0xe8e2d0, roughness: 0.55 });
  const scarfMat = new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.45 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfbe, roughness: 0.65 });
  const hatMat = new THREE.MeshStandardMaterial({ color: 0xdeb841, roughness: 0.5 });
  const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: 0.6, roughness: 0.3 });

  // Torso / Poncho (Smooth curved bell shape)
  const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.44, 0.75, 18), tunicMat);
  bodyMesh.position.y = 0.55;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Red Scarf / Ribbon at neck
  const scarfMesh = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.065, 12, 24), scarfMat);
  scarfMesh.rotation.x = Math.PI / 2;
  scarfMesh.position.y = 0.92;
  group.add(scarfMesh);

  // Fluttering Cape tails
  const capeTail = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.52), new THREE.MeshStandardMaterial({ color: 0xc8102e, side: THREE.DoubleSide }));
  capeTail.position.set(0, 0.75, -0.32);
  capeTail.rotation.x = 0.2;
  group.add(capeTail);
  group.userData.capeTail = capeTail;

  // Head
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.23, 20, 20), skinMat);
  headMesh.position.y = 1.1;
  headMesh.castShadow = true;
  group.add(headMesh);

  // Stylized Glowing Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfff6c2 });
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), eyeMat);
  leftEye.position.set(0.085, 1.12, 0.2);
  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), eyeMat);
  rightEye.position.set(-0.085, 1.12, 0.2);
  group.add(leftEye, rightEye);

  // Vietnamese Nón Lá Conical Hat
  const hatMesh = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.28, 24), hatMat);
  hatMesh.position.y = 1.32;
  hatMesh.castShadow = true;
  group.add(hatMesh);

  // Golden weave ring on hat
  const hatBand = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.022, 8, 24), goldTrimMat);
  hatBand.rotation.x = Math.PI / 2;
  hatBand.position.y = 1.18;
  group.add(hatBand);

  // Silk tassel on hat apex
  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.035, 0.18, 8), scarfMat);
  tassel.position.set(0.05, 1.4, -0.05);
  tassel.rotation.z = -0.3;
  group.add(tassel);

  // Wooden shoes/feet
  const footGeo = new THREE.BoxGeometry(0.12, 0.08, 0.22);
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 0.8 });
  const leftFoot = new THREE.Mesh(footGeo, woodMat);
  leftFoot.position.set(0.14, 0.04, 0);
  const rightFoot = new THREE.Mesh(footGeo, woodMat);
  rightFoot.position.set(-0.14, 0.04, 0);
  group.add(leftFoot, rightFoot);
  group.userData.leftFoot = leftFoot;
  group.userData.rightFoot = rightFoot;

  // ----------------- HANDHELD SMALL LANTERN (ĐÈN LỒNG NHỎ TRÊN TAY) -----------------
  const handGroup = new THREE.Group();
  handGroup.position.set(0.38, 0.65, 0.22);

  const handleMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8),
    new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.7 })
  );
  handleMesh.rotation.x = 0.5;
  handleMesh.rotation.z = -0.3;
  handGroup.add(handleMesh);

  const miniLantern = new THREE.Group();
  miniLantern.position.set(0.08, -0.15, 0.15);

  const miniBodyMat = new THREE.MeshStandardMaterial({
    color: 0xc8102e,
    emissive: new THREE.Color(0xff4433),
    emissiveIntensity: 0.6,
    roughness: 0.4
  });
  const miniBody = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.22, 12), miniBodyMat);
  miniLantern.add(miniBody);

  const miniCap = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.08, 8), goldTrimMat);
  miniCap.position.y = 0.13;
  miniLantern.add(miniCap);

  const miniTassel = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 0.12, 6), scarfMat);
  miniTassel.position.y = -0.16;
  miniLantern.add(miniTassel);

  // Glow light inside small lantern (castShadow = false to avoid atlas issues)
  const heldLight = new THREE.PointLight(0xffaa44, 1.2, 5.0);
  heldLight.position.set(0, 0, 0);
  miniLantern.add(heldLight);

  const heldGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: moteGlowTexture,
    color: 0xffc107,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    fog: false,
    blending: THREE.AdditiveBlending
  }));
  heldGlow.scale.set(1.2, 1.2, 1);
  miniLantern.add(heldGlow);

  handGroup.add(miniLantern);
  group.add(handGroup);

  group.userData.handGroup = handGroup;
  group.userData.miniLantern = miniLantern;
  group.userData.heldLight = heldLight;
  group.userData.miniBodyMat = miniBodyMat;

  return group;
}

// ==========================================
// 5. TRADITIONAL LANTERN POST (THAM KHẢO ẢNH 1 - DN00673)
// ==========================================
function createOrientLanternPostMesh(id) {
  const group = new THREE.Group();

  const redWoodMat = new THREE.MeshStandardMaterial({ color: 0x9b2226, roughness: 0.55 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x4a0e17, roughness: 0.6 });
  const goldRingMat = new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: 0.5, roughness: 0.3 });

  // 1. Plinth / Base
  const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.65), redWoodMat);
  basePlinth.position.y = 0.225;
  basePlinth.castShadow = true;
  basePlinth.receiveShadow = true;
  group.add(basePlinth);

  // 2. Main Post
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.4, 0.24), redWoodMat);
  post.position.y = 1.95;
  post.castShadow = true;
  group.add(post);

  // Gold collar rings
  [0.8, 1.8, 2.9].forEach(y => {
    const ring = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.28), goldRingMat);
    ring.position.y = y;
    group.add(ring);
  });

  // 3. Cantilever Arm with upward winged tips
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 0.22), redWoodMat);
  arm.position.set(0.45, 3.45, 0);
  arm.castShadow = true;
  group.add(arm);

  const tipL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 4), redWoodMat);
  tipL.position.set(-0.35, 3.56, 0);
  tipL.rotation.z = -0.7;
  const tipR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 4), redWoodMat);
  tipR.position.set(1.22, 3.56, 0);
  tipR.rotation.z = 0.7;
  group.add(tipL, tipR);

  // Support strut
  const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.75, 8), redWoodMat);
  strut.position.set(0.48, 3.12, 0);
  strut.rotation.z = -0.85;
  group.add(strut);

  // Hanging chain
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), darkWoodMat);
  chain.position.set(0.95, 3.2, 0);
  group.add(chain);

  // 4. Red Silk Drum Lantern (Ảnh 1 DN00673)
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0x8b1e1e,
    emissive: new THREE.Color(0x330808),
    roughness: 0.45
  });
  const lanternBody = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.72, 16), lanternMat);
  lanternBody.position.set(0.95, 2.65, 0);
  lanternBody.scale.set(1.15, 1.0, 1.15);
  group.add(lanternBody);

  const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16), darkWoodMat);
  topCap.position.set(0.95, 3.03, 0);
  const bottomCap = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16), darkWoodMat);
  bottomCap.position.set(0.95, 2.27, 0);
  group.add(topCap, bottomCap);

  // Crimson Silk Tassel
  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0xc8102e }));
  tassel.position.set(0.95, 2.02, 0);
  group.add(tassel);

  // Warm Golden Amber PointLight inside lantern (Physically illuminates 3D terrain & flora)
  const light = new THREE.PointLight(0xffaa33, 0.0, 22.0, 1.6);
  light.position.set(0.95, 2.65, 0);
  group.add(light);

  // Volumetric 3D Soft Light Sphere (Natural warm spherical aura, not a flat 2D slice)
  const glowSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xffaa33,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );
  glowSphere.position.set(0.95, 2.65, 0);
  group.add(glowSphere);

  // Soft Radial Glow Sprite (Camera-facing atmospheric haze)
  const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: lanternGlowTexture,
    color: 0xffaa33,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    fog: false,
    blending: THREE.AdditiveBlending
  }));
  glowSprite.position.set(0.95, 2.65, 0);
  glowSprite.scale.set(10, 10, 1);
  group.add(glowSprite);

  // 3D Fuel Gauge Bar Billboard (Above lantern at Y = 3.65)
  const fuelBarGroup = new THREE.Group();
  fuelBarGroup.position.set(0.95, 3.65, 0);

  const bgGeo = new THREE.PlaneGeometry(1.2, 0.16);
  const bgMat = new THREE.MeshBasicMaterial({ color: 0x111625, depthTest: false, side: THREE.DoubleSide });
  const bgMesh = new THREE.Mesh(bgGeo, bgMat);
  fuelBarGroup.add(bgMesh);

  const fillGeo = new THREE.PlaneGeometry(1.16, 0.12);
  fillGeo.translate(0.58, 0, 0); // Origin at left edge
  const fillMat = new THREE.MeshBasicMaterial({ color: 0x38ef7d, depthTest: false, side: THREE.DoubleSide });
  const fillMesh = new THREE.Mesh(fillGeo, fillMat);
  fillMesh.position.set(-0.58, 0, 0.01);
  fuelBarGroup.add(fillMesh);

  fuelBarGroup.visible = false;
  group.add(fuelBarGroup);

  group.userData = {
    id,
    lanternBody,
    topCap,
    bottomCap,
    lanternMat,
    light,
    glowSphere,
    glowSprite,
    fuelBarGroup,
    fillMesh,
    fillMat,
    lit: false,
    lightProgress: 0.0
  };

  return group;
}

// ==========================================
// 6. NATURE & ISLAND ENVIRONMENT (THAM KHẢO ẢNH 2)
// ==========================================
const natureGroup = new THREE.Group();
scene.add(natureGroup);

// Broadleaf Palm tree (Ghibli tropical tree from Image 2)
function buildTropicalTree(x, z, groundY = 0) {
  const tree = new THREE.Group();
  tree.position.set(x, groundY, z);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.85 });
  const frondMat = new THREE.MeshStandardMaterial({ color: 0x2d7f50, roughness: 0.55, side: THREE.DoubleSide });

  for (let s = 0; s < 4; s++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.2 - s * 0.02, 0.24 - s * 0.02, 0.85, 8), trunkMat);
    seg.position.set(0.04 * s, s * 0.8 + 0.42, 0);
    seg.rotation.z = -0.05 * s;
    seg.castShadow = true;
    tree.add(seg);
  }

  for (let f = 0; f < 6; f++) {
    const ang = (f / 6) * Math.PI * 2;
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.6, 4), frondMat);
    frond.position.set(Math.cos(ang) * 0.85, 3.4, Math.sin(ang) * 0.85);
    frond.rotation.set(Math.cos(ang) * 0.85, ang, Math.sin(ang) * 0.85);
    frond.castShadow = true;
    tree.add(frond);
  }

  return tree;
}

// Ancient Moss-Covered Stone Altar / Dolmen (Mô phỏng phiến đá phủ rêu trong Ảnh 2)
function buildAncientDolmenAltar(x, z, groundY = 0) {
  const dolmen = new THREE.Group();
  dolmen.position.set(x, groundY, z);

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.9, flatShading: true });
  const mossMat = new THREE.MeshStandardMaterial({ color: 0x388e3c, roughness: 0.75 });

  const pillar1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 1), stoneMat);
  pillar1.scale.set(0.9, 1.8, 0.9);
  pillar1.position.set(-1.3, 0.9, 0);
  pillar1.castShadow = true;

  const pillar2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 1), stoneMat);
  pillar2.scale.set(0.9, 1.8, 0.9);
  pillar2.position.set(1.3, 0.9, 0);
  pillar2.castShadow = true;

  const slab = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.6, 2.4), stoneMat);
  slab.position.set(0, 2.0, 0);
  slab.rotation.z = 0.08;
  slab.rotation.y = 0.15;
  slab.castShadow = true;

  const mossTop = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.15, 2.45), mossMat);
  mossTop.position.set(0, 2.3, 0);
  mossTop.rotation.z = 0.08;
  mossTop.rotation.y = 0.15;

  dolmen.add(pillar1, pillar2, slab, mossTop);
  return dolmen;
}

// Fantasy Lotus Clumps (Blue and Yellow blossoms from Image 2)
function createFlowerClump(x, z, groundY = 0, colorHex = 0x22a6ff) {
  const clump = new THREE.Group();
  clump.position.set(x, groundY, z);

  const petalMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4, side: THREE.DoubleSide });
  const centerMat = new THREE.MeshBasicMaterial({ color: 0xffe58a });

  for (let i = 0; i < 3; i++) {
    const fx = (Math.random() - 0.5) * 0.6;
    const fz = (Math.random() - 0.5) * 0.6;
    const flower = new THREE.Group();
    flower.position.set(fx, 0.25, fz);

    for (let p = 0; p < 5; p++) {
      const ang = (p / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 4), petalMat);
      petal.rotation.set(Math.cos(ang) * 0.5, ang, Math.sin(ang) * 0.5);
      flower.add(petal);
    }
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), centerMat);
    flower.add(center);

    clump.add(flower);
  }
  return clump;
}

function buildMossyRock(x, z, groundY = 0, scale = 1.0) {
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x3d4b5c, roughness: 0.9, flatShading: true });
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7 * scale, 1), rockMat);
  rock.position.set(x, groundY + 0.35 * scale, z);
  rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
}

// Stylized Wild Grass Clumps (Cỏ linh tinh mọc rải rác trên đảo)
function buildGrassTuft(x, z, groundY = 0, scale = 1.0) {
  const group = new THREE.Group();
  group.position.set(x, groundY, z);

  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x3d7844,
    roughness: 0.85,
    side: THREE.DoubleSide
  });
  const flowerMat = new THREE.MeshBasicMaterial({ color: 0xfff3a8 });

  const bladeGeo = new THREE.ConeGeometry(0.12 * scale, 0.65 * scale, 3);
  for (let i = 0; i < 5; i++) {
    const blade = new THREE.Mesh(bladeGeo, grassMat);
    const ang = (i / 5) * Math.PI * 2;
    blade.position.set(Math.cos(ang) * 0.12 * scale, 0.32 * scale, Math.sin(ang) * 0.12 * scale);
    blade.rotation.set(0.35 * Math.sin(ang), ang, 0.35 * Math.cos(ang));
    blade.castShadow = true;
    group.add(blade);
  }

  const bud = new THREE.Mesh(new THREE.SphereGeometry(0.06 * scale, 6, 6), flowerMat);
  bud.position.set(0, 0.45 * scale, 0);
  group.add(bud);

  return group;
}

// Cozy Oriental Island Cottage (Căn nhà nhỏ ấm áp với đèn lồng hiên nhà)
function buildSmallCottage(x, y, z, rotationY = 0) {
  const hut = new THREE.Group();
  hut.position.set(x, y, z);
  hut.rotation.y = rotationY;

  const foundationMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.9 });
  const woodWallMat = new THREE.MeshStandardMaterial({ color: 0x6e472a, roughness: 0.85 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b3a2b, roughness: 0.65 });
  const windowGlowMat = new THREE.MeshBasicMaterial({ color: 0xffd17a });
  const darkTrimMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.7 });

  // Foundation
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 3.2), foundationMat);
  base.position.y = 0.2;
  base.castShadow = true;
  base.receiveShadow = true;
  hut.add(base);

  // Main walls
  const walls = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.8, 2.6), woodWallMat);
  walls.position.y = 1.3;
  walls.castShadow = true;
  walls.receiveShadow = true;
  hut.add(walls);

  // Corner timber pillars
  [[-1.4, -1.2], [1.4, -1.2], [-1.4, 1.2], [1.4, 1.2]].forEach(([px, pz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.9, 0.2), darkTrimMat);
    post.position.set(px, 1.35, pz);
    post.castShadow = true;
    hut.add(post);
  });

  // Front Door
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.08), darkTrimMat);
  door.position.set(0, 1.0, 1.32);
  hut.add(door);

  // Glowing Windows
  [-1.52, 1.52].forEach(wx => {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.55), windowGlowMat);
    win.position.set(wx, 1.4, 0);
    win.rotation.y = wx > 0 ? Math.PI / 2 : -Math.PI / 2;
    hut.add(win);
  });
  const frontWin = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.4), windowGlowMat);
  frontWin.position.set(0.75, 1.4, 1.32);
  hut.add(frontWin);

  // Curved Oriental Hip-and-Gable Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.1, 4), roofMat);
  roof.position.y = 2.75;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  hut.add(roof);

  // Overhang porch
  const porchEave = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.9), roofMat);
  porchEave.position.set(0, 1.9, 1.6);
  porchEave.rotation.x = 0.2;
  porchEave.castShadow = true;
  hut.add(porchEave);

  // Little porch lantern
  const porchLantern = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.07, 0.18, 8),
    new THREE.MeshStandardMaterial({
      color: 0xc8102e,
      emissive: 0xff7722,
      emissiveIntensity: 0.8
    })
  );
  porchLantern.position.set(0.45, 1.65, 1.7);
  hut.add(porchLantern);

  const porchLight = new THREE.PointLight(0xffaa44, 0.8, 4.5);
  porchLight.position.set(0.45, 1.65, 1.7);
  hut.add(porchLight);

  return hut;
}

// Jump Pad 3D Model
function buildJumpPadMesh(x, y, z) {
  const pad = new THREE.Group();
  pad.position.set(x, y, z);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.4, 0.25, 24),
    new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.8, flatShading: true })
  );
  base.position.y = 0.125;
  pad.add(base);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.0, 0.08, 12, 32),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.26;
  pad.add(ring);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: cyanGlowTexture,
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    fog: false,
    blending: THREE.AdditiveBlending
  }));
  glow.position.y = 0.5;
  glow.scale.set(3.0, 3.0, 1);
  pad.add(glow);

  return pad;
}

// Grand Pagoda Bell Tower (Tháp Chuông Đêm 3 - obstacle R=2.0m)
function buildPagodaBellTower(x, y, z) {
  const tower = new THREE.Group();
  tower.position.set(x, y, z);

  const redMat = new THREE.MeshStandardMaterial({ color: 0x9b2226, roughness: 0.6 });
  const goldRoofMat = new THREE.MeshStandardMaterial({ color: 0xdeb841, roughness: 0.45 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x3d1e1e, roughness: 0.7 });
  const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xa87932, metalness: 0.7, roughness: 0.35 });

  // Stone base platform
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.6, 24), darkWoodMat);
  base.position.y = 0.3;
  base.castShadow = true;
  tower.add(base);

  // 4 Red Pavilion Pillars
  const pillarAngles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
  pillarAngles.forEach(ang => {
    const px = Math.cos(ang) * 1.3;
    const pz = Math.sin(ang) * 1.3;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 4.0, 12), redMat);
    col.position.set(px, 2.3, pz);
    col.castShadow = true;
    tower.add(col);
  });

  // Lower Eaves / Roof
  const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 0.8, 4), goldRoofMat);
  lowerRoof.position.y = 4.4;
  lowerRoof.rotation.y = Math.PI / 4;
  lowerRoof.castShadow = true;
  tower.add(lowerRoof);

  // Upper Pavilion & Upper Roof
  const upperPlinth = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.6), redMat);
  upperPlinth.position.y = 5.0;
  tower.add(upperPlinth);

  const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 0.9, 4), goldRoofMat);
  upperRoof.position.y = 5.8;
  upperRoof.rotation.y = Math.PI / 4;
  upperRoof.castShadow = true;
  tower.add(upperRoof);

  // Hanging Antique Bronze Bell
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.75, 1.4, 16), bronzeMat);
  bell.position.y = 2.6;
  bell.castShadow = true;
  tower.add(bell);

  return tower;
}

// ==========================================
// 7. ISLAND TERRAIN GENERATION (3 NIGHTS PER PDF 2)
// ==========================================
const islandMeshGroup = new THREE.Group();
scene.add(islandMeshGroup);

function buildIslandTerrain(night) {
  while (islandMeshGroup.children.length > 0) {
    const obj = islandMeshGroup.children[0];
    islandMeshGroup.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
  }
  while (natureGroup.children.length > 0) {
    const obj = natureGroup.children[0];
    natureGroup.remove(obj);
  }

  // Adjust moonlight shadow camera position per night to prevent ANY cutoff
  if (night === 2) {
    moonLight.position.set(70, 85, -85);
    moonLight.target.position.set(35, 0, 0);
    moonLight.shadow.camera.left = -90;
    moonLight.shadow.camera.right = 90;
  } else if (night === 3) {
    moonLight.position.set(45, 90, -85);
    moonLight.target.position.set(0, 3, 0);
    moonLight.shadow.camera.left = -75;
    moonLight.shadow.camera.right = 75;
  } else {
    moonLight.position.set(45, 80, -85);
    moonLight.target.position.set(0, 0, 0);
    moonLight.shadow.camera.left = -75;
    moonLight.shadow.camera.right = 75;
  }
  moonLight.target.updateMatrixWorld();
  moonLight.shadow.camera.updateProjectionMatrix();

  // Shared round stepping stone assets & builders
  const stoneGeo = new THREE.CylinderGeometry(0.55, 0.62, 0.08, 16);
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x546274, // Mossy river slate stone
    roughness: 0.88,
    flatShading: true
  });

  function addSteppingPath(x1, z1, x2, z2, groundY = 0.04) {
    const dist = Math.hypot(x2 - x1, z2 - z1);
    if (dist < 1.0) return;
    const dirX = (x2 - x1) / dist;
    const dirZ = (z2 - z1) / dist;
    for (let d = 1.6; d <= dist - 1.0; d += 1.4) {
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      const jLat = Math.sin(d * 6.3) * 0.08;
      const sx = x1 + dirX * d + (-dirZ) * jLat;
      const sz = z1 + dirZ * d + dirX * jLat;
      stone.position.set(sx, groundY, sz);
      const scale = 0.88 + Math.sin(d * 3.7) * 0.16;
      stone.scale.set(scale, 1.0, scale);
      stone.rotation.y = d * 1.5;
      stone.receiveShadow = true;
      islandMeshGroup.add(stone);
    }
  }

  function addStonePlaza(cx, cz, groundY = 0.04, radius = 1.5, count = 8) {
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(cx + Math.cos(ang) * radius, groundY, cz + Math.sin(ang) * radius);
      stone.scale.set(1.05, 1.0, 1.05);
      stone.receiveShadow = true;
      islandMeshGroup.add(stone);
    }
  }

  if (night === 1) {
    // ----------------- NIGHT 1: ĐẢO BẾN (R=40m) -----------------
    const diskGeo = new THREE.CylinderGeometry(40.0, 38.0, 4, 64);
    const diskMesh = new THREE.Mesh(diskGeo, sharedGrassMat);
    diskMesh.position.y = -2;
    diskMesh.receiveShadow = true;
    islandMeshGroup.add(diskMesh);

    // 5 đường lát đá tròn dẫn đường đến 5 đèn lồng
    addStonePlaza(0, 0, 0.04);
    const lanternTargets = [
      [0, 25.0], [23.8, 7.7], [14.7, -20.2], [-14.7, -20.2], [-23.8, 7.7]
    ];
    lanternTargets.forEach(([lx, lz]) => {
      addSteppingPath(0, 0, lx, lz, 0.04);
    });

    // Căn nhà nhỏ ấm cúng trên Đảo Bến (nhà người giữ đảo cạnh rặng cây)
    natureGroup.add(buildSmallCottage(-14.0, 0.0, 14.0, 0.45));

    // Ancient Moss-Covered Stone Altar (from Image 2)
    natureGroup.add(buildAncientDolmenAltar(-6.0, 8.0, 0));

    // Cây cối đặt ở các khoảng trống GIỮA các con đường, TUYỆT ĐỐI KHÔNG che khuất tầm nhìn 5 ngọn đèn lồng!
    const treeCoords = [
      [10.0, 14.0], [15.0, 20.0], [7.0, 9.0],
      [-10.0, 14.0], [-16.0, 21.0], [-18.0, 12.0],
      [-20.0, -8.0], [-25.0, -10.0], [-14.0, -5.0],
      [0.0, -18.0], [0.0, -28.0], [-5.0, -12.0], [5.0, -12.0],
      [18.0, -6.0], [25.0, -8.0], [12.0, -4.0]
    ];
    treeCoords.forEach(([tx, tz]) => {
      natureGroup.add(buildTropicalTree(tx, tz, 0));
    });

    // Scatter mossy boulders
    const boulderCoords = [
      [5.0, 4.0], [-4.0, -6.0], [10.0, -12.0], [-14.0, -5.0], [4.0, 16.0],
      [-12.0, 12.0], [18.0, -4.0], [-20.0, -8.0], [16.0, 20.0], [-8.0, -18.0],
      [24.0, 12.0], [-24.0, 10.0], [10.0, 26.0]
    ];
    boulderCoords.forEach(([rx, rz], idx) => {
      natureGroup.add(buildMossyRock(rx, rz, 0, 0.9 + (idx % 3) * 0.4));
    });

    // Cỏ linh tinh rải rác trên đảo
    const grassCoords1 = [
      [3.0, 5.0], [-5.0, -8.0], [8.0, 12.0], [-12.0, 6.0], [15.0, -10.0],
      [-16.0, -12.0], [6.0, -20.0], [-8.0, 22.0], [20.0, 14.0], [-22.0, 2.0],
      [12.0, 24.0], [-18.0, -18.0], [4.0, -14.0], [-10.0, 16.0], [1.0, 11.0]
    ];
    grassCoords1.forEach(([gx, gz], idx) => {
      natureGroup.add(buildGrassTuft(gx, gz, 0, 0.85 + (idx % 3) * 0.2));
    });

    // Scatter Fantasy Lotus Flowers (Blue & Yellow from Image 2)
    const flowerCoords = [
      [-3.0, 4.0, 0x22a6ff], [4.0, -3.0, 0xfbbf24], [-7.0, 9.0, 0x22a6ff],
      [9.0, 6.0, 0xfbbf24], [-10.0, -7.0, 0x22a6ff], [11.0, -5.0, 0xfbbf24],
      [-15.0, 3.0, 0x22a6ff], [13.0, 10.0, 0xfbbf24], [-3.0, -11.0, 0x22a6ff],
      [18.0, -14.0, 0x22a6ff], [-18.0, 18.0, 0xfbbf24]
    ];
    flowerCoords.forEach(([fx, fz, col]) => {
      natureGroup.add(createFlowerClump(fx, fz, 0, col));
    });

  } else if (night === 2) {
    // ----------------- NIGHT 2: ĐẢO CAU (TWIN ISLANDS R=28m + BAMBOO BRIDGE) -----------------
    // Island 1 at (0, 0, 0)
    const isl1 = new THREE.Mesh(new THREE.CylinderGeometry(28.0, 26.0, 4, 48), sharedGrassMat);
    isl1.position.set(0, -2, 0);
    isl1.receiveShadow = true;
    islandMeshGroup.add(isl1);

    // Island 2 at (70, 0, 0)
    const isl2 = new THREE.Mesh(new THREE.CylinderGeometry(28.0, 26.0, 4, 48), sharedGrassMat);
    isl2.position.set(70, -2, 0);
    isl2.receiveShadow = true;
    islandMeshGroup.add(isl2);

    // Bamboo Suspension Bridge between x=26 and x=44, z in [-2, 2]
    const bridgeGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.85 });
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8c6d46, roughness: 0.9 });

    // Deck planks
    for (let x = 26; x <= 44; x += 0.8) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 4.0), woodMat);
      plank.position.set(x, 0.05, 0);
      plank.receiveShadow = true;
      bridgeGroup.add(plank);
    }
    // Ropes along edges
    [-2.0, 2.0].forEach(z => {
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 18.5, 8), ropeMat);
      rope.rotation.z = Math.PI / 2;
      rope.position.set(35, 0.6, z);
      bridgeGroup.add(rope);

      // Support posts along rope
      [26, 30.5, 35, 39.5, 44].forEach(px => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6), woodMat);
        post.position.set(px, 0.35, z);
        bridgeGroup.add(post);
      });
    });
    islandMeshGroup.add(bridgeGroup);

    // ----------------- ĐƯỜNG ĐÁ TRÒN DẪN ĐẾN CÁC TRỤ ĐÈN (ĐẢO CAU) -----------------
    // Đảo 1: Sân đá trung tâm (0, 0) và đường đá tới L1, L2, L3 + Đầu cầu tre
    addStonePlaza(0, 0, 0.04);
    addSteppingPath(0, 0, 0.0, 18.0, 0.04);   // Tới L1
    addSteppingPath(0, 0, 14.0, -10.0, 0.04); // Tới L2
    addSteppingPath(0, 0, -14.0, -10.0, 0.04);// Tới L3
    addSteppingPath(0, 0, 26.0, 0.0, 0.04);   // Tới đầu cầu tre

    // Đảo 2: Sân đá trung tâm (70, 0) và đường đá tới L4, L5, L6 + Đầu ra cầu tre
    addStonePlaza(70, 0, 0.04);
    addSteppingPath(70, 0, 70.0, 18.0, 0.04);  // Tới L4
    addSteppingPath(70, 0, 84.0, -10.0, 0.04); // Tới L5
    addSteppingPath(70, 0, 56.0, -10.0, 0.04); // Tới L6
    addSteppingPath(70, 0, 44.0, 0.0, 0.04);   // Tới cuối cầu tre

    // Căn nhà nhỏ ấm cúng trên Đảo Cau (Đảo 1, nhìn ra mặt nước và cầu tre)
    natureGroup.add(buildSmallCottage(-14.0, 0.0, 2.0, 0.25));

    // Jump Pads (JP1 at [20, 0, 18], JP2 at [50, 0, -18])
    natureGroup.add(buildJumpPadMesh(20, 0, 18));
    natureGroup.add(buildJumpPadMesh(50, 0, -18));

    // Trees and rocks on both islands
    [
      [8, 12], [-10, 10], [-12, -8], [12, -10], [-6, -14],
      [62, 10], [78, 12], [82, -8], [58, -12], [70, 14]
    ].forEach(([tx, tz]) => {
      natureGroup.add(buildTropicalTree(tx, tz, 0));
    });

    [
      [5, 4], [-4, -6], [14, 6], [-12, -4],
      [66, 6], [75, -5], [60, -8], [78, 8]
    ].forEach(([rx, rz], idx) => {
      natureGroup.add(buildMossyRock(rx, rz, 0, 0.9 + (idx % 2) * 0.3));
    });

    // Cỏ linh tinh rải rác trên cả 2 hòn đảo
    const grassCoords2 = [
      [-6.0, 8.0], [6.0, -6.0], [-10.0, -12.0], [14.0, 12.0], [-16.0, 8.0],
      [10.0, -14.0], [18.0, 4.0], [-8.0, -4.0],
      [64.0, 8.0], [76.0, -6.0], [62.0, -10.0], [78.0, 10.0], [82.0, -4.0],
      [58.0, 6.0], [72.0, -14.0], [80.0, 8.0]
    ];
    grassCoords2.forEach(([gx, gz], idx) => {
      natureGroup.add(buildGrassTuft(gx, gz, 0, 0.85 + (idx % 3) * 0.2));
    });

  } else if (night === 3) {
    // ----------------- NIGHT 3: ĐẢO CHUÔNG (3 TIERS Y=0, Y=3, Y=6 + BELL TOWER) -----------------
    // Tier 0: Chân đảo Y=0, R=45m
    const t0 = new THREE.Mesh(new THREE.CylinderGeometry(45.0, 42.0, 4, 64), sharedGrassMat);
    t0.position.set(0, -2, 0);
    t0.receiveShadow = true;
    islandMeshGroup.add(t0);

    // Tier 1: Cao nguyên bán nguyệt tại Y=3 (R=24m, CHỈ NẰM Ở PHÍA BẮC Z >= 0!)
    const t1Geo = new THREE.CylinderGeometry(24.0, 24.0, 3.0, 48, 1, false, -Math.PI / 2, Math.PI);
    const t1 = new THREE.Mesh(t1Geo, sharedGrassMat);
    t1.position.set(0, 1.5, 0);
    t1.receiveShadow = true;
    islandMeshGroup.add(t1);

    // Vách đá đứng dọc theo Z = 0 ngăn cách Tầng 1 và Tầng 0 phía Nam
    const cliffMat = new THREE.MeshStandardMaterial({ color: 0x3d4b5c, roughness: 0.9, flatShading: true });
    const cliffMesh = new THREE.Mesh(new THREE.BoxGeometry(48.0, 3.0, 0.45), cliffMat);
    cliffMesh.position.set(0, 1.5, 0);
    cliffMesh.receiveShadow = true;
    islandMeshGroup.add(cliffMesh);

    // Tier 2: Đỉnh Tháp Chuông tại Y=6, R=8m
    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(8.0, 8.0, 3.0, 32), sharedGrassMat);
    t2.position.set(0, 4.5, 0);
    t2.receiveShadow = true;
    islandMeshGroup.add(t2);

    // ----------------- BẬC THANG ĐÁ ĐI XUỐNG TỪ TẦNG 2 XUỐNG TẦNG 1 (SUMMIT DESCENT STAIRS) -----------------
    // Kết nối từ (0, 6.0, 7.5) xuống (0, 3.0, 11.5)
    const summitStairGroup = new THREE.Group();
    const stairMat = new THREE.MeshStandardMaterial({ color: 0x546274, roughness: 0.88, flatShading: true });
    const woodRailMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.8 });

    // Dốc nền đá nghiêng kết nối 2 tầng
    const rampLength = Math.hypot(4.0, 3.0); // 5.0m
    const rampSlope = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, rampLength), stairMat);
    rampSlope.position.set(0, 4.5, 9.5);
    rampSlope.rotation.x = Math.atan2(3.0, 4.0);
    rampSlope.receiveShadow = true;
    summitStairGroup.add(rampSlope);

    // 6 bậc đá lớn (stepping stone slabs) phân tầng rõ rệt
    for (let i = 0; i <= 5; i++) {
      const stepT = i / 5;
      const stepZ = 7.5 + stepT * 4.0;
      const stepY = 6.0 - stepT * 3.0;
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.22, 0.8), stairMat);
      stepMesh.position.set(0, stepY - 0.1, stepZ);
      stepMesh.receiveShadow = true;
      summitStairGroup.add(stepMesh);
    }

    // 2 hàng cột đèn lồng nhỏ dẫn đường ở 2 bên bậc thang
    [-1.9, 1.9].forEach(sideX => {
      [8.0, 11.0].forEach(sideZ => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), woodRailMat);
        const postY = (sideZ === 8.0) ? 6.0 : 3.6;
        post.position.set(sideX, postY, sideZ);
        summitStairGroup.add(post);

        const miniLamp = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xffaa33 })
        );
        miniLamp.position.set(sideX, postY + 0.6, sideZ);
        summitStairGroup.add(miniLamp);
      });
    });
    islandMeshGroup.add(summitStairGroup);

    // ----------------- DỐC ĐÁ 30° VÀ 150° NỐI TẦNG 1 VÀ TẦNG 0 -----------------
    const stoneMatRamp = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.9 });
    [30, 150].forEach(deg => {
      const rad = (deg * Math.PI) / 180;
      const rampLen = 7.2;
      const ramp = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, rampLen), stoneMatRamp);
      const midR = 27.0;
      ramp.position.set(midR * Math.cos(rad), 1.5, midR * Math.sin(rad));
      ramp.rotation.y = -rad + Math.PI / 2;
      ramp.rotation.x = 0.45;
      ramp.receiveShadow = true;
      islandMeshGroup.add(ramp);

      // Cột đèn lồng chỉ dẫn ở đỉnh dốc Tầng 1 (Descent Waypoint)
      const topX = 24.0 * Math.cos(rad);
      const topZ = 24.0 * Math.sin(rad);
      const guidePost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8), woodRailMat);
      guidePost.position.set(topX + (deg === 30 ? -1.8 : 1.8), 3.75, topZ);
      islandMeshGroup.add(guidePost);

      const guideLamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffaa33 })
      );
      guideLamp.position.set(topX + (deg === 30 ? -1.8 : 1.8), 4.6, topZ);
      islandMeshGroup.add(guideLamp);
    });

    // ----------------- ĐƯỜNG ĐÁ TRÒN DẪN ĐẾN CÁC TRỤ ĐÈN (ĐẢO CHUÔNG) -----------------
    // Tầng 0 (Y=0.04): Sân đá trung tâm (0, 0) dẫn tới L4, L5, L6, L7 và chân 2 con dốc đá
    addStonePlaza(0, 0, 0.04);
    addSteppingPath(0, 0, 35.0, -10.0, 0.04);   // Tới L4
    addSteppingPath(0, 0, -35.0, -10.0, 0.04);  // Tới L5
    addSteppingPath(0, 0, 20.0, -35.0, 0.04);   // Tới L6
    addSteppingPath(0, 0, -20.0, -35.0, 0.04);  // Tới L7
    addSteppingPath(0, 0, 26.0, 15.0, 0.04);    // Tới chân dốc đá 30°
    addSteppingPath(0, 0, -26.0, 15.0, 0.04);   // Tới chân dốc đá 150°

    // Lát đá dọc theo 2 con dốc để người chơi nhìn rõ đường đi xuống chân đảo
    for (let d = 24.5; d <= 29.5; d += 1.2) {
      [30, 150].forEach(deg => {
        const rad = (deg * Math.PI) / 180;
        const tRamp = (30.0 - d) / 6.0;
        const rampY = tRamp * 3.0 + 0.22;
        const stone = new THREE.Mesh(stoneGeo, stoneMat);
        stone.position.set(d * Math.cos(rad), rampY, d * Math.sin(rad));
        stone.receiveShadow = true;
        islandMeshGroup.add(stone);
      });
    }

    // Tầng 1 (Y=3.04): Đường đá nối từ đỉnh dốc tới L2, L3 và hội tụ về Bục Nhảy (0, 13)
    addSteppingPath(20.8, 12.0, 18.0, 10.0, 3.04); // Đỉnh dốc 30° -> L2
    addSteppingPath(-20.8, 12.0, -18.0, 10.0, 3.04);// Đỉnh dốc 150° -> L3
    addSteppingPath(18.0, 10.0, 0.0, 13.0, 3.04);   // L2 -> Bục nhảy
    addSteppingPath(-18.0, 10.0, 0.0, 13.0, 3.04);  // L3 -> Bục nhảy

    // Tầng 2 (Y=6.04): Đường đá tròn từ điểm đáp bục nhảy (0, 4) men quanh Tháp Chuông tới L1 (0, 6)
    // Và dẫn tiếp tới đầu Cầu thang đá đi xuống (0, 7.5)!
    addSteppingPath(0.0, 4.0, 0.0, 6.0, 6.04);
    addSteppingPath(0.0, 6.0, 0.0, 7.5, 6.04); // L1 -> Đầu cầu thang đi xuống
    addStonePlaza(0.0, 6.0, 6.04, 1.4, 6);

    // Chân cầu thang đá (0, 11.5) nối thẳng vào Bục Nhảy (0, 13) trên Tầng 1
    addSteppingPath(0.0, 11.5, 0.0, 13.0, 3.04);

    // Căn nhà nhỏ ấm cúng trên Đảo Chuông (Ngôi nhà sơn cước ở Tầng 1 lộng gió)
    natureGroup.add(buildSmallCottage(0.0, 3.0, 21.0, Math.PI));

    // Jump Pad at Tier 1 (0, 3, 13)
    natureGroup.add(buildJumpPadMesh(0, 3, 13));

    // Grand Pagoda Bell Tower at center of Tier 3 (0, 6, 0)
    natureGroup.add(buildPagodaBellTower(0, 6, 0));

    // Mountain flora
    [
      [28, 14], [-26, 12], [16, -26], [-18, -24], [30, -12],
      [-14, 14], [14, 16]
    ].forEach(([tx, tz]) => {
      const y = (Math.sqrt(tx * tx + tz * tz) <= 24 && tz > 0) ? 3 : 0;
      natureGroup.add(buildTropicalTree(tx, tz, y));
    });

    [
      [22, 10], [-20, 8], [12, -18], [-14, -16],
      [4, 6]
    ].forEach(([rx, rz], idx) => {
      const y = (Math.sqrt(rx * rx + rz * rz) <= 8) ? 6 : (Math.sqrt(rx * rx + rz * rz) <= 24 && rz > 0 ? 3 : 0);
      natureGroup.add(buildMossyRock(rx, rz, y, 0.9 + (idx % 2) * 0.4));
    });

    // Cỏ linh tinh rải rác trên Đảo Chuông (Tầng 0 và Tầng 1)
    const grassCoords3 = [
      [14.0, -12.0, 0], [-16.0, -14.0, 0], [28.0, -8.0, 0], [-28.0, -6.0, 0],
      [10.0, -28.0, 0], [-12.0, -26.0, 0], [32.0, 8.0, 0], [-30.0, 10.0, 0],
      [6.0, -8.0, 0], [-6.0, -10.0, 0], [22.0, 6.0, 0], [-20.0, 4.0, 0],
      [12.0, 16.0, 3], [-14.0, 16.0, 3], [6.0, 18.0, 3], [-6.0, 18.0, 3],
      [16.0, 6.0, 3], [-16.0, 6.0, 3]
    ];
    grassCoords3.forEach(([gx, gz, gy], idx) => {
      natureGroup.add(buildGrassTuft(gx, gz, gy, 0.85 + (idx % 3) * 0.2));
    });
  }
}

// ==========================================
// 8. ENTITIES: DARK CLOUDS, DRIFTERS, CHARMS
// ==========================================
function createDarkCloudMesh(id) {
  const group = new THREE.Group();

  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x1e3a8a,
    emissiveIntensity: 0.35,
    roughness: 0.65,
    flatShading: true
  });

  const mainPuff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 1), cloudMat);
  mainPuff.position.y = 0.9;
  mainPuff.castShadow = true;
  group.add(mainPuff);

  const puff1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), cloudMat);
  puff1.position.set(0.45, 0.8, -0.2);
  const puff2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 1), cloudMat);
  puff2.position.set(-0.4, 0.85, 0.2);
  const puff3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), cloudMat);
  puff3.position.set(0.1, 1.25, 0.1);
  group.add(puff1, puff2, puff3);

  // Glowing Eyes (Default purple/blue or colorblind cyan)
  const isColorblind = localStorage.getItem('dao_den_long_colorblind') === 'true';
  const eyeColor = isColorblind ? 0x00b3ff : 0x7a3cff;
  const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
  eyeL.position.set(0.24, 0.95, 0.6);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
  eyeR.position.set(-0.24, 0.95, 0.6);
  group.add(eyeL, eyeR);

  // Point light aura
  const pl = new THREE.PointLight(eyeColor, 1.6, 6.0);
  pl.position.set(0, 0.9, 0);
  group.add(pl);

  group.userData = { id, mainPuff, puff1, puff2, puff3, eyeMat, cloudMat, pl };
  return group;
}

// Drifter (Gió Lạc - Ethereal Wind Spirit on Night 2 & 3)
function createDrifterMesh(id) {
  const group = new THREE.Group();

  const drifterMat = new THREE.MeshStandardMaterial({
    color: 0x8fa3b8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.5,
    roughness: 0.35,
    transparent: true,
    opacity: 0.85
  });

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), drifterMat);
  core.position.y = 0.8;
  group.add(core);

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 8, 24), drifterMat);
  ring1.position.y = 0.8;
  ring1.rotation.x = Math.PI / 3;
  group.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.04, 8, 24), drifterMat);
  ring2.position.y = 0.8;
  ring2.rotation.y = Math.PI / 4;
  group.add(ring2);

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: cyanGlowTexture,
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    fog: false,
    blending: THREE.AdditiveBlending
  }));
  sprite.position.y = 0.8;
  sprite.scale.set(2.4, 2.4, 1);
  group.add(sprite);

  group.userData = { id, core, ring1, ring2, sprite };
  return group;
}

// Charm (Bùa Gió - Red Silk Talisman with Gold Glyphs)
function createCharmMesh(id) {
  const group = new THREE.Group();

  const charmMat = new THREE.MeshStandardMaterial({
    color: 0xc8102e,
    emissive: 0x990011,
    emissiveIntensity: 0.4,
    side: THREE.DoubleSide
  });

  const parchment = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.85), charmMat);
  parchment.position.y = 0.7;
  group.add(parchment);

  // Golden glyph core
  const glyph = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.03, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: 0.7, roughness: 0.3 })
  );
  glyph.position.set(0, 0.7, 0.02);
  group.add(glyph);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: charmGlowTexture,
    color: 0xff3344,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    fog: false,
    blending: THREE.AdditiveBlending
  }));
  glow.position.y = 0.7;
  glow.scale.set(1.8, 1.8, 1);
  group.add(glow);

  group.userData = { id, parchment, glow };
  return group;
}

// ==========================================
// 9. GAME RUNTIME & ENTITIES MANAGEMENT
// ==========================================
let currentNight = 1;
let cumulativeScore = 0;
let sim = null;

const mayMesh = createMayCharacter();
scene.add(mayMesh);

let lanternMeshes = [];
let moteMeshes = new Map();
let shadeMeshes = new Map();
let drifterMeshes = new Map();
let charmMeshes = new Map();

// Generator for Clustered Motes (Tần xuất đom đóm cụm lại 1 chỗ nhiều lên)
function generateClusteredMotes(night) {
  const motes = [];
  let id = 1;

  function addCluster(cx, cz, count, radius = 1.3, groundY = 0) {
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + (i % 2) * 0.4;
      const r = (0.25 + 0.65 * ((i * 3) % 5) / 4) * radius;
      motes.push({
        id: `M${id++}`,
        pos: [
          Math.round((cx + Math.cos(ang) * r) * 1000) / 1000,
          groundY,
          Math.round((cz + Math.sin(ang) * r) * 1000) / 1000
        ]
      });
    }
  }

  if (night === 1) {
    // 13 rich clusters across Đảo Bến (3-4 motes per swarm)
    addCluster(3.5, 3.5, 4, 1.2, 0);       // Center clearing
    addCluster(-6.0, 8.2, 4, 1.4, 0);      // Ancient Dolmen Altar
    addCluster(0.2, 16.0, 4, 1.5, 0);      // North Lotus Clump
    addCluster(15.0, 6.5, 4, 1.5, 0);      // East Palm Grove
    addCluster(10.0, -14.0, 4, 1.4, 0);    // Southeast Mossy Boulders
    addCluster(-4.0, -16.0, 4, 1.5, 0);    // South Meadow
    addCluster(-16.0, -6.0, 4, 1.5, 0);    // West Path
    addCluster(-14.0, 12.0, 4, 1.4, 0);    // Northwest Palms
    addCluster(0.0, 21.5, 3, 1.0, 0);      // Near L1 approach
    addCluster(20.0, 7.0, 3, 1.0, 0);      // Near L2 approach
    addCluster(12.5, -17.5, 3, 1.0, 0);    // Near L3 approach
    addCluster(-12.5, -17.5, 3, 1.0, 0);   // Near L4 approach
    addCluster(-20.0, 7.0, 3, 1.0, 0);     // Near L5 approach
  } else if (night === 2) {
    // Clusters across Island 1, Island 2, and Bamboo Bridge
    addCluster(0, 8, 4, 1.3, 0);
    addCluster(-10, 0, 4, 1.4, 0);
    addCluster(10, -6, 4, 1.4, 0);
    addCluster(0, -12, 4, 1.4, 0);
    addCluster(35, 0, 4, 1.0, 0);          // On the bridge near Charm
    addCluster(70, 8, 4, 1.3, 0);
    addCluster(60, -4, 4, 1.4, 0);
    addCluster(80, 0, 4, 1.4, 0);
    addCluster(70, -12, 4, 1.4, 0);
  } else if (night === 3) {
    // Clusters across the 3 tiers
    addCluster(20, 12, 4, 1.5, 0);         // Tier 1
    addCluster(-22, 10, 4, 1.5, 0);        // Tier 1
    addCluster(14, -22, 4, 1.5, 0);        // Tier 1
    addCluster(-16, -20, 4, 1.5, 0);       // Tier 1
    addCluster(12, 12, 4, 1.3, 3);         // Tier 2
    addCluster(-12, 12, 4, 1.3, 3);        // Tier 2
    addCluster(0, 16, 4, 1.3, 3);          // Tier 2
    addCluster(3, 4, 3, 1.0, 6);           // Tier 3 near Pagoda
    addCluster(-3, 4, 3, 1.0, 6);          // Tier 3 near Pagoda
  }

  return motes;
}

// Initialize Game (Strictly adhering to PDF 1 & PDF 2 standards!)
function initGame(night = 1) {
  currentNight = night;

  const nightNames = {
    1: 'Đêm 1 · Đảo Bến',
    2: 'Đêm 2 · Đảo Cau',
    3: 'Đêm 3 · Đảo Chuông'
  };
  nightBadge.textContent = nightNames[night] || `Đêm ${night}`;

  // Update level selector buttons active state
  levelBtns.forEach(btn => {
    const bNight = parseInt(btn.getAttribute('data-night'), 10);
    btn.classList.toggle('active', bNight === night);
  });

  buildIslandTerrain(night);

  lanternMeshes.forEach(l => scene.remove(l));
  lanternMeshes = [];
  moteMeshes.forEach(m => scene.remove(m));
  moteMeshes.clear();
  shadeMeshes.forEach(s => scene.remove(s));
  shadeMeshes.clear();
  drifterMeshes.forEach(d => scene.remove(d));
  drifterMeshes.clear();
  charmMeshes.forEach(c => scene.remove(c));
  charmMeshes.clear();

  const clusterMotes = generateClusteredMotes(night);

  // Initial chasing dark clouds (Chỉ 1 đám mây đen dí chậm từ đầu, tối đa 2 mây đen toàn bản đồ)
  let initialShades = [
    { id: 'S1', pos: [14.0, 0, 10.0], state: 'chase' }
  ];
  if (night === 2) {
    initialShades = [
      { id: 'S1', pos: [14.0, 0, 10.0], state: 'chase' }
    ];
  } else if (night === 3) {
    initialShades = [
      { id: 'S1', pos: [14.0, 0, 10.0], state: 'chase' }
    ];
  }

  // Create simulation
  sim = new Simulation({
    night,
    seed: 12345 + night * 100,
    tuning: {
      shade_speed: 1.85,        // Mây đen di chuyển vừa phải
      shade_detect_radius: 35.0,// Tầm phát hiện vừa phải
      shade_lose_radius: 50.0   // Không bị mất dấu khi Mây lùi lại
    },
    scenario: {
      motes: clusterMotes,
      shades: initialShades
    }
  });

  // Điều chỉnh lịch sinh mây đen để không làm ngợp người chơi (tối đa 2 mây đen trên đảo)
  if (sim.map.shade_schedule) {
    sim.map.shade_schedule.first_count = 0;       // Không sinh ồ ạt lúc 5 giây
    sim.map.shade_schedule.max_shades = 2;        // Tối đa chỉ 2 đám mây đen
    sim.map.shade_schedule.interval_ticks = 1800; // 30s mới xem xét thêm nếu thiếu
    sim.map.shade_schedule.speed = 1.85;          // Tốc độ di chuyển chậm rãi
  }

  // Assign cluster spawn points for periodic respawn
  sim.map.mote_spawns = clusterMotes.map(m => [...m.pos]);

  // Create Lantern Posts based on Image 1 placed at PDF 2 exact coordinates
  for (const l of sim.lanterns) {
    const mesh = createOrientLanternPostMesh(l.id);
    mesh.position.set(l.pos[0], l.pos[1], l.pos[2]);
    scene.add(mesh);
    lanternMeshes.push(mesh);
  }

  mayMesh.position.set(sim.player.pos[0], sim.player.pos[1], sim.player.pos[2]);

  pauseModal.style.display = 'none';
  gameoverModal.style.display = 'none';
}

// Hook level select buttons in pause menu
levelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const n = parseInt(btn.getAttribute('data-night'), 10);
    initGame(n);
  });
});

// ==========================================
// 10. INPUT & CAMERA CONTROLS
// ==========================================
const keys = { w: false, a: false, s: false, d: false };
let wantsInteract = false;
let wantsPulse = false;
let wantsDash = false;
let wantsJump = false;
let wantsPause = false;

let camYaw = 0;
let camPitch = 0.52;
const camDist = 9.2;
let isDraggingMouse = false;
let prevMouseX = 0;
let prevMouseY = 0;

window.addEventListener('keydown', (e) => {
  sound.init();
  const code = e.code;
  if (code === 'KeyW') keys.w = true;
  if (code === 'KeyA') keys.a = true;
  if (code === 'KeyS') keys.s = true;
  if (code === 'KeyD') keys.d = true;

  if (code === 'Space' && !e.repeat) wantsJump = true;
  if ((code === 'ShiftLeft' || code === 'ShiftRight') && !e.repeat) wantsDash = true;
  if (code === 'KeyE' && !e.repeat) wantsInteract = true;
  if ((code === 'KeyF' || code === 'KeyQ') && !e.repeat) wantsPulse = true;
  if ((code === 'Escape' || code === 'KeyP') && !e.repeat) wantsPause = true;
  if (code === 'KeyR' && !e.repeat) initGame(currentNight);
});

window.addEventListener('keyup', (e) => {
  const code = e.code;
  if (code === 'KeyW') keys.w = false;
  if (code === 'KeyA') keys.a = false;
  if (code === 'KeyS') keys.s = false;
  if (code === 'KeyD') keys.d = false;
});

canvas.addEventListener('mousedown', (e) => {
  sound.init();
  if (e.button === 0 || e.button === 2) {
    isDraggingMouse = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  }
});

window.addEventListener('mousemove', (e) => {
  if (isDraggingMouse) {
    const dx = e.clientX - prevMouseX;
    const dy = e.clientY - prevMouseY;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    camYaw -= dx * 0.005 * mouseSensitivity;
    camPitch = Math.max(0.2, Math.min(1.1, camPitch + dy * 0.004 * mouseSensitivity));
  }
});

window.addEventListener('mouseup', () => { isDraggingMouse = false; });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

btnResume.addEventListener('click', () => {
  sim.step({ pause: true });
  pauseModal.style.display = 'none';
});
btnRestartNight.addEventListener('click', () => { initGame(currentNight); });
btnRetryGo.addEventListener('click', () => { initGame(currentNight); });

btnNextNight.addEventListener('click', () => {
  if (currentNight < 3) {
    cumulativeScore += sim.score;
    initGame(currentNight + 1);
  } else {
    // Restart full journey
    cumulativeScore = 0;
    initGame(1);
  }
});

// ==========================================
// 11. ROTATING FORWARD-FACING MINIMAP (HEADING-UP RADAR)
// ==========================================
function updateMinimap() {
  const w = minimapCanvas.width;
  const h = minimapCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const rMinimap = w / 2 - 4;

  minimapCtx.clearRect(0, 0, w, h);

  minimapCtx.save();
  // Clip into circular viewport
  minimapCtx.beginPath();
  minimapCtx.arc(cx, cy, rMinimap, 0, Math.PI * 2);
  minimapCtx.clip();

  // Dark circular radar background
  minimapCtx.fillStyle = '#050a18';
  minimapCtx.fillRect(0, 0, w, h);

  // Concentric radar range rings (15m, 30m)
  const mapScale = (rMinimap * 0.9) / 38.0; // ~38m radar radius
  minimapCtx.strokeStyle = 'rgba(242, 193, 78, 0.12)';
  minimapCtx.lineWidth = 1;
  minimapCtx.beginPath();
  minimapCtx.arc(cx, cy, 15.0 * mapScale, 0, Math.PI * 2);
  minimapCtx.arc(cx, cy, 30.0 * mapScale, 0, Math.PI * 2);
  minimapCtx.stroke();

  // Forward heading crosshairs (Top/Bottom, Left/Right)
  minimapCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  minimapCtx.beginPath();
  minimapCtx.moveTo(cx, cy - rMinimap);
  minimapCtx.lineTo(cx, cy + rMinimap);
  minimapCtx.moveTo(cx - rMinimap, cy);
  minimapCtx.lineTo(cx + rMinimap, cy);
  minimapCtx.stroke();

  // Calculate Mây's facing direction vector (fwdX, fwdZ)
  let fwdX = 0, fwdZ = -1;
  if (sim.player.facing_dir && (sim.player.facing_dir[0] !== 0 || sim.player.facing_dir[1] !== 0)) {
    const len = Math.hypot(sim.player.facing_dir[0], sim.player.facing_dir[1]);
    fwdX = sim.player.facing_dir[0] / len;
    fwdZ = sim.player.facing_dir[1] / len;
  }
  // Right vector: (-fwdZ, fwdX)
  const rightX = -fwdZ;
  const rightZ = fwdX;

  const px = sim.player.pos[0];
  const pz = sim.player.pos[2];

  // Function to project world (wx, wz) to screen (sx, sy) relative to player
  // Forward points STRAIGHT UP on screen (-Y), Right points RIGHT (+X)
  function toScreen(wx, wz) {
    const dx = wx - px;
    const dz = wz - pz;
    const fwdDist = dx * fwdX + dz * fwdZ;
    const rightDist = dx * rightX + dz * rightZ;
    return [
      cx + rightDist * mapScale,
      cy - fwdDist * mapScale
    ];
  }

  // 1. Draw Island Boundaries (Transforms circles/bridges in player's reference frame)
  if (currentNight === 1) {
    const [icx, icy] = toScreen(0, 0);
    minimapCtx.strokeStyle = 'rgba(46, 125, 71, 0.7)';
    minimapCtx.lineWidth = 2.5;
    minimapCtx.beginPath();
    minimapCtx.arc(icx, icy, 40.0 * mapScale, 0, Math.PI * 2);
    minimapCtx.stroke();
  } else if (currentNight === 2) {
    const [i1x, i1y] = toScreen(0, 0);
    const [i2x, i2y] = toScreen(70, 0);
    minimapCtx.strokeStyle = 'rgba(46, 125, 71, 0.7)';
    minimapCtx.lineWidth = 2;
    minimapCtx.beginPath();
    minimapCtx.arc(i1x, i1y, 28.0 * mapScale, 0, Math.PI * 2);
    minimapCtx.arc(i2x, i2y, 28.0 * mapScale, 0, Math.PI * 2);
    minimapCtx.stroke();

    const [b1x, b1y] = toScreen(26, 0);
    const [b2x, b2y] = toScreen(44, 0);
    minimapCtx.strokeStyle = 'rgba(140, 109, 70, 0.85)';
    minimapCtx.lineWidth = 3;
    minimapCtx.beginPath();
    minimapCtx.moveTo(b1x, b1y);
    minimapCtx.lineTo(b2x, b2y);
    minimapCtx.stroke();
  } else if (currentNight === 3) {
    const [tcx, tcy] = toScreen(0, 0);
    minimapCtx.lineWidth = 1.8;
    minimapCtx.strokeStyle = 'rgba(46, 125, 71, 0.7)';
    minimapCtx.beginPath();
    minimapCtx.arc(tcx, tcy, 45.0 * mapScale, 0, Math.PI * 2);
    minimapCtx.stroke();

    minimapCtx.strokeStyle = 'rgba(56, 142, 60, 0.6)';
    minimapCtx.beginPath();
    minimapCtx.arc(tcx, tcy, 24.0 * mapScale, 0, Math.PI * 2);
    minimapCtx.stroke();

    minimapCtx.strokeStyle = 'rgba(242, 193, 78, 0.5)';
    minimapCtx.beginPath();
    minimapCtx.arc(tcx, tcy, 8.0 * mapScale, 0, Math.PI * 2);
    minimapCtx.stroke();
  }

  // 2. Draw Motes (Tiny golden sparks)
  minimapCtx.fillStyle = 'rgba(255, 230, 138, 0.75)';
  for (const m of sim.motes) {
    if (!m.active) continue;
    const [mx, my] = toScreen(m.pos[0], m.pos[2]);
    minimapCtx.fillRect(mx - 1.5, my - 1.5, 3, 3);
  }

  // 3. Draw Charms (Crimson dots)
  if (sim.charms) {
    for (const c of sim.charms) {
      if (!c.active) continue;
      const [chx, chy] = toScreen(c.pos[0], c.pos[2]);
      minimapCtx.beginPath();
      minimapCtx.arc(chx, chy, 4.0, 0, Math.PI * 2);
      minimapCtx.fillStyle = '#ff3344';
      minimapCtx.fill();
    }
  }

  // 4. Draw Lanterns
  for (const l of sim.lanterns) {
    const [lx, ly] = toScreen(l.pos[0], l.pos[2]);

    minimapCtx.beginPath();
    minimapCtx.arc(lx, ly, 4.5, 0, Math.PI * 2);
    if (l.lit) {
      minimapCtx.fillStyle = '#ffaa33';
      minimapCtx.shadowColor = '#ffaa33';
      minimapCtx.shadowBlur = 8;
    } else {
      minimapCtx.fillStyle = '#94a3b8';
      minimapCtx.shadowBlur = 0;
    }
    minimapCtx.fill();
    minimapCtx.shadowBlur = 0;
  }

  // 5. Draw Drifters (Gió Lạc - Silver Blue)
  if (sim.drifters) {
    for (const d of sim.drifters) {
      const [dx, dy] = toScreen(d.pos[0], d.pos[2]);
      minimapCtx.beginPath();
      minimapCtx.arc(dx, dy, 4.0, 0, Math.PI * 2);
      minimapCtx.fillStyle = '#8fa3b8';
      minimapCtx.fill();
    }
  }

  // 6. Draw Chasing Dark Clouds (Màu xanh đậm theo yêu cầu!)
  for (const s of sim.shades) {
    const [sx, sy] = toScreen(s.pos[0], s.pos[2]);

    minimapCtx.beginPath();
    minimapCtx.arc(sx, sy, 5.0, 0, Math.PI * 2);
    minimapCtx.fillStyle = '#1e40af';
    minimapCtx.shadowColor = '#2563eb';
    minimapCtx.shadowBlur = 9;
    minimapCtx.fill();
    minimapCtx.shadowBlur = 0;

    minimapCtx.strokeStyle = '#38bdf8';
    minimapCtx.lineWidth = 1.2;
    minimapCtx.stroke();
  }

  // 7. Draw Mây (Facing UP Chevron at Center with Vision Cone)
  minimapCtx.save();
  // Vision wedge pointing straight UP
  minimapCtx.beginPath();
  minimapCtx.moveTo(cx, cy);
  minimapCtx.arc(cx, cy, 26, -Math.PI / 2 - 0.45, -Math.PI / 2 + 0.45);
  minimapCtx.closePath();
  minimapCtx.fillStyle = 'rgba(255, 60, 70, 0.18)';
  minimapCtx.fill();

  // Outer red pulsing circle
  minimapCtx.beginPath();
  minimapCtx.arc(cx, cy, 8.5, 0, Math.PI * 2);
  minimapCtx.fillStyle = 'rgba(255, 34, 51, 0.28)';
  minimapCtx.fill();

  // Navigation Arrow pointing straight forward (UP on screen)
  minimapCtx.beginPath();
  minimapCtx.moveTo(cx, cy - 8);
  minimapCtx.lineTo(cx - 5.5, cy + 5.5);
  minimapCtx.lineTo(cx, cy + 2.5);
  minimapCtx.lineTo(cx + 5.5, cy + 5.5);
  minimapCtx.closePath();
  minimapCtx.fillStyle = '#ff2233';
  minimapCtx.shadowColor = '#ff2233';
  minimapCtx.shadowBlur = 10;
  minimapCtx.fill();

  // White core dot
  minimapCtx.beginPath();
  minimapCtx.arc(cx, cy, 1.8, 0, Math.PI * 2);
  minimapCtx.fillStyle = '#ffffff';
  minimapCtx.shadowBlur = 0;
  minimapCtx.fill();
  minimapCtx.restore();

  minimapCtx.restore();
}

// ==========================================
// 12. MAIN ANIMATION & SIMULATION LOOP
// ==========================================
initGame(1);

let lastTime = performance.now();
let accumulator = 0;
const TICK_DT = 1.0 / 60.0;
let runAnimTime = 0;

function animate(now) {
  requestAnimationFrame(animate);

  const delta = Math.min((now - lastTime) / 1000.0, 0.1);
  lastTime = now;
  accumulator += delta;

  while (accumulator >= TICK_DT) {
    accumulator -= TICK_DT;

    let mx = 0;
    let mz = 0;
    if (keys.w) mz += 1;
    if (keys.s) mz -= 1;
    if (keys.a) mx += 1;
    if (keys.d) mx -= 1;

    const yawDeg = (camYaw * 180) / Math.PI;

    const events = sim.step({
      move: [mx, mz],
      cam_yaw_deg: yawDeg,
      jump: wantsJump,
      dash: wantsDash,
      interact: wantsInteract,
      pulse: wantsPulse,
      pause: wantsPause
    });

    wantsJump = false;
    wantsDash = false;
    wantsInteract = false;
    wantsPulse = false;
    wantsPause = false;

    for (const ev of events) {
      if (ev.name === 'mote_picked') sound.playMotePickup();
      if (ev.name === 'deposit') sound.playDeposit();
      if (ev.name === 'lantern_lit') sound.playLanternIgnite();
      if (ev.name === 'pulse') sound.playPulse();
      if (ev.name === 'dash') sound.playDash();
      if (ev.name === 'charm_picked') sound.playCharm();
      if (ev.name === 'player_hit' || ev.name === 'fall') sound.playHit();
      if (ev.name === 'paused') pauseModal.style.display = 'flex';
      if (ev.name === 'resumed') pauseModal.style.display = 'none';
      if (ev.name === 'game_over') {
        gameoverModal.style.display = 'flex';
        if (ev.data.result === 'won') {
          if (currentNight < 3) {
            goTitle.textContent = `CHIẾN THẮNG ĐÊM ${currentNight}!`;
            goSubtitle.textContent = `Mây đã thắp sáng toàn bộ ngọn đèn trên đảo! Điểm số: ${sim.score}`;
            btnNextNight.textContent = (currentNight === 1) ? 'Tiến Vào Đêm 2 (Đảo Cau)' : 'Tiến Vào Đêm 3 (Đảo Chuông)';
          } else {
            goTitle.textContent = 'BÌNH MINH ĐÃ RẠNG TỎ!';
            const total = cumulativeScore + sim.score;
            goSubtitle.textContent = `Chúc mừng Mây đã hoàn thành trọn vẹn hành trình 3 Đêm! Tổng điểm: ${total}`;
            btnNextNight.textContent = 'Hành Trình Mới (Chơi Lại Từ Đầu)';
          }
        } else {
          goTitle.textContent = 'THẤT BẠI';
          goSubtitle.textContent = ev.data.reason === 'no_flames'
            ? 'Mây đã cạn kiệt Ngọn Lửa bảo vệ...'
            : 'Bình minh đã ló rạng trước khi hoàn thành...';
          btnNextNight.textContent = 'Thử Lại Đêm Này';
        }
      }
    }
  }

  // Visual Update for Mây
  const isMoving = keys.w || keys.s || keys.a || keys.d;
  if (isMoving && sim.player.grounded) {
    runAnimTime += delta * 14;
    mayMesh.userData.leftFoot.position.z = Math.sin(runAnimTime) * 0.12;
    mayMesh.userData.rightFoot.position.z = -Math.sin(runAnimTime) * 0.12;
    mayMesh.position.y = sim.player.pos[1] + Math.abs(Math.sin(runAnimTime)) * 0.08;
    mayMesh.userData.capeTail.rotation.x = 0.4 + Math.sin(runAnimTime) * 0.2;
    mayMesh.userData.miniLantern.rotation.z = Math.sin(runAnimTime) * 0.25;
    mayMesh.userData.miniLantern.rotation.x = Math.cos(runAnimTime) * 0.2;
  } else {
    mayMesh.position.y = sim.player.pos[1];
    mayMesh.userData.capeTail.rotation.x = 0.15;
    mayMesh.userData.miniLantern.rotation.z = THREE.MathUtils.lerp(mayMesh.userData.miniLantern.rotation.z, 0, 0.1);
    mayMesh.userData.miniLantern.rotation.x = THREE.MathUtils.lerp(mayMesh.userData.miniLantern.rotation.x, 0, 0.1);
  }

  mayMesh.position.x = sim.player.pos[0];
  mayMesh.position.z = sim.player.pos[2];

  if (sim.player.facing_dir) {
    const targetAngle = Math.atan2(sim.player.facing_dir[0], sim.player.facing_dir[1]);
    mayMesh.rotation.y = THREE.MathUtils.lerp(mayMesh.rotation.y, targetAngle, 0.2);
  }

  // Update Handheld Lantern Glow based on carried motes!
  const carried = sim.player.carried;
  const heldGlowIntensity = 0.6 + carried * 0.35;
  mayMesh.userData.heldLight.intensity = heldGlowIntensity;
  mayMesh.userData.miniBodyMat.emissiveIntensity = 0.5 + carried * 0.4;

  // Smooth Third-Person Camera Follow
  const targetCamX = mayMesh.position.x - Math.sin(camYaw) * Math.cos(camPitch) * camDist;
  const targetCamY = Math.max(mayMesh.position.y + 1.2, mayMesh.position.y + Math.sin(camPitch) * camDist + 0.6);
  const targetCamZ = mayMesh.position.z - Math.cos(camYaw) * Math.cos(camPitch) * camDist;

  camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
  camera.lookAt(mayMesh.position.x, mayMesh.position.y + 0.9, mayMesh.position.z);

  // Dynamic Scene Ambient Lighting based on progress (Starts dark, brightens gracefully with lanterns)
  const litCount = sim.lanterns.filter(l => l.lit).length;
  const totalLanterns = sim.lanterns.length;
  ambientLight.intensity = 0.22 + 0.38 * (litCount / totalLanterns);

  // Update Traditional Lantern Posts (Ticket-03: Fuel gauges, 1Hz low fuel blink, deflated unlit shape)
  for (const lMesh of lanternMeshes) {
    const lData = sim.lanterns.find(l => l.id === lMesh.userData.id);
    if (!lData) continue;

    const currentFuel = (lData.fuel_sub ?? 0) / 60.0;
    const isLowFuel = lData.lit && currentFuel < 30.0;
    // 1 Hz slow blink when fuel < 30
    const lowFuelBlink = isLowFuel ? (Math.sin(now * 0.002 * Math.PI) > 0 ? 1.0 : 0.15) : 1.0;

    if (lData.lit) {
      if (lMesh.userData.lightProgress < 1.0) {
        lMesh.userData.lightProgress = Math.min(1.0, lMesh.userData.lightProgress + delta * 1.6);
      }
      // Full drum shape
      if (lMesh.userData.lanternBody) lMesh.userData.lanternBody.scale.set(1.15, 1.0, 1.15);
      if (lMesh.userData.topCap) lMesh.userData.topCap.position.y = 3.03;
      if (lMesh.userData.bottomCap) lMesh.userData.bottomCap.position.y = 2.27;
      lMesh.userData.lanternMat.color.setHex(0x8b1e1e);
      lMesh.userData.lanternMat.roughness = 0.45;

      // Fuel bar billboard towards camera
      if (lMesh.userData.fuelBarGroup) {
        lMesh.userData.fuelBarGroup.visible = true;
        lMesh.userData.fuelBarGroup.quaternion.copy(camera.quaternion);

        const fuelRatio = Math.max(0.01, Math.min(1.0, currentFuel / 100.0));
        lMesh.userData.fillMesh.scale.x = fuelRatio;

        if (currentFuel >= 50) {
          lMesh.userData.fillMat.color.setHex(0x38ef7d); // green
        } else if (currentFuel >= 30) {
          lMesh.userData.fillMat.color.setHex(0xf2c14e); // amber
        } else {
          lMesh.userData.fillMat.color.setHex(0xff3344); // red
        }
        lMesh.userData.fuelBarGroup.scale.setScalar(lowFuelBlink > 0.5 ? 1.0 : 0.6);
      }
    } else {
      lMesh.userData.lightProgress = 0.0;
      // Ticket-03: Đèn tắt bị xẹp 20% và giấy có vết rách (weathered dark brown-red)
      if (lMesh.userData.lanternBody) lMesh.userData.lanternBody.scale.set(1.15, 0.8, 1.15);
      if (lMesh.userData.topCap) lMesh.userData.topCap.position.y = 2.95;
      if (lMesh.userData.bottomCap) lMesh.userData.bottomCap.position.y = 2.35;
      lMesh.userData.lanternMat.color.setHex(0x4a1818);
      lMesh.userData.lanternMat.roughness = 0.95;

      if (lMesh.userData.fuelBarGroup) {
        lMesh.userData.fuelBarGroup.visible = false;
      }
    }

    const prog = lMesh.userData.lightProgress;
    const flicker = (1.0 + Math.sin(now * 0.012 + lMesh.position.x) * 0.08) * lowFuelBlink;
    lMesh.userData.light.intensity = prog * 4.8 * flicker;
    lMesh.userData.light.color.setHex(0xffaa33); // Warm golden amber!
    if (lMesh.userData.glowSphere) {
      lMesh.userData.glowSphere.material.opacity = prog * 0.3 * flicker;
    }
    lMesh.userData.glowSprite.material.opacity = prog * 0.75 * flicker;
    lMesh.userData.lanternMat.emissive.setRGB(1.0 * prog * lowFuelBlink, 0.65 * prog * lowFuelBlink, 0.18 * prog * lowFuelBlink);
  }

  // Update Motes Visuals (Zero rectangular boxes, depthWrite: false)
  const activeMoteIds = new Set();
  for (const m of sim.motes) {
    if (!m.active) continue;
    activeMoteIds.add(m.id);

    let mMesh = moteMeshes.get(m.id);
    if (!mMesh) {
      mMesh = new THREE.Group();
      const sGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const sMat = new THREE.MeshBasicMaterial({ color: 0xfff6c2 });
      mMesh.add(new THREE.Mesh(sGeo, sMat));

      const sSprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: moteGlowTexture,
        color: 0xffe58a,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        fog: false,
        blending: THREE.AdditiveBlending
      }));
      sSprite.scale.set(1.4, 1.4, 1);
      mMesh.add(sSprite);

      scene.add(mMesh);
      moteMeshes.set(m.id, mMesh);
    }

    const floatY = Math.sin(now * 0.003 + m.pos[0] * 2) * 0.18;
    mMesh.position.set(m.pos[0], m.pos[1] + 0.35 + floatY, m.pos[2]);
    const bScale = 1.0 + Math.sin(now * 0.006 + m.pos[2]) * 0.15;
    mMesh.scale.set(bScale, bScale, bScale);
  }

  for (const [id, mMesh] of moteMeshes.entries()) {
    if (!activeMoteIds.has(id)) {
      scene.remove(mMesh);
      moteMeshes.delete(id);
    }
  }

  // Update Chasing Dark Clouds (Mây Đen)
  const activeShadeIds = new Set();
  for (const s of sim.shades) {
    activeShadeIds.add(s.id);
    let sMesh = shadeMeshes.get(s.id);
    if (!sMesh) {
      sMesh = createDarkCloudMesh(s.id);
      scene.add(sMesh);
      shadeMeshes.set(s.id, sMesh);
    }
    sMesh.position.set(s.pos[0], s.pos[1], s.pos[2]);

    sMesh.userData.mainPuff.rotation.y += delta * 1.5;
    sMesh.userData.puff1.rotation.x += delta * 2.0;
    sMesh.userData.puff2.rotation.z += delta * 1.8;

    const cloudAuraColor = isColorblind ? 0x00b3ff : 0x7a3cff;
    if (sMesh.userData.eyeMat) sMesh.userData.eyeMat.color.setHex(cloudAuraColor);

    if (s.state === 'stunned') {
      sMesh.userData.pl.color.setHex(0x1e293b);
      sMesh.scale.set(0.65, 0.65, 0.65);
    } else if (s.state === 'drain') {
      // Sucking fuel visual
      sMesh.userData.pl.color.setHex(cloudAuraColor);
      const pulseDrain = 1.05 + Math.sin(now * 0.015) * 0.15;
      sMesh.scale.set(pulseDrain, pulseDrain * 0.9, pulseDrain);
    } else {
      sMesh.userData.pl.color.setHex(cloudAuraColor);
      sMesh.scale.set(1.0, 1.0, 1.0);
    }
  }
  for (const [id, sMesh] of shadeMeshes.entries()) {
    if (!activeShadeIds.has(id)) {
      scene.remove(sMesh);
      shadeMeshes.delete(id);
    }
  }

  // Update Drifters (Gió Lạc - Night 2 & 3)
  if (sim.drifters) {
    const activeDrifterIds = new Set();
    for (const d of sim.drifters) {
      activeDrifterIds.add(d.id);
      let dMesh = drifterMeshes.get(d.id);
      if (!dMesh) {
        dMesh = createDrifterMesh(d.id);
        scene.add(dMesh);
        drifterMeshes.set(d.id, dMesh);
      }
      dMesh.position.set(d.pos[0], d.pos[1], d.pos[2]);
      dMesh.userData.ring1.rotation.z += delta * 2.5;
      dMesh.userData.ring2.rotation.x += delta * 2.0;
    }
    for (const [id, dMesh] of drifterMeshes.entries()) {
      if (!activeDrifterIds.has(id)) {
        scene.remove(dMesh);
        drifterMeshes.delete(id);
      }
    }
  }

  // Update Charms (Bùa Gió - Night 2 & 3)
  if (sim.charms) {
    const activeCharmIds = new Set();
    for (const c of sim.charms) {
      if (!c.active) continue;
      activeCharmIds.add(c.id);
      let cMesh = charmMeshes.get(c.id);
      if (!cMesh) {
        cMesh = createCharmMesh(c.id);
        scene.add(cMesh);
        charmMeshes.set(c.id, cMesh);
      }
      const bob = Math.sin(now * 0.004 + c.pos[0]) * 0.12;
      cMesh.position.set(c.pos[0], c.pos[1] + 0.5 + bob, c.pos[2]);
      cMesh.rotation.y += delta * 1.2;
    }
    for (const [id, cMesh] of charmMeshes.entries()) {
      if (!activeCharmIds.has(id)) {
        scene.remove(cMesh);
        charmMeshes.delete(id);
      }
    }
  }

  // Update HUD elements strictly conforming to Ticket-03 (Contract v1.2)
  flamesDisplay.textContent = '❤'.repeat(Math.max(0, sim.player.flames));
  const mins = Math.floor(sim.time_left_s / 60);
  const secs = Math.floor(sim.time_left_s % 60);
  const isUrgent = sim.time_left_s <= 30;
  const timerPrefix = (isColorblind && isUrgent) ? '⚠ ' : '⏳ ';
  timerDisplay.textContent = `${timerPrefix}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  timerDisplay.classList.toggle('urgent', isUrgent);

  lanternsDisplay.textContent = `${litCount} / ${totalLanterns}`;
  scoreDisplay.textContent = `${cumulativeScore + sim.score}`;

  const invTitle = document.getElementById('inventory-title');
  if (invTitle) {
    invTitle.textContent = `Túi Đom Đóm: ${sim.player.carried} / ${sim.player.capacity}`;
  }

  const slotsContainer = document.getElementById('mote-slots-container');
  if (slotsContainer) {
    while (slotsContainer.children.length < sim.player.capacity) {
      const newSlot = document.createElement('div');
      newSlot.className = 'mote-slot';
      slotsContainer.appendChild(newSlot);
    }
    while (slotsContainer.children.length > sim.player.capacity) {
      slotsContainer.removeChild(slotsContainer.lastChild);
    }
    Array.from(slotsContainer.children).forEach((slot, idx) => {
      slot.classList.toggle('filled', idx < sim.player.carried);
    });
  }

  if (sim.player.dash_cd_ticks > 0) {
    dashCdOverlay.style.display = 'block';
    const pct = (sim.player.dash_cd_ticks / 90) * 100;
    dashCdOverlay.style.opacity = (pct / 100).toString();
  } else {
    dashCdOverlay.style.display = 'none';
  }

  if (sim.player.pulse_cd_ticks > 0) {
    pulseCdOverlay.style.display = 'block';
    const pct = (sim.player.pulse_cd_ticks / 180) * 100;
    pulseCdOverlay.style.opacity = (pct / 100).toString();
  } else {
    pulseCdOverlay.style.display = 'none';
  }

  // Interaction prompt (Ticket-03: Thắp đèn mới, thắp lại hoặc châm dầu)
  let nearestInteractable = null;
  let minDist = Infinity;
  for (const l of sim.lanterns) {
    const canReceive = !l.lit || (l.lit && l.fuel_sub < 6000);
    if (!canReceive) continue;
    const d = Math.sqrt((sim.player.pos[0] - l.pos[0])**2 + (sim.player.pos[2] - l.pos[2])**2);
    if (d < minDist) {
      minDist = d;
      nearestInteractable = l;
    }
  }

  if (nearestInteractable && minDist <= 2.0 && sim.player.carried > 0) {
    interactPrompt.style.display = 'block';
    if (!nearestInteractable.lit) {
      const cost = nearestInteractable.ever_lit ? sim.tuning.relight_cost : sim.tuning.lantern_cost;
      const needed = cost - nearestInteractable.deposited;
      const isRelight = !!nearestInteractable.ever_lit;
      interactPrompt.innerHTML = `🏮 Nhấn <b>[E]</b> để ${isRelight ? 'Thắp Lại Đèn' : 'Thắp Đèn'} (Cần ${needed} Đom đóm)`;
    } else {
      const fuelVal = Math.round(nearestInteractable.fuel_sub / 60.0);
      interactPrompt.innerHTML = `🏮 Nhấn <b>[E]</b> để Châm Dầu (+10 Dầu/con) [Dầu: ${fuelVal}%]`;
    }
  } else {
    interactPrompt.style.display = 'none';
  }

  // Off-screen indicator
  if (nearestUnlit) {
    const lVec = new THREE.Vector3(nearestUnlit.pos[0], nearestUnlit.pos[1] + 1.8, nearestUnlit.pos[2]);
    lVec.project(camera);
    const isBehind = lVec.z > 1.0;
    const isOffscreen = isBehind || Math.abs(lVec.x) > 0.9 || Math.abs(lVec.y) > 0.9;
    if (isOffscreen && minDist > 6.0) {
      offscreenIndicator.style.display = 'block';
      let sx = (lVec.x * 0.5 + 0.5) * window.innerWidth;
      let sy = (-lVec.y * 0.5 + 0.5) * window.innerHeight;
      if (isBehind) { sx = window.innerWidth - sx; sy = window.innerHeight - sy; }
      sx = Math.max(30, Math.min(window.innerWidth - 30, sx));
      sy = Math.max(30, Math.min(window.innerHeight - 30, sy));
      offscreenIndicator.style.left = `${sx}px`;
      offscreenIndicator.style.top = `${sy}px`;
      const angToCenter = Math.atan2(sy - window.innerHeight / 2, sx - window.innerWidth / 2);
      offscreenIndicator.style.transform = `translate(-50%, -50%) rotate(${angToCenter + Math.PI / 2}rad)`;
    } else {
      offscreenIndicator.style.display = 'none';
    }
  } else {
    offscreenIndicator.style.display = 'none';
  }

  // Render Circular Minimap
  updateMinimap();

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
