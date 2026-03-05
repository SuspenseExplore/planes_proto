import * as THREE from 'three';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

const CHUNK_SIZE = 1000;
const CHUNK_SEGS = 128;
const noise = new ImprovedNoise();
const geom = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, CHUNK_SEGS - 1, CHUNK_SEGS - 1);

export function buildChunk(coord, parms) {
	let heights = new Float32Array(CHUNK_SEGS * CHUNK_SEGS);
	let normals = new Float32Array(CHUNK_SEGS * CHUNK_SEGS * 4);
	let heightMap = new THREE.DataTexture(heights, CHUNK_SEGS, CHUNK_SEGS, THREE.RedFormat, THREE.FloatType);
	let normalMap = new THREE.DataTexture(normals, CHUNK_SEGS, CHUNK_SEGS, THREE.RGBAFormat, THREE.FloatType);
	let material = new THREE.ShaderMaterial({
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent,
		uniforms: {
			'heightMap': { value: heightMap },
			'normalMap': { value: normalMap },
			'heightScale': { value: parms.heightScale },
			'texelSize': { value: 1 / CHUNK_SEGS }
		}
	});
	let mesh = new THREE.Mesh(geom, material);
	mesh.position.set(coord[0] * CHUNK_SIZE, coord[1] * CHUNK_SIZE, 0);

	let chunk = {
		coord: coord,
		heights: heights,
		normals: normals,
		heightMap: heightMap,
		normalMap, normalMap,
		mesh: mesh
	};
	updateChunk(chunk, parms);
	return chunk;
}

export function updateChunk(chunk, parms) {
	let i = 0; // normal index
	for (let y = 0; y < CHUNK_SEGS; y++) {
		for (let x = 0; x < CHUNK_SEGS; x++) {
			let height = 0;
			for (let o = 0; o < parms.octaves.length; o++) {
				let octave = parms.octaves[o];
				let n = noise.noise((x + chunk.coord[0] * (CHUNK_SEGS - 1)) * octave.frq, (y + chunk.coord[1] * (CHUNK_SEGS - 1)) * octave.frq, octave.z);
				height += (n * octave.amp);
			}

			// each octave adds from -1 to 1 height, so total range is -octaves.length to octaves.length
			// this range is normalized to (0, 1) and rescaled in the shader
			let o = parms.octaves.length;
			height = height / o;
			chunk.heights[(y * CHUNK_SEGS + x)] = height;
		}
	}
	for (let y = 0; y < CHUNK_SEGS; y++) {
		for (let x = 0; x < CHUNK_SEGS; x++) {
			let n = calcNormal(x, y, chunk, parms).multiplyScalar(0.5).addScalar(0.5);
			chunk.normals[i++] = n.x;
			chunk.normals[i++] = n.y;
			chunk.normals[i++] = n.z;
			i++;
		}
	}
	chunk.mesh.material.uniforms.heightMap.value.needsUpdate = true;
	chunk.mesh.material.uniforms.normalMap.value.needsUpdate = true;
}

function getHeight(x, y, chunk, parms) {
	if (x < 0 || y < 0 || x >= CHUNK_SEGS || y >= CHUNK_SEGS) {
		let height = 0;
		for (let o = 0; o < parms.octaves.length; o++) {
			let octave = parms.octaves[o];
			let n = noise.noise((x + chunk.coord[0] * (CHUNK_SEGS - 1)) * octave.frq, (y + chunk.coord[1] * (CHUNK_SEGS - 1)) * octave.frq, octave.z);
			height += (n * octave.amp);
		}
		let o = parms.octaves.length;
		height = height / o;
		return height;
	}
	return chunk.heights[y * CHUNK_SEGS + x];
}

function calcNormal(x, y, chunk, parms) {
	let nx = getHeight(x - 1, y, chunk, parms);
	let px = getHeight(x + 1, y, chunk, parms);
	let ny = getHeight(x, y - 1, chunk, parms);
	let py = getHeight(x, y + 1, chunk, parms);
	let n = new THREE.Vector3(px - nx, py - ny, 1 / CHUNK_SEGS).normalize();
	return n;
}
