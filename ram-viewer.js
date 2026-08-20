export async function startRamViewer() {
  const canvas = document.querySelector('#ram-canvas');
  const status = document.querySelector('[data-viewer-status]');
  const resetButton = document.querySelector('[data-reset-view]');
  if (!canvas) return;

  const [THREE, { OrbitControls }] = await Promise.all([
    import('three'),
    import('./vendor/three/OrbitControls.js')
  ]);

  canvas.hidden = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(5.1, 2.3, 6.1);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  controls.autoRotateSpeed = 0.45;
  controls.minDistance = 4.1;
  controls.maxDistance = 8.7;
  controls.target.set(0, 0.75, 0);

  const ram = new THREE.Group();
  scene.add(ram);

  const wool = new THREE.MeshStandardMaterial({ color: 0xf1efe3, roughness: 0.88 });
  const woolShade = new THREE.MeshStandardMaterial({ color: 0xd7d7ca, roughness: 0.92 });
  const face = new THREE.MeshStandardMaterial({ color: 0xe4dfcf, roughness: 0.84 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x242724, roughness: 0.85 });
  const horn = new THREE.MeshStandardMaterial({ color: 0xc6b58d, roughness: 0.72 });

  function add(geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(...position);
    item.scale.set(...scale);
    item.rotation.set(...rotation);
    ram.add(item);
    return item;
  }

  add(new THREE.SphereGeometry(1.24, 28, 20), wool, [0, 1.18, 0], [1.75, .9, .82]);
  add(new THREE.SphereGeometry(.82, 24, 16), woolShade, [-1.18, 1.18, 0], [.86, .76, .72]);
  add(new THREE.SphereGeometry(.64, 24, 16), face, [1.82, 1.36, 0], [.86, .66, .56]);
  add(new THREE.ConeGeometry(.28, .6, 16), face, [2.38, 1.28, 0], [1, .75, .75], [0, 0, -Math.PI / 2]);

  const ear = new THREE.ConeGeometry(.16, .5, 12);
  add(ear, face, [1.7, 1.76, .48], [1, .8, 1], [.9, .2, .7]);
  add(ear, face, [1.7, 1.76, -.48], [1, .8, 1], [-.9, -.2, .7]);

  const eye = new THREE.SphereGeometry(.045, 10, 7);
  add(eye, dark, [2.26, 1.5, .29]);
  add(eye, dark, [2.26, 1.5, -.29]);

  const hornGeometry = new THREE.TorusGeometry(.34, .065, 10, 28, Math.PI * 1.45);
  add(hornGeometry, horn, [1.58, 1.62, .42], [1, 1, 1], [1.18, .2, .15]);
  add(hornGeometry, horn, [1.58, 1.62, -.42], [1, 1, 1], [-1.18, -.2, .15]);

  const leg = new THREE.CylinderGeometry(.115, .13, 1.35, 12);
  [[-.95,.4,.43],[-.95,.4,-.43],[.92,.4,.43],[.92,.4,-.43]].forEach((position) => add(leg, face, position));

  const hoof = new THREE.BoxGeometry(.32, .13, .22);
  [[-.95,-.28,.43],[-.95,-.28,-.43],[.92,-.28,.43],[.92,-.28,-.43]].forEach((position) => add(hoof, dark, position));

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(3.4, 48),
    new THREE.MeshStandardMaterial({ color: 0x44643a, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -.36;
  scene.add(ground);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x243620, 2.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(4, 6, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9cc68e, .75);
  fill.position.set(-4, 2, -3);
  scene.add(fill);

  const initialCamera = camera.position.clone();
  const initialTarget = controls.target.clone();

  resetButton?.addEventListener('click', () => {
    camera.position.copy(initialCamera);
    controls.target.copy(initialTarget);
    controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.update();
  });
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const scale = Math.min(window.devicePixelRatio || 1, 1.6);
    if (canvas.width !== Math.round(width * scale) || canvas.height !== Math.round(height * scale)) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }
  };

  let running = true;
  const observer = new IntersectionObserver(([entry]) => { running = entry.isIntersecting; }, { threshold: .01 });
  observer.observe(canvas);

  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;
    resize();
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  if (status) status.textContent = 'Live 3D preview · drag to rotate';
}
