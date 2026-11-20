import * as THREE from 'three';
import { Simulation } from '../core/simulation.js';

// ==========================================
// 1. AUDIO SYNTHESIZER (Web Audio API, 100% Offline)
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
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.ctx.destination);
  }

  setVolume(vol) {
    this.volume = vol;
    localStorage.setItem('dao_den_long_vol', vol.toString());
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  playMotePickup() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playDeposit() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.18);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playJump() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.16);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playDash() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(450, now + 0.15);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  playLanternIgnite() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [220, 329.63, 440, 554.37, 659.25, 880].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      const initialVol = 0.45 / (idx + 1);
      gain.gain.setValueAtTime(initialVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 2.8);
    });
  }

  playPulse() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.5);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  playHit() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.3);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}
const sound = new SoundSynth();

// ==========================================
// 2. DOM & UI ELEMENTS
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

// ==========================================
// 3. THREE.JS SCENE, CAMERA, RENDERER, LIGHTING
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1026);
scene.fog = new THREE.FogExp2(0x0e1736, 0.016);

const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 350);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Ambient Light (Bright enough to see beautiful colors)
const ambientLight = new THREE.AmbientLight(0x384a75, 0.9);
scene.add(ambientLight);

// Moon directional light (Cool silvery blue)
const moonLight = new THREE.DirectionalLight(0xb4d2f8, 1.6);
moonLight.position.set(40, 65, -35);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 1024;
moonLight.shadow.mapSize.height = 1024;
moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 160;
moonLight.shadow.camera.left = -45;
moonLight.shadow.camera.right = 45;
moonLight.shadow.camera.top = 45;
moonLight.shadow.camera.bottom = -45;
scene.add(moonLight);

// ----------------- GLOWING 3D MOON & MOON HALO -----------------
const moonGroup = new THREE.Group();
moonGroup.position.set(50, 75, -80);

const moonMesh = new THREE.Mesh(
  new THREE.SphereGeometry(7.0, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xfffaed })
);
moonGroup.add(moonMesh);

function createMoonGlowTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 250, 240, 1.0)');
  grad.addColorStop(0.3, 'rgba(200, 225, 255, 0.45)');
  grad.addColorStop(0.7, 'rgba(140, 180, 255, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

const moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({
  map: createMoonGlowTexture(),
  color: 0xcfe0ff,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending
}));
moonHalo.scale.set(38, 38, 1);
moonGroup.add(moonHalo);
scene.add(moonGroup);

