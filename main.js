import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('canvas-container');
const playBtn = document.getElementById('playAnimations');
const loaderElem = document.getElementById('loader');
const progressBar = document.getElementById('progressBar');
const loadingText = document.getElementById('loadingText');

let scene, camera, renderer, mixer, model, controls;
let clock = new THREE.Clock();

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.5, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x222222);
  container.appendChild(renderer.domElement);

  // Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0); // Guarda al centro del modello
  controls.update();

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  mixer = null;

  const loader = new GLTFLoader();

  loader.load(
    'animazione_web.glb',

    (gltf) => {
      model = gltf.scene;

      // Centra il modello se è troppo alto
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.y -= center.y; // Sposta al centro Y

      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);

        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.loop = THREE.LoopOnce;
          action.clampWhenFinished = true;
          action.enabled = false;
          action.paused = true;
          clip.userData.action = action;
        });

        playBtn.style.display = 'block';
      }

      loaderElem.style.display = 'none';
      loadingText.style.display = 'none';
    },

    // PROGRESS
    (xhr) => {
      if (xhr.lengthComputable) {
        const percent = Math.min((xhr.loaded / xhr.total) * 100, 100); // 🟢 Limita al 100%
        progressBar.style.width = percent + '%';
        loadingText.textContent = `Caricamento modello... ${Math.floor(percent)}%`;
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
  controls.update();
  renderer.render(scene, camera);
}

playBtn.addEventListener('click', () => {
  if (!mixer || !model) return;

  mixer.stopAllAction();

  mixer._actions.forEach(action => {
    action.reset();
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.play();
  });

  playBtn.style.display = 'none';
});
