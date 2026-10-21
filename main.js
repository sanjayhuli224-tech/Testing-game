import * as THREE from 'three';

const loading = document.getElementById('loading');
const speedDisplay = document.getElementById('speed');
const message = document.getElementById('message');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa7d6f7);
scene.fog = new THREE.Fog(0xa7d6f7, 80, 550);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1500);
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

scene.add(new THREE.HemisphereLight(0xeaf5ff, 0x5d6448, 2.2));

const sun = new THREE.DirectionalLight(0xfff1d1, 2.4);
sun.position.set(-50, 110, 45);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

const cloudMaterial = new THREE.MeshStandardMaterial({
  color: 0xf4fbff,
  opacity: 0.8,
  transparent: true,
  roughness: 1
});

function addCloud(x, y, z, scale = 1) {
  const cloud = new THREE.Group();
  const puffGeo = new THREE.SphereGeometry(2.2, 16, 16);

  const puff1 = new THREE.Mesh(puffGeo, cloudMaterial);
  puff1.position.set(-1.2, 0, 0);
  cloud.add(puff1);

  const puff2 = new THREE.Mesh(puffGeo, cloudMaterial);
  puff2.position.set(0.8, 0.4, 0.6);
  cloud.add(puff2);

  const puff3 = new THREE.Mesh(puffGeo, cloudMaterial);
  puff3.position.set(2.2, 0, 0.2);
  cloud.add(puff3);

  cloud.position.set(x, y, z);
  cloud.scale.setScalar(scale);
  scene.add(cloud);
}

for (let i = 0; i < 12; i++) {
  addCloud(
    (Math.random() - 0.5) * 700,
    60 + Math.random() * 50,
    -200 - Math.random() * 200,
    1.2 + Math.random() * 1.5
  );
}

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(2200, 2200),
  new THREE.MeshStandardMaterial({
    color: 0x6d8d4f,
    roughness: 1
  })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.12;
ground.receiveShadow = true;
scene.add(ground);

for (let i = 0; i < 260; i++) {
  const patch = new THREE.Mesh(
    new THREE.CircleGeometry(1.4 + Math.random() * 2.4, 12),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.28 + Math.random() * 0.08, 0.52, 0.35 + Math.random() * 0.12)
    })
  );
  patch.rotation.x = -Math.PI / 2;
  patch.position.set(
    (Math.random() - 0.5) * 760,
    0.03,
    (Math.random() - 0.5) * 760
  );
  scene.add(patch);
}

const roadMaterial = new THREE.MeshStandardMaterial({
  color: 0x3d4045,
  roughness: 0.96
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
    new THREE.PlaneGeometry(0.18, length * 0.85),
    new THREE.MeshStandardMaterial({
      color: 0xf5e9b4,
      emissive: 0x211a0c,
      emissiveIntensity: 0.08
    })
  );
  lane.rotation.x = -Math.PI / 2;
  lane.rotation.z = rotation;
  lane.position.set(x, 0.03, z);
  scene.add(lane);

  const edge1 = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, length * 0.9),
    new THREE.MeshStandardMaterial({ color: 0xd1d9d4, roughness: 1 })
  );
  edge1.rotation.x = -Math.PI / 2;
  edge1.rotation.z = rotation;
  edge1.position.set(x - width / 2 + 0.14, 0.04, z);
  scene.add(edge1);

  const edge2 = edge1.clone();
  edge2.position.set(x + width / 2 - 0.14, 0.04, z);
  scene.add(edge2);
}

makeRoad(0, 0, 14, 1200);
makeRoad(0, 0, 1200, 14, Math.PI / 2);

function createBuilding(x, z, width, height, depth, color) {
  const building = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.82,
      metalness: 0.08
    })
  );
  building.position.set(x, height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);

  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xb8dff0,
    roughness: 0.28,
    metalness: 0.18
  });

  const rows = Math.max(2, Math.floor(height / 3));
  const cols = Math.max(2, Math.floor(width / 3));

  for (let row = 1; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const windowMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.1, 0.1),
        windowMaterial
      );
      windowMesh.position.set(
        x - width / 2 + 1.5 + col * 2.2,
        row * 2.5,
        z - depth / 2 - 0.08
      );
      scene.add(windowMesh);
    }
  }
}

const buildingColors = [0xc9b79d, 0xb5c4b4, 0xc3beb8, 0x999ea3, 0xba9d7d];

for (let i = -10; i <= 10; i++) {
  if (Math.abs(i) < 2) continue;
  const offset = i * 24;

  createBuilding(
    -26,
    offset,
    12,
    12 + Math.random() * 18,
    14,
    buildingColors[Math.floor(Math.random() * buildingColors.length)]
  );

  createBuilding(
    28,
    offset + 10,
    14,
    13 + Math.random() * 20,
    16,
    buildingColors[Math.floor(Math.random() * buildingColors.length)]
  );
}

