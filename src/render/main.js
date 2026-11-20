import * as THREE from 'three';
import { Simulation } from '../core/simulation.js';
import { getMapForNight } from '../core/constants.js';

// ==========================================
// 1. AUDIO SYNTHESIZER (Web Audio API, Zero Assets)
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
    // Pentatonic high sparkle
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
    gain.gain.setValueAtTime(0.35, now);
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
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
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
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.15);
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
    // Temple bell tone
    const freqs = [220, 440, 554.37, 659.25, 880];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      const initialVol = 0.4 / (idx + 1);
      gain.gain.setValueAtTime(initialVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 2.5);
    });
  }

  playPulse() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
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
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
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
// 2. DOM ELEMENTS SETUP
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

// Settings from localStorage
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
// 3. THREE.JS SCENE, CAMERA, RENDERER
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e1430);
scene.fog = new THREE.FogExp2(0x101736, 0.015);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 350);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

// Dynamic ambient light based on progress
const ambientLight = new THREE.AmbientLight(0x2d3a60, 0.7);
scene.add(ambientLight);

// Cool moonlight
const moonLight = new THREE.DirectionalLight(0x8fa3b8, 1.4);
moonLight.position.set(35, 60, -25);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 1024;
moonLight.shadow.mapSize.height = 1024;
moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 160;
moonLight.shadow.camera.left = -50;
moonLight.shadow.camera.right = 50;
moonLight.shadow.camera.top = 50;
moonLight.shadow.camera.bottom = -50;
scene.add(moonLight);

