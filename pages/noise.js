import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.21';
import * as TILEMAP from '../src/tilemap.js'

const scene = new THREE.Scene();
const stats = new Stats();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 8000);
camera.up.set(0, 0, 1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.appendChild(stats.dom);

scene.background = new THREE.Color(0x2f8fff);
scene.add(new THREE.AmbientLight(0xffffff, 0.1));
{
	var sun = new THREE.DirectionalLight(0xffffcf, 1);
	sun.position.set(10, 0, 10);
	sun.target.position.set(0, 0, 0);
	scene.add(sun);
}

var chunks = [];
let i = 0;
for (let x = -1; x < 2; x++) {
	for (let y = -1; y < 2; y++) {
		chunks[i] = TILEMAP.buildChunk([x, y]);
		chunks[i].update(chunks[i]);
		i++;
	}
}
chunks.forEach(function (chunk) {
	chunk.meshes.forEach(function (el) {
		scene.add(el);
	});
});


const controls = new OrbitControls(camera, renderer.domElement);
controls.object.position.set(-10, -10, 200);
controls.target.set(TILEMAP.mapCfg.chunkSize * TILEMAP.mapCfg.tileSize / 2, TILEMAP.mapCfg.chunkSize * TILEMAP.mapCfg.tileSize / 2, 0);
controls.update();

const frqLimit = 0.1;
const ampLimit = 30;
const gui = new lil.GUI({ width: 600 });
gui.add(TILEMAP.mapCfg, 'chunkSize', 1, TILEMAP.MAX_CHUNK_SIZE, 1).onChange(value => {
	chunks.forEach(function (chunk) {
		chunk.update(chunk);
	});
});
gui.add(TILEMAP.mapCfg, 'tileSize', 0.1, 10).onChange(value => {
	chunks.forEach(function (chunk) {
		chunk.update(chunk);
	});
});
let o1 = gui.addFolder('Octave 1');
o1.add(TILEMAP.mapCfg.octaves[0], 'frq', -frqLimit, frqLimit).onChange(value => {
	chunks.forEach(function (chunk) {
		chunk.update(chunk);
	});
});
o1.add(TILEMAP.mapCfg.octaves[0], 'amp', -ampLimit, ampLimit).onChange(value => {
	chunks.forEach(function (chunk) {
		chunk.update(chunk);
	});
});
let o2 = gui.addFolder('Octave 2');
o2.add(TILEMAP.mapCfg.octaves[1], 'frq', -frqLimit, frqLimit).onChange(value => {
	chunks.forEach(function (chunk) {
		chunk.update(chunk);
	});
});
o2.add(TILEMAP.mapCfg.octaves[1], 'amp', -ampLimit, ampLimit).onChange(value => {
	chunks.forEach(function (chunk) {
		chunk.update(chunk);
	});
});
gui.add(TILEMAP.mapCfg, 'z', -1, 1).onChange(value => {
	chunks.forEach(function (chunk) {
		chunk.update(chunk);
	});
});

function animate(time) {

	// controls.target.set(TILEMAP.mapCfg.chunkSize * TILEMAP.mapCfg.tileSize / 2, TILEMAP.mapCfg.chunkSize * TILEMAP.mapCfg.tileSize / 2, 0);
	// controls.update();
	stats.update();
	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);