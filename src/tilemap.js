import * as THREE from 'three';
import * as INST from './instancer'
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
// import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

const BOX_GEOM = new THREE.BoxGeometry(1, 1, 1);
const MATERIAL = new THREE.MeshPhongMaterial({ color: 0x4faf4f });
const MESH = new THREE.Mesh(BOX_GEOM, MATERIAL);
const DUMMY = new THREE.Object3D(); // use this to build the tx matrix for each instance
const NOISE = new SimplexNoise();
// const IMP_NOISE = new ImprovedNoise();

export const MAX_CHUNK_SIZE = 600;
export var mapCfg = {
	chunkSize: 200,
	tileSize: 10,
	octaves: [
		{ frq: 0.005, amp: 20 },
		{ frq: 0.02, amp: 1.84 }
	],
	z: 0
};

let loadedChunks = {};

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

	let self = {
		coord: coord,
		meshes: meshes,
		worker: new Worker('../src/noise_worker.js', { type: 'module' })
	}

	self.update = (chunk) => {
		let chunkX = coord[0] * mapCfg.chunkSize;
		let chunkY = coord[1] * mapCfg.chunkSize;
		chunk.worker.postMessage({
			id: chunk.meshes[0].uuid,
			chunkCoord: [chunkX, chunkY],
			cfg: mapCfg
		});

		chunk.worker.onmessage = (e) => {
			let c = loadedChunks[e.data.id];
			for (var x = 0; x < mapCfg.chunkSize; x++) {
				for (var y = 0; y < mapCfg.chunkSize; y++) {
					DUMMY.position.set(x * mapCfg.tileSize, y * mapCfg.tileSize, e.data.map[x][y]);
					DUMMY.scale.set(mapCfg.tileSize, mapCfg.tileSize, mapCfg.tileSize);
					DUMMY.updateMatrix();
					c.meshes.forEach(function (el) {
						el.setMatrixAt(y * mapCfg.chunkSize + x, DUMMY.matrix);
					});
				}
			}
			c.meshes.forEach(function (el) {
				el.position.set(c.coord[0] * mapCfg.chunkSize * mapCfg.tileSize, c.coord[1] * mapCfg.chunkSize * mapCfg.tileSize, 0);
				el.instanceMatrix.needsUpdate = true;
				el.count = mapCfg.chunkSize * mapCfg.chunkSize;
			});
		};
	}

	loadedChunks[meshes[0].uuid] = self;
	return self;
}