function createShop(x, z, color) {
  const shop = new THREE.Mesh(
    new THREE.BoxGeometry(3.7, 2.8, 2.2),
    new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
  );
  shop.position.set(x, 1.4, z);
  shop.castShadow = true;
  shop.receiveShadow = true;
  scene.add(shop);

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.45, 0.12),
    new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0x2b1a00,
      emissiveIntensity: 0.15
    })
  );
  sign.position.set(x, 2.5, z + 1.1);
  scene.add(sign);

  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.4, 1.0),
    new THREE.MeshStandardMaterial({
      color: 0xd8574f,
      roughness: 0.7
    })
  );
  awning.position.set(x, 2.8, z + 1.5);
  scene.add(awning);
}

for (let i = 0; i < 14; i++) {
  const side = i % 2 === 0 ? -1 : 1;
  const z = -340 + i * 52;
  createShop(side * (18 + Math.random() * 18), z, i % 3 === 0 ? 0xd7775d : 0xe8d9bf);
}

function createStreetLight(x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 6, 10),
    new THREE.MeshStandardMaterial({ color: 0x6f7275, metalness: 0.5, roughness: 0.7 })
  );
  pole.position.set(x, 3, z);
  pole.castShadow = true;
  scene.add(pole);

  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.28, 0.2),
    new THREE.MeshStandardMaterial({
      color: 0xfee0a1,
      emissive: 0xffef99,
      emissiveIntensity: 0.8
    })
  );
  lamp.position.set(x, 5.9, z);
  scene.add(lamp);

  const glow = new THREE.PointLight(0xfff0bb, 0.7, 20, 2);
  glow.position.set(x, 5.7, z);
  scene.add(glow);
}

for (let z = -500; z <= 500; z += 100) {
  createStreetLight(-18, z);
  createStreetLight(18, z);
}

function createRoadSign(x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 3.4, 10),
    new THREE.MeshStandardMaterial({ color: 0x484d53, metalness: 0.5, roughness: 0.6 })
  );
  pole.position.set(x, 1.7, z);
  scene.add(pole);

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.85, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xf7f7f7, roughness: 1 })
  );
  sign.position.set(x, 3.4, z);
  scene.add(sign);

  const label = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.28, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x2a4f8a })
  );
  label.position.set(x, 3.4, z + 0.06);
  scene.add(label);
}

for (let i = -8; i <= 8; i += 4) {
  createRoadSign(-10, i * 22);
  createRoadSign(10, i * 22 + 10);
}

function createTree(x, z, scale = 1) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.42, 2.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x684829 })
  );
  trunk.position.set(x, 1.4 * scale, z);
  trunk.scale.setScalar(scale);
  trunk.castShadow = true;
  scene.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(2.3, 10, 9),
    new THREE.MeshStandardMaterial({ color: 0x448a46 })
  );
  leaves.position.set(x, 3.8 * scale, z);
  leaves.scale.set(1.1, 1.25, 1.1);
  leaves.castShadow = true;
  scene.add(leaves);
}

for (let i = 0; i < 120; i++) {
  const z = (Math.random() - 0.5) * 700;
  const side = Math.random() < 0.5 ? -1 : 1;
  createTree(side * (20 + Math.random() * 72), z, 0.7 + Math.random() * 0.9);
}

for (let i = 0; i < 80; i++) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.7 + Math.random() * 1.6, 0),
    new THREE.MeshStandardMaterial({
      color: 0x7d7d7a,
      roughness: 1
    })
  );
  rock.position.set(
    (Math.random() - 0.5) * 700,
    0.6,
    (Math.random() - 0.5) * 700
  );
  rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);
}

function createAutoRickshaw(x, z, rotation = 0) {
  const rickshaw = new THREE.Group();

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.0, 2.1),
    new THREE.MeshStandardMaterial({
      color: 0xf3d65e,
      roughness: 0.75
    })
  );
  cabin.position.y = 1.1;
  cabin.castShadow = true;
  rickshaw.add(cabin);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.7, 2.5),
    new THREE.MeshStandardMaterial({
      color: 0xef6d4f,
      roughness: 0.6
    })
  );
  body.position.y = 0.6;
  body.castShadow = true;
  rickshaw.add(body);

  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.18, 12);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });

  for (const px of [-0.75, 0.75]) {
    for (const pz of [-0.75, 0.75]) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(px, 0.35, pz);
      wheel.castShadow = true;
      rickshaw.add(wheel);
    }
  }

  rickshaw.position.set(x, 0, z);
  rickshaw.rotation.y = rotation;
  scene.add(rickshaw);
}

createAutoRickshaw(-40, 120, Math.PI / 2);
createAutoRickshaw(40, -140, -Math.PI / 2);

const car = new THREE.Group();
scene.add(car);

const bodyMaterial = new THREE.MeshStandardMaterial({
  color: 0x9d1717,
  metalness: 0.42,
  roughness: 0.32
});

const body = new THREE.Mesh(
  new THREE.BoxGeometry(2.1, 0.72, 4.3),
  bodyMaterial
);
body.position.y = 0.9;
body.castShadow = true;
car.add(body);

