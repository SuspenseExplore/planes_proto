import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import * as GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.21';
import * as CHUNK from './chunk.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
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
controls.object.position.set(-10, -10, 2000);
controls.target.set(0, 0, 0);
controls.update();

let mapParms = {
	heightScale: 2048,
	octaves: [
		{ frq: 0.01, amp: 1.0, z: 0 },
		{ frq: 0.02, amp: 0.5, z: 0 },
		{ frq: 0.04, amp: 0.25, z: 0 }
	]
}

let chunks = [];
const CHUNK_RAD = 1;
for (let x = -CHUNK_RAD; x <= CHUNK_RAD; x++) {
	for (let y = -CHUNK_RAD; y <= CHUNK_RAD; y++) {
		let c = CHUNK.buildChunk([x, y], mapParms);
		chunks.push(c);
		scene.add(c.mesh);
	}
}

const gui = new lil.GUI({ width: 600 });
gui.add(mapParms, 'heightScale', 64, 2048).onChange(value => {
	chunks.forEach(chunk => {
		chunk.mesh.material.uniforms.heightScale.value = value;
	});
});
for (let o = 0; o < mapParms.octaves.length; o++) {
	let octave = mapParms.octaves[o];
	let folder = gui.addFolder('Octave ' + o);
	folder.add(octave, 'frq', 0.01, 0.2).onChange(value => {
		chunks.forEach(chunk => {
			CHUNK.updateChunk(chunk, mapParms);
		});
	});
	folder.add(octave, 'amp', 0.001, 1).onChange(value => {
		chunks.forEach(chunk => {
			CHUNK.updateChunk(chunk, mapParms);
		});
	});
	folder.add(octave, 'z', -5, 5, 0.01).onChange(value => {
		chunks.forEach(chunk => {
			CHUNK.updateChunk(chunk, mapParms);
		});
	});
}

function animate(time) {

	// controls.target.set(TILEMAP.mapCfg.chunkSize * TILEMAP.mapCfg.tileSize / 2, TILEMAP.mapCfg.chunkSize * TILEMAP.mapCfg.tileSize / 2, 0);
	// controls.update();
	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);