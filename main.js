import * as THREE from 'three';

const loading = document.getElementById('loading');
const speedDisplay = document.getElementById('speed');
const message = document.getElementById('message');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8d7ff);
scene.fog = new THREE.Fog(0xa8d7ff, 60, 620);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1800);
camera.position.set(0, 6, 12);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('game').prepend(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xeaf5ff, 0x5d6448, 2.0);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff0bf, 2.3);
sun.position.set(-40, 120, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const skyGlow = new THREE.Mesh(
  new THREE.SphereGeometry(700, 32, 32),
  new THREE.MeshBasicMaterial({
    color: 0xfff2d0,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.2
  })
);
scene.add(skyGlow);

function addCloud(x, y, z, scale = 1) {
  const cloud = new THREE.Group();
  const puffGeo = new THREE.SphereGeometry(2.6, 16, 16);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xf4fbff,
    opacity: 0.82,
    transparent: true,
    roughness: 1
  });

  const puff1 = new THREE.Mesh(puffGeo, cloudMat);
  puff1.position.set(-1.8, 0, 0);
  cloud.add(puff1);

  const puff2 = new THREE.Mesh(puffGeo, cloudMat);
  puff2.position.set(0.5, 0.6, 0.5);
  cloud.add(puff2);

  const puff3 = new THREE.Mesh(puffGeo, cloudMat);
  puff3.position.set(2.3, 0, 0.2);
  cloud.add(puff3);

  cloud.position.set(x, y, z);
  cloud.scale.setScalar(scale);
  scene.add(cloud);
}

for (let i = 0; i < 14; i++) {
  addCloud(
    (Math.random() - 0.5) * 750,
    60 + Math.random() * 60,
    -220 - Math.random() * 180,
    1 + Math.random() * 1.8
  );
}

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000),
  new THREE.MeshStandardMaterial({
    color: 0x7aa35d,
    roughness: 1
  })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.12;
ground.receiveShadow = true;
scene.add(ground);

const roadMaterial = new THREE.MeshStandardMaterial({
  color: 0x3a3d41,
  roughness: 0.95
});

function makeRoad(x, z, width, length, rotation = 0) {
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(width, length),
    roadMaterial
  );
  road.rotation.x = -Math.PI / 2;
  road.rotation.z = rotation;
  road.position.set(x, 0, z);
  road.receiveShadow = true;
  scene.add(road);

  const lane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, length * 0.82),
    new THREE.MeshStandardMaterial({
      color: 0xf4ebbf,
      emissive: 0x221909,
      emissiveIntensity: 0.08
    })
  );
  lane.rotation.x = -Math.PI / 2;
  lane.rotation.z = rotation;
  lane.position.set(x, 0.03, z);
  scene.add(lane);

  const edgeA = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, length * 0.9),
    new THREE.MeshStandardMaterial({ color: 0xdfe5e3, roughness: 1 })
  );
  edgeA.rotation.x = -Math.PI / 2;
  edgeA.rotation.z = rotation;
  edgeA.position.set(x - width / 2 + 0.14, 0.04, z);
  scene.add(edgeA);

  const edgeB = edgeA.clone();
  edgeB.position.set(x + width / 2 - 0.14, 0.04, z);
  scene.add(edgeB);
}

makeRoad(0, 0, 18, 1200);
makeRoad(0, 0, 1200, 18, Math.PI / 2);

const buildingColors = [0xccc0b8, 0xb8c4bb, 0xc4c0d1, 0xa9b0b8, 0xd7bba0, 0xcfb69d];

function createBuilding(x, z, width, height, depth, color) {
  const building = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.08
    })
  );
  building.position.set(x, height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);

  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xbfe6ff,
    roughness: 0.28,
    metalness: 0.14
  });

  const rows = Math.max(2, Math.floor(height / 3.2));
  const cols = Math.max(2, Math.floor(width / 3));

  for (let row = 1; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.0, 0.12),
        windowMaterial
      );
      win.position.set(
        x - width / 2 + 1.4 + col * 2.2,
        row * 2.4,
        z - depth / 2 - 0.1
      );
      scene.add(win);
    }
  }
}