// Starfield
const starCount = 800;
const starGeo = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 0.9 + 0.1);
  const rad = 160 + Math.random() * 40;
  starPositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = rad * Math.cos(phi);
  starPositions[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({ color: 0xfff6c2, size: 1.5, transparent: true, opacity: 0.85 });
const starField = new THREE.Points(starGeo, starMat);
scene.add(starField);

// Cloud Sea beneath the island (Y = -8)
const cloudGeo = new THREE.PlaneGeometry(350, 350, 40, 40);
const cloudMat = new THREE.MeshStandardMaterial({
  color: 0x12384a,
  roughness: 0.95,
  metalness: 0.05,
  flatShading: true,
  transparent: true,
  opacity: 0.9
});
const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
cloudMesh.rotation.x = -Math.PI / 2;
cloudMesh.position.y = -8;
cloudMesh.receiveShadow = true;
scene.add(cloudMesh);

// Radial Glow Texture Generator for Sprites
function createGlowTexture(colorHex = '#ffe58a') {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.25, colorHex);
  grad.addColorStop(0.65, 'rgba(255, 179, 71, 0.25)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const moteGlowTexture = createGlowTexture('#ffe58a');
const lanternGlowTexture = createGlowTexture('#ffb347');

// ==========================================
// 4. MÂY 3D CHARACTER MODEL (BEAUTIFUL AESTHETICS)
// ==========================================
function createMayCharacter() {
  const group = new THREE.Group();

  // Materials conforming to standard palette
  const tunicMat = new THREE.MeshStandardMaterial({ color: 0xe8e2d0, roughness: 0.6 }); // Tunic Ivory
  const scarfMat = new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.5 }); // Silk Red
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffe0bd, roughness: 0.7 });
  const hatMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.55 });  // Golden Bamboo
  const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: 0.5, roughness: 0.3 });

  // Torso / Poncho (Smooth bell shape)
  const bodyGeo = new THREE.CylinderGeometry(0.24, 0.44, 0.75, 16);
  const bodyMesh = new THREE.Mesh(bodyGeo, tunicMat);
  bodyMesh.position.y = 0.55;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Red Scarf / Ribbon at neck
  const scarfGeo = new THREE.TorusGeometry(0.26, 0.06, 12, 24);
  const scarfMesh = new THREE.Mesh(scarfGeo, scarfMat);
  scarfMesh.rotation.x = Math.PI / 2;
  scarfMesh.position.y = 0.92;
  group.add(scarfMesh);

  // Fluttering Cape tails
  const capeTailGeo = new THREE.PlaneGeometry(0.2, 0.5);
  const capeTailMat = new THREE.MeshStandardMaterial({ color: 0xc8102e, side: THREE.DoubleSide });
  const capeTail = new THREE.Mesh(capeTailGeo, capeTailMat);
  capeTail.position.set(0, 0.75, -0.32);
  capeTail.rotation.x = 0.2;
  group.add(capeTail);
  group.userData.capeTail = capeTail;

  // Head
  const headGeo = new THREE.SphereGeometry(0.22, 18, 18);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 1.1;
  headMesh.castShadow = true;
  group.add(headMesh);

  // Stylized Glowing Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfff6c2 });
  const eyeGeo = new THREE.SphereGeometry(0.035, 10, 10);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(0.08, 1.12, 0.19);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(-0.08, 1.12, 0.19);
  group.add(leftEye, rightEye);

  // Vietnamese Nón Lá Conical Hat
  const hatGeo = new THREE.ConeGeometry(0.55, 0.28, 24);
  const hatMesh = new THREE.Mesh(hatGeo, hatMat);
  hatMesh.position.y = 1.32;
  hatMesh.rotation.x = -0.05;
  hatMesh.castShadow = true;
  group.add(hatMesh);

  // Golden band around hat base
  const hatBandGeo = new THREE.TorusGeometry(0.55, 0.02, 8, 24);
  const hatBand = new THREE.Mesh(hatBandGeo, goldTrimMat);
  hatBand.rotation.x = Math.PI / 2;
  hatBand.position.y = 1.18;
  group.add(hatBand);

  // Silk tassel on hat apex
  const tasselGeo = new THREE.CylinderGeometry(0.015, 0.035, 0.18, 8);
  const tassel = new THREE.Mesh(tasselGeo, scarfMat);
  tassel.position.set(0.05, 1.4, -0.05);
  tassel.rotation.z = -0.3;
  group.add(tassel);

  // Wooden clogs/shoes
  const footGeo = new THREE.BoxGeometry(0.12, 0.08, 0.22);
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 0.8 });
  const leftFoot = new THREE.Mesh(footGeo, woodMat);
  leftFoot.position.set(0.14, 0.04, 0);
  const rightFoot = new THREE.Mesh(footGeo, woodMat);
  rightFoot.position.set(-0.14, 0.04, 0);
  group.add(leftFoot, rightFoot);
  group.userData.leftFoot = leftFoot;
  group.userData.rightFoot = rightFoot;

  // Gentle light aura around Mây
  const playerAura = new THREE.PointLight(0xfff6c2, 0.8, 4.0);
  playerAura.position.set(0, 0.8, 0);
  group.add(playerAura);

  return group;
}

// ==========================================
// 5. CHINESE PAGODA LANTERN TOWER
// ==========================================
function createPagodaLanternMesh(id) {
  const group = new THREE.Group();

  // Granite multi-tier base
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x5b5f6e, roughness: 0.9 });
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.35, 8), stoneMat);
  base1.position.y = 0.175;
  base1.castShadow = true;
  base1.receiveShadow = true;
  group.add(base1);

  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.3, 8), stoneMat);
  base2.position.y = 0.5;
  base2.castShadow = true;
  group.add(base2);

  // Red Lacquer Pagoda Pillar with Gold Rings
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x8b1e1e, roughness: 0.5 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: 0.6, roughness: 0.3 });

  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.4, 12), pillarMat);
  pillar.position.y = 1.35;
  pillar.castShadow = true;
  group.add(pillar);

  // Dougong Brackets
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.9), goldMat);
  bracket.position.y = 2.1;
  group.add(bracket);

  // Lantern Chamber (Silk cylinder that glows)
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0x5b5f6e,
    emissive: new THREE.Color(0x000000),
    roughness: 0.4
  });
  const lanternBody = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.85, 12), lanternMat);
  lanternBody.position.y = 2.6;
  group.add(lanternBody);

  // Pagoda Eaves (Curved Hexagonal Roof)
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2f5d50, roughness: 0.5 });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.65, 6), roofMat);
  roof.position.y = 3.3;
  roof.castShadow = true;
  group.add(roof);

  // Gourd Finial
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), goldMat);
  finial.position.y = 3.7;
  group.add(finial);

  // Warm PointLight inside lantern
  const light = new THREE.PointLight(0xffb347, 0.0, 16.0);
  light.position.set(0, 2.6, 0);
  light.castShadow = true;
  group.add(light);

  // Soft Glow Sprite
  const spriteMat = new THREE.SpriteMaterial({
    map: lanternGlowTexture,
    color: 0xffb347,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending
  });
  const glowSprite = new THREE.Sprite(spriteMat);
  glowSprite.position.set(0, 2.6, 0);
  glowSprite.scale.set(6, 6, 1);
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
// 6. PROCEDURAL NATURE (Palms, Rocks, Grass)
// ==========================================
const natureGroup = new THREE.Group();
scene.add(natureGroup);

