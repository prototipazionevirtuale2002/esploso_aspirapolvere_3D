import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('canvas-container');
const playBtn = document.getElementById('playAnimations');
const loaderElem = document.getElementById('loader');
const progressBar = document.getElementById('progressBar');
const loadingText = document.getElementById('loadingText');

let scene, camera, renderer, mixer, model;
let clock = new THREE.Clock();

init();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.5, 4);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x222222);
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // GLTF Loader
  const loader = new GLTFLoader();

  loader.load(
    'animazione_web.glb',

    (gltf) => {
      model = gltf.scene;

      // Centrare verticalmente il modello
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.y -= center.y;

      scene.add(model);

      // Animazioni
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

      // Nascondi loader dopo breve delay
      setTimeout(() => {
        loaderElem.style.display = 'none';
        loadingText.style.display = 'none';
      }, 500);
    },

    (xhr) => {
      if (xhr.lengthComputable) {
        const percent = Math.min((xhr.loaded / xhr.total) * 100, 100);
        progressBar.style.width = percent + '%';
        loadingText.textContent = `Caricamento modello... ${Math.floor(percent)}%`;
      }
    },

    (error) => {
      console.error('Errore caricamento modello:', error);
      loadingText.textContent = 'Errore caricamento modello.';
    }
  );

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Pulsante per le animazioni
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
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);
}
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.getElementById('canvas-container');
const playBtn = document.getElementById('playAnimations');
const loaderElem = document.getElementById('loader');
const progressBar = document.getElementById('progressBar');
const loadingText = document.getElementById('loadingText');

let scene, camera, renderer, mixer, model;
let clock = new THREE.Clock();

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.5, 4);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x222222);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const loader = new GLTFLoader();

  loader.load(
    'animazione_web.glb',
    (gltf) => {
      model = gltf.scene;

      // Centrare verticalmente
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.y -= center.y;

      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);

        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.loop = THREE.LoopOnce;
          action.clampWhenFinished = true;
          action.enabled = true;
          action.paused = true;
          clip.userData.action = action;
        });

        playBtn.style.display = 'block';
      }

      loaderElem.style.display = 'none';
      loadingText.style.display = 'none';
    },
    (xhr) => {
      if (xhr.lengthComputable) {
        const percent = Math.min((xhr.loaded / xhr.total) * 100, 100);
        progressBar.style.width = percent + '%';
        loadingText.textContent = `Caricamento modello... ${Math.floor(percent)}%`;
      }
    },
    (error) => {
      console.error('Errore caricamento modello:', error);
      loadingText.textContent = 'Errore caricamento modello.';
    }
  );

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

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);
}
