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
controls.object.position.set(-10, -10, 2000);
controls.target.set(0, 0, 0);
controls.update();

const CHUNK_SIZE = 5000;
const CHUNK_SEGS = 128;
const noise = new ImprovedNoise();
const geom = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SEGS - 1, CHUNK_SEGS - 1);
const verts = geom.attributes.position.array;

const heights = new Float32Array(CHUNK_SEGS * CHUNK_SEGS);
const texture = new THREE.DataTexture(heights, CHUNK_SEGS, CHUNK_SEGS, THREE.RedFormat, THREE.FloatType);

let mapParms = {
	octaves: [
		{ frq: 0.01, amp: 200 },
		{ frq: 0.02, amp: 100 }
	]
}
const material = new THREE.ShaderMaterial({
	vertexShader: document.getElementById('vertexShader').textContent,
	fragmentShader: document.getElementById('fragmentShader').textContent,
	uniforms: {
		'tex': { value: texture },
		'amplitude': { value: mapParms.amp }
	}
});
const mesh = new THREE.Mesh(geom, material);
scene.add(mesh);
const gui = new lil.GUI({ width: 600 });
const o1 = gui.addFolder('Octave 1');
o1.add(mapParms.octaves[0], 'frq', 0.01, 0.2).onChange(value => {
	updateMap();
});
o1.add(mapParms.octaves[0], 'amp', -500, 500).onChange(value => {
	updateMap();
});
const o2 = gui.addFolder('Octave 2');
o2.add(mapParms.octaves[1], 'frq', 0.01, 0.2).onChange(value => {
	updateMap();
});
o2.add(mapParms.octaves[1], 'amp', -500, 500).onChange(value => {
	updateMap();
});

function updateMap() {
	let low = 100000;
	let high = -100000;
	for (let x = 0; x < CHUNK_SEGS; x++) {
		for (let y = 0; y < CHUNK_SEGS; y++) {
			let n = 0;
			for (let o = 0; o < mapParms.octaves.length; o++) {
				let octave = mapParms.octaves[o];
				n += noise.noise(x * octave.frq, y * octave.frq, 0) * octave.amp;
			}
			heights[(y * CHUNK_SEGS + x)] = n;
			if (n < low) {
				low = n;
			}
			if (n > high) {
				high = n;
			}
		}
	}
	let spread = high - low;
	for (let i = 0; i < heights.length; i++) {
		heights[i] = (heights[i] - low) / spread;
	}
	material.uniforms.tex.value.needsUpdate = true;
}
updateMap();

function animate(time) {

	// controls.target.set(TILEMAP.mapCfg.chunkSize * TILEMAP.mapCfg.tileSize / 2, TILEMAP.mapCfg.chunkSize * TILEMAP.mapCfg.tileSize / 2, 0);
	// controls.update();
	renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);