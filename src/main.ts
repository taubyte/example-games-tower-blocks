import {
  BoxBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGLRenderer;
let mesh: Mesh;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function init() {
  camera = new PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000,
  );
  camera.position.z = 400;

  scene = new Scene();

  var geometry = new BoxBufferGeometry(200, 200, 200);
  var materials = [
    new MeshBasicMaterial({ color: 'red' }),
    new MeshBasicMaterial({ color: 'green' }),
    new MeshBasicMaterial({ color: 'blue' }),
    new MeshBasicMaterial({ color: 'cyan' }),
    new MeshBasicMaterial({ color: 'magenta' }),
    new MeshBasicMaterial({ color: 'yellow' }),
  ];

  mesh = new Mesh(geometry, materials);

  scene.add(mesh);

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);
}

function animate() {
  requestAnimationFrame(animate);

  mesh.rotation.x += 0.005;
  mesh.rotation.y += 0.01;

  renderer.render(scene, camera);
}

init();
animate();
