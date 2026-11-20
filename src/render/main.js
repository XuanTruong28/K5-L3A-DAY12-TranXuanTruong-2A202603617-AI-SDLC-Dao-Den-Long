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
const interactPrompt = document.getElementById('interact-prompt');

// ==========================================
// 1. SCENE SETUP & SKY: CHILDREN OF LIGHT MOOD
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0e1c);
scene.fog = new THREE.FogExp2(0x0e1428, 0.018);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 300);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

// Lighting: Ethereal Twilight
const ambientLight = new THREE.AmbientLight(0x334466, 1.4);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight(0x7da4d6, 1.6);
moonLight.position.set(25, 45, -20);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 1024;
moonLight.shadow.mapSize.height = 1024;
moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 120;
const d = ISLAND_RADIUS + 5;
moonLight.shadow.camera.left = -d;
moonLight.shadow.camera.right = d;
moonLight.shadow.camera.top = d;
moonLight.shadow.camera.bottom = -d;
scene.add(moonLight);

// Subtle warm secondary rim light from the lanterns direction
const horizonWarmLight = new THREE.DirectionalLight(0xffb74d, 0.4);
horizonWarmLight.position.set(-30, 10, 30);
scene.add(horizonWarmLight);

// ==========================================
// 2. STARRY DOME & CLOUD OCEAN (SKY AESTHETIC)
// ==========================================
// A. Starfield
const starCount = 600;
const starGeo = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
const starSeeds = new Float32Array(starCount);

for (let i = 0; i < starCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 0.85 + 0.15); // upper hemisphere
  const rad = 140 + Math.random() * 40;
  starPositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = rad * Math.cos(phi);
  starPositions[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);
  starSeeds[i] = Math.random() * 10;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMat = new THREE.PointsMaterial({
  color: 0xe0ebff,
  size: 1.4,
  transparent: true,
  opacity: 0.85,
  sizeAttenuation: true
});
const starField = new THREE.Points(starGeo, starMat);
scene.add(starField);