const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.7, 0.8, 2.15),
  new THREE.MeshStandardMaterial({
    color: 0x273a43,
    metalness: 0.25,
    roughness: 0.26
  })
);
cabin.position.set(0, 1.6, -0.2);
cabin.castShadow = true;
car.add(cabin);

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
car.add(windshield);

const wheelGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.25, 16);
const wheelMaterial = new THREE.MeshStandardMaterial({
  color: 0x1b1b1b,
  roughness: 0.9
});
const wheels = [];

for (const x of [-1.08, 1.08]) {
  for (const z of [-1.35, 1.35]) {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.5, z);
    wheel.castShadow = true;
    car.add(wheel);
    wheels.push(wheel);
  }
}

function addLight(x, z, color) {
  const lightMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.18, 0.08),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.7
    })
  );
  lightMesh.position.set(x, 0.98, z);
  car.add(lightMesh);
}

addLight(-0.68, 2.17, 0xfff0c0);
addLight(0.68, 2.17, 0xfff0c0);
addLight(-0.68, -2.17, 0xff1d16);
addLight(0.68, -2.17, 0xff1d16);

const human = new THREE.Group();
human.visible = false;
scene.add(human);

const skin = new THREE.Mesh(
  new THREE.SphereGeometry(0.28, 18, 18),
  new THREE.MeshStandardMaterial({ color: 0xe8c1a0, roughness: 0.9 })
);
skin.position.y = 2.2;
skin.castShadow = true;
human.add(skin);

const hair = new THREE.Mesh(
  new THREE.SphereGeometry(0.31, 16, 12),
  new THREE.MeshStandardMaterial({ color: 0x1f120d, roughness: 1 })
);
hair.position.set(0, 2.46, -0.04);
hair.scale.set(1, 0.7, 1);
hair.castShadow = true;
human.add(hair);

const shirtMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a8c, roughness: 0.7 });
const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xe7c7a6, roughness: 0.9 });

const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.05, 0.35), shirtMaterial);
torso.position.y = 1.35;
torso.castShadow = true;
human.add(torso);

const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.85, 4, 8), skinMaterial);
leftArm.position.set(-0.5, 1.45, 0);
leftArm.rotation.z = 0.35;
leftArm.castShadow = true;
human.add(leftArm);

const rightArm = leftArm.clone();
rightArm.position.x = 0.5;
rightArm.rotation.z = -0.35;
human.add(rightArm);

const leftLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.95, 4, 8), skinMaterial);
leftLeg.position.set(-0.18, 0.52, 0);
leftLeg.castShadow = true;
human.add(leftLeg);

const rightLeg = leftLeg.clone();
rightLeg.position.x = 0.18;
human.add(rightLeg);

const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.42), shirtMaterial);
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
  cameraHeight = THREE.MathUtils.clamp(cameraHeight + dy * 0.025, 1.6, 12);

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
    const offset = new THREE.Vector3(
      Math.sin(car.rotation.y) * 2.8,
      0,
      Math.cos(car.rotation.y) * 2.8
    );
    human.position.copy(car.position).add(offset);
    human.position.y = 0;
    human.rotation.y = car.rotation.y + Math.PI;
    human.visible = true;
    velocity = 0;
    message.textContent = 'You are walking through the city';
  } else {
    mode = 'car';
    human.visible = false;
    const offset = new THREE.Vector3(
      -Math.sin(human.rotation.y) * 2.8,
      0,
      -Math.cos(human.rotation.y) * 2.8
    );
    car.position.copy(human.position).add(offset);
    car.rotation.y = human.rotation.y + Math.PI;
    velocity = 0;
    message.textContent = 'Back in the car';
  }
});

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);

  if (mode === 'car') {
    if (input.gas) velocity += 12 * dt;
    if (input.brake) velocity -= 20 * dt;

    velocity *= Math.pow(0.985, dt * 60);
    velocity = THREE.MathUtils.clamp(velocity, -12, 35);

    const steeringInput = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    steering += (steeringInput - steering) * Math.min(1, dt * 5);

    if (Math.abs(velocity) > 0.2) {
      car.rotation.y += steering * velocity * 0.018 * dt;
    }

    car.position.x += Math.sin(car.rotation.y) * velocity * dt;
    car.position.z += Math.cos(car.rotation.y) * velocity * dt;
    clampToWorld(car);

    wheels.forEach(wheel => {
      wheel.rotation.x += velocity * dt * 0.8;
    });

    human.visible = false;
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

    human.visible = true;
  }

  const target = mode === 'car' ? car.position.clone() : human.position.clone();
  target.y += mode === 'car' ? 1.4 : 1.15;

  const cameraOffset = new THREE.Vector3(
    Math.sin(cameraAngle) * cameraDistance,
    cameraHeight,
    Math.cos(cameraAngle) * cameraDistance
  );

  const lookYaw = mode === 'car' ? car.rotation.y : human.rotation.y;
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
