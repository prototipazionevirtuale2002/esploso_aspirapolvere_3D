import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  //renderer.setClearColor(0x222222);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(10, 10, 10);
  scene.add(directionalLight);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const loader = new GLTFLoader();

  loader.load(
    'animazione_web.glb',

    (gltf) => {
      model = gltf.scene;
      scene.add(model);

      // Calcolo bounding box
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      // Centra il modello
      model.position.sub(center); // sposta il modello in modo che il centro sia all'origine

      // Distanza ideale della camera
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));

      cameraZ *= 1.5; // aumenta distanza per margine
      camera.position.set(0, maxDim * 0.5, cameraZ);
      camera.lookAt(0, 0, 0);

      // Aggiorna il target dei controlli
      controls.target.set(0, 0, 0);
      controls.update();

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);

        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.loop = THREE.LoopOnce;
          action.clampWhenFinished = true;
        });

        playBtn.style.display = 'block';
      }

      loaderElem.style.display = 'none';
      loadingText.style.display = 'none';
    },

    (xhr) => {
      if (xhr.lengthComputable) {
        let percentComplete = (xhr.loaded / xhr.total) * 100;
        if (percentComplete > 100) percentComplete = 100;
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
  controls.update();
  renderer.render(scene, camera);
}

playBtn.addEventListener('click', () => {
  if (!mixer || !model) return;
  mixer.stopAllAction();
  mixer._actions.forEach(action => {
    action.reset();
    action.play();
  });
});
