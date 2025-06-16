import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 1, 3);
controls.update();

const loader = new GLTFLoader();
let mixer;
let actions = [];

const playBtn = document.getElementById('playBtn');
playBtn.style.display = 'none';

loader.load('esploso_web.glb', function(gltf) {
    scene.add(gltf.scene);
    mixer = new THREE.AnimationMixer(gltf.scene);

    gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.stop(); // Ensure it doesn't play automatically
        actions.push(action);
    });

    playBtn.style.display = 'block';
    playBtn.addEventListener('click', () => {
        actions.forEach(action => {
            action.reset();
            action.play();
        });
        playBtn.disabled = true;
    });
}, undefined, function(error) {
    console.error(error);
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}
animate();