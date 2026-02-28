import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.up.set(0, 0, 1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.object.position.set(0, 20, 10);
controls.target.set(0, 0, 0);
controls.update();

scene.background = new THREE.Color(0x2f8fff);
scene.add(new THREE.AmbientLight(0xffffff, 5));
{
	var sun = new THREE.DirectionalLight(0xffffaf, 1);
	sun.position.set(10, 0, 10);
	sun.target.position.set(0, 0, 0);
	scene.add(sun);
}

const loader = new GLTFLoader();
let model = await loader.loadAsync('models/nature_kit/cliff_block_stone.glb');
for (var x = -10; x < 10; x++)
{
	for (var y = -10; y < 10; y++)
	{
		let m = model.scene.clone();
		m.position.set(x, y, 0);
		scene.add(m);
	}
}

function animate(time) {
	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);