for (let i = -12; i <= 12; i++) {
  if (Math.abs(i) < 2) continue;
  const offset = i * 24;
  createBuilding(-28, offset, 12, 14 + Math.random() * 18, 14, buildingColors[Math.floor(Math.random() * buildingColors.length)]);
  createBuilding(28, offset + 8, 14, 15 + Math.random() * 20, 16, buildingColors[Math.floor(Math.random() * buildingColors.length)]);
}

function createShop(x, z, color) {
  const shop = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 2.8, 2.3),
    new THREE.MeshStandardMaterial({ color, roughness: 0.82 })
  );
  shop.position.set(x, 1.4, z);
  shop.castShadow = true;
  shop.receiveShadow = true;
  scene.add(shop);

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.5, 0.12),
    new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0x3e2300,
      emissiveIntensity: 0.2
    })
  );
  sign.position.set(x, 2.6, z + 1.1);
  scene.add(sign);

  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.35, 1.1),
    new THREE.MeshStandardMaterial({
      color: 0xce5a45,
      roughness: 0.75
    })
  );
  awning.position.set(x, 2.7, z + 1.5);
  scene.add(awning);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.7, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x2f2b2a, roughness: 0.8 })
  );
  door.position.set(x, 0.9, z + 1.33);
  scene.add(door);
}

for (let i = 0; i < 16; i++) {
  const side = i % 2 === 0 ? -1 : 1;
  const z = -340 + i * 48;
  createShop(side * (18 + Math.random() * 18), z, i % 3 === 0 ? 0xd77a5b : 0xe7d3af);
}

function createStreetLight(x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 6, 10),
    new THREE.MeshStandardMaterial({ color: 0x707680, metalness: 0.5, roughness: 0.7 })
  );
  pole.position.set(x, 3, z);
  pole.castShadow = true;
  scene.add(pole);

  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.28, 0.18),
    new THREE.MeshStandardMaterial({
      color: 0xfde7a5,
      emissive: 0xffeea3,
      emissiveIntensity: 0.8
    })
  );
  lamp.position.set(x, 5.8, z);
  scene.add(lamp);

  const glow = new THREE.PointLight(0xfff0bb, 0.8, 22, 2);
  glow.position.set(x, 5.7, z);
  scene.add(glow);
}

for (let z = -500; z <= 500; z += 110) {
  createStreetLight(-18, z);
  createStreetLight(18, z);
}

function createTree(x, z, scale = 1) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.38, 2.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x6b4128 })
  );
  trunk.position.set(x, 1.4 * scale, z);
  trunk.scale.setScalar(scale);
  trunk.castShadow = true;
  scene.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(2.1, 10, 9),
    new THREE.MeshStandardMaterial({ color: 0x3f8a48 })
  );
  leaves.position.set(x, 3.7 * scale, z);
  leaves.scale.set(1.15, 1.3, 1.1);
  leaves.castShadow = true;
  scene.add(leaves);
}

for (let i = 0; i < 150; i++) {
  const side = Math.random() < 0.5 ? -1 : 1;
  const z = (Math.random() - 0.5) * 700;
  createTree(side * (18 + Math.random() * 82), z, 0.7 + Math.random() * 0.9);
}

function createBusStop(x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 3.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x60676c, metalness: 0.4, roughness: 0.7 })
  );
  pole.position.set(x, 1.7, z);
  scene.add(pole);

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.8, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 1 })
  );
  sign.position.set(x, 3.3, z);
  scene.add(sign);

  const label = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.26, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x2b5fa5 })
  );
  label.position.set(x, 3.3, z + 0.06);
  scene.add(label);
}

for (let i = -8; i <= 8; i += 4) {
  createBusStop(-10, i * 22);
  createBusStop(10, i * 22 + 10);
}

function createTemple(x, z) {
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(5, 1.5, 5),
    new THREE.MeshStandardMaterial({ color: 0xf0e3b8, roughness: 0.9 })
  );
  base.position.set(x, 0.75, z);
  scene.add(base);

  const tower = new THREE.Mesh(
    new THREE.ConeGeometry(1.6, 3.4, 4),
    new THREE.MeshStandardMaterial({ color: 0xf4d67d, roughness: 0.7 })
  );
  tower.position.set(x, 3.2, z);
  scene.add(tower);

  const top = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xb38f2b })
  );
  top.position.set(x, 5.3, z);
  scene.add(top);
}