// Helper canvas texture for soft glow sprites
function createGlowTexture(colorHex = '#ffd166', centerAlpha = 1.0) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, `rgba(255, 255, 255, ${centerAlpha})`);
  grad.addColorStop(0.3, colorHex);
  grad.addColorStop(0.7, 'rgba(255, 170, 0, 0.2)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

const fireflyGlowTex = createGlowTexture('#ffd166', 1.0);
const purpleGlowTex = createGlowTexture('#9d4edd', 0.8);

// B. Island & Dreamy Terrain
const islandGroup = new THREE.Group();

// Main island plate (Mossy teal-green ground with gentle plateau)
const groundGeo = new THREE.CylinderGeometry(ISLAND_RADIUS, ISLAND_RADIUS * 0.88, 4.5, 64);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x1b3b33, // rich dark mossy teal
  roughness: 0.92,
  metalness: 0.05,
  flatShading: true
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.position.y = -2.25;
ground.receiveShadow = true;
islandGroup.add(ground);

// Island top cliff ring
const cliffEdgeGeo = new THREE.TorusGeometry(ISLAND_RADIUS, 0.65, 12, 64);
const cliffEdgeMat = new THREE.MeshStandardMaterial({
  color: 0x243e39,
  roughness: 0.9,
  metalness: 0.1
});
const cliffEdge = new THREE.Mesh(cliffEdgeGeo, cliffEdgeMat);
cliffEdge.rotation.x = Math.PI / 2;
cliffEdge.position.y = 0.02;
islandGroup.add(cliffEdge);

// Ethereal rim aura (soft glow at island border)
const rimAuraGeo = new THREE.RingGeometry(ISLAND_RADIUS - 0.5, ISLAND_RADIUS + 2.5, 48);
const rimAuraMat = new THREE.MeshBasicMaterial({
  color: 0x2ec4b6,
  transparent: true,
  opacity: 0.35,
  side: THREE.DoubleSide
});
const rimAura = new THREE.Mesh(rimAuraGeo, rimAuraMat);
rimAura.rotation.x = -Math.PI / 2;
rimAura.position.y = 0.05;
islandGroup.add(rimAura);

// Layered Sea of Clouds (Floating cloud plane with vertex wave movement)
const cloudMeshList = [];
for (let c = 0; c < 2; c++) {
  const cloudPlaneGeo = new THREE.PlaneGeometry(350, 350, 48, 48);
  const cloudPlaneMat = new THREE.MeshStandardMaterial({
    color: c === 0 ? 0x18243c : 0x111b2d,
    roughness: 0.95,
    metalness: 0.0,
    transparent: true,
    opacity: c === 0 ? 0.78 : 0.9
  });
  const cloudPlane = new THREE.Mesh(cloudPlaneGeo, cloudPlaneMat);
  cloudPlane.rotation.x = -Math.PI / 2;
  cloudPlane.position.y = -5.8 - c * 2.2;
  islandGroup.add(cloudPlane);
  cloudMeshList.push(cloudPlane);
}

scene.add(islandGroup);

// ==========================================
// 3. TROPICAL ISLAND FLORA & OBSTACLES (DỪA, CỌ, CÂY ĐẢO)
// ==========================================
function decoRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const rand = decoRandom(999);

// Physical obstacle list for trees & rocks (Mây cannot walk through, slides smoothly)
const obstacles = [];

// Tropical materials for island trees
const palmTrunkMat = new THREE.MeshStandardMaterial({
  color: 0x8b5a2b, // warm coconut palm bark
  roughness: 0.9,
  metalness: 0.05
});
const palmLeafMat1 = new THREE.MeshStandardMaterial({
  color: 0x2d6a4f, // lush deep palm frond green
  roughness: 0.8,
  metalness: 0.05,
  side: THREE.DoubleSide
});
const palmLeafMat2 = new THREE.MeshStandardMaterial({
  color: 0x40916c, // bright tropical palm leaf
  roughness: 0.75,
  metalness: 0.05,
  side: THREE.DoubleSide
});
const coconutMat = new THREE.MeshStandardMaterial({
  color: 0x386641,
  roughness: 0.8
});
const shrubMat = new THREE.MeshStandardMaterial({
  color: 0x1b4332,
  roughness: 0.85,
  flatShading: true
});

const treeGroup = new THREE.Group();
const islandPlantCount = 44;

// Keep safe clearance around center (player start) and 5 lanterns
const safeZones = [
  { x: 0, z: 0, r: 6.0 }, // center
  { x: 0, z: 25, r: 5.0 }, // L1
  { x: 23.776, z: 7.725, r: 5.0 }, // L2
  { x: 14.695, z: -20.225, r: 5.0 }, // L3
  { x: -14.695, z: -20.225, r: 5.0 }, // L4
  { x: -23.776, z: 7.725, r: 5.0 } // L5
];

function isSafeFromZones(x, z, extraRadius = 1.0) {
  for (const zone of safeZones) {
    const dx = x - zone.x;
    const dz = z - zone.z;
    if (dx * dx + dz * dz < (zone.r + extraRadius) * (zone.r + extraRadius)) {
      return false;
    }
  }
  return true;
}

for (let i = 0; i < islandPlantCount; i++) {
  let tx = 0, tz = 0, valid = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    const angle = rand() * Math.PI * 2;
    const dist = 6.0 + Math.sqrt(rand()) * (ISLAND_RADIUS - 9.0);
    tx = Math.cos(angle) * dist;
    tz = Math.sin(angle) * dist;
    if (isSafeFromZones(tx, tz, 2.2)) {
      valid = true;
      break;
    }
  }
  if (!valid) continue;

  const pScale = 0.8 + rand() * 0.55;
  const plantType = rand() < 0.5 ? 'coconut' : rand() < 0.8 ? 'fanpalm' : 'shrub';
  const plantObj = new THREE.Group();
  plantObj.position.set(tx, 0, tz);

  if (plantType === 'coconut') {
    // 1. CÂY DỪA BIỂN ĐẢO (COCONUT PALM)
    const trunkHeight = (4.0 + rand() * 1.5) * pScale;
    const trunkRadius = 0.26 * pScale;
    const leanAngle = (rand() - 0.5) * 0.35;
    const leanDir = rand() * Math.PI * 2;

    // Segmented curved trunk
    const segments = 5;
    let prevY = 0;
    let curX = 0, curZ = 0;
    for (let s = 0; s < segments; s++) {
      const segH = trunkHeight / segments;
      const segGeo = new THREE.CylinderGeometry(
        trunkRadius * (1 - (s + 1) * 0.08),
        trunkRadius * (1 - s * 0.08),
        segH,
        7
      );
      const segMesh = new THREE.Mesh(segGeo, palmTrunkMat);
      curX += Math.cos(leanDir) * (s * 0.12 * pScale);
      curZ += Math.sin(leanDir) * (s * 0.12 * pScale);
      segMesh.position.set(curX, prevY + segH * 0.5, curZ);
      segMesh.rotation.z = Math.cos(leanDir) * leanAngle;
      segMesh.rotation.x = -Math.sin(leanDir) * leanAngle;
      segMesh.castShadow = true;
      plantObj.add(segMesh);
      prevY += segH;
    }

    // Top Crown of Palm Fronds (7-8 curved drooping leaves)
    const crownX = curX;
    const crownY = prevY;
    const crownZ = curZ;

    const frondCount = 7;
    for (let f = 0; f < frondCount; f++) {
      const frondAngle = (f / frondCount) * Math.PI * 2 + rand() * 0.2;
      const frondGroup = new THREE.Group();
      frondGroup.position.set(crownX, crownY, crownZ);
      frondGroup.rotation.y = frondAngle;

      // Curved palm blade
      const leafGeo = new THREE.BoxGeometry(0.35 * pScale, 0.06, 2.2 * pScale);
      const leafMesh = new THREE.Mesh(leafGeo, f % 2 === 0 ? palmLeafMat1 : palmLeafMat2);
      leafMesh.position.set(0, -0.25 * pScale, 1.1 * pScale);
      leafMesh.rotation.x = -0.45; // arch downward
      leafMesh.castShadow = true;
      frondGroup.add(leafMesh);
      plantObj.add(frondGroup);
    }

    // Coconuts cluster under fronds
    for (let c = 0; c < 3; c++) {
      const cMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16 * pScale, 8, 8), coconutMat);
      const cAngle = (c / 3) * Math.PI * 2;
      cMesh.position.set(
        crownX + Math.cos(cAngle) * 0.25 * pScale,
        crownY - 0.2 * pScale,
        crownZ + Math.sin(cAngle) * 0.25 * pScale
      );
      plantObj.add(cMesh);
    }

    treeGroup.add(plantObj);
    obstacles.push({ x: tx, z: tz, radius: trunkRadius * 1.3 });
  } else if (plantType === 'fanpalm') {
    // 2. CÂY CỌ QUẠT NHIỆT ĐỚI (FAN PALM)
    const trunkH = (1.5 + rand() * 0.8) * pScale;
    const trunkGeo = new THREE.CylinderGeometry(0.28 * pScale, 0.38 * pScale, trunkH, 7);
    const trunkMesh = new THREE.Mesh(trunkGeo, palmTrunkMat);
    trunkMesh.position.y = trunkH * 0.5;
    trunkMesh.castShadow = true;
    plantObj.add(trunkMesh);

    // Radiating fan leaves
    const fanCount = 6;
    for (let f = 0; f < fanCount; f++) {
      const fanAngle = (f / fanCount) * Math.PI * 2;
      const fanGeo = new THREE.CircleGeometry(0.85 * pScale, 5);
      const fanMesh = new THREE.Mesh(fanGeo, palmLeafMat2);
      fanMesh.position.set(
        Math.cos(fanAngle) * 0.65 * pScale,
        trunkH + 0.3 * pScale,
        Math.sin(fanAngle) * 0.65 * pScale
      );
      fanMesh.rotation.x = -Math.PI / 3;
      fanMesh.rotation.y = fanAngle;
      fanMesh.castShadow = true;
      plantObj.add(fanMesh);
    }

    treeGroup.add(plantObj);
    obstacles.push({ x: tx, z: tz, radius: 0.38 * pScale });
  } else {
    // 3. CÂY BỤI ĐẢO & CÂY LINH TINH (COASTAL ISLAND BUSH)
    const bushRadius = (0.75 + rand() * 0.45) * pScale;
    const bushGeo = new THREE.DodecahedronGeometry(bushRadius, 1);
    const bushMesh = new THREE.Mesh(bushGeo, shrubMat);
    bushMesh.scale.set(1.2, 0.75, 1.2);
    bushMesh.position.y = bushRadius * 0.6;
    bushMesh.castShadow = true;
    plantObj.add(bushMesh);

    treeGroup.add(plantObj);
    obstacles.push({ x: tx, z: tz, radius: bushRadius * 0.75 });
  }
}
scene.add(treeGroup);

