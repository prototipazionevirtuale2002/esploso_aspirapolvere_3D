import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('canvas-container');
const playBtn = document.getElementById('playAnimations');
const loaderElem = document.getElementById('loader');
const progressBar = document.getElementById('progressBar');
const loadingText = document.getElementById('loadingText');

let scene, camera, renderer, mixer, model;
let clock = new THREE.Clock();
let actions = [];

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x222222);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  const loader = new GLTFLoader();

  loader.load(
    'animazione_web.glb',

    (gltf) => {
      model = gltf.scene;
      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        actions = [];

        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.loop = THREE.LoopOnce;
          action.clampWhenFinished = true;
          actions.push(action);
        });

        playBtn.style.display = 'block';
      }

      loaderElem.style.display = 'none';
      loadingText.style.display = 'none';
    },

    (xhr) => {
      if (xhr.lengthComputable) {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        progressBar.style.width = percentComplete + '%';
        loadingText.textContent = `Caricamento modello... ${Math.floor(percentComplete)}%`;
      }
    },

    (error) => {
      console.error('Errore caricamento modello:', error);
      loadingText.textContent = 'Errore caricamento modello.';
    }
  );

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  renderer.render(scene, camera);
}

playBtn.addEventListener('click', () => {
  if (!mixer || !actions.length) return;

  actions.forEach((action) => {
    action.reset();
    action.play();
  });
});