// ----------------- STARFIELD -----------------
const starCount = 750;
const starGeo = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 0.9 + 0.1);
  const rad = 150 + Math.random() * 30;
  starPositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = rad * Math.cos(phi);
  starPositions[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({ color: 0xfff6c2, size: 1.6, transparent: true, opacity: 0.9 });
scene.add(new THREE.Points(starGeo, starMat));

// ----------------- CLOUD OCEAN & GROUND MIST -----------------
const cloudGeo = new THREE.PlaneGeometry(320, 320, 32, 32);
const cloudMat = new THREE.MeshStandardMaterial({
  color: 0x123246,
  roughness: 0.95,
  metalness: 0.05,
  transparent: true,
  opacity: 0.92
});
const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
cloudMesh.rotation.x = -Math.PI / 2;
cloudMesh.position.y = -6.5;
cloudMesh.receiveShadow = true;
scene.add(cloudMesh);

// Floating ground mist layer (xíu xiu sương)
const mistGeo = new THREE.PlaneGeometry(80, 80);
const mistMat = new THREE.MeshBasicMaterial({
  color: 0x8fa3b8,
  transparent: true,
  opacity: 0.14,
  side: THREE.DoubleSide
});
const mistMesh = new THREE.Mesh(mistGeo, mistMat);
mistMesh.rotation.x = -Math.PI / 2;
mistMesh.position.y = 0.35;
scene.add(mistMesh);

// Radial Glow Texture Generator for Sprites
function createGlowTexture(colorHex = '#ffe58a') {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.25, colorHex);
  grad.addColorStop(0.65, 'rgba(255, 120, 40, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const moteGlowTexture = createGlowTexture('#ffe58a');
const lanternGlowTexture = createGlowTexture('#ff3b30');

// ==========================================
// 4. MÂY 3D CHARACTER MODEL WITH HANDHELD LANTERN
// ==========================================
function createMayCharacter() {
  const group = new THREE.Group();

  // Materials conforming to standard palette
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

  // Stylized Glowing Anime Eyes
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
  handGroup.position.set(0.38, 0.65, 0.22); // right hand position

  // Slender bamboo rod/handle
  const handleMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8),
    new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.7 })
  );
  handleMesh.rotation.x = 0.5;
  handleMesh.rotation.z = -0.3;
  handGroup.add(handleMesh);

  // Miniature red silk lantern hanging from the rod
  const miniLantern = new THREE.Group();
  miniLantern.position.set(0.08, -0.15, 0.15);

  const miniBodyMat = new THREE.MeshStandardMaterial({
    color: 0xc8102e,
    emissive: new THREE.Color(0xff4433),
    emissiveIntensity: 0.8,
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

  // Glow point light inside the small lantern
  const heldLight = new THREE.PointLight(0xffaa44, 1.2, 5.0);
  heldLight.position.set(0, 0, 0);
  miniLantern.add(heldLight);

  // Small glow halo sprite
  const heldGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: moteGlowTexture,
    color: 0xffc107,
    transparent: true,
    opacity: 0.7,
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

  // Materials based on Image 1
  const redWoodMat = new THREE.MeshStandardMaterial({ color: 0x9b2226, roughness: 0.55 }); // Red lacquer
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x4a0e17, roughness: 0.6 });
  const goldRingMat = new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: 0.5, roughness: 0.3 });

  // 1. Plinth / Base (Square stepped plinth as seen in Image 1)
  const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.65), redWoodMat);
  basePlinth.position.y = 0.225;
  basePlinth.castShadow = true;
  basePlinth.receiveShadow = true;
  group.add(basePlinth);

  // 2. Main Post (Tall square upright wooden post)
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.4, 0.24), redWoodMat);
  post.position.y = 1.95;
  post.castShadow = true;
  group.add(post);

  // Decorative gold collar rings on post
  [0.8, 1.8, 2.9].forEach(y => {
    const ring = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.28), goldRingMat);
    ring.position.y = y;
    group.add(ring);
  });

  // 3. Horizontal Cantilever Arm with upward winged tips (Xà ngang đầu cong chữ Đinh)
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 0.22), redWoodMat);
  arm.position.set(0.45, 3.45, 0);
  arm.castShadow = true;
  group.add(arm);

  // Curved upturned winged tips at arm ends
  const tipL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 4), redWoodMat);
  tipL.position.set(-0.35, 3.56, 0);
  tipL.rotation.z = -0.7;
  const tipR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 4), redWoodMat);
  tipR.position.set(1.22, 3.56, 0);
  tipR.rotation.z = 0.7;
  group.add(tipL, tipR);

  // Curved knee-brace / support strut underneath the arm
  const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.75, 8), redWoodMat);
  strut.position.set(0.48, 3.12, 0);
  strut.rotation.z = -0.85;
  group.add(strut);

  // Small black hanging chain & hook
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), darkWoodMat);
  chain.position.set(0.95, 3.2, 0);
  group.add(chain);

  // 4. Red Silk Drum Lantern (Bầu đèn lồng đỏ kiểu Ảnh 1)
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0x8b1e1e,
    emissive: new THREE.Color(0x000000),
    roughness: 0.45
  });
  // Bulging oval cylinder
  const lanternBody = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.72, 16), lanternMat);
  lanternBody.position.set(0.95, 2.65, 0);
  lanternBody.scale.set(1.15, 1.0, 1.15); // gentle bulge
  group.add(lanternBody);

  // Top & bottom caps with gold rims
  const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16), darkWoodMat);
  topCap.position.set(0.95, 3.03, 0);
  const bottomCap = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16), darkWoodMat);
  bottomCap.position.set(0.95, 2.27, 0);
  group.add(topCap, bottomCap);

  // Hanging Crimson Silk Tassel underneath
  const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0xc8102e }));
  tassel.position.set(0.95, 2.02, 0);
  group.add(tassel);

  // Warm Red/Amber PointLight inside lantern
  const light = new THREE.PointLight(0xff3b30, 0.0, 14.0);
  light.position.set(0.95, 2.65, 0);
  light.castShadow = true;
  group.add(light);

  // Soft Radial Glow Sprite
  const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: lanternGlowTexture,
    color: 0xff4d3d,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending
  }));
  glowSprite.position.set(0.95, 2.65, 0);
  glowSprite.scale.set(7, 7, 1);
  group.add(glowSprite);

  group.userData = {
    id,
    lanternMat,
    light,
    glowSprite,
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

// Broadleaf Palm tree (Phong cách hoạt họa Ghibli)
function buildTropicalTree(x, z, groundY = 0) {
  const tree = new THREE.Group();
  tree.position.set(x, groundY, z);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.85 });
  const frondMat = new THREE.MeshStandardMaterial({ color: 0x2d7f50, roughness: 0.6, side: THREE.DoubleSide });

  // Trunk with segments
  for (let s = 0; s < 4; s++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.18 - s * 0.02, 0.22 - s * 0.02, 0.8, 8), trunkMat);
    seg.position.set(0.04 * s, s * 0.75 + 0.4, 0);
    seg.rotation.z = -0.05 * s;
    seg.castShadow = true;
    tree.add(seg);
  }

  // Broad segmented palm leaves (Image 2 style)
  for (let f = 0; f < 6; f++) {
    const ang = (f / 6) * Math.PI * 2;
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.4, 4), frondMat);
    frond.position.set(Math.cos(ang) * 0.8, 3.2, Math.sin(ang) * 0.8);
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

  // 2 vertical supporting monolith pillars
  const pillar1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 1), stoneMat);
  pillar1.scale.set(0.9, 1.8, 0.9);
  pillar1.position.set(-1.2, 0.9, 0);
  pillar1.castShadow = true;

  const pillar2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 1), stoneMat);
  pillar2.scale.set(0.9, 1.8, 0.9);
  pillar2.position.set(1.2, 0.9, 0);
  pillar2.castShadow = true;

  // Massive horizontal flat stone slab resting across them
  const slab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 2.2), stoneMat);
  slab.position.set(0, 2.0, 0);
  slab.rotation.z = 0.08; // slightly tilted
  slab.rotation.y = 0.15;
  slab.castShadow = true;

  // Moss top layer on slab
  const mossTop = new THREE.Mesh(new THREE.BoxGeometry(3.65, 0.15, 2.25), mossMat);
  mossTop.position.set(0, 2.3, 0);
  mossTop.rotation.z = 0.08;
  mossTop.rotation.y = 0.15;

  dolmen.add(pillar1, pillar2, slab, mossTop);
  return dolmen;
}