// B. Ancient Coastal Rocks & Stones (With collision)
const rockGeo = new THREE.DodecahedronGeometry(0.65, 0);
const rockMat = new THREE.MeshStandardMaterial({
  color: 0x36414c,
  roughness: 0.88,
  metalness: 0.1,
  flatShading: true
});
const rockCount = 36;
const rockGroup = new THREE.Group();
for (let i = 0; i < rockCount; i++) {
  const angle = rand() * Math.PI * 2;
  const dist = 5.0 + Math.sqrt(rand()) * (ISLAND_RADIUS - 7.5);
  const rx = Math.cos(angle) * dist;
  const rz = Math.sin(angle) * dist;
  if (!isSafeFromZones(rx, rz, 1.4)) continue;

  const rMesh = new THREE.Mesh(rockGeo, rockMat);
  const sc = 0.55 + rand() * 0.75;
  rMesh.scale.set(sc * (0.85 + rand() * 0.4), sc * (0.5 + rand() * 0.3), sc * (0.85 + rand() * 0.4));
  rMesh.position.set(rx, rMesh.scale.y * 0.35, rz);
  rMesh.rotation.set(rand() * 2, rand() * 2, rand() * 2);
  rMesh.castShadow = true;
  rMesh.receiveShadow = true;
  rockGroup.add(rMesh);

  // Register physical obstacle collision radius for rock
  obstacles.push({
    x: rx,
    z: rz,
    radius: sc * 0.58
  });
}
scene.add(rockGroup);

// C. Stylized Lush Grass Clumps (Organic, varied, walkable - NO COLLISION)
const grassBladeCount = 420;
const grassClumpGeo = new THREE.ConeGeometry(0.24, 0.75, 4);
const grassMatEmerald = new THREE.MeshStandardMaterial({
  color: 0x237055,
  roughness: 0.9,
  flatShading: true
});
const grassInstanced = new THREE.InstancedMesh(grassClumpGeo, grassMatEmerald, grassBladeCount);
const dummyMatrix = new THREE.Matrix4();
const dummyPos = new THREE.Vector3();
const dummyQuat = new THREE.Quaternion();
const dummyScale = new THREE.Vector3();

for (let i = 0; i < grassBladeCount; i++) {
  const angle = rand() * Math.PI * 2;
  const dist = 2.5 + Math.sqrt(rand()) * (ISLAND_RADIUS - 4.0);
  const gx = Math.cos(angle) * dist;
  const gz = Math.sin(angle) * dist;

  const sc = 0.6 + rand() * 0.75;
  dummyPos.set(gx, 0.35 * sc, gz);
  dummyQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI * 2);
  dummyScale.set(sc * (0.8 + rand() * 0.4), sc * (0.7 + rand() * 0.6), sc * (0.8 + rand() * 0.4));
  dummyMatrix.compose(dummyPos, dummyQuat, dummyScale);
  grassInstanced.setMatrixAt(i, dummyMatrix);
}
grassInstanced.instanceMatrix.needsUpdate = true;
grassInstanced.receiveShadow = true;
scene.add(grassInstanced);

// ==========================================
// 4. PLAYER CHARACTER: MÂY (SKY-CHILD AESTHETIC)
// ==========================================
let sim = new Simulation({ seed: Date.now() });

