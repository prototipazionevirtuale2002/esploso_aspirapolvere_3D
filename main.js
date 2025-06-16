import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('canvas-container');
const playBtn = document.getElementById('playAnimations');
const loaderElem = document.getElementById('loader');
const progressBar = document.getElementById('progressBar');
const loadingText = document.getElementById('loadingText');

let scene, camera, renderer, mixer, model, controls;
const clock = new THREE.Clock();

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

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

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
      model.position.set(0, 0, 0);
      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);

        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.loop = THREE.LoopOnce;
          action.clampWhenFinished = true;
          action.enabled = true;
          action.reset();
          clip.userData.action = action;
        });

        playBtn.style.display = 'block';
      }

      loaderElem.style.display = 'none';
    },

    (xhr) => {
      if (xhr.lengthComputable) {
        const percentComplete = Math.min((xhr.loaded / xhr.total) * 100, 100);
        progressBar.style.width = `${percentComplete}%`;
        loadingText.textContent = `Caricamento modello... ${Math.floor(percentComplete)}%`;

        if (percentComplete >= 100) {
          setTimeout(() => {
            loaderElem.style.display = 'none';
            loadingText.style.display = 'none';
          }, 300);
        }
      }
    },

    (error) => {
      console.error('Errore nel caricamento:', error);
      loadingText.textContent = 'Errore nel caricamento del modello.';
    }
  );

  window.addEventListener('resize', onWindowResize);
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
});