// Fantasy Lotus / Tropical Flower Clumps (Blue and Yellow blossoms from Image 2)
function createFlowerClump(x, z, groundY = 0, colorHex = 0x22a6ff) {
  const clump = new THREE.Group();
  clump.position.set(x, groundY, z);

  const petalMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4, side: THREE.DoubleSide });
  const centerMat = new THREE.MeshBasicMaterial({ color: 0xffe58a });

  // 3-4 blossoms in clump
  for (let i = 0; i < 3; i++) {
    const fx = (Math.random() - 0.5) * 0.6;
    const fz = (Math.random() - 0.5) * 0.6;
    const flower = new THREE.Group();
    flower.position.set(fx, 0.25, fz);

    // 5 petals
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

// Coastal / Field Rock
function buildMossyRock(x, z, groundY = 0, scale = 1.0) {
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x3d4b5c, roughness: 0.9, flatShading: true });
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65 * scale, 1), rockMat);
  rock.position.set(x, groundY + 0.3 * scale, z);
  rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
}

// ==========================================
// 7. ISLAND TERRAIN GENERATION (COMPACT & SCATTERED NATURE)
// ==========================================
const islandMeshGroup = new THREE.Group();
scene.add(islandMeshGroup);

const ISLAND_PLAY_RADIUS = 30.0; // Cozy, intimate island size

