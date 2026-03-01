import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import * as GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.21';
import * as INST from '../src/instancer.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 8000);
camera.up.set(0, 0, 1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x2f8fff);
scene.add(new THREE.AmbientLight(0xffffff, 0.1));
{
	var sun = new THREE.DirectionalLight(0xffffcf, 1);
	sun.position.set(10, 0, 10);
	sun.target.position.set(0, 0, 0);
	scene.add(sun);
}

const MAX_MAP_SIZE = 600;
var mapCfg = {
	size: 200,
	tileSize: 10,
	frequency1: 0.02,
	amplitude1: 40,
	frequency2: 0.18,
	amplitude2: 1.84
};

const loader = new GLTFLoader();
let model = await loader.loadAsync('../models/nature_kit/cliff_block_stone.glb');
var meshes = model.scene.children[0].children;
var instMeshes = INST.build(meshes, MAX_MAP_SIZE * MAX_MAP_SIZE);
instMeshes.forEach(function (el) {
	scene.add(el);
});

var noise1 = new SimplexNoise();
var heightMap = Array.from(Array(mapCfg.size), () => new Array(mapCfg.size));

// mapCfg.update = function () {
// 	for (var x = 0; x < mapCfg.size; x++) {
// 		for (var y = 0; y < mapCfg.size; y++) {
// 			heightMap[x][y] = noise1.noise(x * mapCfg.frequency1, y * mapCfg.frequency1) * mapCfg.amplitude1;
// 		}
// 	}
// }
// mapCfg.update();

const dummy = new THREE.Object3D(); // use this to build the tx matrix for each instance
var tileMap = Array.from(Array(mapCfg.size), () => new Array(mapCfg.size));
for (var x = 0; x < mapCfg.size; x++) {
	for (var y = 0; y < mapCfg.size; y++) {
		dummy.position.set(x * mapCfg.tileSize, y * mapCfg.tileSize, heightMap[x][y]);
		dummy.scale.set(mapCfg.tileSize, mapCfg.tileSize, mapCfg.tileSize);
		dummy.updateMatrix();
		instMeshes.forEach(function (el) {
			el.setMatrixAt(y * mapCfg.size + x, dummy.matrix);
		});
	}
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.object.position.set(-10, -10, 200);
controls.target.set(mapCfg.size * mapCfg.tileSize / 2, mapCfg.size * mapCfg.tileSize / 2, 0);
controls.update();

const frqLimit = 0.4;
const ampLimit = 100;
const gui = new lil.GUI({ width: 600 });
gui.add(mapCfg, 'size', 1, MAX_MAP_SIZE, 1);
gui.add(mapCfg, 'tileSize', 0.1, 10);
gui.add(mapCfg, 'frequency1', -frqLimit, frqLimit);
gui.add(mapCfg, 'amplitude1', -ampLimit, ampLimit);
gui.add(mapCfg, 'frequency2', -frqLimit, frqLimit);
gui.add(mapCfg, 'amplitude2', -ampLimit, ampLimit);
//gui.add(mapCfg, 'update');
// mapCfg.update();

function animate(time) {
	for (var x = 0; x < mapCfg.size; x++) {
		for (var y = 0; y < mapCfg.size; y++) {
			let h1 = noise1.noise(x * mapCfg.frequency1, y * mapCfg.frequency1) * mapCfg.amplitude1;
			let h2 = noise1.noise(x * mapCfg.frequency2, y * mapCfg.frequency2) * mapCfg.amplitude2;
			dummy.position.set(x * mapCfg.tileSize, y * mapCfg.tileSize, h1 + h2);
			dummy.scale.set(mapCfg.tileSize, mapCfg.tileSize, mapCfg.tileSize);
			dummy.updateMatrix();
			instMeshes.forEach(function (el) {
				el.setMatrixAt(y * mapCfg.size + x, dummy.matrix);
			});
		}
	}
	instMeshes.forEach(function (el) {
		el.instanceMatrix.needsUpdate = true;
		el.count = mapCfg.size * mapCfg.size;
	});

	controls.target.set(mapCfg.size * mapCfg.tileSize / 2, mapCfg.size * mapCfg.tileSize / 2, 0);
	controls.update();
	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);