const playerGroup = new THREE.Group();

// Character Robe Body (Light teal traveler robe)
const bodyGeo = new THREE.CylinderGeometry(0.32, 0.46, 1.05, 14);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x56cfe1, roughness: 0.75, flatShading: true });
const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
bodyMesh.position.y = 0.525;
bodyMesh.castShadow = true;
playerGroup.add(bodyMesh);

// Ethereal White Scarf / Cape (Sky child signature)
const capeGeo = new THREE.BoxGeometry(0.48, 0.65, 0.12);
const capeMat = new THREE.MeshStandardMaterial({ color: 0xf1faee, roughness: 0.65 });
const capeMesh = new THREE.Mesh(capeGeo, capeMat);
capeMesh.position.set(0, 0.62, -0.25);
capeMesh.rotation.x = 0.22;
capeMesh.castShadow = true;
playerGroup.add(capeMesh);

// Head
const headGeo = new THREE.SphereGeometry(0.28, 14, 14);
const headMat = new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.7 });
const headMesh = new THREE.Mesh(headGeo, headMat);
headMesh.position.y = 1.28;
playerGroup.add(headMesh);

// Stylized Conical Hat (Nón Lá)
const hatGeo = new THREE.ConeGeometry(0.78, 0.32, 24);
const hatMat = new THREE.MeshStandardMaterial({
  color: 0xdeb887,
  roughness: 0.85,
  metalness: 0.05,
  flatShading: true
});
const hatMesh = new THREE.Mesh(hatGeo, hatMat);
hatMesh.position.y = 1.52;
hatMesh.castShadow = true;
playerGroup.add(hatMesh);

// Mini traveler lantern hanging from hat
const smallLanternGroup = new THREE.Group();
smallLanternGroup.position.set(0.55, 1.35, 0.15);
const sLanternGeo = new THREE.BoxGeometry(0.14, 0.22, 0.14);
const sLanternMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
const sLanternMesh = new THREE.Mesh(sLanternGeo, sLanternMat);
smallLanternGroup.add(sLanternMesh);

const playerPointLight = new THREE.PointLight(0xffbe0b, 35.0, 7.5, 1.4);
smallLanternGroup.add(playerPointLight);

// Little soft sprite glow for player lantern
const playerGlowSpriteMat = new THREE.SpriteMaterial({
  map: fireflyGlowTex,
  color: 0xffd166,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending
});
const playerGlowSprite = new THREE.Sprite(playerGlowSpriteMat);
playerGlowSprite.scale.set(1.2, 1.2, 1.2);
smallLanternGroup.add(playerGlowSprite);

playerGroup.add(smallLanternGroup);
scene.add(playerGroup);

// ==========================================
// 5. TRADITIONAL CHINESE PAGODA LANTERNS (5 ĐÈN LỒNG TRUNG HOA)
// ==========================================
const lanternMeshes = new Map();
const lanternLightMap = new Map();

// Colors for Chinese red silk lantern states
const COLOR_LIT_SILK = new THREE.Color(0xd90429); // imperial red
const COLOR_LIT_EMISSIVE = new THREE.Color(0xff4d00); // fiery orange-gold glow
const COLOR_UNLIT_SILK = new THREE.Color(0x3a0d14); // dark muted cold silk
const COLOR_UNLIT_EMISSIVE = new THREE.Color(0x000000);
const COLOR_PARTIAL_SILK = new THREE.Color(0x7a1c28);

// Shared materials for Chinese architectural tower elements
const stonePedestalMat = new THREE.MeshStandardMaterial({
  color: 0x2b2d42,
  roughness: 0.92,
  flatShading: true
});
const redLacquerMat = new THREE.MeshStandardMaterial({
  color: 0x8b0000, // Chinese cinnabar red lacquer
  roughness: 0.5,
  metalness: 0.15
});
const goldTrimMat = new THREE.MeshStandardMaterial({
  color: 0xffb703, // gilded gold trim
  roughness: 0.35,
  metalness: 0.6
});
const pagodaRoofMat = new THREE.MeshStandardMaterial({
  color: 0x1a2634, // dark slate pagoda roof tiles
  roughness: 0.7,
  flatShading: true
});
const tasselMat = new THREE.MeshStandardMaterial({
  color: 0xd90429, // red silk tassel
  roughness: 0.6
});