function buildIslandTerrain(night) {
  while (islandMeshGroup.children.length > 0) {
    const obj = islandMeshGroup.children[0];
    islandMeshGroup.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  }
  while (natureGroup.children.length > 0) {
    const obj = natureGroup.children[0];
    natureGroup.remove(obj);
  }

  // Emerald Green Moss Island Ground (Matching Image 2 vibrant colors)
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x2e7d47, // Vibrant emerald moss
    roughness: 0.85,
    metalness: 0.05
  });

  const diskGeo = new THREE.CylinderGeometry(ISLAND_PLAY_RADIUS, ISLAND_PLAY_RADIUS - 2, 4, 64);
  const diskMesh = new THREE.Mesh(diskGeo, grassMat);
  diskMesh.position.y = -2;
  diskMesh.receiveShadow = true;
  islandMeshGroup.add(diskMesh);

  // 1. Ancient Moss-Covered Stone Altar (from Image 2)
  natureGroup.add(buildAncientDolmenAltar(-8.0, 5.0, 0));

  // 2. Scatter trees throughout the INTERIOR (not just on the rim!)
  const interiorTreeCoords = [
    [6.0, 8.0], [-10.0, -9.0], [12.0, -7.0], [-6.0, 16.0], [15.0, 12.0],
    [-14.0, 4.0], [4.0, -15.0], [-16.0, -14.0], [18.0, -15.0], [2.0, 20.0],
    [-18.0, 14.0], [20.0, 2.0]
  ];
  interiorTreeCoords.forEach(([tx, tz]) => {
    natureGroup.add(buildTropicalTree(tx, tz, 0));
  });

  // 3. Scatter mossy boulders across the whole island
  const boulderCoords = [
    [5.0, 3.0], [-4.0, -5.0], [9.0, -11.0], [-12.0, -4.0], [3.0, 14.0],
    [-11.0, 10.0], [16.0, -3.0], [-18.0, -6.0], [14.0, 18.0], [-7.0, -16.0]
  ];
  boulderCoords.forEach(([rx, rz], idx) => {
    natureGroup.add(buildMossyRock(rx, rz, 0, 0.9 + (idx % 3) * 0.4));
  });

  // 4. Scatter Fantasy Lotus Flowers (Blue & Yellow from Image 2)
  const flowerCoords = [
    [-3.0, 3.0, 0x22a6ff], [4.0, -2.0, 0xfbbf24], [-6.0, 8.0, 0x22a6ff],
    [8.0, 5.0, 0xfbbf24], [-9.0, -6.0, 0x22a6ff], [10.0, -4.0, 0xfbbf24],
    [-14.0, 2.0, 0x22a6ff], [12.0, 9.0, 0xfbbf24], [-2.0, -10.0, 0x22a6ff]
  ];
  flowerCoords.forEach(([fx, fz, col]) => {
    natureGroup.add(createFlowerClump(fx, fz, 0, col));
  });
}

// ==========================================
// 8. CHASSING DARK CLOUDS (MÂY ĐEN / BÓNG MỰC)
// ==========================================
function createDarkCloudMesh(id) {
  const group = new THREE.Group();

  // Dark billowy cloud body (deep blue/black shading)
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Deep midnight navy
    emissive: 0x1e3a8a, // Dark blue glow
    emissiveIntensity: 0.35,
    roughness: 0.65,
    flatShading: true
  });

  // Multi-sphere puff cloud shape
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

  // Sinister Glowing Dark Blue Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
  eyeL.position.set(0.24, 0.95, 0.6);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
  eyeR.position.set(-0.24, 0.95, 0.6);
  group.add(eyeL, eyeR);

  // Deep Blue Point Light aura
  const pl = new THREE.PointLight(0x2563eb, 1.6, 6.0);
  pl.position.set(0, 0.9, 0);
  group.add(pl);

  group.userData = { id, mainPuff, puff1, puff2, puff3, pl };
  return group;
}

