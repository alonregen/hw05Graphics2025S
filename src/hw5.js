import {OrbitControls} from './OrbitControls.js'

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 30);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Court setup
const courtGeometry = new THREE.PlaneGeometry(30, 15);
const courtMaterial = new THREE.MeshBasicMaterial({ 
  color: 0xC19A6B,
  side: THREE.DoubleSide
});
const court = new THREE.Mesh(courtGeometry, courtMaterial);
court.rotation.x = -Math.PI / 2;
court.position.y = 0;
scene.add(court);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
mainLight.position.set(10, 10, 10);
mainLight.castShadow = true;
scene.add(mainLight);

// Court markings
const linesMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

// Boundary lines
const boundaryGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(30, 15));
const boundaryLines = new THREE.LineSegments(
  boundaryGeometry,
  new THREE.LineBasicMaterial({ color: 0xFFFFFF })
);
boundaryLines.rotation.x = -Math.PI / 2;
boundaryLines.position.y = 0.01;
scene.add(boundaryLines);

// Center circle
const curve = new THREE.EllipseCurve(
  0, 0,                // Center
  2.4, 2.4,           // Radius
  0, Math.PI * 2,     // Full circle
  false               // Clockwise
);

const points = curve.getPoints(50);
const points3D = points.map(point => new THREE.Vector3(point.x, 0.01, point.y));
const centerCircleGeometry = new THREE.BufferGeometry().setFromPoints(points3D);
const centerCircle = new THREE.Line(centerCircleGeometry, linesMaterial);
scene.add(centerCircle);

// Center line
const centerLine = new THREE.Mesh(
  new THREE.PlaneGeometry(0.1, 15),
  linesMaterial
);
centerLine.rotation.x = -Math.PI / 2;
centerLine.position.y = 0.01;
scene.add(centerLine);

// Three-point lines
function createThreePointLine(side) {
  const startAngle = side === 1 ? Math.PI/2 : 3*Math.PI/2;
  const endAngle = side === 1 ? 3*Math.PI/2 : 5*Math.PI/2;
  
  const curve = new THREE.EllipseCurve(
    0, 0,                     // Center
    6.75, 6.75,               // Radius
    startAngle, endAngle,     // Angles
    false,                     // Clockwise
    0                         // Rotation
  );
  
  const points = curve.getPoints(50);
  const points3D = points.map(point => {
    if (side === 1) {
      return new THREE.Vector3(point.x, 0.01, -point.y);
    } else {
      return new THREE.Vector3(point.x, 0.01, point.y);
    }
  });
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points3D);
  const material = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
  const threePointLine = new THREE.Line(geometry, material);
  
  const straightLineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.01, -7.5),
    new THREE.Vector3(0, 0.01, 7.5)
  ]);
  const straightLine = new THREE.Line(straightLineGeometry, material);
  
  const threePointGroup = new THREE.Group();
  threePointGroup.add(threePointLine);
  threePointGroup.add(straightLine);
  threePointGroup.position.x = side * 15;
  
  scene.add(threePointGroup);
}

createThreePointLine(-1);
createThreePointLine(1);

// Key areas (free throw boxes)
function createKeyArea(side) {
  const keyGeometry = new THREE.PlaneGeometry(4, 5.8);
  const keyMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
  const keyLines = new THREE.LineSegments(
    new THREE.EdgesGeometry(keyGeometry),
    keyMaterial
  );
  keyLines.rotation.x = -Math.PI / 2;
  keyLines.position.set(side * 13, 0.01, 0);
  scene.add(keyLines);
}

createKeyArea(-1);
createKeyArea(1);

// Basketball creation
function createBasketball() {
  const BALL_RADIUS = 0.2;
  const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
  const ballMaterial = new THREE.MeshPhongMaterial({
    color: 0xD85C17,
    roughness: 0.8,
    metalness: 0.1
  });
  const ball = new THREE.Mesh(ballGeometry, ballMaterial);
  
  const seams = new THREE.Group();
  
  function addSeam(rotationY) {
    const curve = new THREE.EllipseCurve(
      0, 0,
      BALL_RADIUS, BALL_RADIUS,
      0, Math.PI * 2,
      false
    );
    
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const seam = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );
    
    seam.rotation.y = rotationY;
    seams.add(seam);
  }
  
  addSeam(0);
  addSeam(Math.PI / 2);
  addSeam(Math.PI / 4);
  addSeam(-Math.PI / 4);
  
  ball.add(seams);
  ball.position.set(0, BALL_RADIUS + 0.01, 0);
  scene.add(ball);
  
  return ball;
}