function buildPalmTree(x, z, groundY = 0) {
  const tree = new THREE.Group();
  tree.position.set(x, groundY, z);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 0.85 });
  const frondMat = new THREE.MeshStandardMaterial({ color: 0x2f5d50, roughness: 0.6, side: THREE.DoubleSide });

  // Curved segmented trunk
  let currentY = 0;
  let currentOffset = 0;
  for (let s = 0; s < 5; s++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.18 - s * 0.02, 0.22 - s * 0.02, 0.75, 8), trunkMat);
    seg.position.set(currentOffset, currentY + 0.35, 0);
    seg.rotation.z = -0.06 * s;
    seg.castShadow = true;
    tree.add(seg);
    currentY += 0.7;
    currentOffset += 0.06;
  }

  // Palm fronds (curved fans)
  for (let f = 0; f < 7; f++) {
    const ang = (f / 7) * Math.PI * 2;
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.6, 2.2, 4), frondMat);
    frond.position.set(currentOffset + Math.cos(ang) * 0.9, currentY, Math.sin(ang) * 0.9);
    frond.rotation.set(Math.cos(ang) * 0.8, ang, Math.sin(ang) * 0.8);
    frond.castShadow = true;
    tree.add(frond);
  }

  return tree;
}

function buildCoastalRock(x, z, groundY = 0, scale = 1.0) {
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x4a5260, roughness: 0.9, flatShading: true });
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7 * scale, 1), rockMat);
  rock.position.set(x, groundY + 0.3 * scale, z);
  rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
}

// Multi-blade Grass InstancedMesh
let grassInstanced = null;
function createLushGrass(positions) {
  if (grassInstanced) {
    natureGroup.remove(grassInstanced);
    grassInstanced.geometry.dispose();
    grassInstanced.material.dispose();
  }

  const bladeCount = positions.length;
  const bladeGeo = new THREE.ConeGeometry(0.08, 0.55, 3);
  bladeGeo.translate(0, 0.275, 0);
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x2f5d50, roughness: 0.8, side: THREE.DoubleSide });

  grassInstanced = new THREE.InstancedMesh(bladeGeo, grassMat, bladeCount);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < bladeCount; i++) {
    const [gx, gy, gz] = positions[i];
    dummy.position.set(gx, gy, gz);
    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.rotation.x = (Math.random() - 0.5) * 0.25;
    dummy.rotation.z = (Math.random() - 0.5) * 0.25;
    const s = 0.7 + Math.random() * 0.6;
    dummy.scale.set(s, s * (0.8 + Math.random() * 0.4), s);
    dummy.updateMatrix();
    grassInstanced.setMatrixAt(i, dummy.matrix);
  }
  grassInstanced.instanceMatrix.needsUpdate = true;
  grassInstanced.receiveShadow = true;
  natureGroup.add(grassInstanced);
}

// ==========================================
// 7. ISLAND MAP BUILDERS
// ==========================================
const islandMeshGroup = new THREE.Group();
scene.add(islandMeshGroup);

