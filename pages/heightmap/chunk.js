import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

const CHUNK_SIZE = 5000;
const CHUNK_SEGS = 128;
const noise = new ImprovedNoise();
const geom = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SEGS - 1, CHUNK_SEGS - 1);

export function buildChunk(coord, parms) {
	let heights = new Float32Array(CHUNK_SEGS * CHUNK_SEGS);
	let texture = new THREE.DataTexture(heights, CHUNK_SEGS, CHUNK_SEGS, THREE.RedFormat, THREE.FloatType);
	let material = new THREE.ShaderMaterial({
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent,
		uniforms: {
			'tex': { value: texture },
			'heightScale': { value: parms.heightScale },
			'texelSize': { value: 1 / CHUNK_SEGS }
		}
	});
	let mesh = new THREE.Mesh(geom, material);
	mesh.position.set(coord[0] * CHUNK_SIZE, coord[1] * CHUNK_SIZE, 0);

	let chunk = {
		coord: coord,
		heights: heights,
		texture: texture,
		mesh: mesh
	};
	updateChunk(chunk, parms);
	return chunk;
}

export function updateChunk(chunk, parms) {
	for (let x = 0; x < CHUNK_SEGS; x++) {
		for (let y = 0; y < CHUNK_SEGS; y++) {
			let height = 0;
			for (let o = 0; o < parms.octaves.length; o++) {
				let octave = parms.octaves[o];
				let n = noise.noise((x + chunk.coord[0] * (CHUNK_SEGS - 1)) * octave.frq, (y + chunk.coord[1] * (CHUNK_SEGS - 1)) * octave.frq, octave.z);
				height += (n * octave.amp);
			}

			// each octave adds from -1 to 1 height, so total range is -octaves.length to octaves.length
			// this range is normalized to (0, 1) and rescaled in the shader
			let o = parms.octaves.length;
			height = height / o * 0.5 + 0.5;
			chunk.heights[(y * CHUNK_SEGS + x)] = height;
		}
	}
	chunk.mesh.material.uniforms.tex.value.needsUpdate = true;
}