for (const l of sim.lanterns) {
  const lGroup = new THREE.Group();
  lGroup.position.set(l.pos[0], 0, l.pos[2]);

  // 1. Two-tier Carved Octagonal Stone Base (Bệ đá hoa cương 2 tầng)
  const baseLowerGeo = new THREE.CylinderGeometry(0.75, 0.95, 0.28, 8);
  const baseLower = new THREE.Mesh(baseLowerGeo, stonePedestalMat);
  baseLower.position.y = 0.14;
  baseLower.receiveShadow = true;
  baseLower.castShadow = true;
  lGroup.add(baseLower);

  const baseUpperGeo = new THREE.CylinderGeometry(0.55, 0.7, 0.26, 8);
  const baseUpper = new THREE.Mesh(baseUpperGeo, stonePedestalMat);
  baseUpper.position.y = 0.41;
  baseUpper.receiveShadow = true;
  baseUpper.castShadow = true;
  lGroup.add(baseUpper);

  // 2. Red Lacquer Pillar with Gold Rings (Cột trụ sơn mài đỏ nẹp vàng)
  const pillarGeo = new THREE.CylinderGeometry(0.18, 0.22, 2.7, 12);
  const pillar = new THREE.Mesh(pillarGeo, redLacquerMat);
  pillar.position.y = 1.76;
  pillar.castShadow = true;
  lGroup.add(pillar);

  // Gold rings on pillar
  for (let r = 0; r < 2; r++) {
    const ringGeo = new THREE.TorusGeometry(0.23, 0.035, 8, 16);
    const ringMesh = new THREE.Mesh(ringGeo, goldTrimMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.9 + r * 1.3;
    lGroup.add(ringMesh);
  }

  // 3. Dougong Brackets / Crossbars (Đấu củng xà đỡ mái đình)
  const bracketGeo = new THREE.BoxGeometry(0.85, 0.1, 0.85);
  const bracket = new THREE.Mesh(bracketGeo, redLacquerMat);
  bracket.position.y = 3.12;
  bracket.castShadow = true;
  lGroup.add(bracket);

  // 4. Traditional Chinese Red Silk Lantern (Lồng Đèn Lụa Đỏ Son Bát Giác)
  const lanternGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.88, 8);
  const lanternSilkMat = new THREE.MeshStandardMaterial({
    color: COLOR_UNLIT_SILK.clone(),
    roughness: 0.45,
    transparent: true,
    opacity: 0.92
  });
  const silkLantern = new THREE.Mesh(lanternGeo, lanternSilkMat);
  silkLantern.position.y = 2.45;
  silkLantern.castShadow = true;
  lGroup.add(silkLantern);

  // Gold top and bottom collars for silk lantern
  const collarTopGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.08, 8);
  const collarTop = new THREE.Mesh(collarTopGeo, goldTrimMat);
  collarTop.position.y = 2.91;
  lGroup.add(collarTop);

  const collarBottomGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.08, 8);
  const collarBottom = new THREE.Mesh(collarBottomGeo, goldTrimMat);
  collarBottom.position.y = 1.99;
  lGroup.add(collarBottom);

  // 5. Hanging Red & Gold Silk Tassels (Tua rua lụa đỏ đung đưa)
  const tasselGroup = new THREE.Group();
  tasselGroup.position.y = 1.95;
  const tasselCount = 4;
  for (let t = 0; t < tasselCount; t++) {
    const tAngle = (t / tasselCount) * Math.PI * 2;
    const tMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.045, 0.45, 6), tasselMat);
    tMesh.position.set(Math.cos(tAngle) * 0.38, -0.25, Math.sin(tAngle) * 0.38);
    tasselGroup.add(tMesh);
  }
  lGroup.add(tasselGroup);

  // 6. Hexagonal Curved Pagoda Eaves / Roof (Mái ngói lầu đình chùa 6 góc cong vút)
  const roofLowerGeo = new THREE.ConeGeometry(1.25, 0.48, 6);
  const roofLower = new THREE.Mesh(roofLowerGeo, pagodaRoofMat);
  roofLower.position.y = 3.36;
  roofLower.castShadow = true;
  lGroup.add(roofLower);

  // Pagoda Finial / Golden Gourd Top (Đỉnh hồ lô vàng kim bảo tháp)
  const finialGeo = new THREE.SphereGeometry(0.18, 10, 10);
  const finial = new THREE.Mesh(finialGeo, goldTrimMat);
  finial.position.y = 3.72;
  lGroup.add(finial);

  // Inner Glowing Sacred Core Flame
  const coreGeo = new THREE.SphereGeometry(0.38, 14, 14);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffea00, transparent: true, opacity: 0.1 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = 2.45;
  lGroup.add(core);

  // Soft Outer Glow Sprite
  const lanternSpriteMat = new THREE.SpriteMaterial({
    map: fireflyGlowTex,
    color: 0xff6b35,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending
  });
  const lSprite = new THREE.Sprite(lanternSpriteMat);
  lSprite.position.y = 2.5;
  lSprite.scale.set(5.2, 5.2, 5.2);
  lGroup.add(lSprite);

  // Sky Beacon Beam (reaches into clouds)
  const beamGeo = new THREE.CylinderGeometry(0.15, 1.6, 32, 16, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffbe0b,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = 18.5;
  lGroup.add(beam);

  // Lantern Light
  const pLight = new THREE.PointLight(0xff7b00, 0, 28, 1.3);
  pLight.position.y = 2.5;
  lGroup.add(pLight);

  scene.add(lGroup);
  lanternMeshes.set(l.id, {
    group: lGroup,
    silkLantern,
    mat: lanternSilkMat,
    core,
    coreMat,
    beam,
    beamMat,
    sprite: lSprite,
    spriteMat: lanternSpriteMat,
    tassels: tasselGroup
  });
  lanternLightMap.set(l.id, pLight);
}

// ==========================================
// 6. MOTES (FIREFLIES WITH SOFT HALO GLOW)
// ==========================================
const moteMeshes = new Map();
const moteGeo = new THREE.SphereGeometry(0.18, 10, 10);
const moteMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });

