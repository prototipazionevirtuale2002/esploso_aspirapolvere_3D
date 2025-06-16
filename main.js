import * as THREE from 'https://cdn.skypack.dev/three@0.150.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.150.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.150.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();
const clock = new THREE.Clock();

const btn = document.getElementById('playAnimations');
const loaderDiv = document.getElementById('loader');
const progressBar = document.getElementById('progressBar');

let mixers = [];

loader.load(
  'animazione_web.glb',
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    if (gltf.animations && gltf.animations.length > 0) {
      gltf.animations.forEach((clip) => {
        const mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(clip);
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
        mixers.push({ mixer, action });
      });

      btn.style.display = 'block';
    }

    loaderDiv.style.display = 'none';
  },
  (xhr) => {
    const percent = (xhr.loaded / xhr.total) * 100;
    progressBar.style.width = `${percent}%`;
  },
  (error) => {
    console.error('Errore nel caricamento:', error);
  }
);

btn.addEventListener('click', () => {
  mixers.forEach(({ action, mixer }) => {
    mixer.stopAllAction();
    action.reset().play();
  });
});

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixers.forEach(({ mixer }) => mixer.update(delta));
  renderer.render(scene, camera);
}

animate();