function buildIslandTerrain(night) {
  // Clear previous terrain
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

  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x2f5d50,
    roughness: 0.9,
    metalness: 0.05
  });
  const rockCliffMat = new THREE.MeshStandardMaterial({
    color: 0x1b2350,
    roughness: 0.95,
    flatShading: true
  });
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x6b4a2f,
    roughness: 0.8
  });

  const grassPositions = [];

  if (night === 1) {
    // Single island R = 40m
    const diskGeo = new THREE.CylinderGeometry(40, 38, 4, 64);
    const diskMesh = new THREE.Mesh(diskGeo, grassMat);
    diskMesh.position.y = -2;
    diskMesh.receiveShadow = true;
    islandMeshGroup.add(diskMesh);

    // Natural palms and rocks along perimeter
    for (let i = 0; i < 22; i++) {
      const ang = (i / 22) * Math.PI * 2 + 0.1;
      const r = 26 + (i % 5) * 2.2;
      natureGroup.add(buildPalmTree(Math.cos(ang) * r, Math.sin(ang) * r, 0));
    }
    for (let i = 0; i < 18; i++) {
      const ang = (i / 18) * Math.PI * 2 + 0.2;
      const r = 32 + (i % 4) * 1.5;
      natureGroup.add(buildCoastalRock(Math.cos(ang) * r, Math.sin(ang) * r, 0, 1.0 + (i % 3) * 0.4));
    }
    for (let i = 0; i < 350; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 36;
      grassPositions.push([Math.cos(ang) * r, 0, Math.sin(ang) * r]);
    }
  } else if (night === 2) {
    // Twin Islands R = 28m each at (0,0) and (70,0)
    const diskA = new THREE.Mesh(new THREE.CylinderGeometry(28, 26, 4, 48), grassMat);
    diskA.position.set(0, -2, 0);
    diskA.receiveShadow = true;
    islandMeshGroup.add(diskA);

    const diskB = new THREE.Mesh(new THREE.CylinderGeometry(28, 26, 4, 48), grassMat);
    diskB.position.set(70, -2, 0);
    diskB.receiveShadow = true;
    islandMeshGroup.add(diskB);

    // Rustic Bamboo Bridge from x=26 to 44, width 4m
    const bridgeGeo = new THREE.BoxGeometry(18, 0.35, 4);
    const bridgeMesh = new THREE.Mesh(bridgeGeo, woodMat);
    bridgeMesh.position.set(35, -0.175, 0);
    bridgeMesh.receiveShadow = true;
    islandMeshGroup.add(bridgeMesh);

    // Bridge ropes / bamboo posts
    for (let bx = 27; bx <= 43; bx += 3) {
      const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 6), woodMat);
      postL.position.set(bx, 0.5, 1.9);
      const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 6), woodMat);
      postR.position.set(bx, 0.5, -1.9);
      islandMeshGroup.add(postL, postR);
    }

    // Jump pads visual rings at (20, 0, 18) and (50, 0, -18)
    [ [20, 0, 18], [50, 0, -18] ].forEach(([px, py, pz]) => {
      const padRing = new THREE.Mesh(
        new THREE.RingGeometry(0.3, 1.0, 24),
        new THREE.MeshBasicMaterial({ color: 0xf2c14e, side: THREE.DoubleSide })
      );
      padRing.rotation.x = -Math.PI / 2;
      padRing.position.set(px, 0.02, pz);
      islandMeshGroup.add(padRing);
    });

    // Nature
    for (let i = 0; i < 14; i++) {
      const ang = (i / 14) * Math.PI * 2;
      natureGroup.add(buildPalmTree(Math.cos(ang) * 19, Math.sin(ang) * 19, 0));
      natureGroup.add(buildPalmTree(70 + Math.cos(ang) * 19, Math.sin(ang) * 19, 0));
    }
    for (let i = 0; i < 300; i++) {
      const isB = Math.random() > 0.5;
      const cx = isB ? 70 : 0;
      const ang = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 24;
      grassPositions.push([cx + Math.cos(ang) * r, 0, Math.sin(ang) * r]);
    }
  } else if (night === 3) {
    // 3-tier stepped island R = 45m
    // Tier 0
    const t0 = new THREE.Mesh(new THREE.CylinderGeometry(45, 43, 4, 64), grassMat);
    t0.position.y = -2;
    t0.receiveShadow = true;
    islandMeshGroup.add(t0);

    // Tier 1 (ring 12-24m, z > 0, height 3m)
    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 3, 48, 1, false, 0, Math.PI), grassMat);
    t1.position.set(0, 1.5, 0);
    t1.receiveShadow = true;
    islandMeshGroup.add(t1);

    // Tier 2 (disk r <= 8m, height 6m)
    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 6, 32), grassMat);
    t2.position.set(0, 3, 0);
    t2.receiveShadow = true;
    islandMeshGroup.add(t2);

    // Ancient Bell Tower on Tier 2
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x8a7240, roughness: 0.6, metalness: 0.3 });
    const bellPillars = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 7.5, 12), towerMat);
    bellPillars.position.set(0, 6 + 3.75, 0);
    bellPillars.castShadow = true;
    islandMeshGroup.add(bellPillars);

    const bellRoof = new THREE.Mesh(new THREE.ConeGeometry(3.0, 1.8, 8), new THREE.MeshStandardMaterial({ color: 0xc8102e }));
    bellRoof.position.set(0, 6 + 8.2, 0);
    bellRoof.castShadow = true;
    islandMeshGroup.add(bellRoof);

    // 2 Ramps (at 30 deg and 150 deg)
    [30, 150].forEach(deg => {
      const rad = (deg * Math.PI) / 180;
      const rampGeo = new THREE.BoxGeometry(3, 0.4, 6.7);
      const rampMesh = new THREE.Mesh(rampGeo, rockCliffMat);
      // center of ramp is r = 27, y = 1.5
      const rx = 27 * Math.cos(rad);
      const rz = 27 * Math.sin(rad);
      rampMesh.position.set(rx, 1.5, rz);
      rampMesh.rotation.y = -rad + Math.PI / 2;
      rampMesh.rotation.x = -Math.atan2(3, 6);
      rampMesh.receiveShadow = true;
      islandMeshGroup.add(rampMesh);
    });

    for (let i = 0; i < 350; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = 26 + Math.random() * 16;
      grassPositions.push([Math.cos(ang) * r, 0, Math.sin(ang) * r]);
    }
  }

  createLushGrass(grassPositions);
}