createTemple(-100, 220);
createTemple(100, -220);

function createAutoRickshaw(x, z, rotation = 0) {
  const rick = new THREE.Group();

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.1, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xf3d55e, roughness: 0.75 })
  );
  cabin.position.y = 1.1;
  cabin.castShadow = true;
  rick.add(cabin);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.7, 2.5),
    new THREE.MeshStandardMaterial({ color: 0xef724d, roughness: 0.65 })
  );
  body.position.y = 0.6;
  body.castShadow = true;
  rick.add(body);

  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.18, 12);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.9 });

  for (const px of [-0.75, 0.75]) {
    for (const pz of [-0.75, 0.75]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(px, 0.35, pz);
      wheel.castShadow = true;
      rick.add(wheel);
    }
  }

  rick.position.set(x, 0, z);
  rick.rotation.y = rotation;
  scene.add(rick);
}

const npcVehicles = [];
function addTrafficVehicle(x, z, color, rotation = 0, scale = 1) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.1 * scale, 0.7 * scale, 4.3 * scale),
    new THREE.MeshStandardMaterial({
      color,
      metalness: 0.45,
      roughness: 0.35
    })
  );
  body.position.y = 0.9 * scale;
  body.castShadow = true;
  group.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.5 * scale, 0.8 * scale, 2.2 * scale),
    new THREE.MeshStandardMaterial({
      color: 0x2d3a47,
      metalness: 0.2,
      roughness: 0.25
    })
  );
  cabin.position.set(0, 1.55 * scale, -0.15 * scale);
  cabin.castShadow = true;
  group.add(cabin);

  const wheelGeo = new THREE.CylinderGeometry(0.42 * scale, 0.42 * scale, 0.28 * scale, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.9 });

  for (const xx of [-1.1 * scale, 1.1 * scale]) {
    for (const zz of [-1.25 * scale, 1.25 * scale]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(xx, 0.52 * scale, zz);
      wheel.castShadow = true;
      group.add(wheel);
    }
  }

  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  scene.add(group);
  npcVehicles.push(group);
}

createAutoRickshaw(-40, 120, Math.PI / 2);
createAutoRickshaw(40, -140, -Math.PI / 2);

addTrafficVehicle(-120, 180, 0x8f1c1c, Math.PI / 2, 1.0);
addTrafficVehicle(140, -180, 0x1c5d8f, -Math.PI / 2, 1.05);
addTrafficVehicle(0, 260, 0x7a9c2d, 0, 0.9);
addTrafficVehicle(-220, -80, 0xba7c27, Math.PI, 1.1);

const playerCar = new THREE.Group();
scene.add(playerCar);

const carBody = new THREE.Mesh(
  new THREE.BoxGeometry(2.1, 0.72, 4.3),
  new THREE.MeshStandardMaterial({
    color: 0x9d1717,
    metalness: 0.42,
    roughness: 0.32
  })
);
carBody.position.y = 0.9;
carBody.castShadow = true;
playerCar.add(carBody);

const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.7, 0.82, 2.15),
  new THREE.MeshStandardMaterial({
    color: 0x2b3a45,
    metalness: 0.2,
    roughness: 0.25
  })
);
cabin.position.set(0, 1.6, -0.2);
cabin.castShadow = true;
playerCar.add(cabin);

const windshield = new THREE.Mesh(
  new THREE.BoxGeometry(1.3, 0.55, 1.1),
  new THREE.MeshStandardMaterial({
    color: 0x9ed7f6,
    roughness: 0.08,
    metalness: 0.3,
    transparent: true,
    opacity: 0.75
  })
);
windshield.position.set(0, 1.62, 0.05);
playerCar.add(windshield);

const wheelGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.25, 16);
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.9 });

const carWheels = [];
for (const x of [-1.08, 1.08]) {
  for (const z of [-1.35, 1.35]) {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.5, z);
    wheel.castShadow = true;
    playerCar.add(wheel);
    carWheels.push(wheel);
  }
}

function addHeadlight(x, z, color) {
  const light = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.18, 0.08),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.6
    })
  );
  light.position.set(x, 0.95, z);
  playerCar.add(light);
}

