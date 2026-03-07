import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import * as GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.21';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.up.set(0, 0, 1);

const NOISE = new ImprovedNoise();

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

const controls = new OrbitControls(camera, renderer.domElement);
controls.object.position.set(-10, -10, 200);
controls.target.set(0, 0, 0);
controls.update();

let mapParms = {
	heightScale: 512,
	separation: 1.5,
	grassColor: [0.2, 0.6, 0.2],
	rockColor: [0.5, 0.5, 0.5],
	octaves: [
		{ frq: 0.01, amp: 1.0, z: 0 },
		{ frq: 0.02, amp: 0.5, z: 0 },
		{ frq: 0.04, amp: 0.25, z: 0 }
	]
}

let positions = [];
let mapSize = 100;
let frequency = 0.1;

var noiseMap = Array.from(Array(mapSize), () => Array.from(Array(mapSize), () => new Array(mapSize)));
var vertMap = Array.from(Array(mapSize), () => Array.from(Array(mapSize), () => new Array(mapSize)));

// find all the noise values
for (let x = 0; x < mapSize; x++) {
	for (let y = 0; y < mapSize; y++) {
		for (let z = 0; z < mapSize; z++) {
			noiseMap[x][y][z] = getNoise(x, y, z - 15);
		}
	}
}

// calculate the vertex position for each cube that needs
for (let x = 1; x < mapSize; x++) {
	for (let y = 1; y < mapSize; y++) {
		for (let z = 1; z < mapSize; z++) {
			let n000 = noiseMap[x][y][z];
			let n001 = noiseMap[x][y][z - 1];
			let n010 = noiseMap[x][y - 1][z];
			let n011 = noiseMap[x][y - 1][z - 1];
			let n100 = noiseMap[x - 1][y][z];
			let n101 = noiseMap[x - 1][y][z - 1];
			let n110 = noiseMap[x - 1][y - 1][z];
			let n111 = noiseMap[x - 1][y - 1][z - 1];

			if (n000 <= 0 && n001 >= 0) {
				// facing up
				positions.push(x - 0.5, y - 0.5, z - 0.5);
				positions.push(x + 0.5, y - 0.5, z - 0.5);
				positions.push(x - 0.5, y + 0.5, z - 0.5);

				positions.push(x - 0.5, y + 0.5, z - 0.5);
				positions.push(x + 0.5, y - 0.5, z - 0.5);
				positions.push(x + 0.5, y + 0.5, z - 0.5);
			}
			if (n000 >= 0 && n001 <= 0) {
				// facing down
				positions.push(x - 0.5, y - 0.5, z - 0.5);
				positions.push(x - 0.5, y + 0.5, z - 0.5);
				positions.push(x + 0.5, y - 0.5, z - 0.5);

				positions.push(x + 0.5, y - 0.5, z - 0.5);
				positions.push(x - 0.5, y + 0.5, z - 0.5);
				positions.push(x + 0.5, y + 0.5, z - 0.5);
			}
			if (n000 <= 0 && n010 >= 0) {
				// facing back?
				positions.push(x - 0.5, y - 0.5, z - 0.5);
				positions.push(x - 0.5, y - 0.5, z + 0.5);
				positions.push(x + 0.5, y - 0.5, z - 0.5);

				positions.push(x + 0.5, y - 0.5, z - 0.5);
				positions.push(x - 0.5, y - 0.5, z + 0.5);
				positions.push(x + 0.5, y - 0.5, z + 0.5);
			}
			if (n000 >= 0 && n010 <= 0) {
				// facing foreward?
				positions.push(x - 0.5, y - 0.5, z + 0.5);
				positions.push(x - 0.5, y - 0.5, z - 0.5);
				positions.push(x + 0.5, y - 0.5, z - 0.5);

				positions.push(x - 0.5, y - 0.5, z + 0.5);
				positions.push(x + 0.5, y - 0.5, z - 0.5);
				positions.push(x + 0.5, y - 0.5, z + 0.5);
			}
			if (n000 <= 0 && n100 >= 0) {
				// facing left
				positions.push(x - 0.5, y - 0.5, z + 0.5);
				positions.push(x - 0.5, y - 0.5, z - 0.5);
				positions.push(x - 0.5, y + 0.5, z - 0.5);

				positions.push(x - 0.5, y - 0.5, z + 0.5);
				positions.push(x - 0.5, y + 0.5, z - 0.5);
				positions.push(x - 0.5, y + 0.5, z + 0.5);
			}
			if (n000 >= 0 && n100 <= 0) {
				// facing right
				positions.push(x - 0.5, y - 0.5, z - 0.5);
				positions.push(x - 0.5, y - 0.5, z + 0.5);
				positions.push(x - 0.5, y + 0.5, z - 0.5);

				positions.push(x - 0.5, y + 0.5, z - 0.5);
				positions.push(x - 0.5, y - 0.5, z + 0.5);
				positions.push(x - 0.5, y + 0.5, z + 0.5);
			}
		}
	}
}

let geom = new THREE.BufferGeometry();
geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geom.computeBoundingBox();
let material = new THREE.MeshPhongMaterial({ color: 0x7f7f7f });
let mesh = new THREE.Mesh(geom, material);
mesh.position.set(-100, -100, -200);
mesh.scale.set(10, 10, 10);
scene.add(mesh);

function animate(time) {

	// controls.target.set(TILEMAP.mapCfg.chunkSize * TILEMAP.mapCfg.tileSize / 2, TILEMAP.mapCfg.chunkSize * TILEMAP.mapCfg.tileSize / 2, 0);
	// controls.update();
	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

function getNoise(x, y, z) {
	return NOISE.noise(x * frequency, y * frequency, z * frequency) - (z * 0.1);
}
