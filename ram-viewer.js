const canvas = document.querySelector("#ram-canvas");
const status = document.querySelector("[data-viewer-status]");
const resetButton = document.querySelector("[data-reset-view]");

async function startRamViewer() {
  if (!canvas) {
    return;
  }

  let THREE;
  let OrbitControls;

  try {
    const modules = await Promise.all([
      import("three"),
      import("./vendor/three/OrbitControls.js"),
    ]);
    THREE = modules[0];
    OrbitControls = modules[1].OrbitControls;
  } catch (error) {
    if (status) {
      status.textContent = "3D preview needs an internet connection";
    }
    console.warn(error);
    return;
  }

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(5.2, 2.4, 6.2);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.55;
  controls.minDistance = 4;
  controls.maxDistance = 9;
  controls.target.set(0, 0.75, 0);

  const ram = new THREE.Group();
  scene.add(ram);

  const wool = new THREE.MeshStandardMaterial({
    color: 0xf1f1e8,
    roughness: 0.82,
    metalness: 0.02,
  });
  const shadowWool = new THREE.MeshStandardMaterial({
    color: 0xd7d8cf,
    roughness: 0.9,
  });
  const face = new THREE.MeshStandardMaterial({
    color: 0xe2ded0,
    roughness: 0.78,
  });
  const hoof = new THREE.MeshStandardMaterial({
    color: 0x262626,
    roughness: 0.72,
  });
  const horn = new THREE.MeshStandardMaterial({
    color: 0xc8b893,
    roughness: 0.66,
  });

  function mesh(geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(...position);
    item.scale.set(...scale);
    item.rotation.set(...rotation);
    item.castShadow = true;
    item.receiveShadow = true;
    ram.add(item);
    return item;
  }

  mesh(new THREE.SphereGeometry(1.24, 40, 28), wool, [0, 1.18, 0], [1.75, 0.9, 0.82]);
  mesh(new THREE.SphereGeometry(0.82, 32, 22), shadowWool, [-1.18, 1.18, 0], [0.86, 0.76, 0.72]);
  mesh(new THREE.SphereGeometry(0.64, 32, 22), face, [1.82, 1.36, 0], [0.86, 0.66, 0.56]);
  mesh(new THREE.ConeGeometry(0.28, 0.6, 22), face, [2.38, 1.28, 0], [1, 0.75, 0.75], [0, 0, -Math.PI / 2]);

  const earGeometry = new THREE.ConeGeometry(0.16, 0.5, 18);
  mesh(earGeometry, face, [1.7, 1.76, 0.48], [1, 0.8, 1], [0.9, 0.2, 0.7]);
  mesh(earGeometry, face, [1.7, 1.76, -0.48], [1, 0.8, 1], [-0.9, -0.2, 0.7]);

  const eyeGeometry = new THREE.SphereGeometry(0.045, 12, 8);
  mesh(eyeGeometry, hoof, [2.26, 1.5, 0.29]);
  mesh(eyeGeometry, hoof, [2.26, 1.5, -0.29]);

  const hornGeometry = new THREE.TorusGeometry(0.34, 0.065, 14, 38, Math.PI * 1.45);
  mesh(hornGeometry, horn, [1.58, 1.62, 0.42], [1, 1, 1], [1.18, 0.2, 0.15]);
  mesh(hornGeometry, horn, [1.58, 1.62, -0.42], [1, 1, 1], [-1.18, -0.2, 0.15]);

  const legGeometry = new THREE.CylinderGeometry(0.115, 0.13, 1.35, 16);
  [[-0.95, 0.4, 0.43], [-0.95, 0.4, -0.43], [0.92, 0.4, 0.43], [0.92, 0.4, -0.43]].forEach((position) => {
    mesh(legGeometry, face, position);
  });

  const hoofGeometry = new THREE.BoxGeometry(0.32, 0.13, 0.22);
  [[-0.95, -0.28, 0.43], [-0.95, -0.28, -0.43], [0.92, -0.28, 0.43], [0.92, -0.28, -0.43]].forEach((position) => {
    mesh(hoofGeometry, hoof, position);
  });

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(3.5, 80),
    new THREE.MeshStandardMaterial({ color: 0x4e6f3d, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.36;
  ground.receiveShadow = true;
  scene.add(ground);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x23341f, 2.4);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.7);
  keyLight.position.set(4, 6, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xa8d29a, 0.8);
  fillLight.position.set(-4, 2, -3);
  scene.add(fillLight);

  const initialCamera = camera.position.clone();
  const initialTarget = controls.target.clone();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function animate() {
    resize();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  resetButton?.addEventListener("click", () => {
    camera.position.copy(initialCamera);
    controls.target.copy(initialTarget);
    controls.autoRotate = true;
    controls.update();
  });

  controls.addEventListener("start", () => {
    controls.autoRotate = false;
  });

  resize();
  animate();

  if (status) {
    status.textContent = "Live 3D preview";
  }
}

startRamViewer();