// ==========================================
// 9. GAME RUNTIME & ENTITIES MANAGEMENT
// ==========================================
let currentNight = 1;
let sim = null;

const mayMesh = createMayCharacter();
scene.add(mayMesh);

let lanternMeshes = [];
let moteMeshes = new Map();
let shadeMeshes = new Map();

// Initialize Game (3 Motes to light, plenty of fireflies, active chasing dark clouds)
function initGame(night = 1) {
  currentNight = night;
  nightBadge.textContent = `Đêm ${night} · Đảo Bến`;

  buildIslandTerrain(night);

  // Clear meshes
  lanternMeshes.forEach(l => scene.remove(l));
  lanternMeshes = [];
  moteMeshes.forEach(m => scene.remove(m));
  moteMeshes.clear();
  shadeMeshes.forEach(s => scene.remove(s));
  shadeMeshes.clear();

  // Create simulation: 3 motes per lantern for enjoyable interactive play!
  sim = new Simulation({
    night,
    seed: 12345,
    tuning: {
      lantern_cost: 3 // Exactly 3 motes to light a lantern as requested!
    },
    initial_motes: 35, // Abundant fireflies scattered across the island!
    initial_shades: 3  // 3 dark clouds actively chasing Mây right away!
  });

  // Create Lantern Posts based on Image 1
  for (const l of sim.lanterns) {
    const mesh = createOrientLanternPostMesh(l.id);
    mesh.position.set(l.pos[0], l.pos[1], l.pos[2]);
    scene.add(mesh);
    lanternMeshes.push(mesh);
  }

  // Reset player position
  mayMesh.position.set(sim.player.pos[0], sim.player.pos[1], sim.player.pos[2]);

  pauseModal.style.display = 'none';
  gameoverModal.style.display = 'none';
}

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
let camPitch = 0.52; // ~30 degrees top-down
const camDist = 8.5;
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

// UI Buttons Listeners
btnResume.addEventListener('click', () => {
  sim.step({ pause: true });
  pauseModal.style.display = 'none';
});
btnRestartNight.addEventListener('click', () => { initGame(currentNight); });
btnNextNight.addEventListener('click', () => { initGame(1); });
btnRetryGo.addEventListener('click', () => { initGame(currentNight); });

