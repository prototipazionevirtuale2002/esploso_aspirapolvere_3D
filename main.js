import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const loader = new GLTFLoader();
const clock = new THREE.Clock();
let mixer;
let actions = [];

const playBtn = document.getElementById('playAnimations');
playBtn.style.display = 'none';

const loaderContainer = document.getElementById('loaderContainer');
const loaderBar = document.getElementById('loaderBar');

loader.load(
  'esploso_web.glb',
  function (gltf) {
    scene.add(gltf.scene);
    mixer = new THREE.AnimationMixer(gltf.scene);
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.stop();
      actions.push(action);
    });
    loaderContainer.style.display = 'none';
    playBtn.style.display = 'block';
  },
  function (xhr) {
    const percent = (xhr.loaded / xhr.total) * 100;
    loaderBar.style.width = percent + '%';
  },
  function (error) {
    console.error('Errore nel caricamento del modello:', error);
  }
);

playBtn.addEventListener('click', () => {
  actions.forEach(action => {
    action.reset();
    action.play();
  });
  playBtn.disabled = true;
});

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  renderer.render(scene, camera);
}
animate();