addHeadlight(-0.68, 2.18, 0xfff0bf);
addHeadlight(0.68, 2.18, 0xfff0bf);
addHeadlight(-0.68, -2.18, 0xff1d16);
addHeadlight(0.68, -2.18, 0xff1d16);

const human = new THREE.Group();
scene.add(human);
human.visible = false;

const skinMat = new THREE.MeshStandardMaterial({ color: 0xe6bf9d, roughness: 0.9 });
const shirtMat = new THREE.MeshStandardMaterial({ color: 0x2d5a8c, roughness: 0.7 });
const pantsMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9 });

const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 18, 18), skinMat);
head.position.y = 2.25;
head.castShadow = true;
human.add(head);

const hair = new THREE.Mesh(
  new THREE.SphereGeometry(0.32, 16, 12),
  new THREE.MeshStandardMaterial({ color: 0x1f120d, roughness: 1 })
);
hair.position.set(0, 2.46, -0.04);
hair.scale.set(1, 0.7, 1);
hair.castShadow = true;
human.add(hair);

const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.35), shirtMat);
torso.position.y = 1.35;
torso.castShadow = true;
human.add(torso);

const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.8, 4, 8), skinMat);
leftArm.position.set(-0.55, 1.45, 0);
leftArm.rotation.z = 0.35;
leftArm.castShadow = true;
human.add(leftArm);

const rightArm = leftArm.clone();
rightArm.position.x = 0.55;
rightArm.rotation.z = -0.35;
human.add(rightArm);

const leftLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.95, 4, 8), skinMat);
leftLeg.position.set(-0.18, 0.52, 0);
leftLeg.castShadow = true;
human.add(leftLeg);

const rightLeg = leftLeg.clone();
rightLeg.position.x = 0.18;
human.add(rightLeg);

const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.42), pantsMat);
leftFoot.position.set(-0.18, -0.08, 0.08);
leftFoot.castShadow = true;
human.add(leftFoot);

const rightFoot = leftFoot.clone();
rightFoot.position.x = 0.18;
human.add(rightFoot);

const input = {
  gas: false,
  brake: false,
  left: false,
  right: false
};

function bindButton(id, key) {
  const button = document.getElementById(id);
  button.addEventListener('pointerdown', event => {
    event.preventDefault();
    input[key] = true;
    button.setPointerCapture(event.pointerId);
  });

  const release = event => {
    event.preventDefault();
    input[key] = false;
  };

  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', () => {
    input[key] = false;
  });
}

bindButton('gas', 'gas');
bindButton('brake', 'brake');
bindButton('left', 'left');
bindButton('right', 'right');

let cameraAngle = 0;
let cameraHeight = 5;
let cameraDistance = 11;
let lastTouchX = 0;
let lastTouchY = 0;
let dragging = false;