const basketball = createBasketball();

// Basketball hoop creation
function createBasketballHoop(side) {
  const hoopGroup = new THREE.Group();
  
  const RIM_HEIGHT = 6;
  const BACKBOARD_HEIGHT = RIM_HEIGHT + 0.5;
  
  // Backboard
  const backboardGeometry = new THREE.BoxGeometry(2.2, 1.3, 0.05);
  const backboardMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
  backboard.position.set(0, BACKBOARD_HEIGHT, 0);
  hoopGroup.add(backboard);
  
  // Rim
  const rimGeometry = new THREE.TorusGeometry(0.45, 0.02, 16, 32);
  const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xff8c00 });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, RIM_HEIGHT, -0.45);
  hoopGroup.add(rim);
  
  // Net
  const netMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const netSegments = 12;
  const netLength = 0.5;
  
  for (let i = 0; i < netSegments; i++) {
    const angle = (i / netSegments) * Math.PI * 2;
    const x = Math.cos(angle) * 0.45;
    const z = Math.sin(angle) * 0.45;
    
    const netGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, RIM_HEIGHT, z - 0.45),
      new THREE.Vector3(x * 0.3, RIM_HEIGHT - netLength, z * 0.3 - 0.45)
    ]);
    const netLine = new THREE.Line(netGeometry, netMaterial);
    hoopGroup.add(netLine);
  }
  
  // Support structure
  const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
  
  const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, BACKBOARD_HEIGHT * 1.2, 8);
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(0, BACKBOARD_HEIGHT * 0.6, 1);
  hoopGroup.add(pole);
  
  const armGeometry = new THREE.BoxGeometry(0.1, 0.1, 1);
  const arm1 = new THREE.Mesh(armGeometry, poleMaterial);
  arm1.position.set(0, BACKBOARD_HEIGHT, 0.5);
  hoopGroup.add(arm1);
  
  const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.2), poleMaterial);
  arm2.position.set(0, BACKBOARD_HEIGHT - 0.5, 0.5);
  arm2.rotation.x = -Math.PI / 6;
  hoopGroup.add(arm2);
  
  hoopGroup.position.set(side * 14.4, 0, 0);
  hoopGroup.rotation.y = side * Math.PI / 2;
  
  scene.add(hoopGroup);
}

createBasketballHoop(-1);
createBasketballHoop(1);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 5;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI * 0.5;

// Camera presets
const cameraPresets = {
  default: { position: new THREE.Vector3(0, 20, 30), target: new THREE.Vector3(0, 0, 0) },
  side: { position: new THREE.Vector3(30, 15, 0), target: new THREE.Vector3(0, 0, 0) },
  corner: { position: new THREE.Vector3(25, 15, 25), target: new THREE.Vector3(0, 0, 0) },
  hoop: { position: new THREE.Vector3(12, 12, 0), target: new THREE.Vector3(14.4, 10, 0) }
};

// Function to smoothly transition camera
function setCameraPreset(presetName, duration = 1000) {
  const preset = cameraPresets[presetName];
  if (!preset) return;
  
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = Date.now();
  
  function updateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Smooth easing
    const t = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
    
    camera.position.lerpVectors(startPos, preset.position, t);
    controls.target.lerpVectors(startTarget, preset.target, t);
    controls.update();
    
    if (progress < 1) {
      requestAnimationFrame(updateCamera);
    }
  }
  
  updateCamera();
}

// Handle keyboard controls
let orbitEnabled = true;
document.addEventListener('keydown', (event) => {
  switch(event.key.toLowerCase()) {
    case 'o':
      orbitEnabled = !orbitEnabled;
      controls.enabled = orbitEnabled;
      break;
    case '1':
      setCameraPreset('default');
      break;
    case '2':
      setCameraPreset('side');
      break;
    case '3':
      setCameraPreset('corner');
      break;
    case '4':
      setCameraPreset('hoop');
      break;
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();