// ==========================================
// 11. CIRCULAR MINIMAP DRAWING
// ==========================================
function updateMinimap() {
  const w = minimapCanvas.width;
  const h = minimapCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const rMinimap = w / 2 - 4;

  minimapCtx.clearRect(0, 0, w, h);

  // Background radar disk
  minimapCtx.save();
  minimapCtx.beginPath();
  minimapCtx.arc(cx, cy, rMinimap, 0, Math.PI * 2);
  minimapCtx.clip();

  minimapCtx.fillStyle = '#0a1024';
  minimapCtx.fillRect(0, 0, w, h);

  // Subtle grid rings
  minimapCtx.strokeStyle = 'rgba(242, 193, 78, 0.15)';
  minimapCtx.lineWidth = 1;
  minimapCtx.beginPath();
  minimapCtx.arc(cx, cy, rMinimap * 0.4, 0, Math.PI * 2);
  minimapCtx.arc(cx, cy, rMinimap * 0.75, 0, Math.PI * 2);
  minimapCtx.stroke();

  // Island Boundary
  const mapScale = (rMinimap * 0.85) / ISLAND_PLAY_RADIUS;
  minimapCtx.strokeStyle = 'rgba(46, 125, 71, 0.7)';
  minimapCtx.lineWidth = 2.5;
  minimapCtx.beginPath();
  minimapCtx.arc(cx, cy, ISLAND_PLAY_RADIUS * mapScale, 0, Math.PI * 2);
  minimapCtx.stroke();

  // Draw Motes (Tiny yellow sparks)
  minimapCtx.fillStyle = 'rgba(255, 230, 138, 0.6)';
  for (const m of sim.motes) {
    if (!m.active) continue;
    const mx = cx + m.pos[0] * mapScale;
    const my = cy + m.pos[2] * mapScale;
    minimapCtx.fillRect(mx - 1, my - 1, 2, 2);
  }

  // Draw Lanterns
  for (const l of sim.lanterns) {
    const lx = cx + l.pos[0] * mapScale;
    const ly = cy + l.pos[2] * mapScale;

    minimapCtx.beginPath();
    minimapCtx.arc(lx, ly, 4, 0, Math.PI * 2);
    if (l.lit) {
      minimapCtx.fillStyle = '#ffb347';
      minimapCtx.shadowColor = '#ffb347';
      minimapCtx.shadowBlur = 8;
    } else {
      minimapCtx.fillStyle = '#94a3b8';
      minimapCtx.shadowBlur = 0;
    }
    minimapCtx.fill();
    minimapCtx.shadowBlur = 0;
  }

  // Draw Chasing Dark Clouds (Màu xanh đậm theo yêu cầu!)
  for (const s of sim.shades) {
    const sx = cx + s.pos[0] * mapScale;
    const sy = cy + s.pos[2] * mapScale;

    minimapCtx.beginPath();
    minimapCtx.arc(sx, sy, 4.5, 0, Math.PI * 2);
    minimapCtx.fillStyle = '#1e40af'; // Dark Blue / Xanh đậm
    minimapCtx.shadowColor = '#2563eb';
    minimapCtx.shadowBlur = 8;
    minimapCtx.fill();
    minimapCtx.shadowBlur = 0;

    // Dark cloud border
    minimapCtx.strokeStyle = '#0f172a';
    minimapCtx.lineWidth = 1.5;
    minimapCtx.stroke();
  }

  // Draw Mây (Moving RED DOT chấm đỏ đang di chuyển!)
  const px = cx + sim.player.pos[0] * mapScale;
  const py = cy + sim.player.pos[2] * mapScale;

  // Red pulse ring
  minimapCtx.beginPath();
  minimapCtx.arc(px, py, 6.5, 0, Math.PI * 2);
  minimapCtx.fillStyle = 'rgba(255, 50, 70, 0.35)';
  minimapCtx.fill();

  // Red center dot
  minimapCtx.beginPath();
  minimapCtx.arc(px, py, 4, 0, Math.PI * 2);
  minimapCtx.fillStyle = '#ff2233'; // Chấm đỏ
  minimapCtx.shadowColor = '#ff2233';
  minimapCtx.shadowBlur = 10;
  minimapCtx.fill();
  minimapCtx.shadowBlur = 0;

  // White inner core
  minimapCtx.beginPath();
  minimapCtx.arc(px, py, 1.5, 0, Math.PI * 2);
  minimapCtx.fillStyle = '#ffffff';
  minimapCtx.fill();

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

  // Run fixed 60Hz simulation step(s)
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

    // Process audio events
    for (const ev of events) {
      if (ev.name === 'mote_picked') sound.playMotePickup();
      if (ev.name === 'deposit') sound.playDeposit();
      if (ev.name === 'lantern_lit') sound.playLanternIgnite();
      if (ev.name === 'pulse') sound.playPulse();
      if (ev.name === 'dash') sound.playDash();
      if (ev.name === 'player_hit' || ev.name === 'fall') sound.playHit();
      if (ev.name === 'paused') pauseModal.style.display = 'flex';
      if (ev.name === 'resumed') pauseModal.style.display = 'none';
      if (ev.name === 'game_over') {
        gameoverModal.style.display = 'flex';
        if (ev.data.result === 'won') {
          goTitle.textContent = 'CHIẾN THẮNG!';
          goSubtitle.textContent = `Mây đã thắp sáng toàn bộ ngọn đèn lồng trên đảo! Tổng điểm: ${sim.score}`;
          btnNextNight.textContent = 'Chơi Lại Từ Đầu';
        } else {
          goTitle.textContent = 'THẤT BẠI';
          goSubtitle.textContent = ev.data.reason === 'no_flames'
            ? 'Mây đã cạn kiệt Ngọn Lửa bảo vệ...'
            : 'Bình minh đã ló rạng trước khi thắp đủ đèn...';
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
    // Gentle sway of handheld lantern
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

  // Rotate Mây towards facing direction
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
  const targetCamY = mayMesh.position.y + Math.sin(camPitch) * camDist + 0.6;
  const targetCamZ = mayMesh.position.z - Math.cos(camYaw) * Math.cos(camPitch) * camDist;

  camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
  camera.lookAt(mayMesh.position.x, mayMesh.position.y + 0.9, mayMesh.position.z);

  // Dynamic Scene Ambient Lighting based on progress
  const litCount = sim.lanterns.filter(l => l.lit).length;
  const totalLanterns = sim.lanterns.length;
  ambientLight.intensity = 0.35 + 0.45 * (litCount / totalLanterns);

  // Update Traditional Lantern Posts (Image 1 style)
  for (const lMesh of lanternMeshes) {
    const lData = sim.lanterns.find(l => l.id === lMesh.userData.id);
    if (!lData) continue;

    if (lData.lit) {
      if (lMesh.userData.lightProgress < 1.0) {
        lMesh.userData.lightProgress = Math.min(1.0, lMesh.userData.lightProgress + delta * 1.6);
      }
    } else {
      lMesh.userData.lightProgress = 0.0;
    }

    const prog = lMesh.userData.lightProgress;
    const flicker = 1.0 + Math.sin(now * 0.012 + lMesh.position.x) * 0.08;
    lMesh.userData.light.intensity = prog * 3.2 * flicker;
    lMesh.userData.glowSprite.material.opacity = prog * 0.9 * flicker;
    lMesh.userData.lanternMat.emissive.setRGB(1.0 * prog, 0.25 * prog, 0.15 * prog);
  }

  // Update Motes Visuals (Plentiful soft golden fireflies)
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

    // Swirling dark cloud puffs
    sMesh.userData.mainPuff.rotation.y += delta * 1.5;
    sMesh.userData.puff1.rotation.x += delta * 2.0;
    sMesh.userData.puff2.rotation.z += delta * 1.8;

    if (s.state === 'stunned') {
      sMesh.userData.pl.color.setHex(0x1e293b);
      sMesh.scale.set(0.65, 0.65, 0.65);
    } else {
      sMesh.userData.pl.color.setHex(0x2563eb);
      sMesh.scale.set(1.0, 1.0, 1.0);
    }
  }
  for (const [id, sMesh] of shadeMeshes.entries()) {
    if (!activeShadeIds.has(id)) {
      scene.remove(sMesh);
      shadeMeshes.delete(id);
    }
  }

  // Update HUD elements
  flamesDisplay.textContent = '❤'.repeat(Math.max(0, sim.player.flames));
  const mins = Math.floor(sim.time_left_s / 60);
  const secs = Math.floor(sim.time_left_s % 60);
  timerDisplay.textContent = `⏳ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  timerDisplay.classList.toggle('urgent', sim.time_left_s <= 30);

  lanternsDisplay.textContent = `${litCount} / ${totalLanterns}`;
  scoreDisplay.textContent = `${sim.score}`;

  moteSlots.forEach((slot, idx) => {
    slot.classList.toggle('filled', idx < sim.player.carried);
  });

  // Cooldown overlays
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

  // Interaction prompt & off-screen arrow
  let nearestUnlit = null;
  let minDist = Infinity;
  for (const l of sim.lanterns) {
    if (l.lit) continue;
    const d = Math.sqrt((sim.player.pos[0] - l.pos[0])**2 + (sim.player.pos[2] - l.pos[2])**2);
    if (d < minDist) {
      minDist = d;
      nearestUnlit = l;
    }
  }

  if (nearestUnlit && minDist <= 2.2) {
    interactPrompt.style.display = 'block';
    interactPrompt.innerHTML = `🏮 Nhấn <b>[E]</b> để Nạp Ánh Sáng (${nearestUnlit.deposited}/${sim.tuning.lantern_cost})`;
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