// ==========================================
// 8. GAME RUNTIME & ENTITIES MANAGEMENT
// ==========================================
let currentNight = 1;
let sim = null;

const mayMesh = createMayCharacter();
scene.add(mayMesh);

let lanternMeshes = [];
let moteMeshes = new Map();
let shadeMeshes = new Map();
let drifterMeshes = new Map();
let charmMeshes = new Map();

// Shade mesh builder (Dark shadowy sphere with purple tendrils)
function createShadeMesh(id) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x120a1a,
    roughness: 0.4,
    metalness: 0.3
  });
  const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 2), bodyMat);
  core.position.y = 0.8;
  core.castShadow = true;
  group.add(core);

  // Purple glowing eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x7a3cff });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
  eyeL.position.set(0.25, 0.9, 0.55);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
  eyeR.position.set(-0.25, 0.9, 0.55);
  group.add(eyeL, eyeR);

  // Purple aura point light
  const pl = new THREE.PointLight(0x7a3cff, 1.5, 6.0);
  pl.position.set(0, 0.8, 0);
  group.add(pl);

  group.userData = { id, core, pl };
  return group;
}

// Drifter mesh builder (Ethereal cyan ribbon)
function createDrifterMesh(id) {
  const group = new THREE.Group();
  const ribbonGeo = new THREE.CylinderGeometry(0.2, 0.05, 1.6, 8);
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: 0x8fa3b8,
    emissive: 0x4a7a96,
    transparent: true,
    opacity: 0.85
  });
  const mesh = new THREE.Mesh(ribbonGeo, ribbonMat);
  mesh.rotation.z = Math.PI / 4;
  mesh.position.y = 1.0;
  group.add(mesh);

  const pl = new THREE.PointLight(0x8fa3b8, 1.2, 5.0);
  pl.position.set(0, 1.0, 0);
  group.add(pl);

  group.userData = { id, mesh };
  return group;
}