function syncMotes(elapsedTime) {
  for (const m of sim.motes) {
    if (m.active) {
      if (!moteMeshes.has(m.id)) {
        const mGroup = new THREE.Group();
        mGroup.position.set(m.pos[0], 0.8, m.pos[2]);

        const coreM = new THREE.Mesh(moteGeo, moteMat);
        mGroup.add(coreM);

        const spriteMat = new THREE.SpriteMaterial({
          map: fireflyGlowTex,
          color: 0xffd166,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(1.4, 1.4, 1.4);
        mGroup.add(sprite);

        scene.add(mGroup);
        moteMeshes.set(m.id, { group: mGroup, sprite, spriteMat });
      } else {
        const data = moteMeshes.get(m.id);
        // Bobbing & gentle breathing rhythm
        const bob = Math.sin(elapsedTime * 2.8 + m.pos[0] * 1.5) * 0.28;
        const breath = 1.2 + Math.sin(elapsedTime * 4.0 + m.pos[2]) * 0.25;
        data.group.position.set(m.pos[0], 0.75 + bob, m.pos[2]);
        data.sprite.scale.set(breath, breath, breath);
      }
    } else {
      if (moteMeshes.has(m.id)) {
        const data = moteMeshes.get(m.id);
        scene.remove(data.group);
        data.spriteMat.dispose();
        moteMeshes.delete(m.id);
      }
    }
  }
}

// ==========================================
// 7. SHADES (BÓNG MỰC - INK ENTITIES)
// ==========================================
const shadeMeshes = new Map();
const shadeGeo = new THREE.DodecahedronGeometry(0.68, 1);
const shadeMatNormal = new THREE.MeshStandardMaterial({
  color: 0x140428,
  roughness: 0.35,
  metalness: 0.2,
  flatShading: true
});
const shadeMatStunned = new THREE.MeshStandardMaterial({
  color: 0x5a189a,
  roughness: 0.9,
  wireframe: true
});

function syncShades(elapsedTime) {
  for (const s of sim.shades) {
    if (!shadeMeshes.has(s.id)) {
      const sGroup = new THREE.Group();
      sGroup.position.set(s.pos[0], 0.9, s.pos[2]);

      const mesh = new THREE.Mesh(shadeGeo, shadeMatNormal);
      mesh.castShadow = true;
      sGroup.add(mesh);

      // Dark aura halo
      const sAuraMat = new THREE.SpriteMaterial({
        map: purpleGlowTex,
        color: 0x7b2cbf,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      const sAura = new THREE.Sprite(sAuraMat);
      sAura.scale.set(2.4, 2.4, 2.4);
      sGroup.add(sAura);

      scene.add(sGroup);
      shadeMeshes.set(s.id, { group: sGroup, mesh, aura: sAura, auraMat: sAuraMat });
    } else {
      const data = shadeMeshes.get(s.id);
      data.group.position.set(s.pos[0], 0.85, s.pos[2]);

      if (s.state === 'stunned') {
        data.mesh.material = shadeMatStunned;
        data.mesh.scale.set(0.6, 0.6, 0.6);
        data.aura.scale.set(1.2, 1.2, 1.2);
        data.mesh.rotation.y += 0.01;
      } else {
        data.mesh.material = shadeMatNormal;
        // Breathing pulse when hunting
        const pulse = 1.0 + Math.sin(elapsedTime * 6.0 + s.pos[0]) * 0.12;
        data.mesh.scale.set(pulse, pulse * 0.9, pulse);
        data.aura.scale.set(2.4 * pulse, 2.4 * pulse, 2.4 * pulse);
        data.mesh.rotation.y += 0.04;
        data.mesh.rotation.x += 0.02;
      }
    }
  }
}

// ==========================================
// 8. PULSE FX (ETHERIAL SHOCKWAVE & DOME)
// ==========================================
const pulseRingGeo = new THREE.RingGeometry(0.4, 1.0, 36);
const pulseRingMat = new THREE.MeshBasicMaterial({
  color: 0xffd166,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending
});
const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
pulseRing.rotation.x = -Math.PI / 2;
pulseRing.position.y = 0.12;
scene.add(pulseRing);

const pulseDomeGeo = new THREE.SphereGeometry(1.0, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
const pulseDomeMat = new THREE.MeshBasicMaterial({
  color: 0xffbe0b,
  transparent: true,
  opacity: 0,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending
});
const pulseDome = new THREE.Mesh(pulseDomeGeo, pulseDomeMat);
pulseDome.position.y = 0.1;
scene.add(pulseDome);

let pulseAnim = 0;
function triggerPulseVisual(pos) {
  pulseRing.position.set(pos[0], 0.12, pos[2]);
  pulseDome.position.set(pos[0], 0.08, pos[2]);
  pulseAnim = 1.0;
}

// ==========================================
// 9. CONTROLS, JUMP PHYSICS & CAMERA ORBIT
// ==========================================
const keys = {};
let camYaw = 0;
let isMouseDown = false;
let prevMouseX = 0;

// Jump physics
let playerVy = 0;
let playerVisualY = 0;
const GRAVITY = 22.0;
const JUMP_SPEED = 7.8;
let isGrounded = true;

// Action buffers to guarantee reliable 1-tick triggers without misses
let wantsInteract = false;
let wantsPulse = false;

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  keys[k] = true;

  if (k === 'r') {
    restartGame();
  } else if (k === 'e') {
    wantsInteract = true;
  } else if (k === 'f' || k === 'q') {
    wantsPulse = true;
  } else if (e.key === ' ' || k === 'space') {
    if (isGrounded) {
      playerVy = JUMP_SPEED;
      isGrounded = false;
    }
  }
});

window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  keys[k] = false;
  if (e.key === ' ' || k === 'space') {
    keys[' '] = false;
  }
});

window.addEventListener('blur', () => {
  for (const k in keys) keys[k] = false;
  isMouseDown = false;
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

// Horizontal-only camera orbit around character (No vertical flipping over head)
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
  playerVy = 0;
  playerVisualY = 0;
  isGrounded = true;
  wantsInteract = false;
  wantsPulse = false;

  for (const [, data] of moteMeshes) {
    scene.remove(data.group);
    data.spriteMat.dispose();
  }
  for (const [, data] of shadeMeshes) {
    scene.remove(data.group);
    data.auraMat.dispose();
  }
  moteMeshes.clear();
  shadeMeshes.clear();
}

btnReplay.addEventListener('click', restartGame);

// Smooth Camera Target Vectors
const cameraCurrentPos = new THREE.Vector3(0, 3, -8);
const cameraTargetLook = new THREE.Vector3(0, 1.2, 0);

// Update HUD
function updateHUD() {
  let hearts = '';
  for (let i = 0; i < 3; i++) {
    hearts += i < sim.player.flames ? '❤' : '🖤';
  }
  flamesDisplay.textContent = hearts;
  motesDisplay.textContent = `✨ ${sim.player.carried} / ${sim.tuning.carry_capacity}`;

  const litCount = sim.lanterns.filter((l) => l.lit).length;
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
    const reasonText =
      sim.game_over_reason === 'dawn'
        ? 'Bình minh đã đến nhưng chưa thắp đủ đèn!'
        : 'Mây đã bị Bóng Mực nuốt trọn ánh sáng!';
    dialogMsg.textContent = `${reasonText} Tổng điểm: ${sim.score}`;
    dialogOverlay.style.display = 'flex';
  }

  // Interactive Prompt when strictly within interact_radius
  let nearLantern = null;
  for (const l of sim.lanterns) {
    const dx = sim.player.pos[0] - l.pos[0];
    const dz = sim.player.pos[2] - l.pos[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist <= sim.tuning.interact_radius) {
      nearLantern = l;
      break;
    }
  }

  if (nearLantern && sim.state === 'playing') {
    interactPrompt.style.display = 'block';
    if (nearLantern.lit) {
      interactPrompt.innerHTML = `🏮 <b>${nearLantern.id}</b> đã thắp sáng rực rỡ! ✨ (Vùng an toàn)`;
      interactPrompt.style.borderColor = '#06d6a0';
    } else if (sim.player.carried > 0) {
      const needed = sim.tuning.lantern_cost - nearLantern.deposited;
      interactPrompt.innerHTML = `🏮 <b>${nearLantern.id}:</b> Bấm phím <kbd style="background:#ffd166;color:#111;padding:2px 8px;border-radius:4px;font-weight:bold;font-size:17px;">E</kbd> để nạp ánh sáng! (Đã nạp: ${nearLantern.deposited}/${sim.tuning.lantern_cost} đom đóm, cần thêm ${needed})`;
      interactPrompt.style.borderColor = '#ffd166';
    } else {
      interactPrompt.innerHTML = `🏮 <b>${nearLantern.id} (Đã nạp: ${nearLantern.deposited}/${sim.tuning.lantern_cost}):</b> Cần ${sim.tuning.lantern_cost - nearLantern.deposited} đom đóm nữa. Hãy đi gom đom đóm ✨ trước!`;
      interactPrompt.style.borderColor = '#ff6b6b';
    }
  } else {
    interactPrompt.style.display = 'none';
  }
}

// ==========================================
// 10. MAIN ANIMATION & RENDER LOOP
// ==========================================
const fixedDelta = 1 / 60;
let accumTime = 0;
let lastTime = performance.now();
let totalElapsed = 0;
let isMoving = false;

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  accumTime += dt;
  totalElapsed += dt;

  // Jump physics integration
  if (!isGrounded) {
    playerVy -= GRAVITY * dt;
    playerVisualY += playerVy * dt;
    if (playerVisualY <= 0) {
      playerVisualY = 0;
      playerVy = 0;
      isGrounded = true;
    }
  }

  while (accumTime >= fixedDelta) {
    accumTime -= fixedDelta;

    // Build input frame from keys
    let mx = 0;
    let mz = 0;
    if (keys['w'] || keys['arrowup']) mz += 1;
    if (keys['s'] || keys['arrowdown']) mz -= 1;
    if (keys['d'] || keys['arrowright']) mx -= 1;
    if (keys['a'] || keys['arrowleft']) mx += 1;

    isMoving = mx !== 0 || mz !== 0;

    const currentInteract = wantsInteract;
    const currentPulse = wantsPulse;
    wantsInteract = false;
    wantsPulse = false;

    const yawDeg = (camYaw * 180) / Math.PI;

    if (isMoving) {
      const moveAngle = Math.atan2(mx, mz);
      playerGroup.rotation.y = camYaw + moveAngle;
    }

    const events = sim.step({
      move: [mx, mz],
      cam_yaw_deg: yawDeg,
      interact: currentInteract,
      pulse: currentPulse,
      jump: !isGrounded
    });

    // Obstacle collision: Mây slides smoothly around trees & rocks (cannot walk through)
    for (const obs of obstacles) {
      const dx = sim.player.pos[0] - obs.x;
      const dz = sim.player.pos[2] - obs.z;
      const minDist = obs.radius + 0.38; // Mây's physical collision radius
      const distSq = dx * dx + dz * dz;
      if (distSq < minDist * minDist) {
        const d = Math.sqrt(distSq);
        if (d > 0.001) {
          sim.player.pos[0] = obs.x + (dx / d) * minDist;
          sim.player.pos[2] = obs.z + (dz / d) * minDist;
        }
      }
    }

    for (const ev of events) {
      if (ev.name === 'pulse') {
        triggerPulseVisual(sim.player.pos);
      }
    }
  }

  // A. Player Bobbing Walk Animation & Cape Swish (Stops immediately on key release!)
  let bobY = 0;
  if (!isGrounded) {
    capeMesh.rotation.x = 0.55;
    hatMesh.rotation.z = 0;
  } else if (isMoving) {
    bobY = Math.abs(Math.sin(totalElapsed * 14.0)) * 0.12;
    capeMesh.rotation.x = 0.45 + Math.sin(totalElapsed * 14.0) * 0.12;
    hatMesh.rotation.z = Math.sin(totalElapsed * 7.0) * 0.05;
  } else {
    // Idle stance - stops immediately
    bobY = Math.sin(totalElapsed * 2.0) * 0.02;
    capeMesh.rotation.x = 0.22;
    hatMesh.rotation.z = 0;
  }
  playerGroup.position.set(sim.player.pos[0], sim.player.pos[1] + playerVisualY + bobY, sim.player.pos[2]);

  // B. Pulse FX Animation
  if (pulseAnim > 0) {
    pulseAnim -= dt * 1.8;
    const progress = 1.0 - Math.max(0, pulseAnim);
    const currentR = progress * sim.tuning.pulse_radius;

    pulseRing.scale.set(currentR, currentR, 1);
    pulseRingMat.opacity = Math.max(0, pulseAnim) * 0.9;

    pulseDome.scale.set(currentR, currentR * 0.7, currentR);
    pulseDomeMat.opacity = Math.max(0, pulseAnim) * 0.45;
  }

  // C. Update Lanterns visual state (Reusing existing color objects, zero GC)
  for (const l of sim.lanterns) {
    const lData = lanternMeshes.get(l.id);
    const pLight = lanternLightMap.get(l.id);
    if (l.lit) {
      lData.mat.color.copy(COLOR_LIT_SILK);
      lData.mat.emissive.copy(COLOR_LIT_EMISSIVE);
      lData.mat.emissiveIntensity = 2.6;
      lData.coreMat.opacity = 1.0;
      const corePulse = 1.35 + Math.sin(totalElapsed * 4.0 + l.pos[0]) * 0.12;
      lData.core.scale.set(corePulse, corePulse, corePulse);
      lData.spriteMat.opacity = 0.85 + Math.sin(totalElapsed * 3.0) * 0.15;
      lData.beamMat.opacity = 0.45 + Math.sin(totalElapsed * 3.5 + l.pos[2]) * 0.15;
      pLight.intensity = 85.0;
      if (lData.tassels) {
        lData.tassels.rotation.z = Math.sin(totalElapsed * 2.5 + l.pos[0]) * 0.12;
      }
    } else {
      const ratio = l.deposited / sim.tuning.lantern_cost;
      if (ratio > 0) {
        lData.mat.color.copy(COLOR_PARTIAL_SILK);
        lData.mat.emissive.setRGB(0.7 * ratio, 0.25 * ratio, 0.0);
        lData.mat.emissiveIntensity = ratio * 1.5;
        lData.coreMat.opacity = 0.2 + ratio * 0.6;
        const scaleVal = 0.8 + ratio * 0.4;
        lData.core.scale.set(scaleVal, scaleVal, scaleVal);
        lData.spriteMat.opacity = ratio * 0.4;
        pLight.intensity = ratio * 28.0;
      } else {
        lData.mat.color.copy(COLOR_UNLIT_SILK);
        lData.mat.emissive.copy(COLOR_UNLIT_EMISSIVE);
        lData.coreMat.opacity = 0.05;
        lData.core.scale.set(0.6, 0.6, 0.6);
        lData.spriteMat.opacity = 0;
        pLight.intensity = 0;
      }
      lData.beamMat.opacity = 0;
    }
  }

  // D. Subtle Cloud and Star Motion
  cloudMeshList[0].rotation.z += 0.0003;
  cloudMeshList[1].rotation.z -= 0.0002;
  cloudMeshList[0].position.y = -5.8 + Math.sin(totalElapsed * 0.8) * 0.2;

  syncMotes(totalElapsed);
  syncShades(totalElapsed);
  updateHUD();

  // E. Smooth Camera Lerp Follow (Diagonal top-down isometric view, rotates 360 horizontally)
  const camDist = 9.2;
  const camHeight = 5.2; // Diagonal angle looking down at Mây, providing expansive scenery & obstacle awareness
  const desiredCamX = sim.player.pos[0] - Math.sin(camYaw) * camDist;
  const desiredCamZ = sim.player.pos[2] - Math.cos(camYaw) * camDist;
  const desiredCamY = sim.player.pos[1] + playerVisualY + camHeight;

  cameraCurrentPos.lerp(new THREE.Vector3(desiredCamX, desiredCamY, desiredCamZ), 0.12);
  cameraTargetLook.lerp(new THREE.Vector3(sim.player.pos[0], sim.player.pos[1] + playerVisualY + 0.9, sim.player.pos[2]), 0.14);

  camera.position.copy(cameraCurrentPos);
  camera.lookAt(cameraTargetLook);

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