renderer.domElement.addEventListener('pointerdown', event => {
  dragging = true;
  lastTouchX = event.clientX;
  lastTouchY = event.clientY;
  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener('pointermove', event => {
  if (!dragging) return;

  const dx = event.clientX - lastTouchX;
  const dy = event.clientY - lastTouchY;

  cameraAngle -= dx * 0.008;
  cameraHeight = THREE.MathUtils.clamp(cameraHeight + dy * 0.025, 1.8, 12);

  lastTouchX = event.clientX;
  lastTouchY = event.clientY;
});

function stopDragging() {
  dragging = false;
}
renderer.domElement.addEventListener('pointerup', stopDragging);
renderer.domElement.addEventListener('pointercancel', stopDragging);
renderer.domElement.addEventListener('lostpointercapture', stopDragging);

let mode = 'car';
let velocity = 0;
let steering = 0;
let walkCycle = 0;

const clock = new THREE.Clock();

function clampToWorld(obj) {
  const max = 440;
  obj.position.x = THREE.MathUtils.clamp(obj.position.x, -max, max);
  obj.position.z = THREE.MathUtils.clamp(obj.position.z, -max, max);
}

function animateHumanWalk(dt) {
  walkCycle += dt * 12;
  const swing = Math.sin(walkCycle) * 0.9;

  leftArm.rotation.x = swing * 0.9;
  rightArm.rotation.x = -swing * 0.9;
  leftLeg.rotation.x = -swing * 0.9;
  rightLeg.rotation.x = swing * 0.9;
  leftFoot.rotation.x = -swing * 0.25;
  rightFoot.rotation.x = swing * 0.25;
}

document.getElementById('exit').addEventListener('click', () => {
  if (mode === 'car') {
    mode = 'onFoot';
    const offset = new THREE.Vector3(Math.sin(playerCar.rotation.y) * 2.8, 0, Math.cos(playerCar.rotation.y) * 2.8);
    human.position.copy(playerCar.position).add(offset);
    human.position.y = 0;
    human.rotation.y = playerCar.rotation.y + Math.PI;
    human.visible = true;
    velocity = 0;
    message.textContent = 'Exploring the city on foot';
  } else {
    mode = 'car';
    human.visible = false;
    const offset = new THREE.Vector3(-Math.sin(human.rotation.y) * 2.8, 0, -Math.cos(human.rotation.y) * 2.8);
    playerCar.position.copy(human.position).add(offset);
    playerCar.rotation.y = human.rotation.y + Math.PI;
    velocity = 0;
    message.textContent = 'Back in the car';
  }
});

function animateTraffic(dt) {
  for (const vehicle of npcVehicles) {
    vehicle.position.x += Math.sin(vehicle.rotation.y) * 18 * dt;
    vehicle.position.z += Math.cos(vehicle.rotation.y) * 18 * dt;

    if (Math.abs(vehicle.position.x) > 420 || Math.abs(vehicle.position.z) > 420) {
      vehicle.position.x = THREE.MathUtils.randFloatSpread(420);
      vehicle.position.z = THREE.MathUtils.randFloatSpread(420);
      vehicle.rotation.y = Math.random() * Math.PI * 2;
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  animateTraffic(dt);

  if (mode === 'car') {
    if (input.gas) velocity += 12 * dt;
    if (input.brake) velocity -= 18 * dt;

    velocity *= Math.pow(0.985, dt * 60);
    velocity = THREE.MathUtils.clamp(velocity, -10, 38);

    const steeringInput = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    steering += (steeringInput - steering) * Math.min(1, dt * 5);

    if (Math.abs(velocity) > 0.2) {
      playerCar.rotation.y += steering * velocity * 0.018 * dt;
    }

    playerCar.position.x += Math.sin(playerCar.rotation.y) * velocity * dt;
    playerCar.position.z += Math.cos(playerCar.rotation.y) * velocity * dt;
    clampToWorld(playerCar);

    for (const wheel of carWheels) {
      wheel.rotation.x += velocity * dt * 0.8;
    }
  } else {
    const move = (input.gas ? 1 : 0) - (input.brake ? 1 : 0);
    const turn = (input.left ? 1 : 0) - (input.right ? 1 : 0);

    human.rotation.y += turn * dt * 2.8;

    if (Math.abs(move) > 0.01) {
      const walkSpeed = 4.5;
      human.position.x += Math.sin(human.rotation.y) * move * walkSpeed * dt;
      human.position.z += Math.cos(human.rotation.y) * move * walkSpeed * dt;
      clampToWorld(human);
      animateHumanWalk(dt);
    } else {
      leftArm.rotation.x = 0;
      rightArm.rotation.x = 0;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftFoot.rotation.x = 0;
      rightFoot.rotation.x = 0;
    }
  }

  const target = mode === 'car' ? playerCar.position.clone() : human.position.clone();
  target.y += mode === 'car' ? 1.5 : 1.15;

  const cameraOffset = new THREE.Vector3(
    Math.sin(cameraAngle) * cameraDistance,
    cameraHeight,
    Math.cos(cameraAngle) * cameraDistance
  );

  const lookYaw = mode === 'car' ? playerCar.rotation.y : human.rotation.y;
  cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), lookYaw);

  camera.position.lerp(target.clone().add(cameraOffset), 1 - Math.pow(0.001, dt));
  camera.lookAt(target);

  speedDisplay.textContent = `${Math.round(Math.abs(velocity) * 3.6)} km/h`;

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

loading.style.display = 'none';
animate();