// Charm mesh builder (Red talisman with gold border)
function createCharmMesh(id) {
  const group = new THREE.Group();
  const cardGeo = new THREE.BoxGeometry(0.4, 0.7, 0.04);
  const cardMat = new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.4 });
  const card = new THREE.Mesh(cardGeo, cardMat);
  card.position.y = 0.8;
  group.add(card);

  const border = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.74, 0.02), new THREE.MeshStandardMaterial({ color: 0xf2c14e }));
  border.position.y = 0.8;
  group.add(border);

  const pl = new THREE.PointLight(0xf2c14e, 1.4, 4.0);
  pl.position.set(0, 0.8, 0);
  group.add(pl);

  group.userData = { id };
  return group;
}

// Initialize / Switch Night
function initGame(night = 1) {
  currentNight = night;
  nightBadge.textContent = `Đêm ${night} · ${night === 1 ? 'Đảo Bến' : (night === 2 ? 'Đảo Cau' : 'Đảo Chuông')}`;

  // Update level selector buttons in pause menu
  levelBtns.forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.night) === night);
  });

  // Rebuild 3D island terrain
  buildIslandTerrain(night);

  // Clear previous dynamic meshes
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

  // Create new simulation instance
  sim = new Simulation({ night, seed: 12345 });

  // Create Lantern meshes
  for (const l of sim.lanterns) {
    const mesh = createPagodaLanternMesh(l.id);
    mesh.position.set(l.pos[0], l.pos[1], l.pos[2]);
    scene.add(mesh);
    lanternMeshes.push(mesh);
  }

  // Create Charms
  for (const c of sim.charms) {
    const mesh = createCharmMesh(c.id);
    mesh.position.set(c.pos[0], c.pos[1], c.pos[2]);
    scene.add(mesh);
    charmMeshes.set(c.id, mesh);
  }

  // Reset player position
  mayMesh.position.set(sim.player.pos[0], sim.player.pos[1], sim.player.pos[2]);

  // Hide modals
  pauseModal.style.display = 'none';
  gameoverModal.style.display = 'none';
}

// ==========================================
// 9. CONTROLS & CAMERA SYSTEM
// ==========================================
const keys = {
  w: false, a: false, s: false, d: false,
  space: false, shift: false, e: false, f: false, q: false,
  pause: false
};

let wantsInteract = false;
let wantsPulse = false;
let wantsDash = false;
let wantsJump = false;
let wantsPause = false;

// 360-degree orbit camera
let camYaw = 0;       // horizontal angle
let camPitch = 0.52;  // ~30 degrees down angle
const camDist = 9.2;
let isDraggingMouse = false;
let prevMouseX = 0;
let prevMouseY = 0;

window.addEventListener('keydown', (e) => {
  sound.init(); // enable WebAudio on first user interaction
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
levelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    initGame(parseInt(btn.dataset.night));
  });
});

btnNextNight.addEventListener('click', () => {
  if (currentNight < 3) {
    initGame(currentNight + 1);
  } else {
    initGame(1);
  }
});
btnRetryGo.addEventListener('click', () => { initGame(currentNight); });

