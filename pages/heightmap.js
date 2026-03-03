import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import * as GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.21';

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

const controls = new OrbitControls(camera, renderer.domElement);
controls.object.position.set(-10, -10, 200);
controls.target.set(0, 0, 0);
controls.update();

const CHUNK_SIZE = 500;
const CHUNK_SEGS = 512;
const noise = new ImprovedNoise();
const geom = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SEGS - 1, CHUNK_SEGS - 1);
const verts = geom.attributes.position.array;

const heights = new Float16Array(CHUNK_SEGS * CHUNK_SEGS);
const frq = 0.02;
const amp = 30;
for (let x = 0; x < CHUNK_SEGS; x++) {
	for (let y = 0; y < CHUNK_SEGS; y++) {
		let n = noise.noise(x * frq, y * frq, 0) + 1;
		heights[(y * CHUNK_SEGS + x)] = n * amp;
	}
}
for (let i = 0, j = 0, l = verts.length; i < l; i++, j += 3) {
	verts[j + 2] = heights[i];
}
geom.computeVertexNormals();

const material = new THREE.MeshPhongMaterial({ color: 0x4faf4f });
const mesh = new THREE.Mesh(geom, material);
scene.add(mesh);

function animate(time) {

	// controls.target.set(TILEMAP.mapCfg.chunkSize * TILEMAP.mapCfg.tileSize / 2, TILEMAP.mapCfg.chunkSize * TILEMAP.mapCfg.tileSize / 2, 0);
	// controls.update();
	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);