import * as THREE from 'three';

/**
 * 
 * @param {Array} meshes an array of meshes
 * @param {*} instCount max instance count
 * @returns InstancedMesh
 */
export function build(meshes, instCount) {
	var instMeshes = [];
	for (var i = 0; i < meshes.length; i++) {
		let instMesh = new THREE.InstancedMesh(meshes[i].geometry, meshes[i].material, instCount);
		instMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		instMeshes[i] = instMesh;
	}

	return instMeshes;
}