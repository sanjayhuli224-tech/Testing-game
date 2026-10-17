import * as THREE from 'three';

const loading = document.getElementById('loading');
const speedDisplay = document.getElementById('speed');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91c8ed);
scene.fog = new THREE.Fog(0x91c8ed, 100, 500);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

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

scene.add(new THREE.HemisphereLight(0xd7edff, 0x59634b, 2));

const sunlight = new THREE.DirectionalLight(0xffedcf, 3);
sunlight.position.set(-50, 100, 40);
sunlight.castShadow = true;
scene.add(sunlight);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000),
  new THREE.MeshStandardMaterial({ color: 0x667c48 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.12;
ground.receiveShadow = true;
scene.add(ground);

// Roads
const roadMaterial = new THREE.MeshStandardMaterial({
  color: 0x35393c,
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

  const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0xe7dfb7
  });

  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(0.15, length),
    lineMaterial
  );

  line.rotation.x = -Math.PI / 2;
  line.rotation.z = rotation;
  line.position.set(x, 0.015, z);
  scene.add(line);
}

makeRoad(0, 0, 15, 1200);
makeRoad(0, 0, 1200, 15, Math.PI / 2);

// Buildings
function createBuilding(x, z, width, height, depth, color) {
  const building = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85
    })
  );

  building.position.set(x, height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);

  // Simple windows
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x9ac4d8,
    roughness: 0.25,
    metalness: 0.1
  });

  for (let floor = 1; floor < height / 3; floor++) {
    for (let col = 0; col < Math.max(1, Math.floor(width / 3)); col++) {
      const windowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, 1.1),
        windowMaterial
      );

      windowMesh.position.set(
        x - width / 2 + 1.5 + col * 3,
        floor * 3,
        z - depth / 2 - 0.02
      );

      scene.add(windowMesh);
    }
  }
}

const buildingColors = [
  0xc4ad91,
  0xb9b4a5,
  0xd3c7a6,
  0x989d9f,
  0xb8a28b
];

for (let i = -8; i <= 8; i++) {
  if (Math.abs(i) < 2) continue;

  const offset = i * 22;

  createBuilding(
    -25,
    offset,
    12,
    10 + Math.random() * 20,
    15,
    buildingColors[Math.floor(Math.random() * buildingColors.length)]
  );

  createBuilding(
    27,
    offset + 10,
    14,
    12 + Math.random() * 24,
    16,
    buildingColors[Math.floor(Math.random() * buildingColors.length)]
  );
}

// Trees
function createTree(x, z, scale = 1) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.4, 2.5, 7),
    new THREE.MeshStandardMaterial({ color: 0x63452c })
  );

  trunk.position.set(x, 1.25 * scale, z);
  trunk.scale.setScalar(scale);
  trunk.castShadow = true;
  scene.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 8, 7),
    new THREE.MeshStandardMaterial({ color: 0x3e713d })
  );

  leaves.position.set(x, 3.5 * scale, z);
  leaves.scale.set(1, 1.2, 1);
  leaves.castShadow = true;
  scene.add(leaves);
}

for (let i = 0; i < 100; i++) {
  const z = (Math.random() - 0.5) * 700;
  const side = Math.random() < 0.5 ? -1 : 1;
  createTree(
    side * (18 + Math.random() * 70),
    z,
    0.7 + Math.random() * 0.8
  );
}

// Car
const car = new THREE.Group();
scene.add(car);

const bodyMaterial = new THREE.MeshStandardMaterial({
  color: 0x9d1717,
  metalness: 0.45,
  roughness: 0.32
});

const body = new THREE.Mesh(
  new THREE.BoxGeometry(2.1, 0.65, 4.3),
  bodyMaterial
);
body.position.y = 0.9;
body.castShadow = true;
car.add(body);

const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.65, 0.75, 2.15),
  new THREE.MeshStandardMaterial({
    color: 0x263943,
    metalness: 0.25,
    roughness: 0.25
  })
);
cabin.position.set(0, 1.55, -0.15);
cabin.castShadow = true;
car.add(cabin);

const wheelGeometry = new THREE.CylinderGeometry(0.42, 0.42, 0.28, 16);
const wheelMaterial = new THREE.MeshStandardMaterial({
  color: 0x191919,
  roughness: 0.9
});

const wheels = [];

for (const x of [-1.08, 1.08]) {
  for (const z of [-1.35, 1.35]) {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.48, z);
    wheel.castShadow = true;
    car.add(wheel);
    wheels.push(wheel);
  }
}

// Headlights and rear lights
function addLight(x, z, color) {
  const lightMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.18, 0.08),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5
    })
  );

  lightMesh.position.set(x, 0.98, z);
  car.add(lightMesh);
}

addLight(-0.68, 2.17, 0xfff0c0);
addLight(0.68, 2.17, 0xfff0c0);
addLight(-0.68, -2.17, 0xff1d16);
addLight(0.68, -2.17, 0xff1d16);

// Controls
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

// Camera orbit
let cameraAngle = 0;
let cameraHeight = 5;
let cameraDistance = 10;
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
  cameraHeight = THREE.MathUtils.clamp(
    cameraHeight + dy * 0.025,
    1.5,
    12
  );

  lastTouchX = event.clientX;
  lastTouchY = event.clientY;
});

function stopDragging() {
  dragging = false;
}

renderer.domElement.addEventListener('pointerup', stopDragging);
renderer.domElement.addEventListener('pointercancel', stopDragging);
renderer.domElement.addEventListener('lostpointercapture', stopDragging);

// Driving
let velocity = 0;
let steering = 0;

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);

  if (input.gas) velocity += 12 * dt;
  if (input.brake) velocity -= 20 * dt;

  velocity *= Math.pow(0.985, dt * 60);
  velocity = THREE.MathUtils.clamp(velocity, -12, 35);

  const steeringInput =
    (input.left ? 1 : 0) - (input.right ? 1 : 0);

  steering += (steeringInput - steering) * Math.min(1, dt * 5);

  if (Math.abs(velocity) > 0.2) {
    car.rotation.y += steering * velocity * 0.018 * dt;
  }

  car.position.x += Math.sin(car.rotation.y) * velocity * dt;
  car.position.z += Math.cos(car.rotation.y) * velocity * dt;

  wheels.forEach(wheel => {
    wheel.rotation.x += velocity * dt * 0.8;
  });

  const target = car.position.clone();
  target.y += 1.2;

  const cameraPosition = new THREE.Vector3(
    Math.sin(cameraAngle) * cameraDistance,
    cameraHeight,
    Math.cos(cameraAngle) * cameraDistance
  );

  cameraPosition.applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    car.rotation.y
  );

  camera.position.lerp(
    target.clone().add(cameraPosition),
    1 - Math.pow(0.001, dt)
  );

  camera.lookAt(target);

  speedDisplay.textContent =
    `${Math.round(Math.abs(velocity) * 3.6)} km/h`;

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

loading.style.display = 'none';
animate();
