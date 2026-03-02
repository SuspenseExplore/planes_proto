import * as THREE from 'three';
import * as INST from './instancer'
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

const BOX_GEOM = new THREE.BoxGeometry(1, 1, 1);
const MATERIAL = new THREE.MeshPhongMaterial({ color: 0x4faf4f });
const MESH = new THREE.Mesh(BOX_GEOM, MATERIAL);
const DUMMY = new THREE.Object3D(); // use this to build the tx matrix for each instance
const NOISE = new SimplexNoise();
const IMP_NOISE = new ImprovedNoise();

export const MAX_CHUNK_SIZE = 600;
export var mapCfg = {
	chunkSize: 200,
	tileSize: 10,
	frequency1: 0.005,
	amplitude1: 20,
	frequency2: 0.02,
	amplitude2: 1.84,
	z: 0
};

function getNoise(x, y, octave) {
	let c = -0.1;
	if (octave == 1) {
		let a = mapCfg.amplitude1 * mapCfg.tileSize;
		return IMP_NOISE.noise(x * mapCfg.frequency1, y * mapCfg.frequency1, mapCfg.z) * a;
	} else if (octave == 2) {
		let a = mapCfg.amplitude2 * mapCfg.tileSize;
		return IMP_NOISE.noise(x * mapCfg.frequency2, y * mapCfg.frequency2, mapCfg.z) * a;
	}
}

/**
 * 
 * @returns {
 * coord: [chunkX, chunkY]
 * meshes: Array(InstancedMesh)
 * }
 */
export function buildChunk(coord) {
	let material = new THREE.MeshPhongMaterial({ color: new THREE.Color(coord[0] * 0.2, coord[1] * 0.2, 0) });
	let mesh = new THREE.Mesh(BOX_GEOM, material);
	let meshes = INST.build([MESH], MAX_CHUNK_SIZE * MAX_CHUNK_SIZE);
	meshes.forEach(mesh => {
		mesh.frustumCulled = false;
	});

	let updateFn = function () {
		let chunkX = coord[0] * mapCfg.chunkSize;
		let chunkY = coord[1] * mapCfg.chunkSize;

		for (var x = 0; x < mapCfg.chunkSize; x++) {
			for (var y = 0; y < mapCfg.chunkSize; y++) {
				let h1 = getNoise(x + chunkX, y + chunkY, 1);
				let h2 = getNoise(x + chunkX, y + chunkY, 2);
				DUMMY.position.set(x * mapCfg.tileSize, y * mapCfg.tileSize, h1 + h2);
				DUMMY.scale.set(mapCfg.tileSize, mapCfg.tileSize, mapCfg.tileSize);
				DUMMY.updateMatrix();
				meshes.forEach(function (el) {
					el.setMatrixAt(y * mapCfg.chunkSize + x, DUMMY.matrix);
				});
			}
		}
		meshes.forEach(function (el) {
			el.position.set(chunkX * mapCfg.tileSize, chunkY * mapCfg.tileSize, 0);
			el.instanceMatrix.needsUpdate = true;
			el.count = mapCfg.chunkSize * mapCfg.chunkSize;
		});
	};

	return {
		coord: coord,
		meshes: meshes,
		update: updateFn
	};
}