// ==========================================
// 10. MAIN ANIMATION & SIMULATION LOOP
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

    // Reset single-frame buffered buttons
    wantsJump = false;
    wantsDash = false;
    wantsInteract = false;
    wantsPulse = false;
    wantsPause = false;

    // Process audio and events
    for (const ev of events) {
      if (ev.name === 'mote_picked') sound.playMotePickup();
      if (ev.name === 'lantern_lit') sound.playLanternIgnite();
      if (ev.name === 'pulse') sound.playPulse();
      if (ev.name === 'dash') sound.playDash();
      if (ev.name === 'player_hit' || ev.name === 'fall') sound.playHit();
      if (ev.name === 'paused') pauseModal.style.display = 'flex';
      if (ev.name === 'resumed') pauseModal.style.display = 'none';
      if (ev.name === 'game_over') {
        gameoverModal.style.display = 'flex';
        if (ev.data.result === 'won') {
          goTitle.textContent = currentNight === 3 ? 'BÌNH MINH RỰC RỠ!' : 'CHIẾN THẮNG!';
          goSubtitle.textContent = currentNight === 3
            ? `Chúc mừng bạn đã hoàn thành trọn vẹn 3 Đêm! Tổng điểm: ${sim.score}`
            : `Mây đã thắp sáng toàn bộ ngọn tháp Đêm ${currentNight}!`;
          btnNextNight.textContent = currentNight === 3 ? 'Chơi Lại Từ Đầu' : 'Đêm Kế Tiếp';
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

  // Visual Update
  const isMoving = keys.w || keys.s || keys.a || keys.d;
  if (isMoving && sim.player.grounded) {
    runAnimTime += delta * 14;
    mayMesh.userData.leftFoot.position.z = Math.sin(runAnimTime) * 0.12;
    mayMesh.userData.rightFoot.position.z = -Math.sin(runAnimTime) * 0.12;
    mayMesh.position.y = sim.player.pos[1] + Math.abs(Math.sin(runAnimTime)) * 0.08;
    mayMesh.userData.capeTail.rotation.x = 0.4 + Math.sin(runAnimTime) * 0.2;
  } else {
    mayMesh.position.y = sim.player.pos[1];
    mayMesh.userData.capeTail.rotation.x = 0.15;
  }

  mayMesh.position.x = sim.player.pos[0];
  mayMesh.position.z = sim.player.pos[2];

  // Rotate Mây towards facing direction
  if (sim.player.facing_dir) {
    const targetAngle = Math.atan2(sim.player.facing_dir[0], sim.player.facing_dir[1]);
    mayMesh.rotation.y = THREE.MathUtils.lerp(mayMesh.rotation.y, targetAngle, 0.2);
  }

  // Smooth Third-Person Camera Follow
  const targetCamX = mayMesh.position.x - Math.sin(camYaw) * Math.cos(camPitch) * camDist;
  const targetCamY = mayMesh.position.y + Math.sin(camPitch) * camDist + 0.6;
  const targetCamZ = mayMesh.position.z - Math.cos(camYaw) * Math.cos(camPitch) * camDist;

  camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.12);
  camera.lookAt(mayMesh.position.x, mayMesh.position.y + 0.9, mayMesh.position.z);

  // Dynamic Scene Ambient Lighting based on progress
  const litCount = sim.lanterns.filter(l => l.lit).length;
  const totalLanterns = sim.lanterns.length;
  ambientLight.intensity = 0.15 + 0.55 * (litCount / totalLanterns);

  // Update Lanterns visual illumination transition
  for (const lMesh of lanternMeshes) {
    const lData = sim.lanterns.find(l => l.id === lMesh.userData.id);
    if (!lData) continue;

    if (lData.lit) {
      if (lMesh.userData.lightProgress < 1.0) {
        lMesh.userData.lightProgress = Math.min(1.0, lMesh.userData.lightProgress + delta * 1.5);
      }
    } else {
      lMesh.userData.lightProgress = 0.0;
    }

    const prog = lMesh.userData.lightProgress;
    // Natural flame flicker
    const flicker = 1.0 + Math.sin(now * 0.012 + lMesh.position.x) * 0.08;
    lMesh.userData.light.intensity = prog * 2.8 * flicker;
    lMesh.userData.glowSprite.material.opacity = prog * 0.85 * flicker;
    lMesh.userData.lanternMat.emissive.setRGB(0.95 * prog, 0.7 * prog, 0.28 * prog);
  }

  // Update Motes Visuals (Glowing spheres with breathing scale & floating aura)
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
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      }));
      sSprite.scale.set(1.4, 1.4, 1);
      mMesh.add(sSprite);

      scene.add(mMesh);
      moteMeshes.set(m.id, mMesh);
    }

    // Breathing float animation
    const floatY = Math.sin(now * 0.003 + m.pos[0] * 2) * 0.15;
    mMesh.position.set(m.pos[0], m.pos[1] + 0.35 + floatY, m.pos[2]);
    const bScale = 1.0 + Math.sin(now * 0.006 + m.pos[2]) * 0.15;
    mMesh.scale.set(bScale, bScale, bScale);
  }

  // Remove inactive motes
  for (const [id, mMesh] of moteMeshes.entries()) {
    if (!activeMoteIds.has(id)) {
      scene.remove(mMesh);
      moteMeshes.delete(id);
    }
  }

  // Update Shades Visuals
  const activeShadeIds = new Set();
  for (const s of sim.shades) {
    activeShadeIds.add(s.id);
    let sMesh = shadeMeshes.get(s.id);
    if (!sMesh) {
      sMesh = createShadeMesh(s.id);
      scene.add(sMesh);
      shadeMeshes.set(s.id, sMesh);
    }
    sMesh.position.set(s.pos[0], s.pos[1], s.pos[2]);
    sMesh.userData.core.rotation.y += delta * 2;
    if (s.state === 'stunned') {
      sMesh.userData.pl.color.setHex(0x3a3450);
      sMesh.scale.set(0.7, 0.7, 0.7);
    } else {
      sMesh.userData.pl.color.setHex(0x7a3cff);
      sMesh.scale.set(1.0, 1.0, 1.0);
    }
  }
  for (const [id, sMesh] of shadeMeshes.entries()) {
    if (!activeShadeIds.has(id)) {
      scene.remove(sMesh);
      shadeMeshes.delete(id);
    }
  }

  // Update Drifters Visuals
  const activeDrifterIds = new Set();
  for (const d of sim.drifters) {
    if (d.state === 'removed') continue;
    activeDrifterIds.add(d.id);
    let dMesh = drifterMeshes.get(d.id);
    if (!dMesh) {
      dMesh = createDrifterMesh(d.id);
      scene.add(dMesh);
      drifterMeshes.set(d.id, dMesh);
    }
    dMesh.position.set(d.pos[0], d.pos[1], d.pos[2]);
    dMesh.rotation.y += delta * 3;
  }
  for (const [id, dMesh] of drifterMeshes.entries()) {
    if (!activeDrifterIds.has(id)) {
      scene.remove(dMesh);
      drifterMeshes.delete(id);
    }
  }

  // Update Charms Visuals
  for (const c of sim.charms) {
    const cMesh = charmMeshes.get(c.id);
    if (cMesh) {
      cMesh.visible = c.available;
      cMesh.rotation.y += delta * 1.5;
    }
  }

  // Update HUD
  flamesDisplay.textContent = '❤'.repeat(Math.max(0, sim.player.flames));
  const mins = Math.floor(sim.time_left_s / 60);
  const secs = Math.floor(sim.time_left_s % 60);
  timerDisplay.textContent = `⏳ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  timerDisplay.classList.toggle('urgent', sim.time_left_s <= 30);

  lanternsDisplay.textContent = `${litCount} / ${totalLanterns}`;
  scoreDisplay.textContent = `${sim.score}`;

  // 10 Inventory Slots
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

  if (nearestUnlit && minDist <= 2.0) {
    interactPrompt.style.display = 'block';
    interactPrompt.innerHTML = `🏮 Nhấn <b>[E]</b> để Nạp Ánh Sáng (${nearestUnlit.deposited}/10)`;
  } else {
    interactPrompt.style.display = 'none';
  }

  // Off-screen indicator
  if (nearestUnlit) {
    const lVec = new THREE.Vector3(nearestUnlit.pos[0], nearestUnlit.pos[1] + 1.5, nearestUnlit.pos[2]);
    lVec.project(camera);
    const isBehind = lVec.z > 1.0;
    const isOffscreen = isBehind || Math.abs(lVec.x) > 0.9 || Math.abs(lVec.y) > 0.9;
    if (isOffscreen && minDist > 8.0) {
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

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);
